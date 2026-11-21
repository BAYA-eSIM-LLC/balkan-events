from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel, EmailStr
from datetime import datetime, timedelta
from typing import Optional, List
import secrets, hashlib
from app.database import get_db
from app.deps import get_current_user
from app.models.user import User
from app.models.user_extended import EmailVerificationToken, PasswordResetToken, UserFavorite, UserActivity
from app.security import hash_password, verify_password, hash_refresh_token

router = APIRouter(prefix="/me", tags=["profile"])

class ProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    bio: Optional[str] = None
    preferred_language: Optional[str] = None
    timezone: Optional[str] = None
    avatar_url: Optional[str] = None

class PasswordChange(BaseModel):
    current_password: str
    new_password: str

class FavoriteAdd(BaseModel):
    event_id: int

@router.get("")
async def get_profile(user: User = Depends(get_current_user)):
    return {
        "id": user.id,
        "email": user.email,
        "full_name": user.full_name,
        "phone": user.phone,
        "bio": user.bio,
        "avatar_url": user.avatar_url,
        "role": user.role,
        "is_verified": user.is_verified,
        "preferred_language": user.preferred_language,
        "timezone": user.timezone,
        "created_at": user.created_at,
    }

@router.patch("")
async def update_profile(data: ProfileUpdate, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(user, field, value)
    await db.commit()
    return {"status": "updated"}

@router.post("/password")
async def change_password(data: PasswordChange, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    if not verify_password(data.current_password, user.password_hash):
        raise HTTPException(status_code=400, detail="Current password incorrect")
    user.password_hash = hash_password(data.new_password)
    await db.commit()
    return {"status": "password changed"}

@router.post("/verify-email/request")
async def request_email_verification(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    if user.is_verified:
        return {"status": "already verified"}
    raw = secrets.token_urlsafe(32)
    token_hash = hashlib.sha256(raw.encode()).hexdigest()
    token = EmailVerificationToken(user_id=user.id, token_hash=token_hash, expires_at=datetime.utcnow() + timedelta(hours=24))
    db.add(token)
    await db.commit()
    # In production: send email with raw token. For now return for testing.
    return {"status": "verification sent", "debug_token": raw}

@router.post("/verify-email")
async def verify_email(token: str, db: AsyncSession = Depends(get_db)):
    token_hash = hashlib.sha256(token.encode()).hexdigest()
    result = await db.execute(select(EmailVerificationToken).where(EmailVerificationToken.token_hash == token_hash))
    vt = result.scalar_one_or_none()
    if not vt or vt.used_at or vt.expires_at < datetime.utcnow():
        raise HTTPException(status_code=400, detail="Invalid or expired token")
    user = await db.get(User, vt.user_id)
    user.is_verified = True
    user.email_verified_at = datetime.utcnow()
    vt.used_at = datetime.utcnow()
    await db.commit()
    return {"status": "verified"}

@router.post("/forgot-password")
async def forgot_password(email: EmailStr, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()
    if user:
        raw = secrets.token_urlsafe(32)
        token_hash = hashlib.sha256(raw.encode()).hexdigest()
        token = PasswordResetToken(user_id=user.id, token_hash=token_hash, expires_at=datetime.utcnow() + timedelta(hours=1))
        db.add(token)
        await db.commit()
        return {"status": "reset sent", "debug_token": raw}
    return {"status": "reset sent"}

@router.post("/reset-password")
async def reset_password(token: str, new_password: str, db: AsyncSession = Depends(get_db)):
    token_hash = hashlib.sha256(token.encode()).hexdigest()
    result = await db.execute(select(PasswordResetToken).where(PasswordResetToken.token_hash == token_hash))
    rt = result.scalar_one_or_none()
    if not rt or rt.used_at or rt.expires_at < datetime.utcnow():
        raise HTTPException(status_code=400, detail="Invalid or expired token")
    user = await db.get(User, rt.user_id)
    user.password_hash = hash_password(new_password)
    rt.used_at = datetime.utcnow()
    await db.commit()
    return {"status": "password reset"}

@router.post("/favorites")
async def add_favorite(data: FavoriteAdd, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    fav = UserFavorite(user_id=user.id, event_id=data.event_id)
    db.add(fav)
    try:
        await db.commit()
    except Exception:
        await db.rollback()
        raise HTTPException(status_code=400, detail="Already favorited or invalid event")
    return {"status": "added"}

@router.get("/favorites")
async def list_favorites(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(UserFavorite).where(UserFavorite.user_id == user.id))
    return [{"event_id": f.event_id, "created_at": f.created_at} for f in result.scalars().all()]

@router.get("/activity")
async def list_activity(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db), limit: int = 50):
    result = await db.execute(
        select(UserActivity).where(UserActivity.user_id == user.id).order_by(UserActivity.created_at.desc()).limit(limit)
    )
    return [{"action": a.action, "details": a.details, "created_at": a.created_at} for a in result.scalars().all()]

@router.post("/delete-account")
async def request_delete_account(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    user.is_active = False
    await db.commit()
    return {"status": "account deactivated, deletion scheduled"}
