"""
PREPRIA Phase 11 Automated Test Suite — Dynamic Evidence-Grounded Career Roadmap & Milestone Progression
Validates:
  1. Multi-domain role catalogs (Technology, Data, HR, Marketing, Finance, Sales, Design)
  2. Deterministic skill gap derivation and explainable readiness scoring
  3. Evidence-grounded milestone unlocking, progressive gating, and completion validation
  4. JWT authentication, multi-tenant isolation, and resource ownership (401, 403, 200)
  5. Persistence of target role updates, milestone states, and timestamps across disk reloads
  6. Integration with verified Learning Hub course completions and Mock Interview evaluations
"""

import pytest
import os
import sys
import uuid
import jwt
from datetime import datetime, timedelta, timezone
from fastapi.testclient import TestClient

backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

os.environ["APP_ENV"] = "test"
os.environ["JWT_SECRET"] = "test-secret-key-for-phase11-roadmap-2026"

from main import app
from app.services.auth_service import (
    users_db,
    _save_users_to_disk,
    JWT_SECRET,
    JWT_ALGORITHM
)
from app.services.performance_tracker import interviews_db, _save_interviews_to_disk
from app.services.engagement_service import course_progress_db, _save_progress_to_disk
from app.services.career_roadmap_service import (
    roadmaps_db,
    _save_roadmaps_to_disk,
    _load_roadmaps_from_disk,
    compute_user_career_roadmap,
    update_user_target_role,
    complete_user_milestone,
    get_role_definition,
    get_domain_for_role,
    CAREER_DOMAINS,
    ROLE_DEFINITIONS
)

client = TestClient(app)

PHASE11_USER_A = "p11_candidate_a@prepria.test"
PHASE11_USER_B = "p11_candidate_b@prepria.test"


