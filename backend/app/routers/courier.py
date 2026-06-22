from fastapi import APIRouter, Depends, File, UploadFile

from app.dependencies.auth import get_current_courier
from app.models.user import User
from app.schemas.order import CourierDeliveryResponse, InboxBadgeResponse
from app.schemas.settings import WarehouseSettingsResponse
from app.services.courier_service import (
    complete_delivery,
    complete_pickup,
    get_delivery_detail,
    get_inbox_badge,
    get_warehouse_for_courier,
    list_assigned_deliveries,
    mark_inbox_viewed,
    start_delivery,
)

router = APIRouter(prefix="/courier", tags=["courier"])


@router.get("/deliveries", response_model=list[CourierDeliveryResponse])
async def get_deliveries(user: User = Depends(get_current_courier)):
    return await list_assigned_deliveries(user)


@router.get("/deliveries/inbox/badge", response_model=InboxBadgeResponse)
async def inbox_badge(user: User = Depends(get_current_courier)):
    return await get_inbox_badge(user)


@router.post("/deliveries/inbox/viewed", response_model=InboxBadgeResponse)
async def inbox_viewed(user: User = Depends(get_current_courier)):
    return await mark_inbox_viewed(user)


@router.get("/deliveries/{order_id}", response_model=CourierDeliveryResponse)
async def get_delivery(order_id: str, user: User = Depends(get_current_courier)):
    return await get_delivery_detail(user, order_id)


@router.post("/deliveries/{order_id}/start", response_model=CourierDeliveryResponse)
async def delivery_start(order_id: str, user: User = Depends(get_current_courier)):
    return await start_delivery(user, order_id)


@router.post("/deliveries/{order_id}/complete-pickup", response_model=CourierDeliveryResponse)
async def delivery_complete_pickup(order_id: str, user: User = Depends(get_current_courier)):
    return await complete_pickup(user, order_id)


@router.post("/deliveries/{order_id}/complete-delivery", response_model=CourierDeliveryResponse)
async def delivery_complete(
    order_id: str,
    user: User = Depends(get_current_courier),
    photos: list[UploadFile] = File(...),
    signature: UploadFile = File(...),
):
    return await complete_delivery(user, order_id, photos, signature)


@router.get("/warehouse", response_model=WarehouseSettingsResponse)
async def warehouse_location(_: User = Depends(get_current_courier)):
    return await get_warehouse_for_courier()
