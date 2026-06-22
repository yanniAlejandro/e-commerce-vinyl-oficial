import random
import secrets
from datetime import datetime, timedelta

from app.config import settings
from app.core.security import hash_password


def generate_otp_code(length: int | None = None) -> str:
    size = length or settings.otp_length
    return "".join(str(random.randint(0, 9)) for _ in range(size))


def hash_otp(code: str) -> str:
    return hash_password(code)


def verify_otp(code: str, otp_hash: str) -> bool:
    from app.core.security import verify_password

    return verify_password(code, otp_hash)


def otp_expires_at() -> datetime:
    return datetime.utcnow() + timedelta(minutes=settings.otp_expire_minutes)


def can_resend_otp(last_sent_at: datetime) -> bool:
    elapsed = (datetime.utcnow() - last_sent_at).total_seconds()
    return elapsed >= settings.otp_resend_cooldown_seconds


def resend_cooldown_remaining(last_sent_at: datetime) -> int:
    elapsed = (datetime.utcnow() - last_sent_at).total_seconds()
    remaining = settings.otp_resend_cooldown_seconds - elapsed
    return max(0, int(remaining))
