from datetime import datetime

from fastapi import HTTPException, UploadFile, status

from app.models.order import DeliveryEvidence, Order, OrderStatus, StatusHistoryEntry
from app.models.user import User
from app.schemas.order import (
    CourierDeliveryResponse,
    DeliveryEvidenceResponse,
    InboxBadgeResponse,
    OrderItemResponse,
    ShippingAddressResponse,
    StatusHistoryResponse,
)
from app.services.cloudinary_service import upload_delivery_image
from app.services.settings_service import get_warehouse_settings


def _delivery_to_response(order: Order, customer: User | None = None) -> CourierDeliveryResponse:
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
        evidence = DeliveryEvidenceResponse(
            photo_urls=order.delivery_evidence.photo_urls,
            signature_url=order.delivery_evidence.signature_url,
            completed_at=order.delivery_evidence.completed_at,
        )

    return CourierDeliveryResponse(
        id=str(order.id),
        items=items,
        subtotal=order.subtotal,
        shipping=order.shipping,
        total=order.total,
        status=order.status,
        status_history=history,
        shipping_address=ShippingAddressResponse.model_validate(order.shipping_address.model_dump()),
        payment_reference=order.payment_reference,
        courier_id=order.courier_id,
        assigned_at=order.assigned_at,
        delivery_deadline=order.delivery_deadline,
        delivery_evidence=evidence,
        created_at=order.created_at,
        updated_at=order.updated_at,
        customer_name=customer.full_name if customer else order.shipping_address.full_name,
        customer_phone=order.shipping_address.phone or (customer.email if customer else ""),
    )


async def list_assigned_deliveries(courier: User) -> list[CourierDeliveryResponse]:
    orders = await Order.find(Order.courier_id == str(courier.id)).to_list()
    orders = [o for o in orders if o.status not in {OrderStatus.ENTREGADO, OrderStatus.CANCELADO}]
    orders.sort(
        key=lambda o: (
            o.delivery_deadline or datetime.max,
            o.assigned_at or o.created_at,
        )
    )

    results: list[CourierDeliveryResponse] = []
    for order in orders:
        customer = await User.get(order.user_id)
        results.append(_delivery_to_response(order, customer))
    return results


async def get_delivery_detail(courier: User, order_id: str) -> CourierDeliveryResponse:
    order = await _get_assigned_order(courier, order_id)
    customer = await User.get(order.user_id)
    return _delivery_to_response(order, customer)


async def get_inbox_badge(courier: User) -> InboxBadgeResponse:
    orders = await Order.find(Order.courier_id == str(courier.id)).to_list()
    active = [o for o in orders if o.status not in {OrderStatus.ENTREGADO, OrderStatus.CANCELADO}]
    if not courier.last_inbox_viewed_at:
        new_count = len(active)
    else:
        new_count = sum(
            1
            for o in active
            if (o.assigned_at or o.created_at) > courier.last_inbox_viewed_at
        )
    return InboxBadgeResponse(has_new=new_count > 0, new_count=new_count)


async def mark_inbox_viewed(courier: User) -> InboxBadgeResponse:
    courier.last_inbox_viewed_at = datetime.utcnow()
    await courier.save()
    return await get_inbox_badge(courier)


async def start_delivery(courier: User, order_id: str) -> CourierDeliveryResponse:
    order = await _get_assigned_order(courier, order_id)
    if order.status != OrderStatus.PEDIDO:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Solo se puede iniciar entregas en estado 'pedido'",
        )

    order.status = OrderStatus.RECOGIDA
    order.updated_at = datetime.utcnow()
    order.status_history.append(
        StatusHistoryEntry(
            status=OrderStatus.RECOGIDA,
            note="Mensajero en camino al almacén",
            changed_by=str(courier.id),
            changed_by_role="courier",
        )
    )
    await order.save()
    customer = await User.get(order.user_id)
    return _delivery_to_response(order, customer)


async def complete_pickup(courier: User, order_id: str) -> CourierDeliveryResponse:
    order = await _get_assigned_order(courier, order_id)
    if order.status != OrderStatus.RECOGIDA:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Solo se puede completar recogida en estado 'recogida'",
        )

    order.status = OrderStatus.CARGADO
    order.updated_at = datetime.utcnow()
    order.status_history.append(
        StatusHistoryEntry(
            status=OrderStatus.CARGADO,
            note="Pedido recogido del almacén",
            changed_by=str(courier.id),
            changed_by_role="courier",
        )
    )
    await order.save()
    customer = await User.get(order.user_id)
    return _delivery_to_response(order, customer)


async def complete_delivery(
    courier: User,
    order_id: str,
    photos: list[UploadFile],
    signature: UploadFile,
) -> CourierDeliveryResponse:
    order = await _get_assigned_order(courier, order_id)
    if order.status != OrderStatus.CARGADO:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Solo se puede completar entrega en estado 'cargado'",
        )
    if not photos:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Se requiere al menos una foto de evidencia",
        )

    photo_urls: list[str] = []
    for photo in photos:
        result = await upload_delivery_image(photo)
        photo_urls.append(result["url"])

    sig_result = await upload_delivery_image(signature)
    now = datetime.utcnow()

    order.status = OrderStatus.ENTREGADO
    order.updated_at = now
    order.delivery_evidence = DeliveryEvidence(
        photo_urls=photo_urls,
        signature_url=sig_result["url"],
        completed_at=now,
    )
    order.status_history.append(
        StatusHistoryEntry(
            status=OrderStatus.ENTREGADO,
            note="Entrega completada con evidencia",
            changed_by=str(courier.id),
            changed_by_role="courier",
        )
    )
    await order.save()
    customer = await User.get(order.user_id)
    return _delivery_to_response(order, customer)


async def get_warehouse_for_courier():
    return await get_warehouse_settings()


async def _get_assigned_order(courier: User, order_id: str) -> Order:
    order = await Order.get(order_id)
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Pedido no encontrado")
    if order.courier_id != str(courier.id):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Pedido no asignado a ti")
    return order
