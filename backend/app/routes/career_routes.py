from fastapi import APIRouter, HTTPException, Header
from pydantic import BaseModel
from typing import List, Optional
from app.services.career_suggestion import generate_career_suggestions
from app.routes.auth_routes import get_current_user, verify_user_ownership

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
async def get_career_suggestions(req: CareerSuggestionRequest, authorization: Optional[str] = Header(None)):
    current_user = get_current_user(authorization)
    if not verify_user_ownership(req.user_id, current_user):
        raise HTTPException(status_code=403, detail="Forbidden: You do not have permission to access career suggestions for another user.")

    try:
        data = req.dict()
        data["user_id"] = current_user.get("email") or current_user.get("id")
        suggestions = generate_career_suggestions(data)
        return suggestions
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
