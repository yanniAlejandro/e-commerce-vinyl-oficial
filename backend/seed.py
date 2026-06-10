"""Seed script for vinyl shop database."""
import asyncio

from app.config import settings
from app.core.security import hash_password
from app.database import connect_db, close_db
from app.models.category import Category
from app.models.product import Product, VinylFormat
from app.models.user import User, UserRole

CATEGORIES = [
    {"name": "Rock", "slug": "rock", "description": "Clásicos y modernos del rock en vinilo"},
    {"name": "Jazz", "slug": "jazz", "description": "Jazz clásico y contemporáneo"},
    {"name": "Soul & Funk", "slug": "soul-funk", "description": "Grooves atemporales"},
    {"name": "Electrónica", "slug": "electronica", "description": "Desde ambient hasta techno"},
    {"name": "Latino", "slug": "latino", "description": "Salsa, bossa nova y más"},
    {"name": "Indie", "slug": "indie", "description": "Descubrimientos independientes"},
]

PRODUCTS = [
    {
        "name": "Dark Side of the Moon",
        "slug": "pink-floyd-dark-side-of-the-moon",
        "sku": "PF-DSOTM-LP",
        "artist": "Pink Floyd",
        "description": "Edición remasterizada en vinilo 180g. Obra maestra del rock progresivo.",
        "price": 34.99,
        "stock": 15,
        "genre": "Rock",
        "year": 1973,
        "label": "Harvest",
        "format": VinylFormat.LP,
        "image_url": "https://images.unsplash.com/photo-1619983081563-430f63602796?w=400&h=400&fit=crop",
        "category_slug": "rock",
    },
    {
        "name": "Kind of Blue",
        "slug": "miles-davis-kind-of-blue",
        "sku": "MD-KOB-LP",
        "artist": "Miles Davis",
        "description": "El álbum de jazz más vendido de la historia. Edición audiophile.",
        "price": 29.99,
        "stock": 20,
        "genre": "Jazz",
        "year": 1959,
        "label": "Columbia",
        "format": VinylFormat.LP,
        "image_url": "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop",
        "category_slug": "jazz",
    },
    {
        "name": "What's Going On",
        "slug": "marvin-gaye-whats-going-on",
        "sku": "MG-WGO-LP",
        "artist": "Marvin Gaye",
        "description": "Soul consciente y atemporal. Vinilo negro 180g.",
        "price": 27.99,
        "stock": 12,
        "genre": "Soul",
        "year": 1971,
        "label": "Tamla",
        "format": VinylFormat.LP,
        "image_url": "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&h=400&fit=crop",
        "category_slug": "soul-funk",
    },
    {
        "name": "Random Access Memories",
        "slug": "daft-punk-random-access-memories",
        "sku": "DP-RAM-LP",
        "artist": "Daft Punk",
        "description": "Disco del año con colaboraciones legendarias. Edición gatefold.",
        "price": 32.99,
        "stock": 18,
        "genre": "Electrónica",
        "year": 2013,
        "label": "Columbia",
        "format": VinylFormat.LP,
        "image_url": "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=400&fit=crop",
        "category_slug": "electronica",
    },
    {
        "name": "Buena Vista Social Club",
        "slug": "buena-vista-social-club",
        "sku": "BVSC-LP",
        "artist": "Buena Vista Social Club",
        "description": "La magia de La Habana en vinilo. Grammy al mejor álbum latino.",
        "price": 26.99,
        "stock": 14,
        "genre": "Latino",
        "year": 1997,
        "label": "World Circuit",
        "format": VinylFormat.LP,
        "image_url": "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&h=400&fit=crop",
        "category_slug": "latino",
    },
    {
        "name": "AM",
        "slug": "arctic-monkeys-am",
        "sku": "AM-AM-LP",
        "artist": "Arctic Monkeys",
        "description": "Indie rock con toques de R&B. Edición limitada en vinilo negro.",
        "price": 28.99,
        "stock": 22,
        "genre": "Indie",
        "year": 2013,
        "label": "Domino",
        "format": VinylFormat.LP,
        "image_url": "https://images.unsplash.com/photo-1459745451174-04fa0ac67340?w=400&h=400&fit=crop",
        "category_slug": "indie",
    },
    {
        "name": "Led Zeppelin IV",
        "slug": "led-zeppelin-iv",
        "sku": "LZ-IV-LP",
        "artist": "Led Zeppelin",
        "description": "Incluye Stairway to Heaven. Remaster 2014 en vinilo 180g.",
        "price": 31.99,
        "stock": 10,
        "genre": "Rock",
        "year": 1971,
        "label": "Atlantic",
        "format": VinylFormat.LP,
        "image_url": "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=400&h=400&fit=crop",
        "category_slug": "rock",
    },
    {
        "name": "A Love Supreme",
        "slug": "john-coltrane-a-love-supreme",
        "sku": "JC-ALS-LP",
        "artist": "John Coltrane",
        "description": "Suite espiritual en cuatro movimientos. Imprescindible.",
        "price": 24.99,
        "stock": 8,
        "genre": "Jazz",
        "year": 1965,
        "label": "Impulse!",
        "format": VinylFormat.LP,
        "image_url": "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400&h=400&fit=crop",
        "category_slug": "jazz",
    },
    {
        "name": "Mothership Connection",
        "slug": "parliament-mothership-connection",
        "sku": "PF-MC-LP",
        "artist": "Parliament",
        "description": "P-Funk en su máxima expresión. Vinilo colorido edición especial.",
        "price": 33.99,
        "stock": 6,
        "genre": "Funk",
        "year": 1975,
        "label": "Casablanca",
        "format": VinylFormat.LP,
        "image_url": "https://images.unsplash.com/photo-1571330737116-fde792d1e875?w=400&h=400&fit=crop",
        "category_slug": "soul-funk",
    },
    {
        "name": "Discovery",
        "slug": "daft-punk-discovery",
        "sku": "DP-DIS-LP",
        "artist": "Daft Punk",
        "description": "French house legendario. Incluye One More Time y Digital Love.",
        "price": 30.99,
        "stock": 16,
        "genre": "Electrónica",
        "year": 2001,
        "label": "Virgin",
        "format": VinylFormat.LP,
        "image_url": "https://images.unsplash.com/photo-1598488035139-bdbb2231fcc4?w=400&h=400&fit=crop",
        "category_slug": "electronica",
    },
    {
        "name": "El Madrileño",
        "slug": "c-tangana-el-madrileno",
        "sku": "CT-EM-LP",
        "artist": "C. Tangana",
        "description": "Fusión de flamenco, pop y hip-hop. Edición doble LP.",
        "price": 35.99,
        "stock": 11,
        "genre": "Latino",
        "year": 2021,
        "label": "Sony",
        "format": VinylFormat.LP,
        "image_url": "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=400&h=400&fit=crop",
        "category_slug": "latino",
    },
    {
        "name": "Currents",
        "slug": "tame-impala-currents",
        "sku": "TI-CUR-LP",
        "artist": "Tame Impala",
        "description": "Psicodelia moderna con producción impecable.",
        "price": 29.99,
        "stock": 19,
        "genre": "Indie",
        "year": 2015,
        "label": "Modular",
        "format": VinylFormat.LP,
        "image_url": "https://images.unsplash.com/photo-1485579149621-3123dd97980f?w=400&h=400&fit=crop",
        "category_slug": "indie",
    },
]


