import pytest
import os
import sys
import uuid
import jwt
from datetime import datetime, timedelta
from fastapi.testclient import TestClient

backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

os.environ["APP_ENV"] = "test"
os.environ["JWT_SECRET"] = "test-secret-key-for-phase9-verification-2026"

from main import app
from app.services.auth_service import (
    users_db,
    _save_users_to_disk,
    generate_token,
    JWT_SECRET,
    JWT_ALGORITHM
)
from app.services.performance_tracker import record_interview, interviews_db, _save_interviews_to_disk
from app.services.engagement_service import course_progress_db, _save_progress_to_disk
from app.services.recommendation_service import generate_recommendations_for_user, recommendations_db, _save_recommendations_to_disk
from app.services.longitudinal_service import get_user_longitudinal_profile, get_longitudinal_topic_detail

client = TestClient(app)


def save_test_interview(user_id: str, role: str, score: int, dimensions: dict = None, weaknesses: list = None, strengths: list = None, q_evals: list = None, difficulty: str = "medium"):
    dimensions = dimensions or {"technicalKnowledge": score, "problemSolving": score, "communication": score, "roleKnowledge": score, "confidence": score}
    scorecard = {
        "overallScore": score,
        "scores": dimensions,
        "weaknesses": weaknesses or [],
        "strengths": strengths or []
    }
    data = {
        "id": f"sess-{uuid.uuid4().hex[:8]}",
        "user_id": user_id,
        "role": role,
        "roleName": role,
        "difficulty": difficulty,
        "score": score,
        "overallScore": score,
        "dimensions": dimensions,
        "evaluation": scorecard,
        "questionEvaluations": q_evals or [],
        "timestamp": datetime.utcnow().isoformat(),
        "completedAt": datetime.utcnow().isoformat()
    }
    record_interview(data)
    return data


@pytest.fixture(autouse=True)
def setup_phase9_users():
    user_a_email = "phase9_user_a@prepria.test"
    user_b_email = "phase9_user_b@prepria.test"
    empty_user_email = "phase9_empty_user@prepria.test"

    for email in [user_a_email, user_b_email, empty_user_email]:
        users_db[:] = [u for u in users_db if u.get("email") != email]
        interviews_db[:] = [i for i in interviews_db if str(i.get("user_id")).lower() != email]
        recommendations_db.pop(email, None)
        # Clear progress db entries for email
        prefix = f"{email}_"
        for k in list(course_progress_db.keys()):
            if k.startswith(prefix):
                course_progress_db.pop(k, None)

    user_a = {
        "id": "uuid-phase9-user-a",
        "name": "Phase 9 User A",
        "email": user_a_email,
        "password": "HashedPassword123!",
        "profile": {"targetRole": "Full Stack Developer", "skills": ["React", "JavaScript", "FastAPI"], "resumeUploaded": True}
    }
    user_b = {
        "id": "uuid-phase9-user-b",
        "name": "Phase 9 User B",
        "email": user_b_email,
        "password": "HashedPassword123!",
        "profile": {"targetRole": "DevOps Engineer", "skills": ["Docker", "Kubernetes"], "resumeUploaded": True}
    }
    empty_user = {
        "id": "uuid-phase9-empty-user",
        "name": "Phase 9 Empty User",
        "email": empty_user_email,
        "password": "HashedPassword123!",
        "profile": {}
    }

    users_db.extend([user_a, user_b, empty_user])
    _save_users_to_disk()
    _save_interviews_to_disk()
    _save_progress_to_disk()

    yield {
        "user_a": user_a,
        "user_b": user_b,
        "empty_user": empty_user
    }


def get_token(user_dict):
    token_res = generate_token(user_dict["id"], user_dict["email"], user_dict["name"])
    return token_res["access_token"]


