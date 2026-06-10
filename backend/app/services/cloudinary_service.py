import asyncio
import mimetypes

import cloudinary
import cloudinary.uploader
from fastapi import HTTPException, UploadFile, status

from app.config import settings

ALLOWED_CONTENT_TYPES = {"image/jpeg", "image/png", "image/webp", "image/jpg"}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5 MB
CLOUDINARY_TIMEOUT = 90
REQUEST_TIMEOUT = CLOUDINARY_TIMEOUT + 15


def _ensure_cloudinary_configured() -> None:
    if not all(
        [
            settings.cloudinary_cloud_name,
            settings.cloudinary_api_key,
            settings.cloudinary_api_secret,
        ]
    ):
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Cloudinary is not configured. Set CLOUDINARY_* variables in .env",
        )
    cloudinary.config(
        cloud_name=settings.cloudinary_cloud_name,
        api_key=settings.cloudinary_api_key,
        api_secret=settings.cloudinary_api_secret,
        secure=True,
    )


def _resolve_content_type(content_type: str | None, filename: str | None) -> str:
    normalized = (content_type or "").split(";")[0].strip().lower()
    if normalized == "image/jpg":
        normalized = "image/jpeg"
    if normalized in ALLOWED_CONTENT_TYPES or normalized == "image/jpeg":
        return "image/jpeg" if normalized in {"image/jpg", "image/jpeg"} else normalized

    if filename:
        guessed, _ = mimetypes.guess_type(filename)
        if guessed:
            guessed = guessed.lower()
            if guessed == "image/jpg":
                guessed = "image/jpeg"
            if guessed in {"image/jpeg", "image/png", "image/webp"}:
                return guessed

    return normalized


def _optimized_delivery_url(secure_url: str) -> str:
    """Apply transforms on delivery (faster upload than eager transformation)."""
    marker = "/upload/"
    if marker in secure_url:
        return secure_url.replace(marker, "/upload/c_limit,w_1200,h_1200,q_auto/", 1)
    return secure_url


def _upload_to_cloudinary(content: bytes) -> dict:
    return cloudinary.uploader.upload(
        content,
        folder=settings.cloudinary_folder,
        resource_type="image",
        overwrite=False,
        timeout=CLOUDINARY_TIMEOUT,
    )


async def upload_cover_image(file: UploadFile) -> dict:
    _ensure_cloudinary_configured()

    resolved_type = _resolve_content_type(file.content_type, file.filename)
    if resolved_type not in {"image/jpeg", "image/png", "image/webp"}:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid file type ({file.content_type or 'unknown'}). Allowed: JPEG, PNG, WebP",
        )

    content = await file.read()
    if not content:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Empty file")
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File too large. Maximum size is 5 MB",
        )

    try:
        result = await asyncio.wait_for(
            asyncio.to_thread(_upload_to_cloudinary, content),
            timeout=REQUEST_TIMEOUT,
        )
    except asyncio.TimeoutError as exc:
        raise HTTPException(
            status_code=status.HTTP_504_GATEWAY_TIMEOUT,
            detail=(
                "Cloudinary tardó demasiado. Prueba con una imagen más pequeña "
                "o comprueba tu conexión a internet."
            ),
        ) from exc
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Cloudinary upload failed: {exc}",
        ) from exc

    delivery_url = _optimized_delivery_url(result["secure_url"])

    return {
        "url": delivery_url,
        "public_id": result["public_id"],
        "width": result.get("width", 0),
        "height": result.get("height", 0),
        "format": result.get("format", ""),
    }
