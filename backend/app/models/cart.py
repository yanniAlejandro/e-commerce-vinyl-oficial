from datetime import datetime

from beanie import Document, Indexed
from pydantic import BaseModel, Field


class CartItem(BaseModel):
    product_id: str
    name: str
    artist: str
    price: float
    quantity: int
    image_url: str = ""


class Cart(Document):
    user_id: Indexed(str, unique=True)
    items: list[CartItem] = Field(default_factory=list)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "carts"
