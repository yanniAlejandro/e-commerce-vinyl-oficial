from datetime import datetime
from enum import Enum

from beanie import Document, Indexed, Link
from pydantic import Field

from app.models.category import Category


class VinylFormat(str, Enum):
    LP = "LP"
    EP = "EP"
    SINGLE = "Single"


class Product(Document):
    name: str
    slug: Indexed(str, unique=True)
    sku: Indexed(str, unique=True)
    artist: Indexed(str)
    description: str
    price: float
    stock: int = 0
    genre: str
    year: int | None = None
    label: str = ""
    format: VinylFormat = VinylFormat.LP
    image_url: str = ""
    category: Link[Category]
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "products"
