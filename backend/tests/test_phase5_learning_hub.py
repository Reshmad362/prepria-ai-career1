"""
PREPRIA Phase 5 Test Suite — Learning Hub Hardening & Persistent Multi-Device Progress
Tests:
  1. Idempotent dwell-time heartbeats (adds delta exactly once, no double counting)
  2. Dwell-time anti-tampering (rejection of negative or excessive jumps, invalid item IDs)
  3. Quiz attempt idempotency (duplicate submissionId does not increment attempt count)
  4. Quiz grading and pass threshold enforcement (>= 70%)
  5. Quiz pass permanence (subsequent failed attempt does not revoke passed status)
  6. Server-side authoritative derivation of completion (rejection of client-supplied spoofing)
  7. Server-side certificate eligibility verification
  8. Concurrent/interleaved multi-device updates without data loss
  9. Cross-user isolation and resource ownership security
  10. Disk persistence across simulated backend restart
  11. Multi-course catalog hydration endpoint
"""

import pytest
import os
import sys
import json
import jwt
from datetime import datetime, timedelta

backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from fastapi.testclient import TestClient

from main import app
from app.services.engagement_service import (
    save_user_course_progress,
    get_user_course_progress,
    validate_certificate_eligibility,
    get_all_user_course_progress,
    _load_progress_from_disk,
    course_progress_db
)
from app.services.auth_service import JWT_SECRET, JWT_ALGORITHM

client = TestClient(app)

TEST_USER_A = "learner_a@prepria.com"
TEST_USER_B = "learner_b@prepria.com"
TEST_COURSE = "devops-foundations"


@pytest.fixture(autouse=True, scope="module")
def clean_test_data():
    """Ensure clean starting state for test users before executing sequential Phase 5 tests."""
    test_emails = [TEST_USER_A.lower(), TEST_USER_B.lower(), "fe101_learner@prepria.com", "under_dwell_user@prepria.com"]
    keys_to_del = [k for k in list(course_progress_db.keys()) if any(em in k for em in test_emails)]
    for k in keys_to_del:
        del course_progress_db[k]
    yield
    keys_to_del = [k for k in list(course_progress_db.keys()) if any(em in k for em in test_emails)]
    for k in keys_to_del:
        del course_progress_db[k]


