from fastapi import APIRouter, HTTPException, Query, status

from app.schemas.product import ProductListResponse, ProductResponse
from app.services.product_service import get_product_by_slug, list_genres, list_products

router = APIRouter(prefix="/products", tags=["products"])


@router.get("", response_model=ProductListResponse)
async def get_products(
    page: int = Query(1, ge=1),
    page_size: int = Query(12, ge=1, le=48),
    search: str | None = None,
    genre: str | None = None,
    category: str | None = None,
    artist: str | None = None,
):
    return await list_products(
        page=page,
        page_size=page_size,
        search=search,
        genre=genre,
        category_slug=category,
        artist=artist,
    )


@router.get("/genres", response_model=list[str])
async def get_genres():
    return await list_genres()


@router.get("/{slug}", response_model=ProductResponse)
async def get_product(slug: str):
    product = await get_product_by_slug(slug)
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    return product
