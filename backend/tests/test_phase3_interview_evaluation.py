import pytest
import os
import json
import tempfile
import jwt
from datetime import datetime, timedelta
from fastapi.testclient import TestClient

from main import app
from app.services.interview_evaluation_service import (
    evaluate_single_answer,
    evaluate_interview_session
)
from app.services.performance_tracker import (
    record_interview,
    get_user_interviews,
    get_growth_analytics,
    _INTERVIEWS_CACHE,
    _load_interviews_from_disk
)
from app.services.auth_service import JWT_SECRET, JWT_ALGORITHM

client = TestClient(app)

def generate_test_token(email: str = "candidate_a@prepria.com", user_id: str = "user-123"):
    payload = {
        "id": user_id,
        "email": email,
        "role": "candidate",
        "exp": datetime.utcnow() + timedelta(hours=1)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


# =====================================================================
# 1. EVALUATION ENGINE & NLP SEMANTIC SIMILARITY TESTS
# =====================================================================

def test_single_answer_nlp_semantic_evaluation():
    """Verify that a substantive, relevant answer achieves high similarity and score."""
    question = "What is the purpose of the virtual DOM in React and how does reconciliation work?"
    ideal = "The virtual DOM is an in-memory representation of the real DOM. When state changes, React creates a new virtual DOM tree, diffs it with the previous tree using a heuristic algorithm, and computes the minimal set of DOM mutations needed during reconciliation."
    user_answer = "React uses a virtual DOM which is a lightweight JavaScript representation of the actual DOM. When component state changes, React compares the new virtual DOM with the previous one using its diffing algorithm and only updates the changed nodes in the real DOM, making rendering fast and efficient."

    result = evaluate_single_answer(
        user_answer=user_answer,
        question_text=question,
        ideal_guidelines=ideal,
        duration_seconds=30
    )

    assert result["status"] == "answered"
    assert result["score"] >= 60
    assert result["similarityScore"] > 0.4
    assert result["wordCount"] > 20
    assert "speech_analysis" in result
    assert result["speech_analysis"]["wpm"] > 0


def test_confidence_dimension_is_objective_fluency_not_emotion():
    """Verify confidence is derived purely from objective speech fluency, not facial/random emotion."""
    questions = [
        {"question": "Explain async/await in JavaScript.", "topic": "JavaScript", "modelAnswerGuidelines": "async functions return promises..."}
    ]
    answers = [
        {
            "questionId": "q1",
            "transcript": "Async and await are syntactic sugar over promises. An async function always returns a promise and await pauses execution until the promise settles.",
            "answerDurationSeconds": 15,
            "status": "answered",
            "isAnswered": True
        }
    ]

    evaluation = evaluate_interview_session(
        role_name="Frontend Developer",
        difficulty="Intermediate",
        questions=questions,
        answers=answers
    )

    assert evaluation["isValid"] is True
    assert "confidence" in evaluation["dimensions"]
    # Verify Confidence is an objective number 0-100 derived from speech metrics
    conf_val = evaluation["dimensions"]["confidence"]
    assert isinstance(conf_val, (int, float))
    assert 0 <= conf_val <= 100
    # Verify no random or emotional classification fields in dimensions
    assert "facial_emotion" not in evaluation["dimensions"]
    assert "psychological_state" not in evaluation["dimensions"]


# =====================================================================
# 2. ZERO-ANSWER DEFENSE TESTS
# =====================================================================

def test_single_answer_zero_answer_defense():
    """Empty or skipped answers must produce a 0 score and invalid/skipped status."""
    result_empty = evaluate_single_answer(user_answer="", question_text="Explain indexing.")
    assert result_empty["score"] == 0
    assert result_empty["status"] == "unanswered"

    result_skipped = evaluate_single_answer(user_answer="[Skipped]", question_text="Explain indexing.")
    assert result_skipped["score"] == 0
    assert result_skipped["status"] == "skipped"

    result_short = evaluate_single_answer(user_answer="hi", question_text="Explain indexing.")
    assert result_short["score"] == 0
    assert result_short["status"] == "unanswered"


def test_session_zero_answer_defense():
    """A session with 0 answered questions must return isValid=False, overallScore=0, and not persist."""
    questions = [
        {"question": "Explain SQL indexing.", "topic": "Databases"},
        {"question": "Explain REST vs GraphQL.", "topic": "API Design"}
    ]
    answers = [
        {"questionId": "q1", "transcript": "[Skipped]", "status": "skipped", "isAnswered": False},
        {"questionId": "q2", "transcript": "", "status": "unanswered", "isAnswered": False}
    ]

    evaluation = evaluate_interview_session(
        role_name="Backend Developer",
        difficulty="Intermediate",
        questions=questions,
        answers=answers
    )

    assert evaluation["isValid"] is False
    assert evaluation["answeredCount"] == 0
    assert evaluation["overallScore"] == 0
    assert evaluation["dimensions"]["technicalKnowledge"] == 0
    assert evaluation["dimensions"]["confidence"] == 0
    assert "You did not submit any responses" in evaluation["message"]


def test_submit_zero_answer_session_via_api():
    """POST /interview/session/submit with zero answers does not persist session."""
    token = generate_test_token("zero_user@prepria.com", "user-zero")
    payload = {
        "roleName": "DevOps Engineer",
        "difficulty": "Intermediate",
        "questions": [{"question": "What is Docker?"}],
        "answers": [{"questionId": "q1", "transcript": "[Skipped]", "status": "skipped", "isAnswered": False}],
        "duration": "01:00"
    }

    response = client.post(
        "/api/interview/session/submit",
        json=payload,
        headers={"Authorization": f"Bearer {token}"}
    )

    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["evaluation"]["isValid"] is False
    assert data["session"] is None  # Must NOT persist zero-answer sessions


# =====================================================================
# 3. END-TO-END SESSION SUBMISSION & PERSISTENCE
# =====================================================================

def test_submit_valid_session_persists_to_disk():
    """Submitting a valid session persists record and returns complete evaluation."""
    user_email = "test_candidate_p3@prepria.com"
    token = generate_test_token(user_email, "user-p3")

    payload = {
        "roleName": "Full Stack Developer",
        "difficulty": "Intermediate",
        "questions": [
            {
                "question": "Explain the difference between optimistic and pessimistic locking in databases.",
                "topic": "Databases",
                "modelAnswerGuidelines": "Optimistic locking assumes collisions are rare and verifies with version numbers. Pessimistic locking acquires locks upfront to prevent concurrent modifications."
            },
            {
                "question": "How do you optimize React component re-renders?",
                "topic": "React",
                "modelAnswerGuidelines": "Use React.memo, useMemo, useCallback, keep state localized, and avoid passing anonymous inline functions."
            }
        ],
        "answers": [
            {
                "questionId": "q1",
                "transcript": "Optimistic locking assumes multiple transactions rarely conflict, so it checks a version or timestamp column before committing. Pessimistic locking locks the database record upfront using select for update.",
                "answerDurationSeconds": 25,
                "status": "answered",
                "isAnswered": True
            },
            {
                "questionId": "q2",
                "transcript": "To optimize React rendering, we use useMemo to memoize expensive computations, useCallback for handler functions, React.memo for pure functional components, and keep state as local as possible.",
                "answerDurationSeconds": 28,
                "status": "answered",
                "isAnswered": True
            }
        ],
        "duration": "05:30",
        "violationsCount": 0
    }

    response = client.post(
        "/api/interview/session/submit",
        json=payload,
        headers={"Authorization": f"Bearer {token}"}
    )

    assert response.status_code == 200
    res_data = response.json()
    assert res_data["success"] is True
    eval_res = res_data["evaluation"]
    assert eval_res["isValid"] is True
    assert eval_res["answeredCount"] == 2
    assert eval_res["overallScore"] >= 65
    assert len(eval_res["questionEvaluations"]) == 2

    # Verify session persisted
    session_rec = res_data["session"]
    assert session_rec is not None
    assert session_rec["user_id"] == user_email
    assert session_rec["roleName"] == "Full Stack Developer"
    assert session_rec["score"] == eval_res["overallScore"]


# =====================================================================
# 4. SURVIVAL ACROSS SIMULATED SERVER RESTART
# =====================================================================

def test_persistence_survives_simulated_restart():
    """Clearing in-memory cache and reloading from disk preserves saved sessions."""
    user_email = "restart_candidate@prepria.com"
    token = generate_test_token(user_email, "user-restart")

    payload = {
        "roleName": "System Architect",
        "difficulty": "Advanced",
        "questions": [{"question": "Explain CAP theorem.", "topic": "Distributed Systems"}],
        "answers": [{
            "questionId": "q1",
            "transcript": "The CAP theorem states that a distributed data store can only simultaneously provide at most two out of three guarantees: Consistency, Availability, and Partition tolerance.",
            "answerDurationSeconds": 20,
            "status": "answered",
            "isAnswered": True
        }],
        "duration": "02:00"
    }

    # Submit session
    resp = client.post(
        "/api/interview/session/submit",
        json=payload,
        headers={"Authorization": f"Bearer {token}"}
    )
    assert resp.status_code == 200
    session_id = resp.json()["session"]["id"]

    # Simulate backend crash/restart: Clear memory cache completely
    _INTERVIEWS_CACHE.clear()

    # Re-fetch history from disk
    history_resp = client.get(
        f"/api/interview/history/{user_email}",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert history_resp.status_code == 200
    history = history_resp.json()["data"]
    assert any(s["id"] == session_id for s in history)
    saved_session = next(s for s in history if s["id"] == session_id)
    assert saved_session["roleName"] == "System Architect"


# =====================================================================
# 5. SECURITY & DATA OWNERSHIP (MULTI-USER ISOLATION)
# =====================================================================

def test_user_cannot_access_other_users_history():
    """User A cannot read User B's interview history (403 Forbidden)."""
    token_user_a = generate_test_token("user_a@prepria.com", "user-a")
    user_b_email = "user_b@prepria.com"

    response = client.get(
        f"/api/interview/history/{user_b_email}",
        headers={"Authorization": f"Bearer {token_user_a}"}
    )

    assert response.status_code == 403
    assert "Forbidden" in response.json()["detail"]


def test_client_cannot_spoof_user_id_in_submission():
    """Client sending a spoofed userId in body must be saved under JWT identity."""
    token_user_a = generate_test_token("user_a@prepria.com", "user-a")

    payload = {
        "roleName": "Frontend Engineer",
        "questions": [{"question": "What is CSS Grid?"}],
        "answers": [{
            "questionId": "q1",
            "transcript": "CSS Grid is a two-dimensional layout system for the web.",
            "answerDurationSeconds": 10,
            "status": "answered",
            "isAnswered": True
        }],
        "userId": "victim_user@prepria.com"  # Attempted spoof
    }

    resp = client.post(
        "/api/interview/session/submit",
        json=payload,
        headers={"Authorization": f"Bearer {token_user_a}"}
    )

    assert resp.status_code == 200
    # Verify the record is saved under user_a, NOT victim_user
    persisted = resp.json()["session"]
    assert persisted["user_id"] == "user_a@prepria.com"


# =====================================================================
# 6. NO HARDCODED GROWTH / WEAK AREAS
# =====================================================================

def test_analytics_and_strengths_derived_dynamically():
    """Verify that weak areas and demonstrated skills are computed dynamically, not hardcoded."""
    user_email = "analytics_tester@prepria.com"

    # Create dummy session with specific scores
    session_data = {
        "user_id": user_email,
        "roleName": "Python Engineer",
        "score": 85,
        "questionEvaluations": [
            {"topic": "AsyncIO", "score": 90, "status": "answered"},
            {"topic": "Metaclasses", "score": 55, "status": "answered"}
        ],
        "completedAt": datetime.utcnow().isoformat(),
        "timestamp": datetime.utcnow().isoformat()
    }
    record_interview(session_data)

    analytics = get_growth_analytics(user_email)
    # Metaclasses score < 60 should be in weak areas
    assert "Metaclasses" in analytics["weak_areas"]
    # AsyncIO score >= 75 should be in demonstrated skills
    assert "AsyncIO" in analytics["demonstrated_skills"]
    # Ensure no old hardcoded ["SQL", "System Design"] unless actually tested
    assert "SQL" not in analytics["weak_areas"]
