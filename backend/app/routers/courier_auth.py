from fastapi import APIRouter, Depends

from app.dependencies.auth import get_current_courier
from app.models.user import User
from app.schemas.courier_auth import (
    ChangePasswordRequest,
    CourierLoginRequest,
    CourierProfileUpdateRequest,
    CourierRegisterRequest,
    OtpResendRequest,
    OtpResendResponse,
    OtpVerifyRequest,
    RegisterPendingResponse,
    TokenResponse,
    UserResponse,
)
from app.services.courier_auth_service import (
    change_courier_password,
    get_courier_profile,
    login_courier,
    register_courier_request,
    resend_courier_otp,
    update_courier_profile,
    verify_courier_otp,
)

router = APIRouter(prefix="/courier/auth", tags=["courier-auth"])


@router.post("/register", response_model=RegisterPendingResponse, status_code=201)
async def register_courier(payload: CourierRegisterRequest):
    return await register_courier_request(payload)


@router.post("/verify-otp", response_model=TokenResponse)
async def verify_otp(payload: OtpVerifyRequest):
    return await verify_courier_otp(payload)


@router.post("/resend-otp", response_model=OtpResendResponse)
async def resend_otp(payload: OtpResendRequest):
    return await resend_courier_otp(payload)


@router.post("/login", response_model=TokenResponse)
async def courier_login(payload: CourierLoginRequest):
    return await login_courier(payload)


@router.get("/me", response_model=UserResponse)
async def courier_me(user: User = Depends(get_current_courier)):
    return await get_courier_profile(user)


@router.patch("/profile", response_model=UserResponse)
async def update_profile(payload: CourierProfileUpdateRequest, user: User = Depends(get_current_courier)):
    return await update_courier_profile(user, payload)


@router.post("/change-password")
async def change_password(payload: ChangePasswordRequest, user: User = Depends(get_current_courier)):
    return await change_courier_password(user, payload)