def generate_token(email: str, user_id: str = "usr-123"):
    payload = {
        "id": user_id,
        "email": email,
        "role": "candidate",
        "exp": datetime.utcnow() + timedelta(hours=2)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


# =====================================================================
# 1. DWELL-TIME HEARTBEAT IDEMPOTENCY & ANTI-TAMPERING
# =====================================================================

def test_idempotent_dwell_heartbeat_adds_delta_once():
    """Valid incremental heartbeat with delta=5s increases lesson dwell time by exactly 5s."""
    token = generate_token(TEST_USER_A)
    headers = {"Authorization": f"Bearer {token}"}

    payload = {
        "user_id": TEST_USER_A,
        "course_id": TEST_COURSE,
        "progress_data": {
            "heartbeat": {
                "heartbeatId": "hb_test_1",
                "sessionId": "sess_1",
                "itemId": "devops-mod1-les1",
                "deltaSeconds": 5
            }
        }
    }

    res = client.post("/analytics/course/progress", json=payload, headers=headers)
    assert res.status_code == 200
    data = res.json()["data"]
    assert data["lessonTimeSpent"]["devops-mod1-les1"] == 5


def test_duplicate_heartbeat_does_not_double_count_dwell_time():
    """Duplicate heartbeat transmission with identical heartbeatId does not double-count time."""
    token = generate_token(TEST_USER_A)
    headers = {"Authorization": f"Bearer {token}"}

    payload = {
        "user_id": TEST_USER_A,
        "course_id": TEST_COURSE,
        "progress_data": {
            "heartbeat": {
                "heartbeatId": "hb_test_1",  # Same ID as previous test
                "sessionId": "sess_1",
                "itemId": "devops-mod1-les1",
                "deltaSeconds": 5
            }
        }
    }

    res = client.post("/analytics/course/progress", json=payload, headers=headers)
    assert res.status_code == 200
    data = res.json()["data"]
    # Must still be 5, NOT 10
    assert data["lessonTimeSpent"]["devops-mod1-les1"] == 5


def test_tampered_dwell_time_rejected_negative_or_excessive_delta():
    """Excessive (>15s) or negative delta heartbeats are rejected without modifying server time."""
    token = generate_token(TEST_USER_A)
    headers = {"Authorization": f"Bearer {token}"}

    # Attempt to spoof 999999 seconds
    tampered_payload = {
        "user_id": TEST_USER_A,
        "course_id": TEST_COURSE,
        "progress_data": {
            "heartbeat": {
                "heartbeatId": "hb_spoof_huge",
                "sessionId": "sess_1",
                "itemId": "devops-mod1-les1",
                "deltaSeconds": 999999
            }
        }
    }

    res = client.post("/analytics/course/progress", json=tampered_payload, headers=headers)
    assert res.status_code == 200
    data = res.json()["data"]
    assert data["lessonTimeSpent"]["devops-mod1-les1"] == 5

    # Attempt negative delta
    negative_payload = {
        "user_id": TEST_USER_A,
        "course_id": TEST_COURSE,
        "progress_data": {
            "heartbeat": {
                "heartbeatId": "hb_spoof_neg",
                "sessionId": "sess_1",
                "itemId": "devops-mod1-les1",
                "deltaSeconds": -50
            }
        }
    }
    res = client.post("/analytics/course/progress", json=negative_payload, headers=headers)
    assert res.status_code == 200
    assert res.json()["data"]["lessonTimeSpent"]["devops-mod1-les1"] == 5


def test_invalid_lesson_id_heartbeat_rejected():
    """Heartbeat for a non-existent lesson ID is discarded."""
    token = generate_token(TEST_USER_A)
    headers = {"Authorization": f"Bearer {token}"}

    invalid_payload = {
        "user_id": TEST_USER_A,
        "course_id": TEST_COURSE,
        "progress_data": {
            "heartbeat": {
                "heartbeatId": "hb_invalid_item",
                "sessionId": "sess_1",
                "itemId": "non-existent-hack-lesson",
                "deltaSeconds": 5
            }
        }
    }

    res = client.post("/analytics/course/progress", json=invalid_payload, headers=headers)
    assert res.status_code == 200
    data = res.json()["data"]
    assert "non-existent-hack-lesson" not in data["lessonTimeSpent"]


# =====================================================================
# 2. QUIZ IDEMPOTENCY, GRADING & PASS PERMANENCE
# =====================================================================

def test_quiz_attempt_idempotency_prevents_duplicate_attempt_counts():
    """Sending the same quiz submissionId multiple times increments attempt count exactly once."""
    token = generate_token(TEST_USER_A)
    headers = {"Authorization": f"Bearer {token}"}

    sub_payload = {
        "user_id": TEST_USER_A,
        "course_id": TEST_COURSE,
        "progress_data": {
            "quizSubmission": {
                "submissionId": "sub_quiz_mod1_attempt_1",
                "quizId": "devops-mod1-quiz",
                "answersByQuestionId": {
                    "q1": 0,  # correct
                    "q2": 1,  # correct
                    "q3": 0   # wrong (correct is 2)
                }
            }
        }
    }

    # First attempt (2/3 = 67% -> Failed)
    res1 = client.post("/analytics/course/progress", json=sub_payload, headers=headers)
    assert res1.status_code == 200
    q1 = res1.json()["data"]["quizScores"]["devops-mod1-quiz"]
    assert q1["score"] == 67
    assert q1["passed"] is False
    assert q1["attempts"] == 1

    # Retry same submissionId (network duplicate)
    res2 = client.post("/analytics/course/progress", json=sub_payload, headers=headers)
    assert res2.status_code == 200
    q2 = res2.json()["data"]["quizScores"]["devops-mod1-quiz"]
    assert q2["attempts"] == 1  # Not double-incremented


def test_quiz_grading_and_pass_threshold_enforcement_70_percent():
    """Quiz scoring >= 70% passes and marks validated; score < 70% fails."""
    token = generate_token(TEST_USER_A)
    headers = {"Authorization": f"Bearer {token}"}

    # Second attempt with new submissionId (3/3 = 100% -> Passed)
    pass_payload = {
        "user_id": TEST_USER_A,
        "course_id": TEST_COURSE,
        "progress_data": {
            "quizSubmission": {
                "submissionId": "sub_quiz_mod1_attempt_2",
                "quizId": "devops-mod1-quiz",
                "answersByQuestionId": {
                    "q1": 0,  # correct
                    "q2": 1,  # correct
                    "q3": 2   # correct
                }
            }
        }
    }

    res = client.post("/analytics/course/progress", json=pass_payload, headers=headers)
    assert res.status_code == 200
    q = res.json()["data"]["quizScores"]["devops-mod1-quiz"]
    assert q["score"] == 100
    assert q["passed"] is True
    assert q["attempts"] == 2


def test_quiz_passed_status_is_permanent_even_if_subsequent_attempt_fails():
    """Once a quiz is passed (>=70%), subsequent lower attempts preserve passed=True and highest score."""
    token = generate_token(TEST_USER_A)
    headers = {"Authorization": f"Bearer {token}"}

    # Third attempt (0/3 = 0% -> Failed)
    fail_payload = {
        "user_id": TEST_USER_A,
        "course_id": TEST_COURSE,
        "progress_data": {
            "quizSubmission": {
                "submissionId": "sub_quiz_mod1_attempt_3",
                "quizId": "devops-mod1-quiz",
                "answersByQuestionId": {
                    "q1": 3,
                    "q2": 3,
                    "q3": 3
                }
            }
        }
    }

    res = client.post("/analytics/course/progress", json=fail_payload, headers=headers)
    assert res.status_code == 200
    q = res.json()["data"]["quizScores"]["devops-mod1-quiz"]
    assert q["passed"] is True  # Permanent pass preserved
    assert q["score"] == 100    # Highest score preserved
    assert q["attempts"] == 3


# =====================================================================
# 3. SERVER-DERIVED COMPLETION & CERTIFICATE AUTHORITY
# =====================================================================

def test_server_independently_derives_completion_and_rejects_client_spoofing():
    """Server derives real required items and ignores client-supplied completion percentage."""
    token = generate_token(TEST_USER_A)
    headers = {"Authorization": f"Bearer {token}"}

    spoofed_payload = {
        "user_id": TEST_USER_A,
        "course_id": TEST_COURSE,
        "progress_data": {
            "totalRequiredItems": 1,
            "completionPercentage": 100,
            "certificateEligible": True,
            "completedItemIds": ["devops-mod1-les1"]
        }
    }

    res = client.post("/analytics/course/progress", json=spoofed_payload, headers=headers)
    assert res.status_code == 200
    data = res.json()["data"]
    # Real total required items for devops-foundations is 6 (2 modules * 3 items)
    assert data["totalRequiredItems"] == 6
    assert data["certificateEligible"] is False
    assert data["completionPercentage"] < 100


def test_certificate_eligibility_strictly_enforced_by_server():
    """Certificate endpoint returns eligible=False until all lessons and final exam are genuinely completed."""
    token = generate_token(TEST_USER_A)
    headers = {"Authorization": f"Bearer {token}"}

    # Verify certificate is currently locked
    cert_res = client.get(f"/analytics/course/certificate/{TEST_USER_A}/{TEST_COURSE}", headers=headers)
    assert cert_res.status_code == 200
    assert cert_res.json()["data"]["eligible"] is False

    # Complete all required lessons and quizzes with valid dwell time (>=60s)
    # devops-mod1-les1, devops-mod1-les2, devops-mod1-quiz (already passed),
    # devops-mod2-les1, devops-mod2-les2, devops-mod2-quiz
    for item_id in ["devops-mod1-les1", "devops-mod1-les2", "devops-mod2-les1", "devops-mod2-les2"]:
        for i in range(12):  # 12 * 5s = 60s
            client.post("/analytics/course/progress", json={
                "user_id": TEST_USER_A,
                "course_id": TEST_COURSE,
                "progress_data": {
                    "heartbeat": {
                        "heartbeatId": f"hb_fill_{item_id}_{i}",
                        "sessionId": "sess_1",
                        "itemId": item_id,
                        "deltaSeconds": 5
                    }
                }
            }, headers=headers)

    # Pass Module 2 quiz
    client.post("/analytics/course/progress", json={
        "user_id": TEST_USER_A,
        "course_id": TEST_COURSE,
        "progress_data": {
            "quizSubmission": {
                "submissionId": "sub_quiz_mod2_pass",
                "quizId": "devops-mod2-quiz",
                "answersByQuestionId": {"q1": 0, "q2": 1}
            },
            "completedItemIds": [
                "devops-mod1-les1", "devops-mod1-les2", "devops-mod1-quiz",
                "devops-mod2-les1", "devops-mod2-les2", "devops-mod2-quiz"
            ]
        }
    }, headers=headers)

    # Pass Final Comprehensive Assessment
    final_res = client.post("/analytics/course/progress", json={
        "user_id": TEST_USER_A,
        "course_id": TEST_COURSE,
        "progress_data": {
            "finalAssessmentSubmission": {
                "submissionId": "sub_final_exam_pass",
                "answersByQuestionId": {"fa-1": 0, "fa-2": 1, "fa-3": 2}
            },
            "completedItemIds": [
                "devops-mod1-les1", "devops-mod1-les2", "devops-mod1-quiz",
                "devops-mod2-les1", "devops-mod2-les2", "devops-mod2-quiz"
            ]
        }
    }, headers=headers)

    assert final_res.status_code == 200
    final_data = final_res.json()["data"]
    assert final_data["completionPercentage"] == 100
    assert final_data["certificateEligible"] is True

    # Now verify certificate endpoint returns eligible=True
    cert_res2 = client.get(f"/analytics/course/certificate/{TEST_USER_A}/{TEST_COURSE}", headers=headers)
    assert cert_res2.status_code == 200
    assert cert_res2.json()["data"]["eligible"] is True


# =====================================================================
# 4. MULTI-DEVICE INTERLEAVED SYNCHRONIZATION
# =====================================================================

def test_interleaved_multi_device_heartbeats_and_progress_sync():
    """Simulates Device A and Device B sending interleaved heartbeats for React Mastery."""
    course_id = "react-mastery"
    token = generate_token(TEST_USER_B)
    headers = {"Authorization": f"Bearer {token}"}

    # Device A sends 3 heartbeats (15s total) on Lesson 1
    for i in range(3):
        client.post("/analytics/course/progress", json={
            "user_id": TEST_USER_B,
            "course_id": course_id,
            "progress_data": {
                "heartbeat": {
                    "heartbeatId": f"hb_devA_les1_{i}",
                    "sessionId": "sess_device_A",
                    "itemId": "react-mod1-les1",
                    "deltaSeconds": 5
                }
            }
        }, headers=headers)

    # Device B sends 4 heartbeats (20s total) on Lesson 2
    for i in range(4):
        client.post("/analytics/course/progress", json={
            "user_id": TEST_USER_B,
            "course_id": course_id,
            "progress_data": {
                "heartbeat": {
                    "heartbeatId": f"hb_devB_les2_{i}",
                    "sessionId": "sess_device_B",
                    "itemId": "react-mod1-les2",
                    "deltaSeconds": 5
                }
            }
        }, headers=headers)

    # Device A sends another 2 heartbeats on Lesson 1 (total 25s)
    for i in range(3, 5):
        client.post("/analytics/course/progress", json={
            "user_id": TEST_USER_B,
            "course_id": course_id,
            "progress_data": {
                "heartbeat": {
                    "heartbeatId": f"hb_devA_les1_{i}",
                    "sessionId": "sess_device_A",
                    "itemId": "react-mod1-les1",
                    "deltaSeconds": 5
                }
            }
        }, headers=headers)

    # Hydrate on Device B and verify cumulative times from both devices are preserved
    prog_res = client.get(f"/analytics/course/progress/{TEST_USER_B}/{course_id}", headers=headers)
    assert prog_res.status_code == 200
    times = prog_res.json()["data"]["lessonTimeSpent"]
    assert times["react-mod1-les1"] == 25
    assert times["react-mod1-les2"] == 20


# =====================================================================
# 5. USER ISOLATION & PERSISTENCE
# =====================================================================

def test_strict_user_data_isolation_cannot_access_or_modify_other_user_progress():
    """User A cannot access or modify User B's course progress or certificate."""
    token_a = generate_token(TEST_USER_A)
    headers_a = {"Authorization": f"Bearer {token_a}"}

    # User A tries to GET User B's progress -> 403
    res1 = client.get(f"/analytics/course/progress/{TEST_USER_B}/{TEST_COURSE}", headers=headers_a)
    assert res1.status_code == 403

    # User A tries to POST progress to User B -> 403
    res2 = client.post("/analytics/course/progress", json={
        "user_id": TEST_USER_B,
        "course_id": TEST_COURSE,
        "progress_data": {}
    }, headers=headers_a)
    assert res2.status_code == 403

    # User A tries to view User B's certificate -> 403
    res3 = client.get(f"/analytics/course/certificate/{TEST_USER_B}/{TEST_COURSE}", headers=headers_a)
    assert res3.status_code == 403


def test_progress_persistence_survives_simulated_backend_restart():
    """Course progress persisted on disk reloads cleanly after in-memory cache wipe."""
    token = generate_token(TEST_USER_A)
    headers = {"Authorization": f"Bearer {token}"}

    # Verify existing state in memory
    rec_before = get_user_course_progress(TEST_USER_A, TEST_COURSE)
    assert rec_before is not None
    assert rec_before["certificateEligible"] is True

    # Wipe in-memory DB to simulate reboot
    course_progress_db.clear()
    assert len(course_progress_db) == 0

    # Reload from disk
    _load_progress_from_disk()

    # Verify state fully restored
    rec_after = get_user_course_progress(TEST_USER_A, TEST_COURSE)
    assert rec_after is not None
    assert rec_after["certificateEligible"] is True
    assert rec_after["completionPercentage"] == 100
    assert rec_after["quizScores"]["devops-mod1-quiz"]["score"] == 100


def test_get_all_user_course_progress_catalog_hydration():
    """GET /analytics/course/progress/{user_id} returns all course records for catalog hydration."""
    token = generate_token(TEST_USER_A)
    headers = {"Authorization": f"Bearer {token}"}

    res = client.get(f"/analytics/course/progress/{TEST_USER_A}", headers=headers)
    assert res.status_code == 200
    data = res.json()["data"]
    assert isinstance(data, list)
    assert len(data) >= 1
    assert any(c["courseId"] == TEST_COURSE for c in data)


# =====================================================================
# 6. DEDICATED REGRESSION TESTS FOR LESSON COMPLETION & DWELL GATING
# =====================================================================

def test_frontend_course_fe101_html5_accessibility_trees_completion_and_unlock():
    """
    Direct regression test for 'Semantic HTML5 & Accessibility Trees' in course fe-101:
    - Authoritative dwell time reaching 60s
    - Submitting lesson completion
    - Server includes fe-101-m1-l1 in completedItemIds
    - Recalculates progress percentage
    - Persists to disk
    - Duplicate completion is idempotent
    """
    user_email = "fe101_learner@prepria.com"
    course_id = "fe-101"
    lesson_id = "fe-101-m1-l1"
    token = generate_token(user_email)
    headers = {"Authorization": f"Bearer {token}"}

    # Clear user from progress db
    key = f"{user_email}_{course_id}"
    if key in course_progress_db:
        del course_progress_db[key]

    # 1. Send heartbeats accumulating 65s active dwell time (> 60s requirement)
    for i in range(13): # 13 * 5s = 65s
        res = client.post("/analytics/course/progress", json={
            "user_id": user_email,
            "course_id": course_id,
            "progress_data": {
                "heartbeat": {
                    "heartbeatId": f"hb_fe101_{i}",
                    "sessionId": "sess_fe101",
                    "itemId": lesson_id,
                    "deltaSeconds": 5
                },
                "totalRequiredItems": 39
            }
        }, headers=headers)
        assert res.status_code == 200

    # Verify dwell time is 65s
    prog1 = client.get(f"/analytics/course/progress/{user_email}/{course_id}", headers=headers).json()["data"]
    assert prog1["lessonTimeSpent"][lesson_id] == 65
    assert lesson_id not in prog1["completedItemIds"]

    # 2. Mark lesson complete
    complete_res = client.post("/analytics/course/progress", json={
        "user_id": user_email,
        "course_id": course_id,
        "progress_data": {
            "completedItemIds": [lesson_id],
            "lessonTimeSpent": {lesson_id: 65},
            "totalRequiredItems": 39
        }
    }, headers=headers)

    assert complete_res.status_code == 200
    data = complete_res.json()["data"]
    assert lesson_id in data["completedItemIds"]
    assert data["totalRequiredItems"] in (39, 40)
    assert data["completionPercentage"] >= 2

    # 3. Duplicate completion submission is idempotent
    dup_res = client.post("/analytics/course/progress", json={
        "user_id": user_email,
        "course_id": course_id,
        "progress_data": {
            "completedItemIds": [lesson_id],
            "lessonTimeSpent": {lesson_id: 65},
            "totalRequiredItems": 39
        }
    }, headers=headers)
    assert dup_res.status_code == 200
    dup_data = dup_res.json()["data"]
    assert dup_data["completedItemIds"] == [lesson_id]

    # 4. Verify disk persistence across cache wipe
    course_progress_db.clear()
    _load_progress_from_disk()
    persisted = get_user_course_progress(user_email, course_id)
    assert persisted is not None
    assert lesson_id in persisted["completedItemIds"]


def test_lesson_completion_rejected_when_dwell_time_insufficient():
    """
    Reverse case verification:
    If dwell time is below the required 60s threshold (e.g. 15s),
    marking the lesson complete must be rejected and completedItemIds remains empty.
    """
    user_email = "under_dwell_user@prepria.com"
    course_id = "fe-101"
    lesson_id = "fe-101-m1-l1"
    token = generate_token(user_email)
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Send only 3 heartbeats (15s total < 60s)
    for i in range(3):
        client.post("/analytics/course/progress", json={
            "user_id": user_email,
            "course_id": course_id,
            "progress_data": {
                "heartbeat": {
                    "heartbeatId": f"hb_under_{i}",
                    "sessionId": "sess_under",
                    "itemId": lesson_id,
                    "deltaSeconds": 5
                }
            }
        }, headers=headers)

    # 2. Attempt to mark complete with insufficient dwell time
    res = client.post("/analytics/course/progress", json={
        "user_id": user_email,
        "course_id": course_id,
        "progress_data": {
            "completedItemIds": [lesson_id],
            "lessonTimeSpent": {lesson_id: 15}
        }
    }, headers=headers)

    assert res.status_code == 200
    data = res.json()["data"]
    # Must NOT be completed
    assert lesson_id not in data["completedItemIds"]
    assert data["completionPercentage"] == 0

