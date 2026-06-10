from pydantic import BaseModel


class CoverUploadResponse(BaseModel):
    url: str
    public_id: str
    width: int
    height: int
    format: str
