from datetime import datetime
from enum import Enum

from pydantic import BaseModel, Field


class OrderStatus(str, Enum):
    PEDIDO = "pedido"
    RECOGIDA = "recogida"
    CARGADO = "cargado"
    ENTREGADO = "entregado"
    CANCELADO = "cancelado"
    PENDING = "pending"
    PAID = "paid"
    SHIPPED = "shipped"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"


class ShippingAddressRequest(BaseModel):
    full_name: str = Field(min_length=2)
    street: str = Field(min_length=3)
    city: str = Field(min_length=2)
    state: str = Field(min_length=2)
    postal_code: str = Field(min_length=4)
    country: str = "ES"
    phone: str = ""
    latitude: float = Field(ge=-90, le=90)
    longitude: float = Field(ge=-180, le=180)


class ShippingAddressResponse(BaseModel):
    full_name: str
    street: str
    city: str
    state: str
    postal_code: str
    country: str = "ES"
    phone: str = ""
    latitude: float | None = None
    longitude: float | None = None


class CreateOrderRequest(BaseModel):
    shipping_address: ShippingAddressRequest
    idempotency_key: str = Field(min_length=8, max_length=64)


class OrderItemResponse(BaseModel):
    product_id: str
    name: str
    artist: str
    price: float
    quantity: int
    image_url: str
    line_total: float


class StatusHistoryResponse(BaseModel):
    status: OrderStatus
    changed_at: datetime
    note: str = ""
    changed_by: str = ""
    changed_by_role: str = ""


class DeliveryEvidenceResponse(BaseModel):
    photo_urls: list[str] = Field(default_factory=list)
    signature_url: str = ""
    completed_at: datetime | None = None


class OrderResponse(BaseModel):
    id: str
    items: list[OrderItemResponse]
    subtotal: float
    shipping: float
    total: float
    status: OrderStatus
    status_history: list[StatusHistoryResponse] = Field(default_factory=list)
    shipping_address: ShippingAddressResponse
    payment_reference: str
    courier_id: str | None = None
    assigned_at: datetime | None = None
    delivery_deadline: datetime | None = None
    delivery_evidence: DeliveryEvidenceResponse | None = None
    created_at: datetime
    updated_at: datetime


class UpdateOrderStatusRequest(BaseModel):
    status: OrderStatus
    note: str = ""


class AdminOrderResponse(OrderResponse):
    user_id: str
    customer_name: str
    customer_email: str
    courier_name: str | None = None


class AssignCourierRequest(BaseModel):
    courier_id: str
    delivery_deadline: datetime | None = None
    note: str = ""


class CourierDeliveryResponse(OrderResponse):
    customer_name: str
    customer_phone: str


class InboxBadgeResponse(BaseModel):
    has_new: bool
    new_count: int


class DisputeContactResponse(BaseModel):
    manager_email: str
