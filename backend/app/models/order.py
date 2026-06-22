from datetime import datetime
from enum import Enum

from beanie import Document, Indexed
from pydantic import BaseModel, Field


class OrderStatus(str, Enum):
    PEDIDO = "pedido"
    RECOGIDA = "recogida"
    CARGADO = "cargado"
    ENTREGADO = "entregado"
    CANCELADO = "cancelado"
    # Legacy values kept for existing documents
    PENDING = "pending"
    PAID = "paid"
    SHIPPED = "shipped"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"


class ShippingAddress(BaseModel):
    full_name: str
    street: str
    city: str
    state: str
    postal_code: str
    country: str = "ES"
    phone: str = ""
    latitude: float | None = None
    longitude: float | None = None


class OrderItem(BaseModel):
    product_id: str
    name: str
    artist: str
    price: float
    quantity: int
    image_url: str = ""


class StatusHistoryEntry(BaseModel):
    status: OrderStatus
    changed_at: datetime = Field(default_factory=datetime.utcnow)
    note: str = ""
    changed_by: str = ""
    changed_by_role: str = ""


class DeliveryEvidence(BaseModel):
    photo_urls: list[str] = Field(default_factory=list)
    signature_url: str = ""
    completed_at: datetime | None = None


class Order(Document):
    user_id: Indexed(str)
    items: list[OrderItem]
    subtotal: float
    shipping: float = 5.99
    total: float
    status: OrderStatus = OrderStatus.PEDIDO
    status_history: list[StatusHistoryEntry] = Field(default_factory=list)
    shipping_address: ShippingAddress
    payment_reference: str = ""
    idempotency_key: Indexed(str, unique=True)
    courier_id: str | None = None
    assigned_at: datetime | None = None
    delivery_deadline: datetime | None = None
    delivery_evidence: DeliveryEvidence | None = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "orders"
