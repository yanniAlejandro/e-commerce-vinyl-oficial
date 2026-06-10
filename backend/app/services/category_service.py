from app.models.category import Category
from app.schemas.category import CategoryResponse


def category_to_response(category: Category) -> CategoryResponse:
    return CategoryResponse(
        id=str(category.id),
        name=category.name,
        slug=category.slug,
        description=category.description,
    )


async def list_categories() -> list[CategoryResponse]:
    categories = await Category.find_all().sort("+name").to_list()
    return [category_to_response(c) for c in categories]
