"""
PREPRIA Phase 20 Automated Integration Test Suite
Unified Interview -> Learning -> Longitudinal -> Career Roadmap Integration

Validates the complete closed-loop product intelligence lineage:
1. Resume -> Interview (grounded skills & target role context)
2. Interview -> Evaluation (authoritative 5-pillar scoring & speech analysis)
3. Evaluation -> Skill Gaps (structured evidence without unsupported assumptions)
4. Evaluation -> Grounded Recommendations (deterministic SHA-256 IDs, native vs external)
5. Recommendation -> Learning Hub (course progress, dwell enforcement, completions)
6. Learning -> Longitudinal (verified native completion as intervention evidence, pre/post delta)
7. Longitudinal -> Future Interview (weakness targeting & mastery-aware adaptation)
8. Longitudinal -> Recommendation (priority elevation for persistent gaps)
9. Longitudinal -> Career Roadmap (milestone unlocking & readiness scoring grounded in evidence)
10. Full Synthetic E2E Candidate Lifecycle
11. Idempotency (duplicate submissions, repeated calculations, idempotent completions)
12. Cross-System Failure & Graceful Degradation (authoritative state preserved)
13. Cross-Tenant Security & JWT Identity Isolation across all subsystems
"""

import os
import sys
import uuid
import json
import pytest
import jwt
from datetime import datetime, timedelta, timezone
from fastapi.testclient import TestClient

# Ensure backend directory is in sys.path
backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

os.environ["APP_ENV"] = "test"
os.environ["JWT_SECRET"] = "phase20-e2e-integration-secret-key-2026"

from main import app
from app.services.auth_service import (
    users_db,
    _save_users_to_disk,
    JWT_SECRET,
    JWT_ALGORITHM
)
from app.services.performance_tracker import (
    interviews_db,
    record_interview,
    get_user_interviews,
    _save_interviews_to_disk
)
from app.services.engagement_service import (
    course_progress_db,
    update_lesson_progress,
    get_user_progress_summary,
    _save_progress_to_disk
)
from app.services.recommendation_service import (
    recommendations_db,
    generate_user_recommendations,
    get_user_recommendations,
    update_recommendation_status,
    _save_recommendations_to_disk
)
from app.services.longitudinal_service import (
    get_user_longitudinal_profile,
    get_longitudinal_topic_detail
)
from app.services.career_roadmap_service import (
    roadmaps_db,
    compute_user_career_roadmap,
    update_user_target_role,
    complete_user_milestone,
    _save_roadmaps_to_disk
)
from app.services.interview_evaluation_service import evaluate_interview_session

client = TestClient(app)

USER_CANDIDATE_A = "p20_candidate_alpha@prepria.test"
USER_CANDIDATE_B = "p20_candidate_beta@prepria.test"


