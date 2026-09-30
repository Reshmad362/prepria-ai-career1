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
from app.routes.auth_routes import get_current_user, verify_user_ownership

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
async def log_interview(req: InterviewResultLog, authorization: Optional[str] = Header(None)):
    current_user = get_current_user(authorization)
    if not verify_user_ownership(req.user_id, current_user):
        raise HTTPException(status_code=403, detail="Forbidden: You do not have permission to submit data for another user.")

    data = req.dict()
    # Enforce authenticated identity
    data["user_id"] = current_user.get("email") or current_user.get("id")
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
async def log_activity(req: UserActivityLog, authorization: Optional[str] = Header(None)):
    """Central endpoint to record any learning activity (lesson, quiz, course, certificate)."""
    current_user = get_current_user(authorization)
    if not verify_user_ownership(req.user_id, current_user):
        raise HTTPException(status_code=403, detail="Forbidden: You do not have permission to record activity for another user.")

    try:
        data = req.dict()
        # Enforce authenticated identity
        data["user_id"] = current_user.get("email") or current_user.get("id")
        recorded = record_user_activity(data)
        return {"success": True, "data": recorded}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/engagement/{user_id}")
async def get_engagement(user_id: str, authorization: Optional[str] = Header(None)):
    """Returns authentic engagement metrics: streak, learning time, weekly heatmap, etc."""
    current_user = get_current_user(authorization)
    if not verify_user_ownership(user_id, current_user):
        raise HTTPException(status_code=403, detail="Forbidden: You do not have permission to access another user's engagement data.")

    try:
        # Use verified user ID / email
        auth_user_key = current_user.get("email") or current_user.get("id")
        engagement = get_user_engagement_metrics(auth_user_key)
        return {"success": True, "data": engagement}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/activity/{user_id}")
async def get_activities(user_id: str, limit: int = 15, authorization: Optional[str] = Header(None)):
    """Returns recent meaningful learning activities for the user."""
    current_user = get_current_user(authorization)
    if not verify_user_ownership(user_id, current_user):
        raise HTTPException(status_code=403, detail="Forbidden: You do not have permission to access another user's activities.")

    try:
        auth_user_key = current_user.get("email") or current_user.get("id")
        acts = get_user_activities(auth_user_key, limit=limit)
        return {"success": True, "data": acts}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/course/progress")
async def save_progress(req: CourseProgressPayload, authorization: Optional[str] = Header(None)):
    """
    Saves verified course progress with server-side certificate eligibility validation.
    Progress is persisted to disk and survives server restarts.
    """
    current_user = get_current_user(authorization)
    if not verify_user_ownership(req.user_id, current_user):
        raise HTTPException(status_code=403, detail="Forbidden: You do not have permission to modify another user's course progress.")

    try:
        auth_user_key = current_user.get("email") or current_user.get("id")
        saved = save_user_course_progress(auth_user_key, req.course_id, req.progress_data)
        return {"success": True, "data": saved}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/course/progress/{user_id}/{course_id}")
async def get_progress(user_id: str, course_id: str, authorization: Optional[str] = Header(None)):
    """Retrieves stored course progress for a user (persisted from previous sessions)."""
    current_user = get_current_user(authorization)
    if not verify_user_ownership(user_id, current_user):
        raise HTTPException(status_code=403, detail="Forbidden: You do not have permission to access another user's course progress.")

    try:
        auth_user_key = current_user.get("email") or current_user.get("id")
        prog = get_user_course_progress(auth_user_key, course_id)
        return {"success": True, "data": prog}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/course/progress/{user_id}")
async def get_all_progress(user_id: str, authorization: Optional[str] = Header(None)):
    """Returns all course progress records for a user across all courses."""
    current_user = get_current_user(authorization)
    if not verify_user_ownership(user_id, current_user):
        raise HTTPException(status_code=403, detail="Forbidden: You do not have permission to access another user's course progress.")

    try:
        auth_user_key = current_user.get("email") or current_user.get("id")
        all_prog = get_all_user_course_progress(auth_user_key)
        return {"success": True, "data": all_prog}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/course/certificate/{user_id}/{course_id}")
async def check_certificate(user_id: str, course_id: str, authorization: Optional[str] = Header(None)):
    """
    Backend certificate eligibility validation endpoint.
    Frontend Certificate.jsx calls this to confirm eligibility independently of localStorage.
    """
    current_user = get_current_user(authorization)
    if not verify_user_ownership(user_id, current_user):
        raise HTTPException(status_code=403, detail="Forbidden: You do not have permission to access another user's certificate.")

    try:
        auth_user_key = current_user.get("email") or current_user.get("id")
        result = validate_certificate_eligibility(auth_user_key, course_id)
        return {"success": True, "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/growth/{user_id}")
async def get_growth(user_id: str, authorization: Optional[str] = Header(None)):
    current_user = get_current_user(authorization)
    if not verify_user_ownership(user_id, current_user):
        raise HTTPException(status_code=403, detail="Forbidden: You do not have permission to access another user's growth analytics.")

    try:
        auth_user_key = current_user.get("email") or current_user.get("id")
        analytics = get_growth_analytics(auth_user_key)
        return {"success": True, "data": analytics}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/dashboard/{user_id}")
