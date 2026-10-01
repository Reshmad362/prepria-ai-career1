from fastapi import APIRouter, HTTPException, Body, Header, Response
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from datetime import datetime

from app.services.question_generator import (
    generate_questions_for_role,
    generate_adaptive_questions
)
from app.services.dynamic_question_generator import generate_resume_driven_questions
from app.services.interview_evaluation_service import evaluate_interview_session
from app.services.performance_tracker import (
    record_interview,
    get_user_interviews,
    get_interview_by_id,
    get_longitudinal_comparison
)
from app.services.interview_report_pdf_service import generate_interview_pdf_report
from app.services.engagement_service import record_user_activity
from app.routes.auth_routes import get_current_user, verify_user_ownership, get_user_by_email_or_id

router = APIRouter()


class GenerateInterviewRequest(BaseModel):
    role: str
    difficulty: str
    question_count: int

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "role": "Full Stack Developer",
                    "difficulty": "medium",
                    "question_count": 5
                }
            ]
        }
    }

class Question(BaseModel):
    type: str
    difficulty: str
    question: str
    topic: Optional[str] = "General"
    isTargetedRemediation: Optional[bool] = False
    targetedWeakness: Optional[str] = None
    remediationFocus: Optional[str] = None

class GenerateInterviewResponse(BaseModel):
    role: str
    questions: List[Dict[str, Any]]
    isAdaptive: Optional[bool] = False
    priorSessionId: Optional[str] = None
    weakTopicsTargeted: Optional[List[str]] = []

class GenerateAdaptiveInterviewRequest(BaseModel):
    role: str
    difficulty: Optional[str] = "medium"
    question_count: Optional[int] = 5

class GenerateDynamicInterviewRequest(BaseModel):
    role: str
    interviewNumber: Optional[int] = 1
    interview_number: Optional[int] = None
    count: Optional[int] = 10
    question_count: Optional[int] = None
    difficulty: Optional[str] = "medium"

class InterviewSessionSubmitRequest(BaseModel):
    roleName: str
    difficulty: Optional[str] = "Intermediate"
    interviewType: Optional[str] = "Technical"
    questions: List[Dict[str, Any]]
    answers: List[Dict[str, Any]]
    duration: Optional[str] = "00:00"
    violationsCount: Optional[int] = 0
    userId: Optional[str] = None

@router.post("/generate-interview", response_model=GenerateInterviewResponse)
def generate_interview(data: GenerateInterviewRequest = Body(...)):
    if data.question_count <= 0:
        raise HTTPException(status_code=400, detail="question_count must be strictly positive.")
    if data.question_count > 20:
        raise HTTPException(status_code=400, detail="question_count cannot exceed 20.")
    if data.difficulty.lower() not in ["easy", "medium", "hard"]:
        raise HTTPException(status_code=400, detail="Unsupported difficulty. Choose easy, medium, or hard.")
        
    questions = generate_questions_for_role(
        role=data.role, 
        difficulty=data.difficulty.lower(), 
        count=data.question_count
    )
    
    return GenerateInterviewResponse(
        role=data.role,
        questions=questions,
        isAdaptive=False,
        priorSessionId=None,
        weakTopicsTargeted=[]
    )


@router.post("/generate-adaptive", response_model=GenerateInterviewResponse)
@router.post("/interview/generate-adaptive", response_model=GenerateInterviewResponse)
@router.post("/api/interview/generate-adaptive", response_model=GenerateInterviewResponse)
async def generate_adaptive_interview_endpoint(
    req: GenerateAdaptiveInterviewRequest,
    authorization: Optional[str] = Header(None)
):
    """
    Generates an adaptive interview session targeting the candidate's authentic prior weaknesses.
    - Inspects previous completed sessions for the authenticated user.
    - Extracts weak topics from question evaluations and improvements.
    - Modulates question difficulty based on authentic prior overall score.
    - Gracefully handles cold start (first interview) with standard baseline generation.
    """
    if req.question_count <= 0:
        raise HTTPException(status_code=400, detail="question_count must be strictly positive.")
    if req.question_count > 20:
        raise HTTPException(status_code=400, detail="question_count cannot exceed 20.")
    if (req.difficulty or "medium").lower() not in ["easy", "medium", "hard"]:
        raise HTTPException(status_code=400, detail="Unsupported difficulty. Choose easy, medium, or hard.")

    # Require authentication for adaptive questioning
    current_user = get_current_user(authorization)
    auth_user_key = current_user.get("email") or current_user.get("id")

    user_sessions = get_user_interviews(auth_user_key)
    valid_sessions = [
        s for s in user_sessions 
        if (s.get("questionEvaluations") or s.get("overallScore") is not None or s.get("score") is not None)
    ]

    # Cold start: No previous sessions found -> establish initial diagnostic baseline
    if not valid_sessions:
        questions = generate_questions_for_role(
            role=req.role,
            difficulty=(req.difficulty or "medium").lower(),
            count=req.question_count
        )
        return GenerateInterviewResponse(
            role=req.role,
            questions=questions,
            isAdaptive=False,
            priorSessionId=None,
            weakTopicsTargeted=[]
        )

    # Prior Session (most recent completed interview)
    prior_session = valid_sessions[0]
    
    # Extract genuine weak topics from prior session
    weak_topics_set = set()
    for qe in prior_session.get("questionEvaluations", []):
        t = qe.get("topic")
        if t and t != "General" and qe.get("score", 100) < 70:
            weak_topics_set.add(t)

    for imp in prior_session.get("improvements", []):
        if isinstance(imp, dict) and imp.get("topic"):
            weak_topics_set.add(imp["topic"])

    # Extract authentic prior overall score
    prior_score = prior_session.get("overallScore") if prior_session.get("overallScore") is not None else prior_session.get("score")

    weak_topics_list = list(weak_topics_set)

    # Generate adaptive question set
    questions = generate_adaptive_questions(
        role=req.role,
        difficulty=(req.difficulty or "medium").lower(),
        count=req.question_count,
        weak_topics=weak_topics_list,
        prior_overall_score=prior_score
    )

    return GenerateInterviewResponse(
        role=req.role,
        questions=questions,
        isAdaptive=bool(weak_topics_list),
        priorSessionId=prior_session.get("id"),
        weakTopicsTargeted=weak_topics_list
    )