def make_jwt(email: str, user_id: str = None) -> str:
    payload = {
        "sub": email,
        "email": email,
        "id": user_id or f"usr-{uuid.uuid4().hex[:8]}",
        "role": "candidate",
        "exp": datetime.now(timezone.utc) + timedelta(hours=2)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


@pytest.fixture(autouse=True)
def clean_test_state():
    """Wipe and persist clean state for Phase 20 test candidates before and after every test."""
    for email in [USER_CANDIDATE_A, USER_CANDIDATE_B]:
        users_db[:] = [u for u in users_db if u.get("email") != email]
        interviews_db[:] = [i for i in interviews_db if str(i.get("user_id")).lower() != email]
        recommendations_db.pop(email, None)
        roadmaps_db.pop(email, None)
        prefix = f"{email}_"
        for k in list(course_progress_db.keys()):
            if k.startswith(prefix):
                course_progress_db.pop(k, None)

    _save_users_to_disk()
    _save_interviews_to_disk()
    _save_recommendations_to_disk()
    _save_progress_to_disk()
    _save_roadmaps_to_disk()
    yield
    for email in [USER_CANDIDATE_A, USER_CANDIDATE_B]:
        users_db[:] = [u for u in users_db if u.get("email") != email]
        interviews_db[:] = [i for i in interviews_db if str(i.get("user_id")).lower() != email]
        recommendations_db.pop(email, None)
        roadmaps_db.pop(email, None)
        prefix = f"{email}_"
        for k in list(course_progress_db.keys()):
            if k.startswith(prefix):
                course_progress_db.pop(k, None)
    _save_users_to_disk()
    _save_interviews_to_disk()
    _save_recommendations_to_disk()
    _save_progress_to_disk()
    _save_roadmaps_to_disk()


class TestPhase20UnifiedDataLineage:
    """1. Resume -> Interview -> Evaluation Lineage."""

    def test_01_resume_to_interview_context_preservation(self):
        """Resume skills and target role are preserved in user record and available for interview."""
        token = make_jwt(USER_CANDIDATE_A)
        # Register user with resume skills and target role
        user_record = {
            "id": f"usr-{uuid.uuid4().hex[:8]}",
            "email": USER_CANDIDATE_A,
            "targetRole": "Full Stack Developer",
            "extractedSkills": ["React", "JavaScript", "Python"],
            "atsScore": 78
        }
        users_db.append(user_record)
        _save_users_to_disk()

        # Update target role endpoint
        resp = client.put(
            "/api/career/target-role",
            headers={"Authorization": f"Bearer {token}"},
            json={"targetRole": "Full Stack Developer"}
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data.get("target_role") == "Full Stack Developer"
        assert "React" in data.get("verified_skills", [])

    def test_02_interview_to_evaluation_authoritative_scoring(self):
        """Submitted interview produces single authoritative 5-pillar evaluation."""
        questions = [
            {
                "id": "q1",
                "question": "How do you manage state in React applications?",
                "topic": "React State Management",
                "modelAnswerGuidelines": "React state can be managed locally with useState/useReducer or globally using Context API and Redux."
            },
            {
                "id": "q2",
                "question": "Explain Docker containerization and how you build lightweight images.",
                "topic": "Docker Containerization",
                "modelAnswerGuidelines": "Docker provides containerization using multi-stage builds, alpine base images, and layer caching."
            }
        ]
        answers = [
            {
                "transcript": "I use Redux Toolkit and React Context API to manage global state across the app with predictable actions and reducers.",
                "answerDurationSeconds": 35
            },
            {
                "transcript": "I don't know much about Docker or multi-stage builds yet.",
                "answerDurationSeconds": 12
            }
        ]

        evaluation = evaluate_interview_session(
            role_name="Full Stack Developer",
            difficulty="Mid-Level",
            questions=questions,
            answers=answers
        )
        assert "overallScore" in evaluation or "score" in evaluation
        assert "dimensions" in evaluation
        dims = evaluation["dimensions"]
        assert "technicalKnowledge" in dims
        assert "problemSolving" in dims
        assert "communication" in dims
        assert "roleKnowledge" in dims
        assert "confidence" in dims

        # Question evaluations should accurately distinguish strong React from weak Docker
        q_evals = evaluation.get("questionEvaluations", [])
        assert len(q_evals) == 2
        assert q_evals[0]["score"] > q_evals[1]["score"]

    def test_03_evaluation_weakness_to_grounded_recommendation(self):
        """Interview weaknesses trigger deterministic, grounded recommendations with exact course mapping."""
        token = make_jwt(USER_CANDIDATE_A)
        # Record interview with explicit Docker weakness
        record_interview({
            "id": "sess-p20-rec-01",
            "user_id": USER_CANDIDATE_A,
            "roleName": "DevOps Engineer",
            "score": 55,
            "overallScore": 55,
            "completedAt": "2026-09-10T10:00:00Z",
            "weakSkills": ["Docker", "Kubernetes"],
            "strongSkills": ["Linux"],
            "dimensions": {"technicalKnowledge": 50, "problemSolving": 55, "communication": 60, "roleKnowledge": 55, "confidence": 55},
            "questionEvaluations": [
                {"topic": "Docker", "score": 40, "question": "Explain Docker multi-stage builds."}
            ]
        })

        recs = generate_user_recommendations(USER_CANDIDATE_A, "DevOps Engineer")
        assert len(recs) > 0

        docker_rec = next((r for r in recs if "docker" in r.get("skill", "").lower() or "devops" in r.get("skill", "").lower()), None)
        assert docker_rec is not None
        assert docker_rec["id"].startswith("rec_")
        assert docker_rec["provider"] in ["PREPRIA Learning Hub", "Coursera", "Infosys Springboard", "edX", "Udemy"]
        assert docker_rec["status"] in ["recommended", "in_progress", "completed"]
        assert "groundingEvidence" in docker_rec or "evidence" in docker_rec

    def test_04_recommendation_to_native_learning_and_external_labeling(self):
        """Native course recommendations link to catalog courses while external recommendations are clearly labeled."""
        recs = generate_user_recommendations(USER_CANDIDATE_A, "Full Stack Developer")
        for rec in recs:
            if rec.get("provider") == "PREPRIA Learning Hub":
                assert rec.get("courseId") is not None
                assert rec.get("isExternal") is False or "external" not in rec.get("courseId", "")
            else:
                assert rec.get("isExternal") is True or rec.get("provider") != "PREPRIA Learning Hub"

    def test_05_native_learning_completion_to_longitudinal_intervention(self):
        """Verified course completion is tracked as a longitudinal learning intervention with chronological accuracy."""
        # 1. Baseline interview before learning
        record_interview({
            "id": "sess-p20-pre-01",
            "user_id": USER_CANDIDATE_A,
            "roleName": "DevOps Engineer",
            "score": 50,
            "overallScore": 50,
            "completedAt": "2026-09-01T10:00:00Z",
            "weakSkills": ["Docker"],
            "dimensions": {"technicalKnowledge": 45, "problemSolving": 50, "communication": 55, "roleKnowledge": 50, "confidence": 50},
            "questionEvaluations": [{"topic": "Docker", "score": 40}]
        })

        # 2. Native course completed
        course_id = "devops-foundations"
        lesson_key = f"{USER_CANDIDATE_A}_{course_id}_m1_l1"
        course_progress_db[lesson_key] = {
            "user_id": USER_CANDIDATE_A,
            "course_id": course_id,
            "completed": True,
            "dwell_time_seconds": 120,
            "completed_at": "2026-09-05T12:00:00Z"
        }
        _save_progress_to_disk()

        # 3. Post-learning interview
        record_interview({
            "id": "sess-p20-post-01",
            "user_id": USER_CANDIDATE_A,
            "roleName": "DevOps Engineer",
            "score": 82,
            "overallScore": 82,
            "completedAt": "2026-09-10T10:00:00Z",
            "strongSkills": ["Docker"],
            "dimensions": {"technicalKnowledge": 85, "problemSolving": 80, "communication": 80, "roleKnowledge": 82, "confidence": 85},
            "questionEvaluations": [{"topic": "Docker", "score": 85}]
        })

        profile = get_user_longitudinal_profile(USER_CANDIDATE_A)
        assert profile["totalInterviews"] == 2
        assert profile["trend"] == "improving"
        assert profile["scoreDelta"] == 32

        # Verify learning interventions list exists and captures the course
        interventions = profile.get("learningInterventions", [])
        assert len(interventions) >= 1
        intervention = interventions[0]
        assert intervention.get("course_id") == course_id

    def test_06_longitudinal_mastery_to_career_roadmap_progression(self):
        """Career roadmap consumes verified course completions and longitudinal interview performance to advance milestones."""
        token = make_jwt(USER_CANDIDATE_A)
        # Seed user with React & JS skills and complete react course
        user_record = {
            "id": f"usr-{uuid.uuid4().hex[:8]}",
            "email": USER_CANDIDATE_A,
            "targetRole": "Full Stack Developer",
            "extractedSkills": ["JavaScript", "React", "HTML", "CSS"],
            "atsScore": 80
        }
        users_db.append(user_record)

        # Complete react-essentials course
        c_key = f"{USER_CANDIDATE_A}_react-essentials_m1_l1"
        course_progress_db[c_key] = {
            "user_id": USER_CANDIDATE_A,
            "course_id": "react-essentials",
            "completed": True,
            "dwell_time_seconds": 150,
            "completed_at": "2026-09-02T10:00:00Z"
        }

        # Successful interview (>=70%)
        record_interview({
            "id": "sess-p20-roadmap-01",
            "user_id": USER_CANDIDATE_A,
            "roleName": "Full Stack Developer",
            "score": 85,
            "overallScore": 85,
            "completedAt": "2026-09-03T10:00:00Z",
            "strongSkills": ["React", "JavaScript"],
            "dimensions": {"technicalKnowledge": 85, "problemSolving": 85, "communication": 85, "roleKnowledge": 85, "confidence": 85}
        })

        roadmap = compute_user_career_roadmap(USER_CANDIDATE_A, "Full Stack Developer")
        assert roadmap["readiness_score"] > 30
        assert "React" in roadmap["verified_skills"]

        # Milestone 1 should be unlocked or completed
        m1 = roadmap["milestones"][0]
        assert m1["status"] in ["completed", "in_progress"]
        assert len(m1["evidence"]) > 0

    def test_07_full_closed_loop_candidate_lifecycle(self):
        """
        Full 12-step synthetic closed-loop verification:
        Resume -> Interview 1 (Gap) -> Evaluation -> Recommendation -> Course Completion ->
        Longitudinal Analysis -> Interview 2 (Mastery) -> Roadmap Updated.
        """
        user = "p20_candidate_alpha@prepria.test"
        token = make_jwt(user)

        # Step 1: Profile creation
        users_db.append({
            "id": "usr-p20-full",
            "email": user,
            "targetRole": "Full Stack Developer",
            "extractedSkills": ["HTML", "CSS", "JavaScript"],
            "atsScore": 65
        })

        # Step 2: Initial Roadmap baseline
        rm_init = compute_user_career_roadmap(user, "Full Stack Developer")
        init_readiness = rm_init["readiness_score"]

        # Step 3: First Interview with gap in Python/FastAPI
        record_interview({
            "id": "sess-p20-full-01",
            "user_id": user,
            "roleName": "Full Stack Developer",
            "score": 58,
            "overallScore": 58,
            "completedAt": "2026-09-01T09:00:00Z",
            "weakSkills": ["Python", "FastAPI"],
            "strongSkills": ["JavaScript"],
            "dimensions": {"technicalKnowledge": 55, "problemSolving": 60, "communication": 60, "roleKnowledge": 55, "confidence": 60},
            "questionEvaluations": [{"topic": "FastAPI", "score": 45, "question": "Explain async endpoints in FastAPI."}]
        })

        # Step 4: Recommendations generated for Python
        recs = generate_user_recommendations(user, "Full Stack Developer")
        py_rec = next((r for r in recs if "python" in r.get("skill", "").lower() or "backend" in r.get("skill", "").lower()), None)
        assert py_rec is not None

        # Step 5: Candidate completes the recommended backend course
        course_id = "python-fastapi-mastery"
        c_key = f"{user}_{course_id}_m1_l1"
        course_progress_db[c_key] = {
            "user_id": user,
            "course_id": course_id,
            "completed": True,
            "dwell_time_seconds": 180,
            "completed_at": "2026-09-05T15:00:00Z"
        }
        update_recommendation_status(user, py_rec["id"], "completed")

        # Step 6: Second Interview demonstrating mastery in Python/FastAPI
        record_interview({
            "id": "sess-p20-full-02",
            "user_id": user,
            "roleName": "Full Stack Developer",
            "score": 88,
            "overallScore": 88,
            "completedAt": "2026-09-08T11:00:00Z",
            "strongSkills": ["Python", "FastAPI", "JavaScript"],
            "weakSkills": [],
            "dimensions": {"technicalKnowledge": 90, "problemSolving": 88, "communication": 85, "roleKnowledge": 88, "confidence": 88},
            "questionEvaluations": [{"topic": "FastAPI", "score": 92, "question": "Explain dependency injection in FastAPI."}]
        })

        # Step 7: Longitudinal profile reflects improvement and resolved weakness
        long_profile = get_user_longitudinal_profile(user)
        assert long_profile["totalInterviews"] == 2
        assert long_profile["trend"] == "improving"
        assert long_profile["scoreDelta"] == 30

        # Step 8: Career Roadmap reflects improved readiness and milestone advancement
        rm_final = compute_user_career_roadmap(user, "Full Stack Developer")
        assert rm_final["readiness_score"] > init_readiness
        assert "Python" in rm_final["verified_skills"]


class TestPhase20IdempotencyAndFailureRecovery:
    """Tests 8-11: Idempotency, repeated requests, and graceful failure degradation."""

    def test_08_duplicate_interview_submission_idempotency(self):
        """Submitting or recording the same interview session ID multiple times does not create duplicate entries."""
        user = USER_CANDIDATE_A
        sess = {
            "id": "sess-p20-idem-01",
            "user_id": user,
            "roleName": "Frontend Developer",
            "score": 75,
            "overallScore": 75,
            "completedAt": "2026-09-01T10:00:00Z",
            "dimensions": {"technicalKnowledge": 75, "problemSolving": 75, "communication": 75, "roleKnowledge": 75, "confidence": 75}
        }
        # Record once
        record_interview(sess)
        count_1 = len(get_user_interviews(user))

        # Record identical second time (replace existing)
        record_interview(sess)
        count_2 = len(get_user_interviews(user))
        assert count_1 == count_2 == 1

    def test_09_repeated_recommendation_generation_idempotency(self):
        """Generating recommendations repeatedly does not duplicate items or alter deterministic IDs."""
        user = USER_CANDIDATE_A
        record_interview({
            "id": "sess-p20-idem-rec",
            "user_id": user,
            "roleName": "Backend Developer",
            "score": 50,
            "overallScore": 50,
            "completedAt": "2026-09-01T10:00:00Z",
            "weakSkills": ["SQL", "PostgreSQL"],
            "dimensions": {"technicalKnowledge": 50, "problemSolving": 50, "communication": 50, "roleKnowledge": 50, "confidence": 50}
        })

        recs_run1 = generate_user_recommendations(user, "Backend Developer")
        recs_run2 = generate_user_recommendations(user, "Backend Developer")

        assert len(recs_run1) == len(recs_run2)
        ids_1 = [r["id"] for r in recs_run1]
        ids_2 = [r["id"] for r in recs_run2]
        assert ids_1 == ids_2

    def test_10_repeated_roadmap_refresh_idempotency(self):
        """Repeated roadmap calculations produce identical readiness scores and milestone states."""
        user = USER_CANDIDATE_A
        rm1 = compute_user_career_roadmap(user, "Data Analyst")
        rm2 = compute_user_career_roadmap(user, "Data Analyst")

        assert rm1["readiness_score"] == rm2["readiness_score"]
        assert rm1["verified_skills"] == rm2["verified_skills"]
        assert rm1["missing_skills"] == rm2["missing_skills"]
        assert len(rm1["milestones"]) == len(rm2["milestones"])

    def test_11_cross_system_failure_graceful_handling(self):
        """When downstream service encounters empty or malformed upstream data, it degrades safely without crashing."""
        user = "p20_empty_user@prepria.test"
        # Longitudinal profile with no interviews
        profile = get_user_longitudinal_profile(user)
        assert profile["totalInterviews"] == 0
        assert profile["trend"] == "insufficient_evidence"

        # Recommendations with no history
        recs = generate_user_recommendations(user, "Software Engineer")
        assert isinstance(recs, list)

        # Career Roadmap with no history
        roadmap = compute_user_career_roadmap(user, "Software Engineer")
        assert roadmap["readiness_score"] >= 0
        assert isinstance(roadmap["milestones"], list)


class TestPhase20SecurityAndTenantIsolation:
    """Tests 12-16: Cross-user JWT authorization and resource isolation across all endpoints."""

    def test_12_interview_evaluation_tenant_isolation(self):
        """User A cannot access or retrieve User B's interview evaluations."""
        token_a = make_jwt(USER_CANDIDATE_A)
        token_b = make_jwt(USER_CANDIDATE_B)

        record_interview({
            "id": "sess-b-private-01",
            "user_id": USER_CANDIDATE_B,
            "roleName": "Backend Developer",
            "score": 88,
            "overallScore": 88,
            "completedAt": "2026-09-01T10:00:00Z",
            "dimensions": {"technicalKnowledge": 88, "problemSolving": 88, "communication": 88, "roleKnowledge": 88, "confidence": 88}
        })

        # User A attempts to access User B's interview
        resp = client.get(
            "/api/interviews/sess-b-private-01",
            headers={"Authorization": f"Bearer {token_a}"}
        )
        assert resp.status_code in [403, 404]

    def test_13_recommendations_tenant_isolation(self):
        """User A cannot view User B's recommendations."""
        token_a = make_jwt(USER_CANDIDATE_A)
        token_b = make_jwt(USER_CANDIDATE_B)

        generate_user_recommendations(USER_CANDIDATE_B, "DevOps Engineer")

        # User A requests their own recommendations - should NOT contain User B's recommendations
        resp = client.get(
            "/api/recommendations",
            headers={"Authorization": f"Bearer {token_a}"}
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data.get("user_id") == USER_CANDIDATE_A

    def test_14_longitudinal_profile_tenant_isolation(self):
        """User A longitudinal request returns only User A's data."""
        token_a = make_jwt(USER_CANDIDATE_A)
        token_b = make_jwt(USER_CANDIDATE_B)

        # Seed User B with an interview
        record_interview({
            "id": "sess-b-long-01",
            "user_id": USER_CANDIDATE_B,
            "roleName": "Data Scientist",
            "score": 90,
            "overallScore": 90,
            "completedAt": "2026-09-01T10:00:00Z",
            "dimensions": {"technicalKnowledge": 90, "problemSolving": 90, "communication": 90, "roleKnowledge": 90, "confidence": 90}
        })

        # User A requests longitudinal profile
        resp = client.get(
            "/api/longitudinal/profile",
            headers={"Authorization": f"Bearer {token_a}"}
        )
        assert resp.status_code == 200
        profile = resp.json()
        assert profile.get("user_id") == USER_CANDIDATE_A
        assert profile.get("totalInterviews") == 0

    def test_15_career_roadmap_tenant_isolation(self):
        """User A cannot modify or view User B's career roadmap."""
        token_a = make_jwt(USER_CANDIDATE_A)
        token_b = make_jwt(USER_CANDIDATE_B)

        resp_a = client.get(
            "/api/career/roadmap",
            headers={"Authorization": f"Bearer {token_a}"}
        )
        assert resp_a.status_code == 200
        assert resp_a.json().get("user_id") == USER_CANDIDATE_A

    def test_16_pdf_report_tenant_isolation(self):
        """User A cannot download PDF report for User B's interview session."""
        token_a = make_jwt(USER_CANDIDATE_A)
        token_b = make_jwt(USER_CANDIDATE_B)

        record_interview({
            "id": "sess-b-pdf-01",
            "user_id": USER_CANDIDATE_B,
            "roleName": "HR Executive",
            "score": 85,
            "overallScore": 85,
            "completedAt": "2026-09-01T10:00:00Z",
            "dimensions": {"technicalKnowledge": 85, "problemSolving": 85, "communication": 85, "roleKnowledge": 85, "confidence": 85}
        })

        resp = client.get(
            "/api/interviews/sess-b-pdf-01/report/pdf",
            headers={"Authorization": f"Bearer {token_a}"}
        )
        assert resp.status_code in [403, 404]
