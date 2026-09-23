import pytest
import os
import json
import jwt
from datetime import datetime, timedelta
from fastapi.testclient import TestClient

import sys
backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

os.environ["APP_ENV"] = "test"
os.environ["JWT_SECRET"] = "test-secret-key-for-phase4-verification-2026"
os.environ["JWT_EXPIRATION_HOURS"] = "24"

from main import app
from app.services.performance_tracker import (
    interviews_db,
    _load_interviews_from_disk,
    _save_interviews_to_disk,
    get_user_interviews,
    get_longitudinal_comparison
)
from app.services.question_generator import generate_adaptive_questions, generate_questions_for_role, ROLE_QUESTIONS
from app.services.auth_service import hash_password, users_db, _save_users_to_disk

client = TestClient(app)

def generate_test_token(email: str = "adaptive_candidate@prepria.com", user_id: str = "user-phase4-adaptive"):
    payload = {
        "sub": user_id,
        "id": user_id,
        "email": email,
        "name": "Adaptive Candidate",
        "exp": datetime.utcnow() + timedelta(hours=1)
    }
    return jwt.encode(payload, os.environ["JWT_SECRET"], algorithm="HS256")


@pytest.fixture(autouse=True)
def clean_test_interview_records():
    # Clean up test user records before and after each test
    test_emails = [
        "adaptive_candidate_a@prepria.com",
        "adaptive_candidate_b@prepria.com",
        "cold_start_user@prepria.com",
        "decline_candidate@prepria.com"
    ]
    for email in test_emails:
        for item in list(interviews_db):
            if item.get("user_id") == email:
                interviews_db.remove(item)
    _save_interviews_to_disk()
    
    yield
    
    for email in test_emails:
        for item in list(interviews_db):
            if item.get("user_id") == email:
                interviews_db.remove(item)
    _save_interviews_to_disk()


# =====================================================================
# 1. COLD START (FIRST INTERVIEW / NO PRIOR HISTORY)
# =====================================================================

def test_cold_start_interview_generation_establishes_baseline():
    """When a candidate has zero prior completed sessions, cold start generates standard baseline questions."""
    email = "cold_start_user@prepria.com"
    token = generate_test_token(email, "cold-user-1")

    res = client.post("/api/interview/generate-adaptive", json={
        "role": "Full Stack Developer",
        "difficulty": "medium",
        "question_count": 4
    }, headers={"Authorization": f"Bearer {token}"})

    assert res.status_code == 200
    data = res.json()
    assert data["role"] == "Full Stack Developer"
    assert data["isAdaptive"] is False
    assert data["priorSessionId"] is None
    assert data["weakTopicsTargeted"] == []
    assert len(data["questions"]) == 4
    for q in data["questions"]:
        assert q["isTargetedRemediation"] is False
        assert q["targetedWeakness"] is None


# =====================================================================
# 2. INTERVIEW 1 EVALUATION & WEAKNESS PERSISTENCE
# =====================================================================