# ─── 1. Authenticated Longitudinal Profile Retrieval ───────────────────────
def test_1_authenticated_longitudinal_profile_retrieval(setup_phase9_users):
    user_a = setup_phase9_users["user_a"]
    token = get_token(user_a)

    res = client.get("/longitudinal/profile", headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 200
    json_data = res.json()
    assert json_data["success"] is True
    assert "data" in json_data
    assert json_data["data"]["userId"] == user_a["email"]


# ─── 2. Missing Authentication → 401 ─────────────────────────────────────────
def test_2_missing_authentication_returns_401():
    res = client.get("/longitudinal/profile")
    assert res.status_code in [401, 403]


# ─── 3. Invalid Authentication → 401 ─────────────────────────────────────────
def test_3_invalid_authentication_returns_401():
    res = client.get("/longitudinal/profile", headers={"Authorization": "Bearer invalid_token_12345"})
    assert res.status_code == 401


# ─── 4. User Isolation (User A Cannot Access User B Data) ────────────────────
def test_4_user_isolation(setup_phase9_users):
    user_a = setup_phase9_users["user_a"]
    user_b = setup_phase9_users["user_b"]

    save_test_interview(user_b["email"], role="DevOps Engineer", score=85, weaknesses=["Kubernetes Topology"])

    token_a = get_token(user_a)
    res_a = client.get("/longitudinal/profile", headers={"Authorization": f"Bearer {token_a}"})
    assert res_a.status_code == 200
    data_a = res_a.json()["data"]

    # User A profile must not contain User B's email or interviews
    assert data_a["userId"] == user_a["email"]
    assert data_a["totalInterviews"] == 0
    assert not any(w.get("topic") == "Kubernetes Topology" for w in data_a.get("recurringWeaknesses", []))


# ─── 5. No-Interview Empty State ────────────────────────────────────────────
def test_5_no_interview_empty_state(setup_phase9_users):
    empty_user = setup_phase9_users["empty_user"]
    token = get_token(empty_user)

    res = client.get("/longitudinal/profile", headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 200
    data = res.json()["data"]

    assert data["totalInterviews"] == 0
    assert data["trend"] == "insufficient_evidence"
    assert data["scoreDelta"] == 0
    assert len(data["strengths"]) == 0
    assert len(data["recurringWeaknesses"]) == 0


# ─── 6. Single-Interview Insufficient-Evidence State ───────────────────────
def test_6_single_interview_insufficient_evidence_state(setup_phase9_users):
    user_a = setup_phase9_users["user_a"]
    email = user_a["email"]

    save_test_interview(email, role="Full Stack Developer", score=65, weaknesses=["Database Optimization"])

    token = get_token(user_a)
    res = client.get("/longitudinal/profile", headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 200
    data = res.json()["data"]

    assert data["totalInterviews"] == 1
    assert data["trend"] == "insufficient_evidence"
    assert data["latestScore"] == 65
    assert data["scoreDelta"] == 0


# ─── 7. Multi-Interview Score Trend ────────────────────────────────────────
def test_7_multi_interview_score_trend(setup_phase9_users):
    user_a = setup_phase9_users["user_a"]
    email = user_a["email"]

    save_test_interview(email, role="Full Stack Developer", score=55)
    save_test_interview(email, role="Full Stack Developer", score=68)
    save_test_interview(email, role="Full Stack Developer", score=78)

    profile = get_user_longitudinal_profile(email)
    assert profile["totalInterviews"] == 3
    assert profile["initialScore"] == 55
    assert profile["latestScore"] == 78
    assert profile["highestScore"] == 78
    assert profile["scoreDelta"] == 23
    assert profile["trend"] == "improving"


# ─── 8. Score Delta and Percentage Change Calculation ────────────────────────
def test_8_score_delta_and_percentage_change(setup_phase9_users):
    user_a = setup_phase9_users["user_a"]
    email = user_a["email"]

    save_test_interview(email, role="Full Stack Developer", score=50)
    save_test_interview(email, role="Full Stack Developer", score=75)

    profile = get_user_longitudinal_profile(email)
    assert profile["scoreDelta"] == 25
    assert profile["percentageChange"] == 50.0  # (25 / 50) * 100


# ─── 9. Dimension-Level Progression ────────────────────────────────────────
def test_9_dimension_level_progression(setup_phase9_users):
    user_a = setup_phase9_users["user_a"]
    email = user_a["email"]

    save_test_interview(email, role="Full Stack Developer", score=60, dimensions={"technicalKnowledge": 50, "communication": 60})
    save_test_interview(email, role="Full Stack Developer", score=75, dimensions={"technicalKnowledge": 80, "communication": 65})

    profile = get_user_longitudinal_profile(email)
    dims = profile["dimensionProgression"]

    assert dims["technicalKnowledge"]["initial"] == 50
    assert dims["technicalKnowledge"]["latest"] == 80
    assert dims["technicalKnowledge"]["delta"] == 30
    assert dims["technicalKnowledge"]["trend"] == "improving"


# ─── 10. Recurring Weakness Detection ───────────────────────────────────────
def test_10_recurring_weakness_detection(setup_phase9_users):
    user_a = setup_phase9_users["user_a"]
    email = user_a["email"]

    save_test_interview(email, role="Full Stack Developer", score=60, weaknesses=["SQL Optimization"])
    save_test_interview(email, role="Full Stack Developer", score=62, weaknesses=["SQL Optimization"])

    profile = get_user_longitudinal_profile(email)
    rec_weak = profile["recurringWeaknesses"]

    assert len(rec_weak) >= 1
    sql_w = next((w for w in rec_weak if w["topic"] == "SQL Optimization"), None)
    assert sql_w is not None
    assert sql_w["occurrenceCount"] == 2
    assert sql_w["status"] == "recurring"


# ─── 11. Persistent Weakness Detection ──────────────────────────────────────
def test_11_persistent_weakness_detection(setup_phase9_users):
    user_a = setup_phase9_users["user_a"]
    email = user_a["email"]

    save_test_interview(email, role="Full Stack Developer", score=55, weaknesses=["SQL Optimization"])
    
    # User completes a learning intervention
    key = f"{email}_sql-database-optimization"
    course_progress_db[key] = {"userId": email, "courseId": "sql-database-optimization", "completionPercentage": 100, "certificateEligible": True}
    _save_progress_to_disk()

    # Session 2: Weakness persists despite intervention
    save_test_interview(email, role="Full Stack Developer", score=58, weaknesses=["SQL Optimization"])

    profile = get_user_longitudinal_profile(email)
    pers_weak = profile["persistentWeaknesses"]

    assert len(pers_weak) >= 1
    sql_p = next((w for w in pers_weak if w["topic"] == "SQL Optimization"), None)
    assert sql_p is not None
    assert sql_p["status"] == "persistent"


# ─── 12. Weakness Resolution Detection ──────────────────────────────────────
def test_12_weakness_resolution_detection(setup_phase9_users):
    user_a = setup_phase9_users["user_a"]
    email = user_a["email"]

    # Session 1: Flagged weak in SQL Optimization
    save_test_interview(
        email, role="Full Stack Developer", score=55,
        weaknesses=["SQL Optimization"],
        q_evals=[{"topic": "SQL Optimization", "score": 50, "question": "Explain indexing"}]
    )

    # Session 2: Improved in SQL Optimization (score 82%)
    save_test_interview(
        email, role="Full Stack Developer", score=80,
        weaknesses=[],
        q_evals=[{"topic": "SQL Optimization", "score": 82, "question": "Explain query execution plan"}]
    )

    profile = get_user_longitudinal_profile(email)
    res_weak = profile["resolvedWeaknesses"]

    assert len(res_weak) >= 1
    sql_r = next((w for w in res_weak if w["topic"] == "SQL Optimization"), None)
    assert sql_r is not None
    assert sql_r["status"] == "resolved"
    assert sql_r["resolvedScore"] == 82


# ─── 13. Consistent Strength Detection ──────────────────────────────────────
def test_13_consistent_strength_detection(setup_phase9_users):
    user_a = setup_phase9_users["user_a"]
    email = user_a["email"]

    save_test_interview(email, role="Full Stack Developer", score=80, q_evals=[{"topic": "React Architecture", "score": 85}])
    save_test_interview(email, role="Full Stack Developer", score=85, q_evals=[{"topic": "React Architecture", "score": 90}])

    profile = get_user_longitudinal_profile(email)
    strengths = profile["strengths"]

    assert len(strengths) >= 1
    react_s = next((s for s in strengths if s["topic"] == "React Architecture"), None)
    assert react_s is not None
    assert react_s["status"] == "consistent"


# ─── 14. Topic Exposure Tracking ─────────────────────────────────────────────
def test_14_topic_exposure_tracking(setup_phase9_users):
    user_a = setup_phase9_users["user_a"]
    email = user_a["email"]

    save_test_interview(email, role="Full Stack Developer", score=70, difficulty="medium", q_evals=[{"topic": "REST APIs", "score": 75}])
    save_test_interview(email, role="Full Stack Developer", score=80, difficulty="hard", q_evals=[{"topic": "REST APIs", "score": 85}])

    profile = get_user_longitudinal_profile(email)
    t_prog = profile["topicProgress"]

    api_t = next((t for t in t_prog if t["topic"] == "REST APIs"), None)
    assert api_t is not None
    assert api_t["timesTested"] == 2
    assert api_t["scores"] == [75, 85]
    assert "medium" in api_t["difficultiesEncountered"]
    assert "hard" in api_t["difficultiesEncountered"]


# ─── 15. Question Exposure Tracking ──────────────────────────────────────────
def test_15_question_exposure_tracking(setup_phase9_users):
    user_a = setup_phase9_users["user_a"]
    email = user_a["email"]

    save_test_interview(email, role="Full Stack Developer", score=70, q_evals=[{"topic": "Security", "score": 70, "question": "What is JWT?"}])

    profile = get_user_longitudinal_profile(email)
    q_exp = profile["questionExposure"]

    assert len(q_exp) >= 1
    assert q_exp[0]["questionText"] == "What is JWT?"
    assert q_exp[0]["timesAsked"] == 1


# ─── 16. Difficulty History and Progression ──────────────────────────────────
def test_16_difficulty_history_and_progression(setup_phase9_users):
    user_a = setup_phase9_users["user_a"]
    email = user_a["email"]

    save_test_interview(email, role="Full Stack Developer", score=70, difficulty="medium")
    save_test_interview(email, role="Full Stack Developer", score=85, difficulty="hard")

    profile = get_user_longitudinal_profile(email)
    assert len(profile["difficultyHistory"]) == 2
    assert profile["difficultyProgression"] == "progressed"


# ─── 17. Learning Intervention Integration ──────────────────────────────────
def test_17_learning_intervention_integration(setup_phase9_users):
    user_a = setup_phase9_users["user_a"]
    email = user_a["email"]

    key = f"{email}_fe-101"
    course_progress_db[key] = {"userId": email, "courseId": "fe-101", "completionPercentage": 100, "certificateEligible": True, "updatedAt": datetime.utcnow().isoformat()}
    _save_progress_to_disk()

    profile = get_user_longitudinal_profile(email)
    interventions = profile["learningInterventions"]

    assert len(interventions) >= 1
    assert interventions[0]["courseId"] == "fe-101"
    assert interventions[0]["status"] == "completed"


# ─── 18. Intervention Outcome Detection ──────────────────────────────────────
def test_18_intervention_outcome_detection(setup_phase9_users):
    user_a = setup_phase9_users["user_a"]
    email = user_a["email"]

    # Session 1 before course
    save_test_interview(email, role="Full Stack Developer", score=50, q_evals=[{"topic": "Frontend Fundamentals", "score": 50}])

    # Course completed
    key = f"{email}_fe-101"
    course_progress_db[key] = {"userId": email, "courseId": "fe-101", "completionPercentage": 100, "certificateEligible": True}
    _save_progress_to_disk()

    # Session 2 after course
    save_test_interview(email, role="Full Stack Developer", score=80, q_evals=[{"topic": "Frontend Fundamentals", "score": 85}])

    profile = get_user_longitudinal_profile(email)
    outcomes = profile["interventionOutcomes"]

    assert len(outcomes) >= 1
    assert outcomes[0]["outcome"] == "improved"
    assert outcomes[0]["scoreDelta"] > 0
    assert "Improvement was observed" in outcomes[0]["description"]


# ─── 19. Recommendation History Integration ────────────────────────────────
def test_19_recommendation_history_integration(setup_phase9_users):
    user_a = setup_phase9_users["user_a"]
    email = user_a["email"]

    # Generate recommendations for User A
    generate_recommendations_for_user(email)

    profile = get_user_longitudinal_profile(email)
    rec_hist = profile["recommendationHistory"]

    assert isinstance(rec_hist, list)
    assert len(rec_hist) >= 1


# ─── 20. Conservative Mastery State Calculation ─────────────────────────────
def test_20_conservative_mastery_state_calculation(setup_phase9_users):
    user_a = setup_phase9_users["user_a"]
    email = user_a["email"]

    # Single session good score -> developing or consistent, not instant 'mastered'
    save_test_interview(email, role="Full Stack Developer", score=85, q_evals=[{"topic": "Docker", "score": 85}])

    profile = get_user_longitudinal_profile(email)
    m_states = profile["masteryStates"]

    docker_m = next((m for m in m_states if m["topic"] == "Docker"), None)
    assert docker_m is not None
    assert docker_m["masteryState"] in ["developing", "consistent", "strong"]


# ─── 21. Deterministic Output ───────────────────────────────────────────────
def test_21_deterministic_output(setup_phase9_users):
    user_a = setup_phase9_users["user_a"]
    email = user_a["email"]

    save_test_interview(email, role="Full Stack Developer", score=60)
    save_test_interview(email, role="Full Stack Developer", score=75)

    profile1 = get_user_longitudinal_profile(email)
    profile2 = get_user_longitudinal_profile(email)

    assert profile1["totalInterviews"] == profile2["totalInterviews"]
    assert profile1["scoreDelta"] == profile2["scoreDelta"]
    assert profile1["trend"] == profile2["trend"]


# ─── 22. No Fabricated Conclusions ──────────────────────────────────────────
def test_22_no_fabricated_conclusions(setup_phase9_users):
    empty_user = setup_phase9_users["empty_user"]
    email = empty_user["email"]

    profile = get_user_longitudinal_profile(email)
    assert profile["trend"] == "insufficient_evidence"
    assert profile["totalInterviews"] == 0
    assert len(profile["strengths"]) == 0


# ─── 23. Multi-Role Context Separation ──────────────────────────────────────
def test_23_multi_role_context_separation(setup_phase9_users):
    user_a = setup_phase9_users["user_a"]
    email = user_a["email"]

    save_test_interview(email, role="Full Stack Developer", score=70)
    save_test_interview(email, role="DevOps Engineer", score=85)

    profile = get_user_longitudinal_profile(email)
    roles = profile["multiRoleContext"]

    assert len(roles) == 2
    r_names = [r["role"] for r in roles]
    assert "Full Stack Developer" in r_names
    assert "DevOps Engineer" in r_names


# ─── 24. Topic Detail Endpoint ───────────────────────────────────────────────
def test_24_topic_detail_endpoint(setup_phase9_users):
    user_a = setup_phase9_users["user_a"]
    email = user_a["email"]
    token = get_token(user_a)

    save_test_interview(email, role="Full Stack Developer", score=80, q_evals=[{"topic": "FastAPI", "score": 88}])

    res = client.get("/longitudinal/topic/FastAPI", headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 200
    data = res.json()["data"]

    assert data["topic"] == "FastAPI"
    assert data["hasData"] is True
    assert data["masteryState"] in ["developing", "consistent", "strong"]


# ─── 25. Existing Phase 1–8 Compatibility ────────────────────────────────────
def test_25_existing_phase1_8_compatibility(setup_phase9_users):
    user_a = setup_phase9_users["user_a"]
    token = get_token(user_a)

    # Health check
    res_h = client.get("/health")
    assert res_h.status_code == 200

    # Phase 8 Recommendations
    res_r = client.get("/recommendations", headers={"Authorization": f"Bearer {token}"})
    assert res_r.status_code == 200

    # Phase 6 Dashboard
    res_d = client.get(f"/analytics/dashboard/{user_a['email']}", headers={"Authorization": f"Bearer {token}"})
    assert res_d.status_code == 200
