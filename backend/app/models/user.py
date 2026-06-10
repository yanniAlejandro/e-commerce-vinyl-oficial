from datetime import datetime
from enum import Enum

from beanie import Document, Indexed, Link
from pydantic import EmailStr, Field


class UserRole(str, Enum):
    CUSTOMER = "customer"
    ADMIN = "admin"


class User(Document):
    email: Indexed(EmailStr, unique=True)
    hashed_password: str
    full_name: str
    role: UserRole = UserRole.CUSTOMER
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "users"
