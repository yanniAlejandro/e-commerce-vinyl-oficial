from fastapi import APIRouter

from app.schemas.category import CategoryResponse
from app.services.category_service import list_categories

router = APIRouter(prefix="/categories", tags=["categories"])


@router.get("", response_model=list[CategoryResponse])
async def get_categories():
    return await list_categories()
