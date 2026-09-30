"""
PREPRIA Phase 6 Test Suite — Dashboard & Progress Analytics Unification
Verifies:
  1. Authenticated user data retrieval for dashboard
  2. Unauthenticated request rejection (401)
  3. Cross-user isolation (403 when User A accesses User B's dashboard/growth)
  4. Real persisted interviews returned in growth analytics
  5. Actual scores used without hardcoded/random values
  6. Authentic dimension deltas derived from Phase 3/4 evaluations
  7. Single interview returns baseline without fake growth
  8. Empty history returns clean empty state
  9. Persistent course progress integration
  10. Dashboard course progress matches backend store
  11. Absence of hardcoded metrics
  12. Absence of randomized metrics
  13. Single source of truth: Dashboard & Growth use identical source data
  14-18. Verification that Phase 1-5 test suites remain passing
"""

import pytest
import os
import sys
import jwt
import subprocess
from datetime import datetime, timedelta, timezone

backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from fastapi.testclient import TestClient
from main import app
from app.services.auth_service import JWT_SECRET, JWT_ALGORITHM
from app.services.performance_tracker import record_interview, interviews_db, get_growth_analytics
from app.services.engagement_service import save_user_course_progress, course_progress_db

client = TestClient(app)

USER_A = "phase6_user_a@prepria.com"
USER_B = "phase6_user_b@prepria.com"


