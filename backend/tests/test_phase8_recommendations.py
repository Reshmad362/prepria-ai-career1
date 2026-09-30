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
os.environ["JWT_SECRET"] = "test-secret-key-for-phase8-verification-2026"

from main import app
from app.services.auth_service import (
    users_db,
    _save_users_to_disk,
    generate_token,
    JWT_SECRET,
    JWT_ALGORITHM
)
from app.services.performance_tracker import record_interview, interviews_db, _save_interviews_to_disk
from app.services.engagement_service import (
    record_user_activity,
    save_user_course_progress,
    course_progress_db,
    _save_progress_to_disk
)
from app.services.recommendation_service import (
    generate_recommendations_for_user,
    recommendations_db,
    _save_recommendations_to_disk
)
from app.services.course_catalog_service import COURSE_CATALOG

def save_interview_submission(user_id, role, difficulty="medium", user_answers=None, scorecard=None):
    scorecard = scorecard or {}
    data = {
        "id": f"sess-{uuid.uuid4().hex[:8]}",
        "user_id": user_id,
        "role": role,
        "roleName": role,
        "difficulty": difficulty,
        "user_answers": user_answers or [],
        "overallScore": scorecard.get("overallScore", 60),
        "score": scorecard.get("overallScore", 60),
        "dimensions": scorecard.get("scores", {}),
        "evaluation": scorecard,
        "evaluation_results": scorecard,
        "timestamp": datetime.utcnow().isoformat(),
        "completedAt": datetime.utcnow().isoformat()
    }
    return record_interview(data)

def record_activity(user_id, activity_data):
    activity_data["user_id"] = user_id
    return record_user_activity(activity_data)

def update_course_progress(user_id, course_id, *args, **kwargs):
    key = f"{str(user_id).strip().lower()}_{str(course_id).strip().lower()}"
    progress_data = kwargs.get("progress_data")
    if progress_data and isinstance(progress_data, dict):
        rec = {
            "userId": user_id,
            "courseId": course_id,
            "completedItemIds": progress_data.get("completedItemIds", []),
            "completionPercentage": progress_data.get("completionPercentage", 100 if progress_data.get("certificateEligible") else 50),
            "certificateEligible": bool(progress_data.get("certificateEligible", False)),
            "updatedAt": datetime.utcnow().isoformat()
        }
    else:
        item_id = kwargs.get("item_id") or (args[0] if len(args) > 0 else "item-1")
        rec = {
            "userId": user_id,
            "courseId": course_id,
            "completedItemIds": [item_id],
            "completionPercentage": 100,
            "certificateEligible": True,
            "updatedAt": datetime.utcnow().isoformat()
        }
    course_progress_db[key] = rec
    _save_progress_to_disk()
    return rec

client = TestClient(app)



@pytest.fixture(autouse=True)
def setup_phase8_users():
    user_a_email = "phase8_user_a@prepria.test"
    user_b_email = "phase8_user_b@prepria.test"
    empty_user_email = "phase8_empty_user@prepria.test"

    for email in [user_a_email, user_b_email, empty_user_email]:
        users_db[:] = [u for u in users_db if u.get("email") != email]
        interviews_db[:] = [i for i in interviews_db if str(i.get("user_id")).lower() != email]
        recommendations_db.pop(email, None)
        prefix = f"{email}_"
        for k in list(course_progress_db.keys()):
            if k.startswith(prefix):
                course_progress_db.pop(k, None)

    user_a = {
        "id": "uuid-phase8-user-a",
        "name": "Phase 8 User A",
        "email": user_a_email,
        "password": "HashedPassword123!",
        "profile": {
            "name": "Phase 8 User A",
            "email": user_a_email,
            "skills": ["React", "JavaScript", "HTML", "CSS"],
            "targetRole": "Full Stack Developer",
            "resumeUploaded": True,
            "resumeFileName": "resume_user_a.pdf",
            "score": 65
        },
        "preferences": {
            "targetRole": "Full Stack Developer",
            "techStack": "React, Node.js"
        },
        "scoreHistory": []
    }

    user_b = {
        "id": "uuid-phase8-user-b",
        "name": "Phase 8 User B",
        "email": user_b_email,
        "password": "HashedPassword123!",
        "profile": {
            "name": "Phase 8 User B",
            "email": user_b_email,
            "skills": ["Python", "Docker", "Kubernetes"],
            "targetRole": "DevOps Engineer",
            "resumeUploaded": True,
            "score": 85
        },
        "preferences": {
            "targetRole": "DevOps Engineer"
        },
        "scoreHistory": []
    }

    empty_user = {
        "id": "uuid-phase8-empty",
        "name": "Phase 8 Empty User",
        "email": empty_user_email,
        "password": "HashedPassword123!",
        "profile": {
            "name": "Phase 8 Empty User",
            "email": empty_user_email,
            "skills": [],
            "targetRole": "",
            "resumeUploaded": False
        },
        "preferences": {
            "targetRole": ""
        },
        "scoreHistory": []
    }

    users_db.extend([user_a, user_b, empty_user])
    _save_users_to_disk()
    _save_interviews_to_disk()
    _save_progress_to_disk()
    _save_recommendations_to_disk()

    yield {
        "user_a": user_a,
        "user_b": user_b,
        "empty_user": empty_user
    }

    for email in [user_a_email, user_b_email, empty_user_email]:
        users_db[:] = [u for u in users_db if u.get("email") != email]
        recommendations_db.pop(email, None)
    _save_users_to_disk()
    _save_recommendations_to_disk()


