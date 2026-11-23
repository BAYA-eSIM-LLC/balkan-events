import os
import pytest
from cryptography.fernet import Fernet
from app.services.mfa import encrypt_secret, decrypt_secret, hash_code, generate_recovery_codes

# Tests that do not need a live DB
os.environ.setdefault("MFA_ENCRYPTION_KEY", Fernet.generate_key().decode())

def test_encrypt_roundtrip():
    os.environ["MFA_ENCRYPTION_KEY"] = Fernet.generate_key().decode()
    # Re-import to pick up key is not needed; function reads env each call
    from importlib import reload
    import app.services.mfa as m
    reload(m)
    secret = "JBSWY3DPEHPK3PXP"
    enc = m.encrypt_secret(secret)
    assert enc != secret
    assert m.decrypt_secret(enc) == secret

def test_recovery_codes_unique_and_hashed():
    codes = generate_recovery_codes(10)
    assert len(codes) == 10
    assert len(set(codes)) == 10
    hashes = [hash_code(c) for c in codes]
    assert all(len(h) == 64 for h in hashes)
    assert hash_code(codes[0]) != codes[0]
