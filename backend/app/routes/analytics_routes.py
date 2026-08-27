from fastapi import APIRouter, HTTPException, Header
from pydantic import BaseModel
from typing import Dict, Any, Optional, List
from datetime import datetime
from app.services.performance_tracker import record_interview, get_growth_analytics, interviews_db
from app.services.engagement_service import (
    record_user_activity,
    get_user_activities,
    get_user_engagement_metrics,
    save_user_course_progress,
    get_user_course_progress,
    validate_certificate_eligibility,
    get_all_user_course_progress
)

router = APIRouter(prefix="/analytics", tags=["Longitudinal Analytics & Engagement"])


class InterviewResultLog(BaseModel):
    user_id: str
    role: str
    score: float
    fluency_score: int
    emotion_confidence: float
    ats_score: int
    timestamp: Optional[str] = None


class UserActivityLog(BaseModel):
    user_id: str
    activity_type: str
    title: str
    duration_minutes: Optional[int] = 0
    timestamp: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None


class CourseProgressPayload(BaseModel):
    user_id: str
    course_id: str
    progress_data: Dict[str, Any]


@router.post("/record")
async def log_interview(req: InterviewResultLog):
    data = req.dict()
    if not data.get('timestamp'):
        data['timestamp'] = datetime.utcnow().isoformat()
    record_interview(data)
    record_user_activity({
        "user_id": data["user_id"],
        "activity_type": "interview_complete",
        "title": f"Completed AI Mock Interview ({data.get('role', 'Technical')})",
        "duration_minutes": 20,
        "timestamp": data['timestamp'],
        "metadata": {"role": data.get("role"), "score": data.get("score"), "ats_score": data.get("ats_score")}
    })
    return {"success": True, "message": "Interview stored in longitudinal tracker"}


@router.post("/activity/record")
async def log_activity(req: UserActivityLog):
    """Central endpoint to record any learning activity (lesson, quiz, course, certificate)."""
    try:
        data = req.dict()
        recorded = record_user_activity(data)
        return {"success": True, "data": recorded}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/engagement/{user_id}")
async def get_engagement(user_id: str):
    """Returns authentic engagement metrics: streak, learning time, weekly heatmap, etc."""
    try:
        engagement = get_user_engagement_metrics(user_id)
        return {"success": True, "data": engagement}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/activity/{user_id}")
async def get_activities(user_id: str, limit: int = 15):
    """Returns recent meaningful learning activities for the user."""
    try:
        acts = get_user_activities(user_id, limit=limit)
        return {"success": True, "data": acts}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/course/progress")
async def save_progress(req: CourseProgressPayload):
    """
    Saves verified course progress with server-side certificate eligibility validation.
    Progress is persisted to disk and survives server restarts.
    """
    try:
        saved = save_user_course_progress(req.user_id, req.course_id, req.progress_data)
        return {"success": True, "data": saved}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/course/progress/{user_id}/{course_id}")
async def get_progress(user_id: str, course_id: str):
    """Retrieves stored course progress for a user (persisted from previous sessions)."""
    try:
        prog = get_user_course_progress(user_id, course_id)
        return {"success": True, "data": prog}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/course/progress/{user_id}")
async def get_all_progress(user_id: str):
    """Returns all course progress records for a user across all courses."""
    try:
        all_prog = get_all_user_course_progress(user_id)
        return {"success": True, "data": all_prog}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/course/certificate/{user_id}/{course_id}")
async def check_certificate(user_id: str, course_id: str):
    """
    Backend certificate eligibility validation endpoint.
    Frontend Certificate.jsx calls this to confirm eligibility independently of localStorage.
    """
    try:
        result = validate_certificate_eligibility(user_id, course_id)
        return {"success": True, "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/growth/{user_id}")
async def get_growth(user_id: str):
    try:
        analytics = get_growth_analytics(user_id)
        return {"success": True, "data": analytics}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/dashboard/{user_id}")