def test_interview_1_evaluates_and_persists_specific_weakness():
    """Candidate takes Interview 1 and demonstrates a clear weakness in Database Performance & Indexing."""
    email = "adaptive_candidate_a@prepria.com"
    token = generate_test_token(email, "user-cand-a")

    payload = {
        "roleName": "Full Stack Developer",
        "difficulty": "medium",
        "questions": [
            {
                "question": "A production database query is slow. How do you troubleshoot?",
                "topic": "Database Performance & Indexing",
                "modelAnswerGuidelines": "Use EXPLAIN ANALYZE, inspect query execution plan, check table indexes, verify buffer cache hits, and eliminate table scans."
            },
            {
                "question": "Explain the difference between GET and POST requests.",
                "topic": "HTTP Protocols",
                "modelAnswerGuidelines": "GET is idempotent and passes parameters in URL. POST is non-idempotent and carries data in request body."
            }
        ],
        "answers": [
            {
                "questionId": "q1",
                "transcript": "I don't know much about database optimization, maybe restart server.", # Poor answer
                "answerDurationSeconds": 8,
                "status": "answered",
                "isAnswered": True
            },
            {
                "questionId": "q2",
                "transcript": "GET retrieves data from a server and is idempotent without side effects, while POST submits data to be processed and is non-idempotent.", # Strong answer
                "answerDurationSeconds": 20,
                "status": "answered",
                "isAnswered": True
            }
        ],
        "duration": "03:00",
        "violationsCount": 0
    }

    res = client.post("/interview/session/submit", json=payload, headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 200
    res_data = res.json()
    assert res_data["success"] is True
    session_data = res_data["session"]
    assert session_data is not None
    assert session_data["user_id"] == email

    # Verify that question 1 (Database Performance & Indexing) scored poorly (< 60)
    q1_eval = next(q for q in session_data["questionEvaluations"] if q["topic"] == "Database Performance & Indexing")
    assert q1_eval["score"] < 60

    # Verify that question 2 (HTTP Protocols) scored well (>= 75)
    q2_eval = next(q for q in session_data["questionEvaluations"] if q["topic"] == "HTTP Protocols")
    assert q2_eval["score"] >= 75


# =====================================================================
# 3. INTERVIEW 2 ADAPTIVE TARGETING OF INTERVIEW 1 WEAKNESS
# =====================================================================

def test_interview_2_adaptive_generation_targets_interview_1_weakness():
    """Interview 2 demonstrably prioritizes questions targeting Interview 1's persisted weak topic."""
    email = "adaptive_candidate_a@prepria.com"
    token = generate_test_token(email, "user-cand-a")

    # 1. Establish Baseline Session with weak topic "Database Performance & Indexing"
    base_session = {
        "user_id": email,
        "roleName": "Full Stack Developer",
        "score": 58,
        "overallScore": 58,
        "dimensions": {"technicalKnowledge": 55, "problemSolving": 50, "communication": 70, "roleKnowledge": 60, "confidence": 65},
        "questionEvaluations": [
            {"topic": "Database Performance & Indexing", "score": 42, "status": "answered", "question": "Slow query troubleshooting"},
            {"topic": "HTTP Protocols", "score": 85, "status": "answered", "question": "GET vs POST"}
        ],
        "improvements": [
            {"topic": "Database Performance & Indexing", "description": "Deepen explanation of indexing and query profiling."}
        ],
        "completedAt": datetime.utcnow().isoformat(),
        "timestamp": datetime.utcnow().isoformat()
    }
    from app.services.performance_tracker import record_interview
    persisted_base = record_interview(base_session)

    # 2. Call Adaptive Interview 2 Generation
    res = client.post("/api/interview/generate-adaptive", json={
        "role": "Full Stack Developer",
        "difficulty": "medium",
        "question_count": 4
    }, headers={"Authorization": f"Bearer {token}"})

    assert res.status_code == 200
    data = res.json()
    assert data["isAdaptive"] is True
    assert data["priorSessionId"] == persisted_base["id"]
    assert "Database Performance & Indexing" in data["weakTopicsTargeted"]

    # 3. Assert that at least one generated question targets the exact weak topic
    targeted_questions = [
        q for q in data["questions"]
        if q.get("isTargetedRemediation") is True and q.get("targetedWeakness") == "Database Performance & Indexing"
    ]
    assert len(targeted_questions) >= 1

    # 4. Verify question is legitimate and not fabricated
    targeted_q = targeted_questions[0]
    assert targeted_q["topic"] in ["Database Performance & Indexing", "SQL Indexing"]
    assert len(targeted_q["question"]) > 10


# =====================================================================
# 4. DIFFICULTY MODULATION BASED ON AUTHENTIC PRIOR SCORE
# =====================================================================

def test_difficulty_modulates_based_on_prior_score():
    """Adaptive engine adjusts remediation drill focus based on authentic measured prior score."""
    # Test low score (< 60) -> foundational diagnostic
    low_questions = generate_adaptive_questions(
        role="Backend Developer",
        difficulty="medium",
        count=3,
        weak_topics=["SQL Indexing"],
        prior_overall_score=45
    )
    targeted_low = [q for q in low_questions if q.get("isTargetedRemediation")]
    assert len(targeted_low) >= 1
    assert "Foundational" in targeted_low[0].get("remediationFocus", "")

    # Test high score (> 80) -> advanced optimization
    high_questions = generate_adaptive_questions(
        role="Backend Developer",
        difficulty="medium",
        count=3,
        weak_topics=["Distributed Systems"],
        prior_overall_score=88
    )
    targeted_high = [q for q in high_questions if q.get("isTargetedRemediation")]
    assert len(targeted_high) >= 1
    assert "Advanced" in targeted_high[0].get("remediationFocus", "")


# =====================================================================
# 5. AUTHENTIC LONGITUDINAL COMPARISON & EXACT SCORE DELTAS
# =====================================================================

def test_longitudinal_comparison_calculates_exact_deltas():
    """Computes exact delta between Baseline Session and Current Session from authentic Phase 3 evaluation scores."""
    email = "adaptive_candidate_a@prepria.com"
    token = generate_test_token(email, "user-cand-a")

    from app.services.performance_tracker import record_interview

    # Session 1 (Baseline)
    sess_1 = {
        "user_id": email,
        "roleName": "Full Stack Developer",
        "score": 60,
        "overallScore": 60,
        "dimensions": {"technicalKnowledge": 55, "problemSolving": 60, "communication": 70, "roleKnowledge": 60, "confidence": 65},
        "questionEvaluations": [
            {"topic": "Database Performance & Indexing", "score": 45, "status": "answered"}
        ],
        "improvements": [{"topic": "Database Performance & Indexing", "description": "Review indexing"}],
        "completedAt": (datetime.utcnow() - timedelta(days=1)).isoformat()
    }
    persisted_1 = record_interview(sess_1)

    # Session 2 (Current - Improved)
    sess_2 = {
        "user_id": email,
        "roleName": "Full Stack Developer",
        "score": 82,
        "overallScore": 82,
        "dimensions": {"technicalKnowledge": 85, "problemSolving": 80, "communication": 80, "roleKnowledge": 80, "confidence": 85},
        "questionEvaluations": [
            {"topic": "Database Performance & Indexing", "score": 88, "status": "answered"}
        ],
        "improvements": [],
        "completedAt": datetime.utcnow().isoformat()
    }
    persisted_2 = record_interview(sess_2)

    res = client.get(f"/api/interview/longitudinal/{email}", headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 200
    comp = res.json()["data"]

    assert comp["hasComparison"] is True
    # Assert baseline and current scores match exact Phase 3 evaluation values
    assert comp["baseline"]["score"] == 60
    assert comp["current"]["score"] == 82
    assert comp["scoreDelta"] == 22
    assert comp["trajectory"] == "Measured Improvement"
    assert comp["dimensionDeltas"]["technicalKnowledge"] == 30
    assert comp["dimensionDeltas"]["problemSolving"] == 20

    # Verify resolved weakness detection
    assert len(comp["resolvedWeaknesses"]) == 1
    assert comp["resolvedWeaknesses"][0]["topic"] == "Database Performance & Indexing"
    assert comp["resolvedWeaknesses"][0]["status"] == "Resolved"


def test_honest_longitudinal_decline_reporting():
    """If a candidate's score declines in Session 2, the system honestly reports Measured Decline."""
    email = "decline_candidate@prepria.com"
    token = generate_test_token(email, "user-decline")

    from app.services.performance_tracker import record_interview

    # Session 1 (Baseline)
    sess_1 = {
        "user_id": email,
        "roleName": "Backend Developer",
        "score": 80,
        "overallScore": 80,
        "dimensions": {"technicalKnowledge": 80, "problemSolving": 80, "communication": 80, "roleKnowledge": 80, "confidence": 80},
        "questionEvaluations": [{"topic": "Databases", "score": 80, "status": "answered"}],
        "completedAt": (datetime.utcnow() - timedelta(days=2)).isoformat()
    }
    record_interview(sess_1)

    # Session 2 (Current - Decline)
    sess_2 = {
        "user_id": email,
        "roleName": "Backend Developer",
        "score": 55,
        "overallScore": 55,
        "dimensions": {"technicalKnowledge": 50, "problemSolving": 55, "communication": 60, "roleKnowledge": 55, "confidence": 55},
        "questionEvaluations": [{"topic": "Databases", "score": 50, "status": "answered"}],
        "completedAt": datetime.utcnow().isoformat()
    }
    record_interview(sess_2)

    res = client.get(f"/api/interview/longitudinal/{email}", headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 200
    comp = res.json()["data"]

    assert comp["hasComparison"] is True
    assert comp["scoreDelta"] == -25
    assert comp["trajectory"] == "Measured Decline"


# =====================================================================
# 6. MULTI-USER ISOLATION & DATA OWNERSHIP
# =====================================================================

def test_multi_user_isolation_cannot_access_or_generate_from_other_users_weaknesses():
    """User B cannot generate interviews from User A's history and cannot view User A's longitudinal growth."""
    email_a = "adaptive_candidate_a@prepria.com"
    email_b = "adaptive_candidate_b@prepria.com"
    token_b = generate_test_token(email_b, "user-b")

    # User A has historical weakness in Metaclasses
    from app.services.performance_tracker import record_interview
    record_interview({
        "user_id": email_a,
        "roleName": "Python Engineer",
        "score": 50,
        "overallScore": 50,
        "dimensions": {"technicalKnowledge": 50, "problemSolving": 50, "communication": 50, "roleKnowledge": 50, "confidence": 50},
        "questionEvaluations": [{"topic": "Metaclasses", "score": 40, "status": "answered"}],
        "improvements": [{"topic": "Metaclasses", "description": "Review Python internals"}],
        "completedAt": datetime.utcnow().isoformat()
    })

    # User B calls generate-adaptive -> should receive Cold Start, NOT User A's Metaclasses weakness
    res_b = client.post("/api/interview/generate-adaptive", json={
        "role": "Python Engineer",
        "difficulty": "medium",
        "question_count": 3
    }, headers={"Authorization": f"Bearer {token_b}"})

    assert res_b.status_code == 200
    data_b = res_b.json()
    assert data_b["isAdaptive"] is False
    assert "Metaclasses" not in data_b["weakTopicsTargeted"]

    # User B tries to access User A's longitudinal comparison -> 403 Forbidden
    res_forbidden = client.get(f"/api/interview/longitudinal/{email_a}", headers={"Authorization": f"Bearer {token_b}"})
    assert res_forbidden.status_code == 403
    assert "Forbidden" in res_forbidden.json()["detail"]


# =====================================================================
# 7. PERSISTENCE SURVIVES SIMULATED RESTART
# =====================================================================

def test_adaptive_pipeline_survives_simulated_backend_restart():
    """Clearing in-memory cache and reloading disk store preserves baseline weaknesses for adaptive targeting."""
    email = "adaptive_candidate_a@prepria.com"
    token = generate_test_token(email, "user-cand-a")

    from app.services.performance_tracker import record_interview, interviews_db

    record_interview({
        "user_id": email,
        "roleName": "Backend Developer",
        "score": 52,
        "overallScore": 52,
        "dimensions": {"technicalKnowledge": 50, "problemSolving": 50, "communication": 60, "roleKnowledge": 50, "confidence": 50},
        "questionEvaluations": [{"topic": "Distributed Systems", "score": 38, "status": "answered"}],
        "improvements": [{"topic": "Distributed Systems", "description": "CAP theorem"}],
        "completedAt": datetime.utcnow().isoformat()
    })

    # Simulate backend crash/restart: Wipe memory cache
    interviews_db.clear()

    # Re-fetch adaptive questions
    res = client.post("/api/interview/generate-adaptive", json={
        "role": "Backend Developer",
        "difficulty": "hard",
        "question_count": 3
    }, headers={"Authorization": f"Bearer {token}"})

    assert res.status_code == 200
    data = res.json()
    assert data["isAdaptive"] is True
    assert "Distributed Systems" in data["weakTopicsTargeted"]
    assert any(q.get("isTargetedRemediation") and q.get("targetedWeakness") == "Distributed Systems" for q in data["questions"])
