import logging
import smtplib
from email.mime.text import MIMEText

from app.config import settings

logger = logging.getLogger(__name__)


async def send_otp_email(to_email: str, code: str, purpose: str = "registro") -> None:
    subject = f"QTB — Código de verificación ({purpose})"
    body = (
        f"Tu código de verificación para {purpose} en QTB Mensajeros es:\n\n"
        f"  {code}\n\n"
        f"Expira en {settings.otp_expire_minutes} minutos.\n"
        f"Si no solicitaste este código, ignora este mensaje."
    )

    if not settings.smtp_host:
        logger.warning("SMTP not configured — OTP for %s: %s", to_email, code)
        print(f"[DEV OTP] {to_email}: {code}")
        return

    message = MIMEText(body, "plain", "utf-8")
    message["Subject"] = subject
    message["From"] = settings.smtp_from or settings.smtp_user
    message["To"] = to_email

    try:
        with smtplib.SMTP(settings.smtp_host, settings.smtp_port) as server:
            if settings.smtp_use_tls:
                server.starttls()
            if settings.smtp_user and settings.smtp_password:
                server.login(settings.smtp_user, settings.smtp_password)
            server.sendmail(message["From"], [to_email], message.as_string())
    except Exception as exc:
        logger.error("Failed to send OTP email to %s: %s", to_email, exc)
        print(f"[DEV OTP fallback] {to_email}: {code}")
        raise
