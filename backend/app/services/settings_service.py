from app.models.settings import AppSettings
from app.schemas.settings import WarehouseSettingsResponse, WarehouseSettingsUpdate


async def get_or_create_settings() -> AppSettings:
    settings_doc = await AppSettings.find_one(AppSettings.key == "default")
    if not settings_doc:
        settings_doc = AppSettings()
        await settings_doc.insert()
    return settings_doc


async def get_warehouse_settings() -> WarehouseSettingsResponse:
    doc = await get_or_create_settings()
    return WarehouseSettingsResponse(
        warehouse_name=doc.warehouse_name,
        warehouse_address=doc.warehouse_address,
        warehouse_latitude=doc.warehouse_latitude,
        warehouse_longitude=doc.warehouse_longitude,
    )


async def update_warehouse_settings(payload: WarehouseSettingsUpdate) -> WarehouseSettingsResponse:
    doc = await get_or_create_settings()
    doc.warehouse_name = payload.warehouse_name
    doc.warehouse_address = payload.warehouse_address
    doc.warehouse_latitude = payload.warehouse_latitude
    doc.warehouse_longitude = payload.warehouse_longitude
    await doc.save()
    return await get_warehouse_settings()
