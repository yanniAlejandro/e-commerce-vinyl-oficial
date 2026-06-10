from datetime import datetime

from pydantic import BaseModel, Field


class CartItemResponse(BaseModel):
    product_id: str
    name: str
    artist: str
    price: float
    quantity: int
    image_url: str = ""
    line_total: float


class CartResponse(BaseModel):
    items: list[CartItemResponse]
    subtotal: float
    item_count: int
    updated_at: datetime


class AddToCartRequest(BaseModel):
    product_id: str
    quantity: int = Field(default=1, ge=1)


class UpdateCartItemRequest(BaseModel):
    quantity: int = Field(ge=0)
