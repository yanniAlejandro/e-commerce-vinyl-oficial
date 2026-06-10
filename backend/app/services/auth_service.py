from app.core.security import hash_password, verify_password, create_access_token
from app.models.user import User, UserRole
from app.schemas.auth import UserLogin, UserRegister, UserResponse, TokenResponse


def user_to_response(user: User) -> UserResponse:
    return UserResponse(
        id=str(user.id),
        email=user.email,
        full_name=user.full_name,
        role=user.role,
        created_at=user.created_at,
    )


async def register_user(payload: UserRegister) -> TokenResponse:
    existing = await User.find_one(User.email == payload.email)
    if existing:
        from fastapi import HTTPException, status
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")

    user = User(
        email=payload.email,
        hashed_password=hash_password(payload.password),
        full_name=payload.full_name,
        role=UserRole.CUSTOMER,
    )
    await user.insert()
    token = create_access_token(str(user.id), user.role.value)
    return TokenResponse(access_token=token, user=user_to_response(user))


async def login_user(payload: UserLogin) -> TokenResponse:
    from fastapi import HTTPException, status

    user = await User.find_one(User.email == payload.email)
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    token = create_access_token(str(user.id), user.role.value)
    return TokenResponse(access_token=token, user=user_to_response(user))
