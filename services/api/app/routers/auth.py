from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from pydantic import BaseModel, EmailStr
from datetime import datetime, timedelta
from app.database import get_db
from app.deps import get_current_user
from app.models.user import User
from app.models.refresh_token import RefreshToken
from app.security import hash_password, verify_password, create_access_token, create_refresh_token, hash_refresh_token
import pyotp
import secrets
from app.services.mfa import encrypt_secret, decrypt_secret, hash_code, generate_recovery_codes, verify_totp
from app.services.rate_limit import limited as _limited
from app.models.mfa import MFARecoveryCode, MFAPending



router = APIRouter(prefix="/auth", tags=["auth"])

class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    full_name: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class RefreshRequest(BaseModel):
    refresh_token: str

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"

REFRESH_EXPIRE_DAYS = 7

from app.models.user_extended import PasswordResetToken
from app.services.email import queue_email

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str

class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str

@router.post("/forgot-password")
async def forgot_password(data: ForgotPasswordRequest, db: AsyncSession = Depends(get_db)):
    if _limited(f"forgot:{data.email}", limit=3, window=600):
        raise HTTPException(429, "Too many requests")
    result = await db.execute(select(User).where(User.email == data.email))
    user = result.scalar_one_or_none()
    # Always return success to prevent enumeration
    if user:
        raw = secrets.token_urlsafe(32)
        token_hash = hash_refresh_token(raw)
        expires = datetime.utcnow() + timedelta(hours=1)
        db.add(PasswordResetToken(user_id=user.id, token_hash=token_hash, expires_at=expires))
        await db.commit()
        # Queue email – SMTP may be BLOCKED
        await queue_email(db, to_email=user.email, subject="Reset lozinke", body=f"Token: {raw}", template="password_reset", reference_type="user", reference_id=user.id, idempotency_key=f"reset-{user.id}-{token_hash[:16]}")
    return {"ok": True, "message": "Ako račun postoji, poslan je e-mail s uputama."}

@router.post("/reset-password")
async def reset_password(data: ResetPasswordRequest, db: AsyncSession = Depends(get_db)):
    if len(data.new_password) < 8:
        raise HTTPException(400, "Lozinka mora imati najmanje 8 znakova")
    token_hash = hash_refresh_token(data.token)
    result = await db.execute(select(PasswordResetToken).where(PasswordResetToken.token_hash == token_hash))
    tok = result.scalar_one_or_none()
    if not tok or tok.used_at or tok.expires_at < datetime.utcnow():
        raise HTTPException(400, "Neispravan ili istekao token")
    user = await db.get(User, tok.user_id)
    if not user:
        raise HTTPException(400, "Korisnik nije pronađen")
    user.password_hash = hash_password(data.new_password)
    tok.used_at = datetime.utcnow()
    # Revoke all refresh tokens
    await db.execute(update(RefreshToken).where(RefreshToken.user_id == user.id).values(is_revoked=True))
    await db.commit()
    return {"ok": True}

@router.post("/change-password")
async def change_password(data: ChangePasswordRequest, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    if not verify_password(data.current_password, user.password_hash):
        raise HTTPException(401, "Pogrešna trenutna lozinka")
    if len(data.new_password) < 8:
        raise HTTPException(400, "Lozinka mora imati najmanje 8 znakova")
    user.password_hash = hash_password(data.new_password)
    await db.execute(update(RefreshToken).where(RefreshToken.user_id == user.id).values(is_revoked=True))
    await db.commit()
    return {"ok": True}



async def _issue_tokens(user: User, db: AsyncSession) -> TokenResponse:
    access = create_access_token({"sub": str(user.id), "role": user.role})
    raw_refresh, token_hash = create_refresh_token()
    expires = datetime.utcnow() + timedelta(days=REFRESH_EXPIRE_DAYS)
    rt = RefreshToken(user_id=user.id, token_hash=token_hash, expires_at=expires)
    db.add(rt)
    await db.commit()
    return TokenResponse(access_token=access, refresh_token=raw_refresh)

@router.post("/register", response_model=TokenResponse)
async def register(data: RegisterRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == data.email))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Email already registered")
    user = User(email=data.email, password_hash=hash_password(data.password), full_name=data.full_name)
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return await _issue_tokens(user, db)

@router.post("/login")
async def login(data: LoginRequest, db: AsyncSession = Depends(get_db)):
    if _limited(f"login:{data.email}"):
        raise HTTPException(429, "Too many attempts")
    result = await db.execute(select(User).where(User.email == data.email))
    user = result.scalar_one_or_none()
    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    # Enforce MFA for admins if user has it enabled OR platform requires it
    from app.models.platform_settings import PlatformSettings
    settings_row = await db.get(PlatformSettings, 1)
    platform_requires = bool(settings_row and settings_row.mfa_required_admins)
    must_mfa = user.role in ("superadmin", "admin") and (getattr(user, "mfa_enabled", False) or platform_requires)
    if must_mfa:
        if not getattr(user, "mfa_enabled", False) or not user.totp_secret:
            raise HTTPException(403, "MFA required for admin accounts. Complete MFA setup first.")
        token = secrets.token_urlsafe(32)
        pending = MFAPending(
            token_hash=hash_code(token),
            user_id=user.id,
            expires_at=datetime.utcnow() + timedelta(minutes=5),
            attempts=0,
        )
        db.add(pending)
        await db.commit()
        return {"mfa_required": True, "mfa_token": token}
    return await _issue_tokens(user, db)

