from datetime import datetime
from enum import Enum

from pydantic import BaseModel, EmailStr, Field

from app.models.pending_courier import AvailabilitySlot, VehicleType


class UserRole(str, Enum):
    CUSTOMER = "customer"
    ADMIN = "admin"
    COURIER = "courier"


class UserRegister(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8)
    full_name: str = Field(min_length=2)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: str
    email: EmailStr
    full_name: str
    role: UserRole
    username: str | None = None
    vehicle_type: VehicleType | None = None
    availability: list[AvailabilitySlot] = Field(default_factory=list)
    created_at: datetime


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class CourierRegisterRequest(BaseModel):
    username: str = Field(min_length=3, max_length=32, pattern=r"^[a-zA-Z0-9_]+$")
    email: EmailStr
    password: str = Field(min_length=8)
    password_confirm: str = Field(min_length=8)
    full_name: str = Field(min_length=2)
    vehicle_type: VehicleType
    availability: list[AvailabilitySlot] = Field(min_length=1)


class CourierLoginRequest(BaseModel):
    login: str = Field(min_length=3, description="Username or email")
    password: str


class OtpVerifyRequest(BaseModel):
    email: EmailStr
    code: str = Field(min_length=4, max_length=8)


class OtpResendRequest(BaseModel):
    email: EmailStr


class RegisterPendingResponse(BaseModel):
    message: str
    email: EmailStr
    resend_cooldown_seconds: int = 60


class OtpResendResponse(BaseModel):
    message: str
    resend_cooldown_seconds: int


class CourierProfileUpdateRequest(BaseModel):
    full_name: str = Field(min_length=2)


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str = Field(min_length=8)
    new_password_confirm: str = Field(min_length=8)
