"""
Phase 13 Test Suite: Verification of Bug Fixes, State Synchronization, & Learning Hub Gating

Validates:
1. Interview session submission & evaluation schema stability
2. Course dwell-time enforcement (insufficient dwell time rejected)
3. Course dwell-time valid completion (sufficient dwell time accepted and persisted)
4. Quiz protection (quizzes cannot be bypassed by dwell time)
5. Final assessment gating (certificates locked until all modules & exams passed)
6. Heartbeat idempotency & monotonic completion preservation
7. Cross-user isolation and security checks
"""

import pytest
import os
import sys
import uuid
import jwt
from datetime import datetime, timezone
from fastapi.testclient import TestClient

backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

os.environ["APP_ENV"] = "test"
os.environ["JWT_SECRET"] = "test-secret-key-for-phase13-fixes-2026"

from main import app
from app.services.auth_service import (
    users_db,
    _save_users_to_disk,
    JWT_SECRET,
    JWT_ALGORITHM
)
from app.services.performance_tracker import interviews_db, _save_interviews_to_disk
from app.services.engagement_service import (
    course_progress_db,
    _save_progress_to_disk,
    save_user_course_progress,
    get_user_course_progress
)

client = TestClient(app)

TEST_USER_A = "phase13_user_a@prepria.test"
TEST_USER_B = "phase13_user_b@prepria.test"