def create_token(email: str) -> str:
    payload = {
        "sub": email,
        "email": email,
        "exp": datetime.now(timezone.utc) + timedelta(hours=2)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


@pytest.fixture(autouse=True)
def cleanup_phase6_test_data():
    """Ensure clean starting state before and after each test."""
    from app.services.auth_service import users_db
    test_users = [USER_A.lower(), USER_B.lower()]
    interviews_db[:] = [i for i in interviews_db if str(i.get("user_id")).lower() not in test_users]
    users_db[:] = [u for u in users_db if str(u.get("email", "")).lower() not in test_users]
    keys_to_del = [k for k in list(course_progress_db.keys()) if any(u in k for u in test_users)]
    for k in keys_to_del:
        del course_progress_db[k]
    yield
    interviews_db[:] = [i for i in interviews_db if str(i.get("user_id")).lower() not in test_users]
    users_db[:] = [u for u in users_db if str(u.get("email", "")).lower() not in test_users]
    keys_to_del = [k for k in list(course_progress_db.keys()) if any(u in k for u in test_users)]
    for k in keys_to_del:
        del course_progress_db[k]


def test_dashboard_returns_authenticated_user_data():
    token = create_token(USER_A)
    headers = {"Authorization": f"Bearer {token}"}
    response = client.get(f"/analytics/dashboard/{USER_A}", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["data"]["userId"].lower() == USER_A.lower()


def test_dashboard_rejects_unauthenticated_request():
    response = client.get(f"/analytics/dashboard/{USER_A}")
    assert response.status_code == 401


def test_user_a_cannot_access_user_b_dashboard():
    token_a = create_token(USER_A)
    headers_a = {"Authorization": f"Bearer {token_a}"}
    response = client.get(f"/analytics/dashboard/{USER_B}", headers=headers_a)
    assert response.status_code == 403


def test_growth_returns_real_persisted_interviews():
    token = create_token(USER_A)
    headers = {"Authorization": f"Bearer {token}"}
    
    # Record test session for USER_A
    record_interview({
        "id": "sess-phase6-1",
        "user_id": USER_A,
        "role": "DevOps Engineer",
        "overallScore": 0.82,
        "score": 82,
        "fluency_score": 85,
        "emotion_confidence": 0.88,
        "ats_score": 90,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "dimensions": {
            "technicalKnowledge": 85,
            "problemSolving": 80,
            "communication": 85,
            "roleKnowledge": 82,
            "confidence": 88
        },
        "questionEvaluations": [
            {"topic": "CI/CD Pipelines", "score": 85, "status": "answered"}
        ]
    })

    response = client.get(f"/analytics/growth/{USER_A}", headers=headers)
    assert response.status_code == 200
    res_data = response.json()["data"]
    assert res_data["hasHistory"] is True
    assert len(res_data["sessions"]) == 1
    assert res_data["sessions"][0]["id"] == "sess-phase6-1"
    assert res_data["sessions"][0]["score"] == 82


def test_growth_uses_actual_scores():
    record_interview({
        "id": "sess-score-check",
        "user_id": USER_A,
        "role": "Frontend Engineer",
        "overallScore": 0.77,
        "score": 77,
        "dimensions": {"technicalKnowledge": 77, "problemSolving": 75, "communication": 80, "roleKnowledge": 76, "confidence": 78},
        "timestamp": datetime.now(timezone.utc).isoformat()
    })

    growth = get_growth_analytics(USER_A)
    assert growth["history"][0]["score"] == 77
    assert growth["sessions"][0]["score"] == 77


def test_growth_dimension_deltas_are_authentic():
    # Session 1 (Baseline)
    record_interview({
        "id": "sess-dim-1",
        "user_id": USER_A,
        "role": "Backend Engineer",
        "overallScore": 0.70,
        "score": 70,
        "timestamp": (datetime.now(timezone.utc) - timedelta(days=2)).isoformat(),
        "dimensions": {
            "technicalKnowledge": 65,
            "problemSolving": 70,
            "communication": 75,
            "roleKnowledge": 68,
            "confidence": 72
        }
    })

    # Session 2 (Current)
    record_interview({
        "id": "sess-dim-2",
        "user_id": USER_A,
        "role": "Backend Engineer",
        "overallScore": 0.85,
        "score": 85,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "dimensions": {
            "technicalKnowledge": 80,
            "problemSolving": 85,
            "communication": 85,
            "roleKnowledge": 82,
            "confidence": 88
        }
    })

    growth = get_growth_analytics(USER_A)
    assert growth["scoreDelta"] == 15
    assert growth["dimensionTrends"]["technicalKnowledge"] == [65, 80]
    assert growth["dimensionTrends"]["problemSolving"] == [70, 85]
    assert growth["score_trend"] == "Increasing"


def test_single_interview_returns_baseline_without_fake_growth():
    record_interview({
        "id": "sess-single-baseline",
        "user_id": USER_A,
        "role": "Cloud Architect",
        "overallScore": 0.80,
        "score": 80,
        "timestamp": datetime.now(timezone.utc).isoformat()
    })

    growth = get_growth_analytics(USER_A)
    assert growth["hasHistory"] is True
    assert len(growth["sessions"]) == 1
    assert growth["scoreDelta"] == 0
    assert growth["growth_percentage"] == 0.0
    assert growth["score_trend"] == "Initial Baseline Established"


def test_empty_history_returns_empty_state():
    growth = get_growth_analytics(USER_A)
    assert growth["hasHistory"] is False
    assert growth["sessions"] == []
    assert growth["scoreTrend"] == []
    assert growth["scoreDelta"] == 0
    assert growth["score_trend"] == "Insufficient Data"


def test_course_progress_is_persistent():
    token = create_token(USER_A)
    headers = {"Authorization": f"Bearer {token}"}

    save_user_course_progress(USER_A, "devops-foundations", {
        "completedItemIds": ["devops-mod1-les1"],
        "lessonTimeSpent": {"devops-mod1-les1": 65}
    })

    response = client.get(f"/analytics/course/progress/{USER_A}/devops-foundations", headers=headers)
    assert response.status_code == 200
    data = response.json()["data"]
    assert "devops-mod1-les1" in data["completedItemIds"]


def test_dashboard_course_progress_matches_backend():
    token = create_token(USER_A)
    headers = {"Authorization": f"Bearer {token}"}

    save_user_course_progress(USER_A, "devops-foundations", {
        "completedItemIds": ["devops-mod1-les1"],
        "lessonTimeSpent": {"devops-mod1-les1": 65}
    })

    dash_res = client.get(f"/analytics/dashboard/{USER_A}", headers=headers)
    assert dash_res.status_code == 200
    dash_data = dash_res.json()["data"]

    assert "courseProgress" in dash_data
    assert isinstance(dash_data["courseProgress"]["completed"], int)
    assert dash_data["courseProgress"]["total"] >= 1


def test_no_hardcoded_dashboard_metrics():
    # User with zero activity should get authentic 0 states, not hardcoded 85% or fake numbers
    token = create_token(USER_A)
    headers = {"Authorization": f"Bearer {token}"}

    res = client.get(f"/analytics/dashboard/{USER_A}", headers=headers)
    assert res.status_code == 200
    data = res.json()["data"]

    assert data["interviewCount"] == 0
    assert data["overallScore"] == 0
    assert data["latestScore"] == 0
    assert data["dimensions"]["technicalKnowledge"] == 0
    assert data["dimensions"]["communication"] == 0


def test_no_randomized_dashboard_metrics():
    token = create_token(USER_A)
    headers = {"Authorization": f"Bearer {token}"}

    # Record fixed session
    record_interview({
        "id": "sess-deterministic",
        "user_id": USER_A,
        "role": "QA Engineer",
        "overallScore": 0.75,
        "score": 75,
        "fluency_score": 80,
        "emotion_confidence": 0.70,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "dimensions": {
            "technicalKnowledge": 75,
            "problemSolving": 70,
            "communication": 80,
            "roleKnowledge": 75,
            "confidence": 70
        }
    })

    res1 = client.get(f"/analytics/dashboard/{USER_A}", headers=headers).json()["data"]
    res2 = client.get(f"/analytics/dashboard/{USER_A}", headers=headers).json()["data"]

    # Results must be strictly deterministic across calls
    assert res1["overallScore"] == res2["overallScore"]
    assert res1["dimensions"] == res2["dimensions"]
    assert res1["latestScore"] == res2["latestScore"]


def test_dashboard_and_growth_use_same_source_data():
    token = create_token(USER_A)
    headers = {"Authorization": f"Bearer {token}"}

    record_interview({
        "id": "sess-sync",
        "user_id": USER_A,
        "role": "Data Engineer",
        "overallScore": 0.88,
        "score": 88,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "dimensions": {
            "technicalKnowledge": 90,
            "problemSolving": 85,
            "communication": 88,
            "roleKnowledge": 86,
            "confidence": 90
        }
    })

    dash_data = client.get(f"/analytics/dashboard/{USER_A}", headers=headers).json()["data"]
    growth_data = client.get(f"/analytics/growth/{USER_A}", headers=headers).json()["data"]

    assert dash_data["latestScore"] == growth_data["sessions"][0]["score"]
    assert dash_data["dimensions"] == growth_data["sessions"][0]["dimensions"]
    assert dash_data["trend"] == growth_data["score_trend"]


def test_weaknesses_and_longitudinal_resolution_analytics():
    token = create_token(USER_A)
    headers = {"Authorization": f"Bearer {token}"}

    record_interview({
        "id": "sess-weak-1",
        "user_id": USER_A,
        "role": "System Architect",
        "overallScore": 0.55,
        "score": 55,
        "timestamp": (datetime.now(timezone.utc) - timedelta(days=1)).isoformat(),
        "dimensions": {"technicalKnowledge": 55, "problemSolving": 50, "communication": 55, "roleKnowledge": 55, "confidence": 60},
        "questionEvaluations": [
            {"topic": "Distributed Caching", "score": 45, "status": "answered"}
        ]
    })

    dash_res = client.get(f"/analytics/dashboard/{USER_A}", headers=headers).json()["data"]
    assert "Distributed Caching" in dash_res["weakAreas"]


def test_ats_score_integration_from_profile_and_interview():
    token = create_token(USER_A)
    headers = {"Authorization": f"Bearer {token}"}

    from app.services.auth_service import create_user, update_user_profile
    create_user("Phase6 User A", USER_A, "TestPass123!")
    update_user_profile(USER_A, {"score": 88, "resumeUploaded": True})

    dash_res = client.get(f"/analytics/dashboard/{USER_A}", headers=headers).json()["data"]
    assert dash_res["atsScore"] == 88


def test_certificates_and_learning_analytics():
    token = create_token(USER_A)
    headers = {"Authorization": f"Bearer {token}"}

    dash_res = client.get(f"/analytics/dashboard/{USER_A}", headers=headers).json()["data"]
    assert "certificatesEarned" in dash_res
    assert isinstance(dash_res["certificatesEarned"], int)


def _run_regression_suite(test_file: str):
    sub_env = dict(os.environ)
    sub_env["PYTHONPATH"] = backend_dir
    target_file = os.path.join(backend_dir, "tests", os.path.basename(test_file))
    return subprocess.run(
        [sys.executable, "-m", "pytest", target_file, "-v"],
        capture_output=True,
        text=True,
        env=sub_env
    )


def test_existing_phase1_security_tests_still_pass():
    result = _run_regression_suite("backend/tests/test_phase1_security.py")
    assert result.returncode == 0, f"Phase 1 tests failed:\n{result.stdout}\n{result.stderr}"


def test_existing_phase2_tests_still_pass():
    result = _run_regression_suite("backend/tests/test_phase2_docx_extraction.py")
    assert result.returncode == 0, f"Phase 2 tests failed:\n{result.stdout}\n{result.stderr}"


def test_existing_phase3_tests_still_pass():
    result = _run_regression_suite("backend/tests/test_phase3_interview_evaluation.py")
    assert result.returncode == 0, f"Phase 3 tests failed:\n{result.stdout}\n{result.stderr}"


def test_existing_phase4_tests_still_pass():
    result = _run_regression_suite("backend/tests/test_phase4_longitudinal_adaptive.py")
    assert result.returncode == 0, f"Phase 4 tests failed:\n{result.stdout}\n{result.stderr}"


def test_existing_phase5_tests_still_pass():
    result = _run_regression_suite("backend/tests/test_phase5_learning_hub.py")
    assert result.returncode == 0, f"Phase 5 tests failed:\n{result.stdout}\n{result.stderr}"
    assert result.returncode == 0, f"Phase 5 tests failed:\n{result.stdout}\n{result.stderr}"
