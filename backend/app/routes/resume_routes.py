from fastapi import APIRouter, UploadFile, File, HTTPException
from app.services.resume_service import process_resume_upload

router = APIRouter()

@router.post("/upload-resume")
async def upload_resume(file: UploadFile = File(None)):
    """
    Endpoint to handle resume file uploads.
    Accepts .pdf and .docx files under 10MB.
    Returns JSON response with upload success, filename, and file path.
    """
    if file is None:
        raise HTTPException(status_code=400, detail="No file uploaded")
        
    return await process_resume_upload(file)
