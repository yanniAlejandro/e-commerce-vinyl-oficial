from datetime import datetime

from beanie import Document, Indexed
from pydantic import Field


class Category(Document):
    name: str
    slug: Indexed(str, unique=True)
    description: str = ""
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "categories"
