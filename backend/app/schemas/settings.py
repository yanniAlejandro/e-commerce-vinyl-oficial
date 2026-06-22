from pydantic import BaseModel, Field


class WarehouseSettingsResponse(BaseModel):
    warehouse_name: str
    warehouse_address: str
    warehouse_latitude: float
    warehouse_longitude: float


class WarehouseSettingsUpdate(BaseModel):
    warehouse_name: str = Field(min_length=2)
    warehouse_address: str = Field(min_length=3)
    warehouse_latitude: float = Field(ge=-90, le=90)
    warehouse_longitude: float = Field(ge=-180, le=180)