@router.post("/generate-dynamic")
@router.post("/interview/generate-dynamic")
@router.post("/api/interview/generate-dynamic")
async def generate_dynamic_interview_endpoint(
    req: GenerateDynamicInterviewRequest,
    authorization: Optional[str] = Header(None)
):
    """
    Generates a dynamic candidate-specific interview session derived from parsed resume evidence.
    - Resolves authenticated user identity strictly from JWT header.
    - Loads candidate's authentic parsed resume (skills, projects, experience, education).
    - Integrates previous interview session history and weak topics.
    - Formulates auditable questions with source metadata.
    """
    count = req.count if (req.count is not None and req.count > 0) else (req.question_count or 10)
    if count <= 0:
        raise HTTPException(status_code=400, detail="count must be strictly positive.")
    if count > 20:
        raise HTTPException(status_code=400, detail="count cannot exceed 20.")

    # Require JWT authentication for dynamic candidate-specific interviews
    current_user = get_current_user(authorization)
    auth_user_key = current_user.get("email") or current_user.get("id")

    # Retrieve authentic profile & resume data
    user_obj = get_user_by_email_or_id(email=auth_user_key, user_id=auth_user_key)
    profile_data = user_obj.get("profile", {}) if user_obj else {}

    # Retrieve prior session history
    previous_sessions = get_user_interviews(auth_user_key)
    interview_num = req.interviewNumber or req.interview_number or 1

    if interview_num == 1 and previous_sessions:
        interview_num = len(previous_sessions) + 1

    result = generate_resume_driven_questions(
        user_profile=profile_data,
        role=req.role,
        interview_number=interview_num,
        count=count,
        previous_sessions=previous_sessions
    )

    return result


@router.post("/interview/session/submit")
@router.post("/api/interview/session/submit")
async def submit_interview_session(
    req: InterviewSessionSubmitRequest,
    authorization: Optional[str] = Header(None)
):
    """
    Submits a completed or partial candidate interview session:
    - Runs authoritative evaluation across all questions using NLP semantic similarity and speech analysis.
    - Computes objective 5-pillar competency metrics (Technical, Problem Solving, Communication, Role Knowledge, Confidence).
    - Enforces strict zero-answer defense.
    - If authenticated, persists the session to disk (interview_history.json) scoped to the verified JWT user identity.
    """
    if not req.questions:
        raise HTTPException(status_code=400, detail="Session must contain at least one question.")

    # 1. Authoritative Session Evaluation
    evaluation = evaluate_interview_session(
        role_name=req.roleName,
        difficulty=req.difficulty or "Intermediate",
        questions=req.questions,
        answers=req.answers,
        session_duration=req.duration or "00:00",
        violations_count=req.violationsCount or 0
    )

    persisted_record = None

    # 2. Authentication & Persistence
    if authorization:
        current_user = get_current_user(authorization)
        auth_user_key = current_user.get("email") or current_user.get("id")

        # Zero-answer protection: Only persist valid sessions with at least 1 answer
        if evaluation.get("isValid") and evaluation.get("answeredCount", 0) > 0:
            session_data = {
                "user_id": auth_user_key,
                "roleName": req.roleName,
                "role": req.roleName,
                "difficulty": req.difficulty,
                "interviewType": req.interviewType,
                "score": evaluation.get("overallScore", 0),
                "overallScore": evaluation.get("overallScore", 0),
                "duration": req.duration,
                "answeredCount": evaluation.get("answeredCount", 0),
                "questionCount": len(req.questions),
                "totalQuestions": len(req.questions),
                "completedAt": datetime.utcnow().isoformat(),
                "timestamp": datetime.utcnow().isoformat(),
                "dimensions": evaluation.get("dimensions", {}),
                "speech_metrics": evaluation.get("speech_metrics", {}),
                "fluency_score": evaluation.get("dimensions", {}).get("communication", 80),
                "emotion_confidence": float(evaluation.get("dimensions", {}).get("confidence", 80)) / 100.0,
                "ats_score": 85,
                "questionEvaluations": evaluation.get("questionEvaluations", []),
                "strengths": evaluation.get("strengths", []),
                "improvements": evaluation.get("improvements", []),
                "violationsCount": req.violationsCount or 0,
                "status": "completed" if evaluation.get("isCompleted") else "partial"
            }
            persisted_record = record_interview(session_data)

            # Record user learning activity
            try:
                record_user_activity({
                    "user_id": auth_user_key,
                    "activity_type": "interview_complete",
                    "title": f"Completed AI Mock Interview ({req.roleName})",
                    "duration_minutes": 20,
                    "timestamp": session_data["timestamp"],
                    "metadata": {
                        "role": req.roleName,
                        "score": evaluation.get("overallScore", 0),
                        "answeredCount": evaluation.get("answeredCount", 0)
                    }
                })
            except Exception:
                pass

    return {
        "success": True,
        "evaluation": evaluation,
        "session": persisted_record
    }