@router.post("/refresh", response_model=TokenResponse)
async def refresh(data: RefreshRequest, db: AsyncSession = Depends(get_db)):
    token_hash = hash_refresh_token(data.refresh_token)
    result = await db.execute(
        select(RefreshToken).where(RefreshToken.token_hash == token_hash).with_for_update()
    )
    rt = result.scalar_one_or_none()
    if not rt or rt.is_revoked or rt.expires_at < datetime.utcnow():
        raise HTTPException(status_code=401, detail="Invalid or expired refresh token")
    # Rotate: revoke old, issue new
    rt.is_revoked = True
    user = await db.get(User, rt.user_id)
    if not user or not user.is_active:
        raise HTTPException(status_code=401, detail="User inactive")
    from app.models.platform_settings import PlatformSettings
    settings_row = await db.get(PlatformSettings, 1)
    platform_requires = bool(settings_row and settings_row.mfa_required_admins)
    if user.role in ("superadmin", "admin") and (getattr(user, "mfa_enabled", False) or platform_requires):
        raise HTTPException(status_code=401, detail="MFA required. Use /auth/login and /auth/mfa/confirm")
    await db.commit()
    return await _issue_tokens(user, db)

@router.post("/logout")
async def logout(data: RefreshRequest, db: AsyncSession = Depends(get_db)):
    token_hash = hash_refresh_token(data.refresh_token)
    result = await db.execute(
        select(RefreshToken).where(RefreshToken.token_hash == token_hash)
    )
    rt = result.scalar_one_or_none()
    if rt:
        rt.is_revoked = True
        await db.commit()
    return {"status": "logged out"}


class MFASetupResponse(BaseModel):
    secret: str
    uri: str

class MFAConfirmRequest(BaseModel):
    mfa_token: str
    code: str

# Short-lived tokens for MFA step. In-memory for this process only.

def _require_admin_mfa(user: User):
    return user.role in ("superadmin", "admin") and user.mfa_enabled

@router.post("/mfa/setup")
async def mfa_setup(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    if user.role not in ("superadmin", "admin"):
        raise HTTPException(403, "MFA setup is for admin roles")
    secret = pyotp.random_base32()
    user.totp_secret = encrypt_secret(secret)
    user.mfa_enabled = False
    codes = generate_recovery_codes(10)
    for c in codes:
        db.add(MFARecoveryCode(user_id=user.id, code_hash=hash_code(c)))
    await db.commit()
    uri = pyotp.TOTP(secret).provisioning_uri(name=user.email, issuer_name="BALKAN EVENTS")
    return {"secret": secret, "uri": uri, "recovery_codes": codes}

@router.post("/mfa/enable")
async def mfa_enable(code: str, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    if not user.totp_secret:
        raise HTTPException(400, "Run setup first")
    if not verify_totp(user.totp_secret, code):
        raise HTTPException(401, "Invalid code")
    user.mfa_enabled = True
    await db.commit()
    return {"enabled": True}

@router.post("/mfa/confirm", response_model=TokenResponse)
async def mfa_confirm(data: MFAConfirmRequest, db: AsyncSession = Depends(get_db)):
    if _limited(f"mfa:{data.mfa_token[:8]}"):
        raise HTTPException(429, "Too many attempts")
    token_hash = hash_code(data.mfa_token)
    result = await db.execute(select(MFAPending).where(MFAPending.token_hash == token_hash).with_for_update())
    pending = result.scalar_one_or_none()
    if not pending or pending.expires_at < datetime.utcnow() or pending.attempts >= 5:
        if pending:
            await db.delete(pending)
            await db.commit()
        raise HTTPException(401, "MFA token expired or too many attempts")
    user = await db.get(User, pending.user_id)
    if not user or not user.totp_secret:
        raise HTTPException(401, "MFA not configured")
    ok = verify_totp(user.totp_secret, data.code)
    if not ok:
        # Try recovery code
        rc = await db.execute(
            select(MFARecoveryCode).where(
                MFARecoveryCode.user_id == user.id,
                MFARecoveryCode.code_hash == hash_code(data.code),
                MFARecoveryCode.used == False,
            )
        )
        recovery = rc.scalar_one_or_none()
        if recovery:
            recovery.used = True
            ok = True
    if not ok:
        pending.attempts += 1
        await db.commit()
        raise HTTPException(401, "Invalid code")
    await db.delete(pending)
    await db.commit()
    return await _issue_tokens(user, db)

@router.post("/mfa/recovery/regenerate")
async def regenerate_recovery(code: str, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    if not user.mfa_enabled or not user.totp_secret:
        raise HTTPException(400, "MFA not enabled")
    if not verify_totp(user.totp_secret, code):
        raise HTTPException(401, "Invalid code")
    await db.execute(
        MFARecoveryCode.__table__.delete().where(MFARecoveryCode.user_id == user.id)
    )
    codes = generate_recovery_codes(10)
    for c in codes:
        db.add(MFARecoveryCode(user_id=user.id, code_hash=hash_code(c)))
    await db.commit()
    return {"recovery_codes": codes}