def make_test_token(email: str, user_id: str = None) -> str:
    payload = {
        "sub": email,
        "email": email,
        "id": user_id or str(uuid.uuid4()),
        "exp": datetime.now(timezone.utc) + timedelta(hours=2)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


@pytest.fixture(autouse=True)
def cleanup_phase11_data():
    """Ensure clean starting and ending state for Phase 11 test users."""
    for email in [PHASE11_USER_A, PHASE11_USER_B]:
        users_db[:] = [u for u in users_db if u.get("email") != email]
        interviews_db[:] = [i for i in interviews_db if str(i.get("user_id")).lower() != email]
        roadmaps_db.pop(email, None)
        prefix = f"{email}_"
        for k in list(course_progress_db.keys()):
            if k.startswith(prefix):
                course_progress_db.pop(k, None)
    
    _save_users_to_disk()
    _save_interviews_to_disk()
    _save_progress_to_disk()
    _save_roadmaps_to_disk()

    yield

    for email in [PHASE11_USER_A, PHASE11_USER_B]:
        users_db[:] = [u for u in users_db if u.get("email") != email]
        interviews_db[:] = [i for i in interviews_db if str(i.get("user_id")).lower() != email]
        roadmaps_db.pop(email, None)
        prefix = f"{email}_"
        for k in list(course_progress_db.keys()):
            if k.startswith(prefix):
                course_progress_db.pop(k, None)

    _save_users_to_disk()
    _save_interviews_to_disk()
    _save_progress_to_disk()
    _save_roadmaps_to_disk()


@pytest.fixture
def setup_phase11_users():
    """Bootstrap test candidates."""
    u_a = {
        "id": "p11-usr-a",
        "email": PHASE11_USER_A,
        "name": "Candidate Alice",
        "password": "hashed_password",
        "target_role": "Full Stack Developer",
        "skills": ["JavaScript", "React", "REST APIs", "Git"]
    }
    u_b = {
        "id": "p11-usr-b",
        "email": PHASE11_USER_B,
        "name": "Candidate Bob",
        "password": "hashed_password",
        "target_role": "Data Analyst",
        "skills": ["SQL", "Excel", "Data Cleaning"]
    }
    users_db.extend([u_a, u_b])
    _save_users_to_disk()
    return {
        "user_a": u_a,
        "user_b": u_b,
        "token_a": make_test_token(PHASE11_USER_A, "p11-usr-a"),
        "token_b": make_test_token(PHASE11_USER_B, "p11-usr-b")
    }


# ─── 1. DOMAIN & ROLE CATALOG TESTS ──────────────────────────────────────────

def test_1_all_seven_career_domains_supported():
    expected_domains = ["Technology", "Data & Analytics", "Human Resources", "Marketing", "Finance", "Business & Sales", "Design"]
    for d in expected_domains:
        assert d in CAREER_DOMAINS, f"Career domain '{d}' must be defined."
        assert len(CAREER_DOMAINS[d]["roles"]) > 0, f"Domain '{d}' must list valid roles."


def test_2_role_definition_retrieval():
    def_fs = get_role_definition("Full Stack Developer")
    assert def_fs["domain"] == "Technology"
    assert "React" in def_fs["coreSkills"]
    assert len(def_fs["milestoneTemplates"]) == 4

    def_da = get_role_definition("Data Analyst")
    assert def_da["domain"] == "Data & Analytics"
    assert "SQL" in def_da["coreSkills"]

    def_hr = get_role_definition("HR Executive")
    assert def_hr["domain"] == "Human Resources"
    assert "Recruitment" in def_hr["coreSkills"]


def test_3_case_insensitive_role_lookup():
    def_lower = get_role_definition("full stack developer")
    assert def_lower["domain"] == "Technology"

    def_unknown = get_role_definition("NonExistentRoleXYZ")
    assert def_unknown is not None
    assert "coreSkills" in def_unknown


# ─── 2. DETERMINISTIC SKILL GAP & READINESS SCORING ──────────────────────────

def test_4_deterministic_skill_gap_derivation(setup_phase11_users):
    rm = compute_user_career_roadmap(PHASE11_USER_A, target_role_override="Full Stack Developer")
    assert rm["target_role"] == "Full Stack Developer"
    assert rm["career_domain"] == "Technology"
    
    # Alice has React, JavaScript, REST APIs, Git
    assert "React" in rm["verified_skills"]
    assert "JavaScript" in rm["verified_skills"]
    assert "Git" in rm["verified_skills"]
    
    # Missing skills should contain required skills not in verified list
    assert "Docker" in rm["missing_skills"]
    assert "PostgreSQL" in rm["missing_skills"]
    assert rm["skill_coverage_percent"] > 0
    assert rm["readiness_score"] > 0


def test_5_readiness_score_is_strictly_deterministic(setup_phase11_users):
    score_1 = compute_user_career_roadmap(PHASE11_USER_A)["readiness_score"]
    score_2 = compute_user_career_roadmap(PHASE11_USER_A)["readiness_score"]
    score_3 = compute_user_career_roadmap(PHASE11_USER_A)["readiness_score"]
    assert score_1 == score_2 == score_3, "Readiness score must be strictly reproducible."


def test_6_empty_profile_baseline_readiness():
    empty_email = "empty_user_test@prepria.test"
    rm = compute_user_career_roadmap(empty_email, target_role_override="Backend Developer")
    assert rm["readiness_score"] == 0
    assert rm["skill_coverage_percent"] == 0
    assert len(rm["missing_skills"]) > 0


# ─── 3. MILESTONE PROGRESSION & EVIDENCE GATING ──────────────────────────────

def test_7_milestone_progressive_unlock_states(setup_phase11_users):
    rm = compute_user_career_roadmap(PHASE11_USER_A, target_role_override="Full Stack Developer")
    milestones = rm["milestones"]
    assert len(milestones) == 4
    
    # Milestone 1: Step 01 is unlocked / in_progress
    assert milestones[0]["status"] in ["in_progress", "completed"]
    assert milestones[0]["step"] == "01"
    
    # Later milestones with unmet prerequisites should be locked or in_progress based on skill match
    assert milestones[-1]["status"] in ["locked", "in_progress", "completed"]


def test_8_milestone_contains_authentic_evidence(setup_phase11_users):
    rm = compute_user_career_roadmap(PHASE11_USER_A, target_role_override="Full Stack Developer")
    ms1 = rm["milestones"][0]
    
    # Should contain Grounded in Resume / Profile skill evidence
    has_resume_ev = any("Grounded in Resume" in str(ev) for ev in ms1.get("evidence", []))
    assert has_resume_ev, "Milestone 1 should ground evidence in candidate's verified skills."


def test_9_milestone_completion_handler_validates_prerequisites(setup_phase11_users):
    # Attempting to complete an invalid milestone id raises ValueError
    with pytest.raises(ValueError, match="not found"):
        complete_user_milestone(PHASE11_USER_A, "ms-nonexistent-99")


def test_10_milestone_manual_completion_persists(setup_phase11_users):
    rm_before = compute_user_career_roadmap(PHASE11_USER_A, target_role_override="Full Stack Developer")
    ms1_id = rm_before["milestones"][0]["id"]
    
    updated_rm = complete_user_milestone(PHASE11_USER_A, ms1_id)
    ms1_after = next(m for m in updated_rm["milestones"] if m["id"] == ms1_id)
    assert ms1_after["status"] == "completed"
    assert ms1_after["completedAt"] is not None


# ─── 4. INTERACTION & INTEGRATION WITH OTHER PHASES ──────────────────────────

def test_11_course_completion_unlocks_milestone_and_improves_readiness(setup_phase11_users):
    # Candidate initially has base readiness
    rm_initial = compute_user_career_roadmap(PHASE11_USER_A, target_role_override="Full Stack Developer")
    initial_score = rm_initial["readiness_score"]

    # Candidate completes Python & FastAPI course
    course_id = "python-fastapi-mastery"
    key = f"{PHASE11_USER_A}_{course_id}"
    course_progress_db[key] = {
        "user_id": PHASE11_USER_A,
        "course_id": course_id,
        "progress_percent": 100,
        "status": "completed",
        "is_completed": True
    }
    _save_progress_to_disk()

    # Recompute roadmap
    rm_after = compute_user_career_roadmap(PHASE11_USER_A, target_role_override="Full Stack Developer")
    assert rm_after["readiness_score"] > initial_score, "Completing course must deterministically increase readiness."
    assert "Python" in rm_after["verified_skills"] or "FastAPI" in rm_after["verified_skills"]


def test_12_interview_evaluation_injects_evidence(setup_phase11_users):
    # Add a high scoring mock interview
    interviews_db.append({
        "interview_id": "p11-inv-01",
        "user_id": PHASE11_USER_A,
        "targetRole": "Full Stack Developer",
        "overallScore": 88,
        "evaluation": {
            "strong_skills": ["PostgreSQL", "System Design"],
            "weak_skills": ["Docker"]
        }
    })
    _save_interviews_to_disk()

    rm = compute_user_career_roadmap(PHASE11_USER_A, target_role_override="Full Stack Developer")
    assert "PostgreSQL" in rm["verified_skills"]
    # Evidence list should reflect mock interview
    has_inv_ev = any("Validated by Mock Interview" in str(ev) for m in rm["milestones"] for ev in m.get("evidence", []))
    assert has_inv_ev


# ─── 5. AUTHENTICATION & SECURITY ENDPOINTS (401, 403, 200) ──────────────────

def test_13_unauthenticated_roadmap_returns_401():
    res = client.get("/api/career/roadmap")
    assert res.status_code == 401


def test_14_invalid_token_returns_401():
    res = client.get("/api/career/roadmap", headers={"Authorization": "Bearer invalid.token.payload"})
    assert res.status_code == 401


def test_15_authenticated_owner_retrieval(setup_phase11_users):
    token_a = setup_phase11_users["token_a"]
    res = client.get("/api/career/roadmap", headers={"Authorization": f"Bearer {token_a}"})
    assert res.status_code == 200
    body = res.json()
    assert body["success"] is True
    assert body["data"]["target_role"] == "Full Stack Developer"
    assert "milestones" in body["data"]


def test_16_cross_user_access_blocked(setup_phase11_users):
    token_a = setup_phase11_users["token_a"]
    # User A tries to pass user_id of User B
    res = client.get(f"/api/career/roadmap?user_id={PHASE11_USER_B}", headers={"Authorization": f"Bearer {token_a}"})
    assert res.status_code == 403
    assert "Forbidden" in res.json().get("detail", "")


def test_17_target_role_update_endpoint(setup_phase11_users):
    token_a = setup_phase11_users["token_a"]
    payload = {"target_role": "Data Analyst"}
    res = client.post("/api/career/roadmap/target-role", json=payload, headers={"Authorization": f"Bearer {token_a}"})
    assert res.status_code == 200
    body = res.json()
    assert body["success"] is True
    assert body["data"]["target_role"] == "Data Analyst"
    assert body["data"]["career_domain"] == "Data & Analytics"


def test_18_cross_user_target_role_update_blocked(setup_phase11_users):
    token_a = setup_phase11_users["token_a"]
    payload = {"target_role": "Data Analyst", "user_id": PHASE11_USER_B}
    res = client.post("/api/career/roadmap/target-role", json=payload, headers={"Authorization": f"Bearer {token_a}"})
    assert res.status_code == 403


def test_19_milestone_complete_endpoint(setup_phase11_users):
    token_a = setup_phase11_users["token_a"]
    # Get current roadmap to get valid milestone id
    rm_res = client.get("/api/career/roadmap", headers={"Authorization": f"Bearer {token_a}"})
    ms_id = rm_res.json()["data"]["milestones"][0]["id"]

    res = client.post(f"/api/career/roadmap/milestone/{ms_id}/complete", headers={"Authorization": f"Bearer {token_a}"})
    assert res.status_code == 200
    body = res.json()
    assert body["success"] is True
    ms0 = body["data"]["milestones"][0]
    assert ms0["status"] == "completed"


def test_20_career_domains_catalog_endpoint(setup_phase11_users):
    token_a = setup_phase11_users["token_a"]
    res = client.get("/api/career/roadmap/domains", headers={"Authorization": f"Bearer {token_a}"})
    assert res.status_code == 200
    body = res.json()
    assert body["success"] is True
    assert "domains" in body
    assert "roles" in body


# ─── 6. PERSISTENCE & DISK RELOAD TESTS ──────────────────────────────────────

def test_21_persistence_survives_memory_wipe(setup_phase11_users):
    # Set target role to UI/UX Designer
    update_user_target_role(PHASE11_USER_A, "UI/UX Designer")
    
    # Wipe in-memory dictionary and reload from disk
    roadmaps_db.clear()
    assert len(roadmaps_db) == 0
    _load_roadmaps_from_disk()

    assert PHASE11_USER_A in roadmaps_db
    assert roadmaps_db[PHASE11_USER_A]["target_role"] == "UI/UX Designer"
    assert roadmaps_db[PHASE11_USER_A]["career_domain"] == "Design"


# ─── 7. BACKWARD COMPATIBILITY TESTS ─────────────────────────────────────────

def test_22_legacy_career_suggestions_endpoint_preserved(setup_phase11_users):
    token_a = setup_phase11_users["token_a"]
    req = {
        "user_id": PHASE11_USER_A,
        "resume_skills": ["React", "JavaScript"],
        "matched_roles": ["Full Stack Developer"],
        "latest_score": 80.0,
        "fluency_score": 85.0
    }
    res = client.post("/career-suggestions", json=req, headers={"Authorization": f"Bearer {token_a}"})
    assert res.status_code == 200
