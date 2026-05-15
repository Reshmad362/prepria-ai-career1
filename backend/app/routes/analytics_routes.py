from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, Any, Optional
from datetime import datetime
from app.services.performance_tracker import record_interview, get_growth_analytics

router = APIRouter(prefix="/analytics", tags=["Longitudinal Analytics"])

class InterviewResultLog(BaseModel):
    user_id: str
    role: str
    score: float
    fluency_score: int
    emotion_confidence: float
    ats_score: int
    timestamp: Optional[str] = None

@router.post("/record")
async def log_interview(req: InterviewResultLog):
    data = req.dict()
    if not data['timestamp']:
        data['timestamp'] = datetime.utcnow().isoformat()
    record_interview(data)
    return {"success": True, "message": "Interview stored in longitudinal tracker"}

@router.get("/growth/{user_id}")
async def get_growth(user_id: str):
    try:
        analytics = get_growth_analytics(user_id)
        return {
            "success": True,
            "data": analytics
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
