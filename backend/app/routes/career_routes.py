from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from app.services.career_suggestion import generate_career_suggestions

router = APIRouter(prefix="/career-suggestions", tags=["Career Suggestions"])

class CareerSuggestionRequest(BaseModel):
    user_id: str
    resume_skills: Optional[List[str]] = []
    matched_roles: Optional[List[str]] = []
    latest_score: Optional[float] = 0.0
    fluency_score: Optional[float] = 0.0
    weak_skills: Optional[List[str]] = []
    history_available: Optional[bool] = False

@router.post("")
async def get_career_suggestions(req: CareerSuggestionRequest):
    try:
        suggestions = generate_career_suggestions(req.dict())
        return suggestions
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
