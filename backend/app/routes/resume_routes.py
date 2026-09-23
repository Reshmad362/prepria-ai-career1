from fastapi import APIRouter, UploadFile, File, HTTPException, Header
from typing import Optional
from app.services.resume_service import process_resume_upload
from app.services.auth_service import decode_token, update_user_profile, get_user_by_email_or_id
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

@router.post("/upload-resume")
async def upload_resume(
    file: UploadFile = File(None), 
    authorization: Optional[str] = Header(None)
):
    """
    Endpoint to handle resume file uploads.
    Accepts .pdf and .docx files under 10MB.
    Processes ATS parsing and attaches resume intelligence to the authenticated user.
    """
    if file is None:
        raise HTTPException(status_code=400, detail="No file uploaded")
        
    result = await process_resume_upload(file)
    
    # If authenticated, persist resume intelligence to user's persistent profile record
    if authorization:
        if not authorization.startswith("Bearer "):
            raise HTTPException(status_code=401, detail="Invalid authorization header format")
        token = authorization.split("Bearer ")[1].strip()
        payload = decode_token(token)
        if not payload or not payload.get("email"):
            raise HTTPException(status_code=401, detail="Invalid or expired session token")
            
        email = payload.get("email")
        ats_data = result.get("data", {})
        
        resume_profile_data = {
            "resumeUploaded": True,
            "resumeFileName": file.filename or result.get("filename", ""),
            "score": ats_data.get("score", 0),
            "skills": ats_data.get("skills", []),
            "experience": ats_data.get("experience", ""),
            "projects": ats_data.get("projects", []),
            "education": ats_data.get("education", ""),
            "keywords": ats_data.get("keywords", []),
            "feedback": ats_data.get("feedback", {})
        }
        
        try:
            update_user_profile(email, resume_profile_data)
            logger.info("Resume intelligence successfully persisted for user %s with ATS score %s", email, ats_data.get("score"))
        except Exception as e:
            logger.warning("Could not auto-link resume to user record: %s", str(e))
            
    return result
