from datetime import datetime, timedelta

from fastapi import HTTPException, status

from app.models.category import Category
from app.models.order import Order, OrderStatus, StatusHistoryEntry
from app.models.product import Product
from app.models.user import User, UserRole
from app.schemas.order import (
    AdminOrderResponse,
    AssignCourierRequest,
    OrderItemResponse,
    OrderResponse,
    ShippingAddressResponse,
    StatusHistoryResponse,
    UpdateOrderStatusRequest,
)
from app.schemas.product import ProductCreate, ProductResponse, ProductUpdate
from app.services.product_service import product_to_response


async def _order_to_response(order: Order) -> OrderResponse:
    items = [
        OrderItemResponse(
            product_id=item.product_id,
            name=item.name,
            artist=item.artist,
            price=item.price,
            quantity=item.quantity,
            image_url=item.image_url,
            line_total=round(item.price * item.quantity, 2),
        )
        for item in order.items
    ]
    history = [
        StatusHistoryResponse(
            status=entry.status,
            changed_at=entry.changed_at,
            note=entry.note,
            changed_by=entry.changed_by,
            changed_by_role=entry.changed_by_role,
        )
        for entry in order.status_history
    ]
    evidence = None
    if order.delivery_evidence:
        from app.schemas.order import DeliveryEvidenceResponse

        evidence = DeliveryEvidenceResponse(
            photo_urls=order.delivery_evidence.photo_urls,
            signature_url=order.delivery_evidence.signature_url,
            completed_at=order.delivery_evidence.completed_at,
        )
    return OrderResponse(
        id=str(order.id),
        items=items,
        subtotal=order.subtotal,
        shipping=order.shipping,
        total=order.total,
        status=order.status,
        status_history=history,
        shipping_address=ShippingAddressResponse.model_validate(
            order.shipping_address.model_dump()
        ),
        payment_reference=order.payment_reference,
        courier_id=order.courier_id,
        assigned_at=order.assigned_at,
        delivery_deadline=order.delivery_deadline,
        delivery_evidence=evidence,
        created_at=order.created_at,
        updated_at=order.updated_at,
    )


async def _order_to_admin_response(order: Order, user: User | None) -> AdminOrderResponse:
    base = await _order_to_response(order)
    courier_name = None
    if order.courier_id:
        courier = await User.get(order.courier_id)
        courier_name = courier.full_name if courier else None
    return AdminOrderResponse(
        **base.model_dump(),
        user_id=order.user_id,
        customer_name=user.full_name if user else order.shipping_address.full_name,
        customer_email=user.email if user else "",
        courier_name=courier_name,
    )


async def list_all_products(include_inactive: bool = True) -> list[ProductResponse]:
    query = Product.find() if include_inactive else Product.find(Product.is_active == True)
    products = await query.sort("-created_at").to_list()
    return [await product_to_response(p) for p in products]


async def create_product(payload: ProductCreate) -> ProductResponse:
    category = await Category.get(payload.category_id)
    if not category:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")

    existing_slug = await Product.find_one(Product.slug == payload.slug)
    if existing_slug:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Slug already exists")

    existing_sku = await Product.find_one(Product.sku == payload.sku)
    if existing_sku:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="SKU already exists")

    product = Product(**payload.model_dump(exclude={"category_id"}), category=category)
    await product.insert()
    return await product_to_response(product)


async def update_product(product_id: str, payload: ProductUpdate) -> ProductResponse:
    product = await Product.get(product_id)
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")

    updates = payload.model_dump(exclude_unset=True)
    category_id = updates.pop("category_id", None)

    if category_id:
        category = await Category.get(category_id)
        if not category:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")
        product.category = category

    if "slug" in updates:
        conflict = await Product.find_one(Product.slug == updates["slug"])
        if conflict and str(conflict.id) != product_id:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Slug already exists")

    if "sku" in updates:
        conflict = await Product.find_one(Product.sku == updates["sku"])
        if conflict and str(conflict.id) != product_id:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="SKU already exists")

    for key, value in updates.items():
        setattr(product, key, value)

    await product.save()
    return await product_to_response(product)


async def delete_product(product_id: str) -> ProductResponse:
    product = await Product.get(product_id)
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")

    product.is_active = False
    await product.save()
    return await product_to_response(product)


async def list_all_orders(status: OrderStatus | None = None) -> list[AdminOrderResponse]:
    query = Order.find()
    if status:
        query = Order.find(Order.status == status)
    orders = await query.sort("-created_at").to_list()

    results: list[AdminOrderResponse] = []
    for order in orders:
        user = await User.get(order.user_id)
        results.append(await _order_to_admin_response(order, user))
    return results


ACTIVE_STATUSES = {
    OrderStatus.PEDIDO,
    OrderStatus.RECOGIDA,
    OrderStatus.CARGADO,
    OrderStatus.ENTREGADO,
    OrderStatus.CANCELADO,
}


async def update_order_status(order_id: str, payload: UpdateOrderStatusRequest) -> AdminOrderResponse:
    order = await Order.get(order_id)
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")

    if payload.status not in ACTIVE_STATUSES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid status. Use: pedido, recogida, cargado, entregado, cancelado",
        )

    order.status = payload.status
    order.updated_at = datetime.utcnow()
    order.status_history.append(
        StatusHistoryEntry(status=payload.status, note=payload.note or "Actualizado por admin")
    )
    await order.save()

    user = await User.get(order.user_id)
    return await _order_to_admin_response(order, user)


async def list_couriers() -> list[dict]:
    couriers = await User.find(User.role == UserRole.COURIER, User.is_active == True).to_list()
    return [
        {
            "id": str(c.id),
            "full_name": c.full_name,
            "username": c.username,
            "email": c.email,
            "vehicle_type": c.vehicle_type.value if c.vehicle_type else None,
        }
        for c in couriers
    ]


async def assign_courier_to_order(order_id: str, payload: AssignCourierRequest) -> AdminOrderResponse:
    order = await Order.get(order_id)
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")

    courier = await User.get(payload.courier_id)
    if not courier or courier.role != UserRole.COURIER:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Courier not found")

    deadline = payload.delivery_deadline or (datetime.utcnow() + timedelta(hours=48))
    order.courier_id = str(courier.id)
    order.assigned_at = datetime.utcnow()
    order.delivery_deadline = deadline
    order.updated_at = datetime.utcnow()
    order.status_history.append(
        StatusHistoryEntry(
            status=order.status,
            note=payload.note or f"Asignado a {courier.full_name}",
            changed_by="admin",
            changed_by_role="admin",
        )
    )
    await order.save()

    user = await User.get(order.user_id)
    return await _order_to_admin_response(order, user)
