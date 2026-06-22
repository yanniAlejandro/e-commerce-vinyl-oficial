from datetime import datetime

from fastapi import HTTPException, status

from app.models.cart import Cart
from app.models.order import Order, OrderItem, OrderStatus, StatusHistoryEntry, ShippingAddress
from app.models.product import Product
from app.schemas.order import (
    CreateOrderRequest,
    OrderItemResponse,
    OrderResponse,
    ShippingAddressResponse,
    StatusHistoryResponse,
)
from app.services.cart_service import clear_cart

SHIPPING_COST = 5.99


def _order_to_response(order: Order) -> OrderResponse:
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
        for entry in (order.status_history or [])
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
        updated_at=getattr(order, "updated_at", order.created_at),
    )


async def create_order(user_id: str, payload: CreateOrderRequest) -> OrderResponse:
    existing = await Order.find_one(Order.idempotency_key == payload.idempotency_key)
    if existing:
        return _order_to_response(existing)

    cart = await Cart.find_one(Cart.user_id == user_id)
    if not cart or not cart.items:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cart is empty")

    order_items: list[OrderItem] = []
    subtotal = 0.0

    for cart_item in cart.items:
        product = await Product.get(cart_item.product_id)
        if not product or not product.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Product {cart_item.name} is no longer available",
            )
        if product.stock < cart_item.quantity:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Insufficient stock for {product.name}",
            )
        if product.price != cart_item.price:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Price changed for {product.name}. Update your cart.",
            )

        line_total = round(product.price * cart_item.quantity, 2)
        subtotal += line_total
        order_items.append(
            OrderItem(
                product_id=str(product.id),
                name=product.name,
                artist=product.artist,
                price=product.price,
                quantity=cart_item.quantity,
                image_url=product.image_url,
            )
        )

    subtotal = round(subtotal, 2)
    total = round(subtotal + SHIPPING_COST, 2)
    now = datetime.utcnow()

    for item in order_items:
        product = await Product.get(item.product_id)
        if product:
            product.stock -= item.quantity
            await product.save()

    initial_status = OrderStatus.PEDIDO
    order = Order(
        user_id=user_id,
        items=order_items,
        subtotal=subtotal,
        shipping=SHIPPING_COST,
        total=total,
        status=initial_status,
        status_history=[StatusHistoryEntry(status=initial_status, note="Pedido confirmado")],
        shipping_address=ShippingAddress(**payload.shipping_address.model_dump()),
        payment_reference=f"mock_pay_{payload.idempotency_key[:12]}",
        idempotency_key=payload.idempotency_key,
        created_at=now,
        updated_at=now,
    )
    await order.insert()
    await clear_cart(user_id)
    return _order_to_response(order)


async def list_user_orders(user_id: str) -> list[OrderResponse]:
    orders = await Order.find(Order.user_id == user_id).sort("-created_at").to_list()
    return [_order_to_response(o) for o in orders]


async def get_user_order(user_id: str, order_id: str) -> OrderResponse | None:
    order = await Order.get(order_id)
    if not order or order.user_id != user_id:
        return None
    return _order_to_response(order)
