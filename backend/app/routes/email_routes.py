from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel
from typing import Dict, Any, Optional
import logging
from app.services.email_service import send_notification_email

router = APIRouter()
logger = logging.getLogger(__name__)

class EmailPayload(BaseModel):
    event_type: str
    subject: str
    data: Dict[str, Any]

@router.post("/send")
async def send_email(payload: EmailPayload, background_tasks: BackgroundTasks):
    """
    Endpoint to trigger an email notification.
    We process the email in a background task to avoid blocking the API response.
    """
    logger.info(f"Received email request for event: {payload.event_type}")
    
    # Check if event_type is valid
    valid_events = ["signup", "resume_upload", "interview", "course_completion", "certificate", "otp"]
    if payload.event_type not in valid_events:
        raise HTTPException(status_code=400, detail=f"Invalid event type. Must be one of {valid_events}")

    # Synchronous attempt first so we can confidently return success to frontend 
    # Or, we can just run it synchronously since we want the frontend to know the EXACT result.
    # The user requested: "The frontend should display success notifications only after receiving a successful response from the FastAPI backend confirming SMTP delivery."
    # So we will run it synchronously.
    
    success = send_notification_email(payload.subject, payload.event_type, payload.data)
    
    if not success:
        logger.error(f"Email delivery failed for event: {payload.event_type}")
        raise HTTPException(status_code=500, detail="Failed to send email notification")
        
    return {"message": "Email sent successfully", "success": True}
