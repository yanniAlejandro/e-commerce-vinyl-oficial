from datetime import datetime

from pydantic import BaseModel


class CategoryResponse(BaseModel):
    id: str
    name: str
    slug: str
    description: str


class CategoryCreate(BaseModel):
    name: str
    slug: str
    description: str = ""