@router.get("/interview/history/{user_id}")
@router.get("/api/interview/history/{user_id}")
async def get_interview_history(
    user_id: str,
    authorization: Optional[str] = Header(None)
):
    """
    Retrieves the persistent interview history for an authenticated user.
    Enforces strict JWT ownership verification.
    """
    current_user = get_current_user(authorization)
    if not verify_user_ownership(user_id, current_user):
        raise HTTPException(status_code=403, detail="Forbidden: You do not have permission to access another user's interview history.")

    auth_user_key = current_user.get("email") or current_user.get("id")
    history = get_user_interviews(auth_user_key)
    return {
        "success": True,
        "data": history
    }


@router.get("/interview/session/{user_id}/{session_id}")
@router.get("/api/interview/session/{user_id}/{session_id}")
async def get_interview_session_details(
    user_id: str,
    session_id: str,
    authorization: Optional[str] = Header(None)
):
    """
    Retrieves details for a specific interview session.
    Enforces strict JWT ownership verification.
    """
    current_user = get_current_user(authorization)
    if not verify_user_ownership(user_id, current_user):
        raise HTTPException(status_code=403, detail="Forbidden: You do not have permission to access another user's interview session.")

    auth_user_key = current_user.get("email") or current_user.get("id")
    session = get_interview_by_id(auth_user_key, session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Interview session not found.")

    return {
        "success": True,
        "data": session
    }


@router.get("/interview/longitudinal/{user_id}")
@router.get("/api/interview/longitudinal/{user_id}")
async def get_longitudinal_comparison_endpoint(
    user_id: str,
    authorization: Optional[str] = Header(None)
):
    """
    Retrieves authentic longitudinal comparison between the candidate's Baseline and Current sessions.
    Enforces strict JWT ownership verification.
    """
    current_user = get_current_user(authorization)
    if not verify_user_ownership(user_id, current_user):
        raise HTTPException(status_code=403, detail="Forbidden: You do not have permission to access another user's longitudinal comparison.")

    auth_user_key = current_user.get("email") or current_user.get("id")
    comparison = get_longitudinal_comparison(auth_user_key)
    return {
        "success": True,
        "data": comparison
    }


@router.get("/interview/report/{session_id}/pdf")
@router.get("/api/interview/report/{session_id}/pdf")
@router.get("/interview/report/{user_id}/{session_id}/pdf")
@router.get("/api/interview/report/{user_id}/{session_id}/pdf")
async def download_interview_report_pdf(
    session_id: str,
    user_id: Optional[str] = None,
    authorization: Optional[str] = Header(None)
):
    """
    Generates and returns an authoritative server-generated PDF performance evaluation report.
    - Requires JWT authentication.
    - Enforces strict user isolation: User A cannot download User B's report.
    - Uses persisted evaluation and speech metrics from Phase 14 without DOM scraping.
    """
    current_user = get_current_user(authorization)
    auth_user_key = current_user.get("email") or current_user.get("id")

    # If user_id is explicitly provided in URL path, enforce ownership match
    if user_id and not verify_user_ownership(user_id, current_user):
        raise HTTPException(status_code=403, detail="Forbidden: You do not have permission to access another candidate's evaluation report.")

    session = get_interview_by_id(auth_user_key, session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Interview session evaluation not found.")

    try:
        pdf_bytes = generate_interview_pdf_report(session, user_identity=auth_user_key)
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to generate interview PDF report.")

    safe_session_id = re.sub(r'[^a-zA-Z0-9_\-]', '', str(session_id))
    filename = f"prepria-interview-report-{safe_session_id}.pdf"

    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"',
            "Cache-Control": "no-cache, no-store, must-revalidate"
        }
    )



