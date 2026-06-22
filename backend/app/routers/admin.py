from fastapi import APIRouter, Depends, File, Query, UploadFile

from app.dependencies.auth import get_current_admin
from app.models.order import OrderStatus
from app.models.user import User
from app.schemas.media import CoverUploadResponse
from app.schemas.order import AdminOrderResponse, AssignCourierRequest, UpdateOrderStatusRequest
from app.schemas.product import ProductCreate, ProductResponse, ProductUpdate
from app.schemas.settings import WarehouseSettingsResponse, WarehouseSettingsUpdate
from app.services.admin_service import (
    assign_courier_to_order,
    create_product,
    delete_product,
    list_all_orders,
    list_all_products,
    list_couriers,
    update_order_status,
    update_product,
)
from app.services.cloudinary_service import upload_cover_image
from app.services.settings_service import get_warehouse_settings, update_warehouse_settings

router = APIRouter(prefix="/admin", tags=["admin"])


@router.post("/uploads/cover", response_model=CoverUploadResponse, status_code=201)
async def admin_upload_cover(
    file: UploadFile = File(...),
    _: User = Depends(get_current_admin),
):
    result = await upload_cover_image(file)
    return CoverUploadResponse(**result)


@router.get("/products", response_model=list[ProductResponse])
async def admin_list_products(_: User = Depends(get_current_admin)):
    return await list_all_products(include_inactive=True)


@router.post("/products", response_model=ProductResponse, status_code=201)
async def admin_create_product(payload: ProductCreate, _: User = Depends(get_current_admin)):
    return await create_product(payload)


@router.put("/products/{product_id}", response_model=ProductResponse)
async def admin_update_product(
    product_id: str,
    payload: ProductUpdate,
    _: User = Depends(get_current_admin),
):
    return await update_product(product_id, payload)


@router.delete("/products/{product_id}", response_model=ProductResponse)
async def admin_delete_product(product_id: str, _: User = Depends(get_current_admin)):
    return await delete_product(product_id)


@router.get("/orders", response_model=list[AdminOrderResponse])
async def admin_list_orders(
    status: OrderStatus | None = Query(None),
    _: User = Depends(get_current_admin),
):
    return await list_all_orders(status=status)


@router.patch("/orders/{order_id}/status", response_model=AdminOrderResponse)
async def admin_update_order_status(
    order_id: str,
    payload: UpdateOrderStatusRequest,
    _: User = Depends(get_current_admin),
):
    return await update_order_status(order_id, payload)


@router.patch("/orders/{order_id}/assign", response_model=AdminOrderResponse)
async def admin_assign_courier(
    order_id: str,
    payload: AssignCourierRequest,
    _: User = Depends(get_current_admin),
):
    return await assign_courier_to_order(order_id, payload)


@router.get("/couriers")
async def admin_list_couriers(_: User = Depends(get_current_admin)):
    return await list_couriers()


@router.get("/settings/warehouse", response_model=WarehouseSettingsResponse)
async def admin_get_warehouse(_: User = Depends(get_current_admin)):
    return await get_warehouse_settings()


@router.patch("/settings/warehouse", response_model=WarehouseSettingsResponse)
async def admin_update_warehouse(
    payload: WarehouseSettingsUpdate,
    _: User = Depends(get_current_admin),
):
    return await update_warehouse_settings(payload)
