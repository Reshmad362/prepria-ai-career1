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

@router.get("/dashboard/{user_id}")
async def get_dashboard_metrics(user_id: str):
    try:
        from app.services.auth_service import users_db
        user_info = next((u for u in users_db if u.get('email') == user_id or u.get('id') == user_id), None)
        
        analytics = get_growth_analytics(user_id)
        history = analytics.get("history", [])
        
        # Calculate dynamic metrics based on longitudinal data
        ai_career_score = 0
        ats_score = 0
        tech_score = 0
        comm_score = 0
        confidence_score = 0
        interview_score = 0
        
        if history:
            ai_career_score = int(sum(h.get('score', 0) for h in history) / len(history))
            ats_score = int(sum(h.get('ats', 0) for h in history) / len(history))
            comm_score = int(sum(h.get('fluency', 0) for h in history) / len(history))
            confidence_score = int(sum(h.get('confidence', 0) for h in history) / len(history))
            tech_score = int(sum(h.get('score', 0) for h in history) / len(history)) # Defaulting tech to overall score
            interview_score = int(sum(h.get('score', 0) for h in history) / len(history))
        
        # Default mock data for new users
        if not history:
            ai_career_score = 0
            ats_score = 0
            comm_score = 0
            tech_score = 0
            confidence_score = 0
        
        return {
            "success": True,
            "data": {
                "aiCareerScore": ai_career_score,
                "careerReadiness": "High" if ai_career_score > 75 else "Medium" if ai_career_score > 50 else "Low",
                "atsScore": ats_score,
                "resumeMatch": f"{ats_score}%",
                "technicalScore": tech_score,
                "communicationScore": comm_score,
                "confidenceScore": confidence_score,
                "currentStreak": len(history) if history else 0, # simplified streak
                "learningHours": len(history) * 2, # mocked 2 hours per interview
                "interviewScore": interview_score,
                "profileCompletion": 85 if user_info else 50,
                "coursesCompleted": 0,
                "certificatesEarned": 0,
                "targetCompany": "Google", # To be fetched from profile in future
                "targetRole": "Software Engineer", # To be fetched from profile in future
                "recommendedNextStep": "Improve System Design" if "System Design" in analytics.get("weak_areas", []) else "Practice Mock Interview",
                "careerProgress": f"{ai_career_score}%",
                "resumeUpdatedDate": datetime.utcnow().strftime("%Y-%m-%d"),
                "weeklyGrowth": analytics.get("growth_percentage", 0),
                "monthlyGrowth": analytics.get("growth_percentage", 0) + 2.5,
                "interviewReadiness": f"{interview_score}%",
                "recentHistory": history[-5:] if history else [],
                "trend": analytics.get("score_trend", "No Data")
            }
        }
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
