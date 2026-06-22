from beanie import init_beanie
from pymongo import AsyncMongoClient

from app.config import settings
from app.models.cart import Cart
from app.models.category import Category
from app.models.order import Order
from app.models.pending_courier import PendingCourierRegistration
from app.models.product import Product
from app.models.settings import AppSettings
from app.models.user import User

client: AsyncMongoClient | None = None


async def connect_db() -> None:
    global client
    client = AsyncMongoClient(settings.mongodb_uri)
    await init_beanie(
        database=client[settings.mongodb_db],
        document_models=[User, Category, Product, Cart, Order, PendingCourierRegistration, AppSettings],
    )


async def close_db() -> None:
    global client
    if client:
        await client.close()
        client = None
