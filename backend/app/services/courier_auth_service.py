from datetime import datetime, timedelta

from fastapi import HTTPException, status

from app.core.otp import (
    can_resend_otp,
    generate_otp_code,
    hash_otp,
    otp_expires_at,
    resend_cooldown_remaining,
    verify_otp,
)
from app.core.security import create_access_token, hash_password, verify_password
from app.models.pending_courier import PendingCourierRegistration
from app.models.user import User, UserRole
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
from app.services.email_service import send_otp_email


def courier_to_response(user: User) -> UserResponse:
    return UserResponse(
        id=str(user.id),
        email=user.email,
        full_name=user.full_name,
        role=user.role,
        username=user.username,
        vehicle_type=user.vehicle_type,
        availability=user.availability,
        created_at=user.created_at,
    )


async def register_courier_request(payload: CourierRegisterRequest) -> RegisterPendingResponse:
    if payload.password != payload.password_confirm:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Las contraseñas no coinciden",
        )

    existing_user = await User.find_one(
        {"$or": [{"email": payload.email}, {"username": payload.username}]}
    )
    if existing_user:
        if existing_user.email == payload.email:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email ya registrado")
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT, detail="Nombre de usuario ya en uso"
        )

    pending = await PendingCourierRegistration.find_one(
        {"$or": [{"email": payload.email}, {"username": payload.username}]}
    )
    if pending:
        await pending.delete()

    code = generate_otp_code()
    pending = PendingCourierRegistration(
        username=payload.username,
        email=payload.email,
        hashed_password=hash_password(payload.password),
        full_name=payload.full_name,
        vehicle_type=payload.vehicle_type,
        availability=payload.availability,
        otp_hash=hash_otp(code),
        otp_expires_at=otp_expires_at(),
    )
    await pending.insert()
    await send_otp_email(payload.email, code, "registro de mensajero")

    return RegisterPendingResponse(
        message="Código OTP enviado al correo electrónico",
        email=payload.email,
        resend_cooldown_seconds=60,
    )


async def verify_courier_otp(payload: OtpVerifyRequest) -> TokenResponse:
    pending = await PendingCourierRegistration.find_one(PendingCourierRegistration.email == payload.email)
    if not pending:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Registro no encontrado")

    if pending.otp_expires_at < datetime.utcnow():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Código OTP expirado")

    if not verify_otp(payload.code, pending.otp_hash):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Código OTP inválido")

    user = User(
        email=pending.email,
        username=pending.username,
        hashed_password=pending.hashed_password,
        full_name=pending.full_name,
        role=UserRole.COURIER,
        vehicle_type=pending.vehicle_type,
        availability=pending.availability,
        email_verified=True,
    )
    await user.insert()
    await pending.delete()

    token = create_access_token(str(user.id), user.role.value)
    return TokenResponse(access_token=token, user=courier_to_response(user))


async def resend_courier_otp(payload: OtpResendRequest) -> OtpResendResponse:
    pending = await PendingCourierRegistration.find_one(PendingCourierRegistration.email == payload.email)
    if not pending:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Registro no encontrado")

    if not can_resend_otp(pending.last_otp_sent_at):
        remaining = resend_cooldown_remaining(pending.last_otp_sent_at)
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Espera {remaining} segundos antes de reenviar",
            headers={"Retry-After": str(remaining)},
        )

    code = generate_otp_code()
    pending.otp_hash = hash_otp(code)
    pending.otp_expires_at = otp_expires_at()
    pending.last_otp_sent_at = datetime.utcnow()
    await pending.save()
    await send_otp_email(payload.email, code, "registro de mensajero")

    return OtpResendResponse(
        message="Código OTP reenviado",
        resend_cooldown_seconds=60,
    )


async def login_courier(payload: CourierLoginRequest) -> TokenResponse:
    login = payload.login.strip()
    user = await User.find_one(
        {
            "$or": [{"email": login}, {"username": login}],
            "role": UserRole.COURIER,
        }
    )
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Credenciales inválidas")

    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Cuenta desactivada")

    token = create_access_token(str(user.id), user.role.value)
    return TokenResponse(access_token=token, user=courier_to_response(user))


async def get_courier_profile(user: User) -> UserResponse:
    return courier_to_response(user)


async def update_courier_profile(user: User, payload: CourierProfileUpdateRequest) -> UserResponse:
    user.full_name = payload.full_name
    await user.save()
    return courier_to_response(user)


async def change_courier_password(user: User, payload: ChangePasswordRequest) -> dict:
    if payload.new_password != payload.new_password_confirm:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Las contraseñas nuevas no coinciden",
        )
    if not verify_password(payload.current_password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Contraseña actual incorrecta",
        )

    user.hashed_password = hash_password(payload.new_password)
    await user.save()
    return {"message": "Contraseña actualizada correctamente"}
