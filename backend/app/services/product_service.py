from beanie.operators import Or, RegEx

from app.models.category import Category
from app.models.product import Product
from app.schemas.product import ProductListResponse, ProductResponse


async def _resolve_category(product: Product) -> tuple[str, str]:
    category = await product.fetch_link(Product.category)
    if category:
        return str(category.id), category.name
    return "", ""


async def product_to_response(product: Product) -> ProductResponse:
    category_id, category_name = await _resolve_category(product)
    return ProductResponse(
        id=str(product.id),
        name=product.name,
        slug=product.slug,
        sku=product.sku,
        artist=product.artist,
        description=product.description,
        price=product.price,
        stock=product.stock,
        genre=product.genre,
        year=product.year,
        label=product.label,
        format=product.format,
        image_url=product.image_url,
        category_id=category_id,
        category_name=category_name,
        is_active=product.is_active,
        created_at=product.created_at,
    )


async def list_products(
    page: int = 1,
    page_size: int = 12,
    search: str | None = None,
    genre: str | None = None,
    category_slug: str | None = None,
    artist: str | None = None,
) -> ProductListResponse:
    filters: list = [Product.is_active == True]

    if search:
        filters.append(
            Or(
                RegEx(Product.name, search, "i"),
                RegEx(Product.artist, search, "i"),
            )
        )

    if genre:
        filters.append(Product.genre == genre)

    if artist:
        filters.append(RegEx(Product.artist, artist, "i"))

    if category_slug:
        category = await Category.find_one(Category.slug == category_slug)
        if category:
            filters.append(Product.category.id == category.id)

    query = Product.find(*filters)
    total = await query.count()
    skip = (page - 1) * page_size
    products = await query.sort("-created_at").skip(skip).limit(page_size).to_list()
    items = [await product_to_response(p) for p in products]

    return ProductListResponse(items=items, total=total, page=page, page_size=page_size)


async def get_product_by_slug(slug: str) -> ProductResponse | None:
    product = await Product.find_one(Product.slug == slug, Product.is_active == True)
    if not product:
        return None
    return await product_to_response(product)


async def get_product_by_id(product_id: str) -> Product | None:
    return await Product.get(product_id)


async def list_genres() -> list[str]:
    genres = await Product.distinct("genre", {"is_active": True})
    return sorted(g for g in genres if g)
