from fastapi import APIRouter, Depends

from app.dependencies.auth import get_current_user
from app.models.user import User
from app.schemas.cart import AddToCartRequest, CartResponse, UpdateCartItemRequest
from app.services.cart_service import (
    add_to_cart,
    clear_cart,
    get_cart,
    remove_from_cart,
    update_cart_item,
)

router = APIRouter(prefix="/cart", tags=["cart"])


@router.get("", response_model=CartResponse)
async def read_cart(user: User = Depends(get_current_user)):
    return await get_cart(str(user.id))


@router.post("/items", response_model=CartResponse)
async def add_item(payload: AddToCartRequest, user: User = Depends(get_current_user)):
    return await add_to_cart(str(user.id), payload)


@router.patch("/items/{product_id}", response_model=CartResponse)
async def update_item(
    product_id: str,
    payload: UpdateCartItemRequest,
    user: User = Depends(get_current_user),
):
    return await update_cart_item(str(user.id), product_id, payload)


@router.delete("/items/{product_id}", response_model=CartResponse)
async def delete_item(product_id: str, user: User = Depends(get_current_user)):
    return await remove_from_cart(str(user.id), product_id)


@router.delete("", response_model=CartResponse)
async def empty_cart(user: User = Depends(get_current_user)):
    return await clear_cart(str(user.id))
