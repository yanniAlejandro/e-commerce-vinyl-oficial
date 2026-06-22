from datetime import datetime
from enum import Enum

from beanie import Document, Indexed
from pydantic import BaseModel, EmailStr, Field

from app.models.pending_courier import AvailabilitySlot, VehicleType


class UserRole(str, Enum):
    CUSTOMER = "customer"
    ADMIN = "admin"
    COURIER = "courier"


class User(Document):
    email: Indexed(EmailStr, unique=True)
    hashed_password: str
    full_name: str
    role: UserRole = UserRole.CUSTOMER
    is_active: bool = True
    username: str | None = None
    vehicle_type: VehicleType | None = None
    availability: list[AvailabilitySlot] = Field(default_factory=list)
    email_verified: bool = True
    last_inbox_viewed_at: datetime | None = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "users"
