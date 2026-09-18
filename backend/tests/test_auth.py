import pytest
from datetime import timedelta
from backend.app.auth.security import hash_password, verify_password, create_access_token, decode_access_token

def test_password_hashing():
    pw = "kirana_secure_pass_123"
    hashed = hash_password(pw)
    assert hashed != pw
    assert verify_password(pw, hashed) is True
    assert verify_password("wrong_pass", hashed) is False

def test_jwt_token_generation_and_decode():
    data = {"sub": "merchant_ramesh", "role": "MERCHANT"}
    token = create_access_token(data, expires_delta=timedelta(minutes=15))
    assert isinstance(token, str)
    decoded = decode_access_token(token)
    assert decoded is not None
    assert decoded["sub"] == "merchant_ramesh"
    assert decoded["role"] == "MERCHANT"

def test_expired_or_invalid_token():
    # Expired token test
    data = {"sub": "merchant_ramesh"}
    token = create_access_token(data, expires_delta=timedelta(minutes=-10))
    decoded = decode_access_token(token)
    assert decoded is None

    # Tampered token test
    assert decode_access_token("gibberish.tampered.token") is None
