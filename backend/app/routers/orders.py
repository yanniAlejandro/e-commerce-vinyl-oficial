from fastapi import APIRouter, Depends, HTTPException, status

from app.config import settings
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.schemas.order import CreateOrderRequest, DisputeContactResponse, OrderResponse
from app.services.order_service import create_order, get_user_order, list_user_orders

router = APIRouter(prefix="/orders", tags=["orders"])


@router.post("", response_model=OrderResponse, status_code=201)
async def place_order(payload: CreateOrderRequest, user: User = Depends(get_current_user)):
    return await create_order(str(user.id), payload)


@router.get("", response_model=list[OrderResponse])
async def get_orders(user: User = Depends(get_current_user)):
    return await list_user_orders(str(user.id))


@router.get("/support/contact", response_model=DisputeContactResponse)
async def get_dispute_contact(_: User = Depends(get_current_user)):
    return DisputeContactResponse(manager_email=settings.manager_email)


@router.get("/{order_id}", response_model=OrderResponse)
async def get_order(order_id: str, user: User = Depends(get_current_user)):
    order = await get_user_order(str(user.id), order_id)
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")
    return order
