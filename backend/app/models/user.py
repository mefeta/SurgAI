import hashlib
import os

from sqlalchemy import Column, Integer, String, Boolean, DateTime, func
from app.database import Base


def hash_password(password: str) -> str:
    """SHA-256 hash with random salt."""
    salt = os.urandom(32)
    pwd_hash = hashlib.pbkdf2_hmac("sha256", password.encode(), salt, 100000)
    return salt.hex() + ":" + pwd_hash.hex()


def verify_password(password: str, stored: str) -> bool:
    """Verify a password against a stored salt:hash string."""
    try:
        salt_hex, hash_hex = stored.split(":")
        salt = bytes.fromhex(salt_hex)
        pwd_hash = hashlib.pbkdf2_hmac("sha256", password.encode(), salt, 100000)
        return pwd_hash.hex() == hash_hex
    except (ValueError, AttributeError):
        return False


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(100), unique=True, nullable=False, index=True)
    full_name = Column(String(200), nullable=False)
    email = Column(String(200), unique=True, nullable=False, index=True)
    password_hash = Column(String(200), nullable=False)
    role = Column(String(50), nullable=False, default="clinic_manager")
    is_admin = Column(Boolean, default=False)
    clinic_name = Column(String(200), nullable=True)
    created_at = Column(DateTime, server_default=func.now())
