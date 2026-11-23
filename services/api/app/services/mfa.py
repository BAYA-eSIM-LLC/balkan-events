"""MFA helpers: encrypted TOTP, recovery codes, pending tokens."""
import os
import hashlib
import secrets
from datetime import datetime, timedelta
from cryptography.fernet import Fernet
import pyotp

MFA_KEY = os.getenv("MFA_ENCRYPTION_KEY", "")

def _fernet() -> Fernet:
    if not MFA_KEY:
        raise RuntimeError("MFA_ENCRYPTION_KEY is not set")
    return Fernet(MFA_KEY.encode() if isinstance(MFA_KEY, str) else MFA_KEY)

def encrypt_secret(plain: str) -> str:
    return _fernet().encrypt(plain.encode()).decode()

def decrypt_secret(token: str) -> str:
    return _fernet().decrypt(token.encode()).decode()

def hash_code(code: str) -> str:
    return hashlib.sha256(code.encode()).hexdigest()

def generate_recovery_codes(n: int = 10) -> list[str]:
    return [secrets.token_hex(4) for _ in range(n)]

def verify_totp(encrypted_secret: str, code: str) -> bool:
    secret = decrypt_secret(encrypted_secret)
    return pyotp.TOTP(secret).verify(code, valid_window=1)