async def get_dashboard(user_id: str):
    """
    Backend endpoint required by `frontend/src/pages/Dashboard.jsx`.
    The frontend expects a specific JSON shape for executive KPI cards,
    longitudinal chart history, weekly heatmap, and recent activities.
    """
    try:
        user_lower = str(user_id).strip().lower()

        # Engagement metrics (streak, lessons, weekly heatmap, certs, etc.)
        engagement = get_user_engagement_metrics(user_lower)

        # Interview longitudinal metrics (trend + chart history)
        growth = get_growth_analytics(user_lower)

        # Latest interview for score-based cards (if any)
        user_interviews = [i for i in interviews_db if str(i.get("user_id", "")).strip().lower() == user_lower]
        user_interviews.sort(
            key=lambda x: datetime.fromisoformat(x["timestamp"]) if isinstance(x.get("timestamp"), str) else datetime.min,
            reverse=True
        )
        latest = user_interviews[0] if user_interviews else None

        latest_score = float(latest.get("score", 0) or 0) if latest else 0.0
        latest_fluency = int(latest.get("fluency_score", 0) or 0) if latest else 0
        latest_confidence = float(latest.get("emotion_confidence", 0) or 0) if latest else 0.0
        latest_ats = int(latest.get("ats_score", 0) or 0) if latest else 0

        # Normalize score into a 0..100 percent for the UI cards.
        interview_score_pct = int(latest_score * 100) if latest_score <= 1 else int(latest_score)
        ai_career_score_pct = interview_score_pct

        confidence_pct = int(latest_confidence * 100) if latest_confidence <= 1 else int(latest_confidence)

        # Weekly heatmap: Dashboard.jsx expects 7 items with { dayName, active, minutes, lessons }
        weekly_breakdown = engagement.get("weeklyBreakdown") or []
        weekly_activity = []
        # weeklyBreakdown is Mon..Sun already in engagement_service
        for i in range(7):
            day_obj = weekly_breakdown[i] if i < len(weekly_breakdown) else None
            weekly_activity.append({
                "dayName": day_obj.get("day") if day_obj else ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][i],
                "active": bool(day_obj.get("active")) if day_obj else False,
                "minutes": int(day_obj.get("minutes", 0) or 0) if day_obj else 0,
                "lessons": 0
            })

        # Recent activity feed
        recent_activities = get_user_activities(user_lower, limit=5)

        # Basic readiness label (heuristic)
        career_readiness = (
            "High" if ai_career_score_pct >= 80 else
            "Medium" if ai_career_score_pct >= 55 else
            "Low"
        )

        # Recommended next step (keep safe defaults; UI already has its own profile completion alerts)
        recommended_next_step = "Upload Resume"

        data = {
            "aiCareerScore": ai_career_score_pct,
            "careerReadiness": career_readiness,
            "atsScore": latest_ats,
            "resumeMatch": f"{latest_ats}%",
            "technicalScore": latest_fluency,
            "communicationScore": latest_fluency,
            "confidenceScore": confidence_pct,
            "currentStreak": engagement.get("currentStreak", 0),
            "learningHours": int((engagement.get("learningTime", {}).get("thisWeekMinutes", 0) or 0) / 60),
            "learningTimeFormatted": engagement.get("learningTime", {}).get("thisWeekFormatted", "0m"),
            "lessonsCompleted": engagement.get("lessonsCompleted", 0),
            "assessmentsPassed": engagement.get("assessmentsPassed", 0),
            "coursesCompleted": engagement.get("coursesCompleted", 0),
            "certificatesEarned": engagement.get("certificatesEarned", 0),
            "skillsDemonstrated": growth.get("improved_skills", []) if isinstance(growth, dict) else [],
            "skillsDemonstratedCount": len(growth.get("improved_skills", []) or []) if isinstance(growth, dict) else 0,
            "weeklyActivity": weekly_activity,
            "interviewScore": interview_score_pct,
            "profileCompletion": 0,
            "targetCompany": "Not Set",
            "targetRole": "Not Set",
            "recommendedNextStep": recommended_next_step,
            "resumeUpdatedDate": "N/A",
            "weeklyGrowth": float(growth.get("growth_percentage", 0.0) or 0.0),
            "monthlyGrowth": float(growth.get("growth_percentage", 0.0) or 0.0),
            "interviewReadiness": f"{interview_score_pct}%",
            "recentHistory": growth.get("history", []) if isinstance(growth, dict) else [],
            "recentActivities": recent_activities,
            "trend": growth.get("score_trend", "No Data") if isinstance(growth, dict) else "No Data"
        }

        return {"success": True, "data": data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
