#!/usr/bin/env python3
"""Secure CLI to create the first SUPERADMIN account.
Usage (with DATABASE_URL set, e.g. inside API container):
  python -m scripts.create_superadmin
Password is generated randomly and printed only once.
Never hardcode passwords. Never log the password.
"""
import asyncio
import secrets
import string
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import select
from app.models.user import User, UserRole
from app.security import hash_password
from app.config import settings

def generate_password(length: int = 24) -> str:
    alphabet = string.ascii_letters + string.digits + "!@#$%^&*"
    return "".join(secrets.choice(alphabet) for _ in range(length))

async def main():
    engine = create_async_engine(settings.DATABASE_URL)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    async with async_session() as db:
        result = await db.execute(select(User).where(User.role == UserRole.SUPERADMIN.value))
        existing = result.scalar_one_or_none()
        if existing:
            print(f"SUPERADMIN already exists: {existing.email}")
            print("Use the password-reset endpoint or admin tools to change password.")
            return
        email = "admin@balkanevents.org"
        password = generate_password()
        user = User(
            email=email,
            password_hash=hash_password(password),
            full_name="Platform Super Admin",
            role=UserRole.SUPERADMIN.value,
            is_active=True,
            is_verified=True,
        )
        db.add(user)
        await db.commit()
        print("=" * 60)
        print("SUPERADMIN CREATED")
        print("=" * 60)
        print(f"Email:    {email}")
        print(f"Password: {password}")
        print("=" * 60)
        print("SAVE THIS PASSWORD NOW. It will never be shown again.")
        print("Change it after first login. Password is NOT stored in git or logs.")
    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(main())
