from datetime import datetime
from enum import Enum

from beanie import Document, Indexed
from pydantic import BaseModel, EmailStr, Field


class VehicleType(str, Enum):
    BICYCLE = "bicycle"
    MOTORCYCLE = "motorcycle"
    CAR = "car"
    VAN = "van"


class AvailabilitySlot(BaseModel):
    day_of_week: int = Field(ge=0, le=6, description="0=Monday, 6=Sunday")
    start_time: str = Field(pattern=r"^\d{2}:\d{2}$")
    end_time: str = Field(pattern=r"^\d{2}:\d{2}$")


class PendingCourierRegistration(Document):
    username: Indexed(str, unique=True)
    email: Indexed(EmailStr, unique=True)
    hashed_password: str
    full_name: str
    vehicle_type: VehicleType
    availability: list[AvailabilitySlot]
    otp_hash: str
    otp_expires_at: datetime
    last_otp_sent_at: datetime = Field(default_factory=datetime.utcnow)
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "pending_courier_registrations"
