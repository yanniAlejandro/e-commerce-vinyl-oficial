from beanie import Document
from pydantic import Field


class AppSettings(Document):
    """Singleton document for app-wide configuration (warehouse location)."""

    key: str = "default"
    warehouse_name: str = "Almacén QTB La Habana"
    warehouse_address: str = "Calle Obispo, La Habana Vieja, Cuba"
    warehouse_latitude: float = 23.1355
    warehouse_longitude: float = -82.3508

    class Settings:
        name = "app_settings"
