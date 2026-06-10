from fastapi import APIRouter, Depends

from app.dependencies.auth import get_current_user
from app.models.user import User
from app.schemas.auth import UserRegister, UserLogin, TokenResponse, UserResponse
from app.services.auth_service import register_user, login_user, user_to_response

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=TokenResponse, status_code=201)
async def register(payload: UserRegister):
    return await register_user(payload)


@router.post("/login", response_model=TokenResponse)
async def login(payload: UserLogin):
    return await login_user(payload)


@router.get("/me", response_model=UserResponse)
async def me(user: User = Depends(get_current_user)):
    return user_to_response(user)