async def seed() -> None:
    await connect_db()

    existing_products = await Product.count()
    if existing_products == 0:
        category_map: dict[str, Category] = {}
        for cat_data in CATEGORIES:
            category = Category(**cat_data)
            await category.insert()
            category_map[cat_data["slug"]] = category
            print(f"Created category: {cat_data['name']}")

        for prod_data in PRODUCTS:
            category_slug = prod_data.pop("category_slug")
            category = category_map[category_slug]
            product = Product(**prod_data, category=category)
            await product.insert()
            print(f"Created product: {prod_data['artist']} - {prod_data['name']}")
    else:
        print("Products already exist. Skipping catalog seed.")

    admin = await User.find_one(User.email == "admin@vinylshop.com")
    if not admin:
        admin = User(
            email="admin@vinylshop.com",
            hashed_password=hash_password("admin1234"),
            full_name="Admin Vinyl Shop",
            role=UserRole.ADMIN,
        )
        await admin.insert()
        print("Created admin user: admin@vinylshop.com / admin1234")

    demo = await User.find_one(User.email == "demo@vinylshop.com")
    if not demo:
        demo = User(
            email="demo@vinylshop.com",
            hashed_password=hash_password("demo1234"),
            full_name="Usuario Demo",
            role=UserRole.CUSTOMER,
        )
        await demo.insert()
        print("Created demo user: demo@vinylshop.com / demo1234")

    await close_db()
    print("Seed completed successfully!")


if __name__ == "__main__":
    asyncio.run(seed())
