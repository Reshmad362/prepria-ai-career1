from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, Any, Optional
import logging
from app.services.email_service import (
    send_notification_email,
    get_email_credentials,
    get_smtp_config,
    is_development_mode
)

router = APIRouter()
logger = logging.getLogger(__name__)

class EmailPayload(BaseModel):
    event_type: str
    subject: str
    data: Dict[str, Any]

@router.get("/status")
def get_email_status():
    """Diagnostic check for email service configuration (safe, reveals no passwords)."""
    user, password = get_email_credentials()
    host, port = get_smtp_config()
    is_dev = is_development_mode()
    return {
        "mode": "development" if is_dev else "production",
        "dev_otp_mode": is_dev and not bool(user and password),
        "smtp_configured": bool(user and password),
        "smtp_host": host,
        "smtp_port": port,
        "sender_email": user if user else None,
        "has_password": bool(password)
    }

@router.post("/send")
async def send_email(payload: EmailPayload):
    """
    Endpoint to trigger an email notification synchronously so caller knows exact outcome.
    """
    logger.info(f"Received email request for event: {payload.event_type}")
    
    valid_events = ["signup", "resume_upload", "interview", "course_completion", "certificate", "otp"]
    if payload.event_type not in valid_events:
        raise HTTPException(status_code=400, detail=f"Invalid event type. Must be one of {valid_events}")

    success = send_notification_email(payload.subject, payload.event_type, payload.data)
    
    if not success:
        logger.error(f"Email delivery failed for event: {payload.event_type}")
        raise HTTPException(status_code=500, detail="Failed to send email notification. Check SMTP credentials in backend/.env")
        
    return {"message": "Email notification processed successfully", "success": True}
