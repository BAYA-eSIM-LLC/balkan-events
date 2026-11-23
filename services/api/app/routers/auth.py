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
    result = await db.execute(select(User).where(User.email == data.email))
    user = result.scalar_one_or_none()
    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    if user.role in ("SUPERADMIN", "ADMIN") and getattr(user, "mfa_enabled", False):
        token = secrets.token_urlsafe(32)
        _mfa_pending[token] = user.id
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
_mfa_pending: dict[str, int] = {}

def _require_admin_mfa(user: User):
    return user.role in ("SUPERADMIN", "ADMIN") and user.mfa_enabled

@router.post("/mfa/setup", response_model=MFASetupResponse)
async def mfa_setup(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    if user.role not in ("SUPERADMIN", "ADMIN"):
        raise HTTPException(403, "MFA setup is for admin roles")
    secret = pyotp.random_base32()
    user.totp_secret = secret
    user.mfa_enabled = False
    await db.commit()
    uri = pyotp.TOTP(secret).provisioning_uri(name=user.email, issuer_name="BALKAN EVENTS")
    return MFASetupResponse(secret=secret, uri=uri)

@router.post("/mfa/enable")
async def mfa_enable(code: str, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    if not user.totp_secret:
        raise HTTPException(400, "Run setup first")
    if not pyotp.TOTP(user.totp_secret).verify(code, valid_window=1):
        raise HTTPException(401, "Invalid code")
    user.mfa_enabled = True
    await db.commit()
    return {"enabled": True}

@router.post("/mfa/confirm", response_model=TokenResponse)
async def mfa_confirm(data: MFAConfirmRequest, db: AsyncSession = Depends(get_db)):
    user_id = _mfa_pending.pop(data.mfa_token, None)
    if not user_id:
        raise HTTPException(401, "MFA token expired or invalid")
    user = await db.get(User, user_id)
    if not user or not user.totp_secret:
        raise HTTPException(401, "MFA not configured")
    if not pyotp.TOTP(user.totp_secret).verify(data.code, valid_window=1):
        raise HTTPException(401, "Invalid code")
    return await _issue_tokens(user, db)