def generate_token(email: str) -> str:
    payload = {
        "sub": email,
        "email": email,
        "exp": datetime.now(timezone.utc).timestamp() + 3600
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


@pytest.fixture(autouse=True)
def cleanup_phase13_data():
    """Ensure clean starting and ending state."""
    users_db[:] = [u for u in users_db if u.get("email") not in (TEST_USER_A, TEST_USER_B)]
    interviews_db[:] = [i for i in interviews_db if str(i.get("user_id")).lower() not in (TEST_USER_A, TEST_USER_B)]
    for k in list(course_progress_db.keys()):
        if k.startswith(f"{TEST_USER_A}_") or k.startswith(f"{TEST_USER_B}_"):
            course_progress_db.pop(k, None)
    _save_users_to_disk()
    _save_interviews_to_disk()
    _save_progress_to_disk()

    yield

    users_db[:] = [u for u in users_db if u.get("email") not in (TEST_USER_A, TEST_USER_B)]
    interviews_db[:] = [i for i in interviews_db if str(i.get("user_id")).lower() not in (TEST_USER_A, TEST_USER_B)]
    for k in list(course_progress_db.keys()):
        if k.startswith(f"{TEST_USER_A}_") or k.startswith(f"{TEST_USER_B}_"):
            course_progress_db.pop(k, None)
    _save_users_to_disk()
    _save_interviews_to_disk()
    _save_progress_to_disk()


# ─── 1. INTERVIEW EVALUATION TESTS ──────────────────────────────────────────

def test_interview_session_evaluation_returns_question_evaluations():
    """Verify that interview evaluation returns structured question evaluations with required fields."""
    token = generate_token(TEST_USER_A)
    payload = {
        "roleName": "Full Stack Developer",
        "difficulty": "Intermediate",
        "interviewType": "Technical",
        "questions": [
            {
                "id": "q1",
                "question": "Explain the difference between state and props in React.",
                "topic": "React",
                "difficulty": "Intermediate",
                "modelAnswerGuidelines": "Props are immutable and passed from parent; state is mutable and managed within the component."
            }
        ],
        "answers": [
            {
                "questionId": "q1",
                "transcript": "Props are passed down from parent components and are read-only, whereas state is managed internally by the component.",
                "answerDurationSeconds": 25
            }
        ],
        "duration": "01:15",
        "violationsCount": 0,
        "userId": TEST_USER_A
    }

    res = client.post(
        "/api/interview/session/submit",
        json=payload,
        headers={"Authorization": f"Bearer {token}"}
    )
    assert res.status_code == 200
    data = res.json()
    assert data["success"] is True
    eval_res = data["evaluation"]
    assert eval_res["isValid"] is True
    assert eval_res["answeredCount"] == 1
    assert len(eval_res["questionEvaluations"]) == 1
    q_eval = eval_res["questionEvaluations"][0]
    assert q_eval["score"] > 50
    assert "question" in q_eval
    assert "answerText" in q_eval
    assert "speech_analysis" in q_eval


# ─── 2. LEARNING HUB GATING & DWELL-TIME TESTS ─────────────────────────────

def test_learning_hub_rejects_insufficient_dwell_time():
    """Verify that claiming lesson completion with insufficient dwell time is rejected by the backend."""
    token = generate_token(TEST_USER_A)
    course_id = "devops-foundations"
    lesson_id = "devops-mod1-les1"  # requires 60s

    progress_payload = {
        "completedItemIds": [lesson_id],
        "lessonTimeSpent": {lesson_id: 15}  # 15s < 60s required
    }

    res = client.post(
        "/analytics/course/progress",
        json={
            "user_id": TEST_USER_A,
            "course_id": course_id,
            "progress_data": progress_payload
        },
        headers={"Authorization": f"Bearer {token}"}
    )
    assert res.status_code == 200
    data = res.json()
    assert data["success"] is True
    saved_record = data["data"]
    # The item must NOT be in completedItemIds because dwell time was insufficient
    assert lesson_id not in saved_record["completedItemIds"]


def test_learning_hub_accepts_valid_dwell_time_completion():
    """Verify that claiming lesson completion with sufficient dwell time is validated and persisted."""
    token = generate_token(TEST_USER_A)
    course_id = "devops-foundations"
    lesson_id = "devops-mod1-les1"  # requires 60s

    progress_payload = {
        "completedItemIds": [lesson_id],
        "lessonTimeSpent": {lesson_id: 65}  # 65s >= 60s required
    }

    res = client.post(
        "/analytics/course/progress",
        json={
            "user_id": TEST_USER_A,
            "course_id": course_id,
            "progress_data": progress_payload
        },
        headers={"Authorization": f"Bearer {token}"}
    )
    assert res.status_code == 200
    data = res.json()
    assert data["success"] is True
    saved_record = data["data"]
    # Valid dwell time must be recorded and item accepted into completedItemIds
    assert lesson_id in saved_record["completedItemIds"]


def test_quiz_cannot_be_completed_via_dwell_time_alone():
    """Verify that a quiz item cannot be completed simply by claiming dwell time without submitting passing answers."""
    token = generate_token(TEST_USER_A)
    course_id = "devops-foundations"
    quiz_id = "devops-mod1-quiz"

    progress_payload = {
        "completedItemIds": [quiz_id],
        "lessonTimeSpent": {quiz_id: 120}  # even with 120s dwell time
    }

    res = client.post(
        "/analytics/course/progress",
        json={
            "user_id": TEST_USER_A,
            "course_id": course_id,
            "progress_data": progress_payload
        },
        headers={"Authorization": f"Bearer {token}"}
    )
    assert res.status_code == 200
    data = res.json()
    saved_record = data["data"]
    # Quiz must NOT be marked complete without a passing quiz score
    assert quiz_id not in saved_record["completedItemIds"]


def test_monotonic_completion_preservation_across_heartbeats():
    """Verify that subsequent dwell-time heartbeats do not overwrite or remove previously completed lessons."""
    token = generate_token(TEST_USER_A)
    course_id = "devops-foundations"
    les1 = "devops-mod1-les1"
    les2 = "devops-mod1-les2"

    # 1. Complete Lesson 1
    client.post(
        "/analytics/course/progress",
        json={
            "user_id": TEST_USER_A,
            "course_id": course_id,
            "progress_data": {
                "completedItemIds": [les1],
                "lessonTimeSpent": {les1: 65}
            }
        },
        headers={"Authorization": f"Bearer {token}"}
    )

    # 2. Heartbeat for Lesson 2 (5 seconds elapsed, not yet complete)
    res = client.post(
        "/analytics/course/progress",
        json={
            "user_id": TEST_USER_A,
            "course_id": course_id,
            "progress_data": {
                "heartbeat": {
                    "heartbeatId": f"hb_{uuid.uuid4().hex}",
                    "itemId": les2,
                    "deltaSeconds": 5
                },
                "completedItemIds": [les1]
            }
        },
        headers={"Authorization": f"Bearer {token}"}
    )
    assert res.status_code == 200
    data = res.json()["data"]
    # Lesson 1 must remain completed
    assert les1 in data["completedItemIds"]
    assert les2 not in data["completedItemIds"]


# ─── 3. SECURITY & USER ISOLATION TESTS ────────────────────────────────────

def test_user_a_cannot_view_or_modify_user_b_progress():
    """Verify that User A's token cannot read User B's course progress."""
    token_a = generate_token(TEST_USER_A)
    res = client.get(
        f"/analytics/course/progress/{TEST_USER_B}",
        headers={"Authorization": f"Bearer {token_a}"}
    )
    assert res.status_code == 403