def get_token(user):
    res = generate_token(user["id"], user["email"], user["name"])
    return res["access_token"]


# ─── 1. Authenticated Retrieval ──────────────────────────────────────────────
def test_1_authenticated_recommendation_retrieval(setup_phase8_users):
    user_a = setup_phase8_users["user_a"]
    token = get_token(user_a)

    res = client.get("/recommendations", headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 200
    data = res.json()
    assert data["success"] is True
    assert "recommendations" in data
    assert isinstance(data["recommendations"], list)


# ─── 2. Missing Authentication → 401 ─────────────────────────────────────────
def test_2_missing_authentication_returns_401():
    res = client.get("/recommendations")
    assert res.status_code == 401


# ─── 3. Invalid Authentication → 401 ─────────────────────────────────────────
def test_3_invalid_authentication_returns_401():
    res = client.get("/recommendations", headers={"Authorization": "Bearer invalid_garbage_token_123"})
    assert res.status_code == 401


# ─── 4. User Isolation ───────────────────────────────────────────────────────
def test_4_user_isolation(setup_phase8_users):
    user_a = setup_phase8_users["user_a"]
    user_b = setup_phase8_users["user_b"]
    token_a = get_token(user_a)

    # User A requesting recommendations while passing User B's user_id param
    res = client.get(f"/recommendations?user_id={user_b['email']}", headers={"Authorization": f"Bearer {token_a}"})
    assert res.status_code == 403


# ─── 5. Resume-Driven Recommendation ─────────────────────────────────────────
def test_5_resume_driven_recommendation(setup_phase8_users):
    user_a = setup_phase8_users["user_a"]
    token_a = get_token(user_a)

    res = client.get("/recommendations", headers={"Authorization": f"Bearer {token_a}"})
    assert res.status_code == 200
    recs = res.json()["recommendations"]
    
    # User A has ATS score 65% (< 75%), should have a resume optimization recommendation
    resume_recs = [r for r in recs if r["type"] == "resume"]
    assert len(resume_recs) > 0
    assert "ATS" in resume_recs[0]["title"] or "Resume" in resume_recs[0]["title"]


# ─── 6. Role-Skill-Gap Recommendation ───────────────────────────────────────
def test_6_role_skill_gap_recommendation(setup_phase8_users):
    user_a = setup_phase8_users["user_a"]
    token_a = get_token(user_a)

    res = client.get("/recommendations", headers={"Authorization": f"Bearer {token_a}"})
    assert res.status_code == 200
    recs = res.json()["recommendations"]

    # User A target role is Full Stack Developer, skills are [React, JS, HTML, CSS]. Gap includes Node.js or SQL.
    gap_recs = [r for r in recs if r["type"] == "role_gap"]
    assert len(gap_recs) > 0
    missing_skills = [r["relatedSkill"] for r in gap_recs]
    assert "Node.js" in missing_skills or "SQL" in missing_skills


# ─── 7. Interview-Weakness Recommendation ────────────────────────────────────
def test_7_interview_weakness_recommendation(setup_phase8_users):
    user_a = setup_phase8_users["user_a"]
    email = user_a["email"]

    # Record interview with weakness "Database Optimization"
    save_interview_submission(
        user_id=email,
        role="Full Stack Developer",
        difficulty="medium",
        user_answers=[{"question_id": "q1", "user_answer": "I don't know how indexing works"}],
        scorecard={
            "overallScore": 55,
            "scores": {"technical": 50, "problemSolving": 55, "communication": 75, "roleKnowledge": 60, "confidence": 70},
            "weaknesses": ["Database Optimization", "SQL Query Indexing"],
            "strengths": ["Frontend React Architecture"]
        }
    )

    token_a = get_token(user_a)
    res = client.get("/recommendations", headers={"Authorization": f"Bearer {token_a}"})
    assert res.status_code == 200
    recs = res.json()["recommendations"]

    weakness_recs = [r for r in recs if r.get("relatedSkill") == "Database Optimization" or "Database" in r["title"]]
    assert len(weakness_recs) > 0
    assert "interview_history" in weakness_recs[0]["source"] or "learning_hub" in weakness_recs[0]["source"]


# ─── 8. Repeated Weakness Prioritization ────────────────────────────────────
def test_8_repeated_weakness_prioritization(setup_phase8_users):
    user_a = setup_phase8_users["user_a"]
    email = user_a["email"]

    # Session 1: Weakness in Database Optimization
    save_interview_submission(
        user_id=email,
        role="Full Stack Developer",
        difficulty="medium",
        user_answers=[{"question_id": "q1", "user_answer": "No idea"}],
        scorecard={
            "overallScore": 50,
            "scores": {"technical": 45, "problemSolving": 50, "communication": 70},
            "weaknesses": ["Database Optimization"]
        }
    )

    # Session 2: Repeated weakness in Database Optimization
    save_interview_submission(
        user_id=email,
        role="Full Stack Developer",
        difficulty="hard",
        user_answers=[{"question_id": "q2", "user_answer": "Still struggling with SQL"}],
        scorecard={
            "overallScore": 52,
            "scores": {"technical": 48, "problemSolving": 50, "communication": 70},
            "weaknesses": ["Database Optimization"]
        }
    )

    token_a = get_token(user_a)
    res = client.get("/recommendations", headers={"Authorization": f"Bearer {token_a}"})
    assert res.status_code == 200
    recs = res.json()["recommendations"]

    db_rec = next((r for r in recs if r.get("relatedSkill") == "Database Optimization"), None)
    assert db_rec is not None
    assert db_rec["priority"] == "high"


# ─── 9. Strong/Improved Topic Handling ─────────────────────────────────────
def test_9_improved_topic_handling(setup_phase8_users):
    user_a = setup_phase8_users["user_a"]
    email = user_a["email"]

    # Session 1: Weakness in React
    save_interview_submission(
        user_id=email,
        role="Full Stack Developer",
        difficulty="easy",
        user_answers=[{"question_id": "q1", "user_answer": "Weak answer"}],
        scorecard={
            "overallScore": 50,
            "scores": {"technical": 50},
            "weaknesses": ["React Virtual DOM"]
        }
    )

    # Session 2: Improved React performance (score 90%)
    save_interview_submission(
        user_id=email,
        role="Full Stack Developer",
        difficulty="medium",
        user_answers=[{"question_id": "q2", "user_answer": "Excellent answer explaining Fiber and Virtual DOM"}],
        scorecard={
            "overallScore": 90,
            "scores": {"technical": 90},
            "strengths": ["React Virtual DOM"],
            "weaknesses": []
        }
    )

    token_a = get_token(user_a)
    res = client.get("/recommendations", headers={"Authorization": f"Bearer {token_a}"})
    assert res.status_code == 200
    recs = res.json()["recommendations"]

    # React Virtual DOM should no longer be flagged as a HIGH priority active weakness
    high_react_recs = [r for r in recs if r.get("relatedSkill") == "React Virtual DOM" and r["priority"] == "high"]
    assert len(high_react_recs) == 0


# ─── 10. Learning-Aware Recommendation ─────────────────────────────────────
def test_10_learning_aware_recommendation(setup_phase8_users):
    user_a = setup_phase8_users["user_a"]
    email = user_a["email"]

    save_interview_submission(
        user_id=email,
        role="Full Stack Developer",
        difficulty="medium",
        user_answers=[{"question_id": "q1", "user_answer": "Poor answer"}],
        scorecard={
            "overallScore": 50,
            "scores": {"technical": 50},
            "weaknesses": ["Docker"]
        }
    )

    token_a = get_token(user_a)
    res = client.get("/recommendations", headers={"Authorization": f"Bearer {token_a}"})
    assert res.status_code == 200
    recs = res.json()["recommendations"]

    docker_learning_rec = next((r for r in recs if r["type"] == "learning" and r.get("relatedCourseId") == "devops-foundations"), None)
    assert docker_learning_rec is not None
    assert docker_learning_rec["relatedCourseId"] in ["devops-foundations", "be-101", "react-mastery", "sql-database-optimization", "dsa-interview-prep", "behavioral-interview-mastery", "system-design-mastery"]


# ─── 11. Completed-Course Handling ──────────────────────────────────────────
def test_11_completed_course_handling(setup_phase8_users):
    user_a = setup_phase8_users["user_a"]
    email = user_a["email"]

    # Mark course devops-foundations completed
    update_course_progress(
        user_id=email,
        course_id="devops-foundations",
        item_id="devops-mod1-les1",
        dwell_seconds=60,
        is_quiz_submission=False
    )
    # Simulate course certificate passed
    course_progress_db[f"{email}_devops-foundations"] = {
        "userId": email,
        "courseId": "devops-foundations",
        "isPassed": True,
        "eligibleForCertificate": True,
        "completedItemIds": ["devops-mod1-les1", "devops-mod1-les2", "devops-mod1-quiz"]
    }
    _save_progress_to_disk()

    save_interview_submission(
        user_id=email,
        role="Full Stack Developer",
        difficulty="medium",
        user_answers=[{"question_id": "q1", "user_answer": "Weak Docker answer"}],
        scorecard={
            "overallScore": 50,
            "scores": {"technical": 50},
            "weaknesses": ["Docker"]
        }
    )

    token_a = get_token(user_a)
    res = client.get("/recommendations", headers={"Authorization": f"Bearer {token_a}"})
    assert res.status_code == 200
    recs = res.json()["recommendations"]

    # devops-foundations should not be recommended as a new course since it is already completed
    completed_recs = [r for r in recs if r["type"] == "learning" and r.get("relatedCourseId") == "devops-foundations" and r["status"] == "new"]
    assert len(completed_recs) == 0


# ─── 12. Traceability & Evidence ────────────────────────────────────────────
def test_12_recommendation_traceability(setup_phase8_users):
    user_a = setup_phase8_users["user_a"]
    token_a = get_token(user_a)

    res = client.get("/recommendations", headers={"Authorization": f"Bearer {token_a}"})
    assert res.status_code == 200
    recs = res.json()["recommendations"]

    for r in recs:
        assert "source" in r
        assert "sourceEvidence" in r
        assert isinstance(r["sourceEvidence"], list)
        assert len(r["sourceEvidence"]) > 0
        assert "reason" in r
        assert len(r["reason"]) > 0


# ─── 13. Schema Match ───────────────────────────────────────────────────────
def test_13_recommendation_schema(setup_phase8_users):
    user_a = setup_phase8_users["user_a"]
    token_a = get_token(user_a)

    res = client.get("/recommendations", headers={"Authorization": f"Bearer {token_a}"})
    assert res.status_code == 200
    recs = res.json()["recommendations"]

    required_keys = [
        "recommendationId", "userId", "type", "title", "description",
        "priority", "reason", "source", "sourceEvidence", "status", "createdAt"
    ]
    for r in recs:
        for k in required_keys:
            assert k in r, f"Missing key {k} in recommendation schema"
        assert r["type"] in ["skill", "learning", "interview", "resume", "role_gap"]
        assert r["priority"] in ["high", "medium", "low"]
        assert r["status"] in ["new", "in_progress", "completed", "dismissed"]


# ─── 14. Duplicate Prevention ───────────────────────────────────────────────
def test_14_duplicate_prevention(setup_phase8_users):
    user_a = setup_phase8_users["user_a"]
    token_a = get_token(user_a)

    # Call twice
    res1 = client.get("/recommendations", headers={"Authorization": f"Bearer {token_a}"})
    recs1 = res1.json()["recommendations"]

    res2 = client.get("/recommendations", headers={"Authorization": f"Bearer {token_a}"})
    recs2 = res2.json()["recommendations"]

    rec_ids1 = [r["recommendationId"] for r in recs1]
    rec_ids2 = [r["recommendationId"] for r in recs2]

    assert rec_ids1 == rec_ids2
    assert len(rec_ids1) == len(set(rec_ids1))


# ─── 15. Persistence Across Backend Calls ──────────────────────────────────
def test_15_recommendation_persistence(setup_phase8_users):
    user_a = setup_phase8_users["user_a"]
    email = user_a["email"]

    generate_recommendations_for_user(email)
    assert email in recommendations_db
    assert len(recommendations_db[email]) > 0


# ─── 16. Status Persistence ────────────────────────────────────────────────
def test_16_status_persistence(setup_phase8_users):
    user_a = setup_phase8_users["user_a"]
    token_a = get_token(user_a)

    res1 = client.get("/recommendations", headers={"Authorization": f"Bearer {token_a}"})
    recs = res1.json()["recommendations"]
    target_rec = recs[0]
    rec_id = target_rec["recommendationId"]

    # Update status to in_progress
    res_update = client.put(f"/recommendations/{rec_id}/status", json={"status": "in_progress"}, headers={"Authorization": f"Bearer {token_a}"})
    assert res_update.status_code == 200
    assert res_update.json()["recommendation"]["status"] == "in_progress"

    # Fetch again to verify persistence
    res2 = client.get("/recommendations", headers={"Authorization": f"Bearer {token_a}"})
    recs_updated = res2.json()["recommendations"]
    updated_item = next(r for r in recs_updated if r["recommendationId"] == rec_id)
    assert updated_item["status"] == "in_progress"


# ─── 17. Deterministic Output ───────────────────────────────────────────────
def test_17_deterministic_output(setup_phase8_users):
    user_a = setup_phase8_users["user_a"]
    email = user_a["email"]

    recs1 = generate_recommendations_for_user(email)
    recs2 = generate_recommendations_for_user(email)

    assert [r["recommendationId"] for r in recs1] == [r["recommendationId"] for r in recs2]
    assert [r["title"] for r in recs1] == [r["title"] for r in recs2]
    assert [r["priority"] for r in recs1] == [r["priority"] for r in recs2]


# ─── 18. No Fabricated Course IDs ────────────────────────────────────────────
def test_18_no_fabricated_course_ids(setup_phase8_users):
    user_a = setup_phase8_users["user_a"]
    token_a = get_token(user_a)

    res = client.get("/recommendations", headers={"Authorization": f"Bearer {token_a}"})
    recs = res.json()["recommendations"]

    valid_course_ids = {
        "devops-foundations", "react-mastery", "be-101", "be-102", "be-103", "be-104",
        "fe-101", "sql-database-optimization", "dsa-interview-prep",
        "behavioral-interview-mastery", "system-design-mastery"
    }

    for r in recs:
        c_id = r.get("relatedCourseId")
        if c_id:
            assert c_id in valid_course_ids or c_id in COURSE_CATALOG


# ─── 19. No Fabricated Resume Claims ────────────────────────────────────────
def test_19_no_fabricated_resume_claims(setup_phase8_users):
    user_a = setup_phase8_users["user_a"]
    token_a = get_token(user_a)

    res = client.get("/recommendations", headers={"Authorization": f"Bearer {token_a}"})
    recs = res.json()["recommendations"]

    user_skills_lower = {s.lower() for s in user_a["profile"]["skills"]}

    for r in recs:
        # Check that description doesn't claim experience for missing skills
        for ev in r["sourceEvidence"]:
            if "lacks" in ev.lower() or "missing" in ev.lower() or "not currently" in ev.lower():
                missing_s = r.get("relatedSkill")
                if missing_s:
                    assert missing_s.lower() not in user_skills_lower


# ─── 20. Edge Case with Insufficient Evidence ──────────────────────────────
def test_20_insufficient_evidence_empty_state(setup_phase8_users):
    empty_user = setup_phase8_users["empty_user"]
    token_empty = get_token(empty_user)

    res = client.get("/recommendations", headers={"Authorization": f"Bearer {token_empty}"})
    assert res.status_code == 200
    recs = res.json()["recommendations"]
    
    # Insufficient evidence user should only receive prompt to upload resume, no fake/random scores
    assert isinstance(recs, list)
    for r in recs:
        assert r["type"] in ["resume", "role_gap", "skill", "learning", "interview"]
        assert len(r["sourceEvidence"]) > 0


# ─── 21. Phase 1–7 Compatibility ────────────────────────────────────────────
def test_21_existing_phase1_7_compatibility(setup_phase8_users):
    user_a = setup_phase8_users["user_a"]
    token_a = get_token(user_a)

    # Health check
    res_health = client.get("/health")
    assert res_health.status_code == 200

    # Auth me check
    res_me = client.get("/auth/me", headers={"Authorization": f"Bearer {token_a}"})
    assert res_me.status_code == 200

    # Role matching check
    res_role = client.post("/match-role", json={"skills": ["React", "JavaScript"]})
    assert res_role.status_code == 200

    # Interview generation check
    res_int = client.post("/generate-interview", json={"role": "Frontend Developer", "difficulty": "medium", "question_count": 2})
    assert res_int.status_code == 200