async def get_dashboard(user_id: str, authorization: Optional[str] = Header(None)):
    """
    Backend endpoint required by `frontend/src/pages/Dashboard.jsx`.
    Enforces JWT authentication and resource ownership.
    """
    current_user = get_current_user(authorization)
    if not verify_user_ownership(user_id, current_user):
        raise HTTPException(status_code=403, detail="Forbidden: You do not have permission to access another user's dashboard.")

    try:
        auth_user_key = current_user.get("email") or current_user.get("id")
        user_lower = str(auth_user_key).strip().lower()

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
        if not latest_ats:
            from app.services.auth_service import get_user_by_email_or_id
            u_obj = get_user_by_email_or_id(email=user_lower)
            if u_obj and isinstance(u_obj.get("profile"), dict):
                latest_ats = int(u_obj["profile"].get("score", 0) or u_obj["profile"].get("ats_score", 0) or 0)

        # Normalize score into a 0..100 percent for the UI cards.
        interview_score_pct = int(latest_score * 100) if latest_score <= 1 else int(latest_score)
        ai_career_score_pct = interview_score_pct

        confidence_pct = int(latest_confidence * 100) if latest_confidence <= 1 else int(latest_confidence)

        # Weekly heatmap: Dashboard.jsx expects 7 items with { dayName, active, minutes, lessons }
        weekly_breakdown = engagement.get("weeklyBreakdown") or []
        weekly_activity = []
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

        recommended_next_step = "Upload Resume"

        # Course progress calculation
        all_prog = get_all_user_course_progress(user_lower)
        courses_completed = engagement.get("coursesCompleted", 0)
        total_courses_count = max(2, len(all_prog)) if all_prog else 2
        course_pct = int(sum(p.get("completionPercentage", 0) for p in all_prog) / max(1, len(all_prog))) if all_prog else 0

        # Overall & best scores calculation across interviews
        if user_interviews:
            scores_list = []
            for inv in user_interviews:
                raw_s = inv.get("overallScore") if inv.get("overallScore") is not None else inv.get("score", 0)
                scores_list.append(int(raw_s * 100) if (isinstance(raw_s, float) and 0 < raw_s <= 1.0) else int(raw_s or 0))
            overall_score = int(sum(scores_list) / len(scores_list))
            best_score = max(scores_list)
        else:
            overall_score = 0
            best_score = 0

        # Dimension metrics from latest session if available
        if latest and latest.get("dimensions"):
            dims = latest["dimensions"]
            tech_k = int(dims.get("technicalKnowledge", 0))
            ps_k = int(dims.get("problemSolving", 0))
            comm_k = int(dims.get("communication", 0))
            role_k = int(dims.get("roleKnowledge", 0))
            conf_k = int(dims.get("confidence", 0))
        elif latest:
            tech_k = interview_score_pct
            ps_k = interview_score_pct
            comm_k = latest_fluency or interview_score_pct
            role_k = interview_score_pct
            conf_k = confidence_pct
        else:
            tech_k = 0
            ps_k = 0
            comm_k = 0
            role_k = 0
            conf_k = 0

        score_delta = growth.get("scoreDelta", 0) if isinstance(growth, dict) else 0

        # Formatted recent interviews summary
        recent_interviews_summary = []
        for inv in user_interviews[:5]:
            raw_s = inv.get("overallScore") if inv.get("overallScore") is not None else inv.get("score", 0)
            inv_score = int(raw_s * 100) if (isinstance(raw_s, float) and 0 < raw_s <= 1.0) else int(raw_s or 0)
            recent_interviews_summary.append({
                "id": inv.get("id"),
                "role": inv.get("roleName") or inv.get("role", "Technical"),
                "score": inv_score,
                "completedAt": inv.get("completedAt") or inv.get("timestamp"),
                "dimensions": inv.get("dimensions") or {}
            })

        data = {
            "userId": auth_user_key,
            "overallScore": overall_score,
            "interviewCount": len(user_interviews),
            "bestScore": best_score,
            "latestScore": interview_score_pct,
            "scoreDelta": score_delta,
            "dimensions": {
                "technicalKnowledge": tech_k,
                "problemSolving": ps_k,
                "communication": comm_k,
                "roleKnowledge": role_k,
                "confidence": conf_k
            },
            "skills": growth.get("improved_skills", []) if isinstance(growth, dict) else [],
            "weakAreas": growth.get("weak_areas", []) if isinstance(growth, dict) else [],
            "courseProgress": {
                "completed": courses_completed,
                "total": total_courses_count,
                "percentage": course_pct
            },
            "readiness": overall_score,
            "recentInterviews": recent_interviews_summary,

            # Dashboard.jsx UI backward-compatibility keys:
            "aiCareerScore": interview_score_pct if user_interviews else 0,
            "careerReadiness": career_readiness if user_interviews else "Low",
            "atsScore": latest_ats,
            "resumeMatch": f"{latest_ats}%",
            "technicalScore": tech_k,
            "communicationScore": comm_k,
            "confidenceScore": conf_k,
            "currentStreak": engagement.get("currentStreak", 0),
            "learningHours": int((engagement.get("learningTime", {}).get("thisWeekMinutes", 0) or 0) / 60),
            "learningTimeFormatted": engagement.get("learningTime", {}).get("thisWeekFormatted", "0m"),
            "lessonsCompleted": engagement.get("lessonsCompleted", 0),
            "assessmentsPassed": engagement.get("assessmentsPassed", 0),
            "coursesCompleted": courses_completed,
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
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
