from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from app.services.emotion_analysis_service import analyze_emotion

router = APIRouter(tags=["Emotion Detection"])

class EmotionRequest(BaseModel):
    base64_image: Optional[str] = None

@router.post("/emotion-detection", summary="Detect emotion from a base64 encoded image frame")
async def emotion_detection_endpoint(req: EmotionRequest):
    try:
        result = analyze_emotion(req.base64_image)
        return {"success": True, "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
