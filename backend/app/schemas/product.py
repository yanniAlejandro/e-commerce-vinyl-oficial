from datetime import datetime
from enum import Enum

from pydantic import BaseModel, Field


class VinylFormat(str, Enum):
    LP = "LP"
    EP = "EP"
    SINGLE = "Single"


class ProductResponse(BaseModel):
    id: str
    name: str
    slug: str
    sku: str
    artist: str
    description: str
    price: float
    stock: int
    genre: str
    year: int | None
    label: str
    format: VinylFormat
    image_url: str
    category_id: str
    category_name: str
    is_active: bool
    created_at: datetime


class ProductListResponse(BaseModel):
    items: list[ProductResponse]
    total: int
    page: int
    page_size: int


class ProductCreate(BaseModel):
    name: str
    slug: str
    sku: str
    artist: str
    description: str
    price: float = Field(gt=0)
    stock: int = Field(ge=0)
    genre: str
    year: int | None = None
    label: str = ""
    format: VinylFormat = VinylFormat.LP
    image_url: str = ""
    category_id: str


class ProductUpdate(BaseModel):
    name: str | None = None
    slug: str | None = None
    sku: str | None = None
    artist: str | None = None
    description: str | None = None
    price: float | None = Field(default=None, gt=0)
    stock: int | None = Field(default=None, ge=0)
    genre: str | None = None
    year: int | None = None
    label: str | None = None
    format: VinylFormat | None = None
    image_url: str | None = None
    category_id: str | None = None
    is_active: bool | None = None
