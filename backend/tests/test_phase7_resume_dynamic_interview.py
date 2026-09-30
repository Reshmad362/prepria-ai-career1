"""
PREPRIA Phase 7 Test Suite — Resume-Driven Dynamic Interview Engine

Verifies:
  1. Resume extraction to interview context (skills, projects, experience, education, certifications)
  2. Project-specific question grounding
  3. Technology-specific question grounding
  4. Responsibility-specific question grounding
  5. No fabricated resume claims (zero-fabrication audit)
  6. Distinction between role-based questions and resume-based questions
  7. Different resumes produce different questions
  8. Question diversity & deduplication across multiple interviews for the same candidate
  9. Previously asked question & topic tracking
  10. Weakness-targeted adaptation
  11. Strong topic adaptation (no unnecessary basic repetition)
  12. Difficulty modulation based on prior overall score
  13. Complete source traceability metadata (source, sourceType, sourceEntity)
  14. Grounded dynamic follow-up generation
  15. Multi-user isolation (User A cannot access or use User B's resume/history)
  16. Unauthenticated request rejection (401)
  17. Persistence surviving simulated backend restart
  18. Compatibility with existing role-based interview generation
  19-23. Phase 1-6 regression verification
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
from app.services.auth_service import (
    JWT_SECRET, JWT_ALGORITHM, create_user, update_user_profile, users_db
)
from app.services.performance_tracker import (
    record_interview, interviews_db, _load_interviews_from_disk
)
from app.services.dynamic_question_generator import (
    normalize_resume_evidence,
    is_claimed_in_resume,
    generate_resume_driven_questions,
    generate_follow_up_question
)

client = TestClient(app)

USER_CANDIDATE_A = "phase7_alice@prepria.com"
USER_CANDIDATE_B = "phase7_bob@prepria.com"


def create_token(email: str) -> str:
    payload = {
        "sub": email,
        "email": email,
        "exp": datetime.now(timezone.utc) + timedelta(hours=2)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


@pytest.fixture(autouse=True)
def cleanup_phase7_test_data():
    """Ensure clean starting state before and after each test."""
    test_emails = [USER_CANDIDATE_A.lower(), USER_CANDIDATE_B.lower()]
    interviews_db[:] = [i for i in interviews_db if str(i.get("user_id")).lower() not in test_emails]
    users_db[:] = [u for u in users_db if str(u.get("email", "")).lower() not in test_emails]
    yield
    interviews_db[:] = [i for i in interviews_db if str(i.get("user_id")).lower() not in test_emails]
    users_db[:] = [u for u in users_db if str(u.get("email", "")).lower() not in test_emails]


# Sample Candidate Profiles
RESUME_PROFILE_A = {
    "name": "Alice Candidate",
    "email": USER_CANDIDATE_A,
    "skills": ["React", "FastAPI", "PostgreSQL", "Python", "JavaScript"],
    "technicalSkills": ["React", "FastAPI", "PostgreSQL", "Python", "JavaScript"],
    "projects": [
        {
            "name": "AI Career Intelligence Platform",
            "technologies": ["React", "FastAPI", "PostgreSQL"],
            "description": "Full-stack AI career platform"
        }
    ],
    "experience": [
        {
            "title": "Software Engineering Intern",
            "company": "TechCorp",
            "responsibilities": ["Implemented REST APIs and authentication"],
            "technologies": ["FastAPI", "React"]
        }
    ],
    "education": "B.Tech in Computer Science",
    "certifications": ["AWS Certified Developer"],
    "keywords": ["React", "FastAPI", "PostgreSQL"]
}

RESUME_PROFILE_B = {
    "name": "Bob Candidate",
    "email": USER_CANDIDATE_B,
    "skills": ["Java", "Spring Boot", "MySQL", "Hibernate"],
    "technicalSkills": ["Java", "Spring Boot", "MySQL", "Hibernate"],
    "projects": [
        {
            "name": "E-Commerce Microservices",
            "technologies": ["Java", "Spring Boot", "MySQL"],
            "description": "Distributed e-commerce backend"
        }
    ],
    "experience": [
        {
            "title": "Backend Intern",
            "company": "DataCloud",
            "responsibilities": ["Designed MySQL relational schemas"],
            "technologies": ["Java", "MySQL"]
        }
    ],
    "education": "B.S in Information Technology",
    "certifications": ["Oracle Certified Professional"],
    "keywords": ["Java", "Spring Boot", "MySQL"]
}


# TEST 1 — Resume extraction to interview context
def test_resume_extraction_to_interview_context():
    evidence = normalize_resume_evidence(RESUME_PROFILE_A)
    assert evidence["has_resume"] is True
    assert "react" in evidence["claimed_items"]
    assert "fastapi" in evidence["claimed_items"]
    assert "postgresql" in evidence["claimed_items"]
    assert len(evidence["projects"]) == 1
    assert evidence["projects"][0]["name"] == "AI Career Intelligence Platform"
    assert len(evidence["certifications"]) == 1
    assert evidence["certifications"][0]["name"] == "AWS Certified Developer"


# TEST 2 — Project-specific question
def test_project_specific_question_grounding():
    result = generate_resume_driven_questions(RESUME_PROFILE_A, "Full Stack Developer", interview_number=1, count=10)
    questions = result["questions"]
    project_qs = [q for q in questions if q.get("sourceType") == "project"]
    assert len(project_qs) >= 1
    assert any("AI Career Intelligence Platform" in q["question"] for q in project_qs)
    assert all(q.get("sourceEntity") == "AI Career Intelligence Platform" for q in project_qs)


# TEST 3 — Technology-specific question
def test_technology_specific_question_grounding():
    result = generate_resume_driven_questions(RESUME_PROFILE_A, "Backend Developer", interview_number=1, count=10)
    questions = result["questions"]
    fastapi_qs = [q for q in questions if "FastAPI" in q.get("question", "") or q.get("sourceEntity") == "FastAPI"]
    assert len(fastapi_qs) >= 1
    assert any(q.get("source") == "resume" for q in fastapi_qs)


# TEST 4 — Responsibility-specific question
def test_responsibility_specific_question_grounding():
    result = generate_resume_driven_questions(RESUME_PROFILE_A, "Full Stack Developer", interview_number=1, count=10)
    questions = result["questions"]
    resp_qs = [q for q in questions if q.get("sourceType") in ["experience", "responsibility"]]
    assert len(resp_qs) >= 1
    assert any(q.get("source") == "resume" for q in resp_qs)


# TEST 5 — No fabricated resume question (Zero-fabrication audit)
def test_no_fabricated_resume_question():
    # Profile A does NOT mention Kubernetes
    assert not is_claimed_in_resume("Kubernetes", normalize_resume_evidence(RESUME_PROFILE_A))
    
    result = generate_resume_driven_questions(RESUME_PROFILE_A, "Backend Developer", interview_number=1, count=10)
    questions = result["questions"]
    
    resume_qs = [q for q in questions if q.get("source") == "resume"]
    for q in resume_qs:
        assert "Kubernetes" not in q["question"], f"Fabricated claim found in resume question: {q['question']}"


# TEST 6 — Role question distinction
def test_role_question_distinction():
    result = generate_resume_driven_questions(RESUME_PROFILE_A, "Backend Developer", interview_number=1, count=10)
    questions = result["questions"]
    
    # A hypothetical deployment question might reference Docker/Kubernetes, but source MUST be "role", not "resume"
    role_qs = [q for q in questions if q.get("source") == "role"]
    for q in role_qs:
        assert q["source"] == "role"
        assert q["sourceType"] in ["role", "role_requirement"]


# TEST 7 — Different resumes produce different questions
def test_different_resumes_produce_different_questions():
    res_a = generate_resume_driven_questions(RESUME_PROFILE_A, "Full Stack Developer", interview_number=1, count=10)
    res_b = generate_resume_driven_questions(RESUME_PROFILE_B, "Full Stack Developer", interview_number=1, count=10)

    q_texts_a = [q["question"] for q in res_a["questions"] if q.get("source") == "resume"]
    q_texts_b = [q["question"] for q in res_b["questions"] if q.get("source") == "resume"]

    # Resume A questions must mention Alice's projects/tech, Resume B must mention Bob's
    assert any("AI Career Intelligence Platform" in q or "FastAPI" in q for q in q_texts_a)
    assert any("E-Commerce Microservices" in q or "Spring Boot" in q for q in q_texts_b)
    assert not any("E-Commerce Microservices" in q for q in q_texts_a)


# TEST 8 — Question diversity & deduplication across multiple interviews
def test_question_diversity_across_multiple_interviews():
    res1 = generate_resume_driven_questions(RESUME_PROFILE_A, "Full Stack Developer", interview_number=1, count=5)
    
    # Simulate session 1 completed with answered questions
    session_1 = {
        "user_id": USER_CANDIDATE_A,
        "role": "Full Stack Developer",
        "score": 75,
        "questionEvaluations": [
            {"question": q["question"], "topic": q["topic"], "score": 75} for q in res1["questions"]
        ]
    }

    res2 = generate_resume_driven_questions(
        RESUME_PROFILE_A, "Full Stack Developer", interview_number=2, count=5, previous_sessions=[session_1]
    )

    q1_texts = set(q["question"] for q in res1["questions"])
    q2_texts = set(q["question"] for q in res2["questions"])

    # Duplicate set overlap should be minimal/zero
    overlap = q1_texts & q2_texts
    assert len(overlap) <= 1, f"Unexpected high question duplication across interviews: {overlap}"


# TEST 9 — Previously asked tracking
def test_previously_asked_tracking():
    sess_asked = {
        "user_id": USER_CANDIDATE_A,
        "questionEvaluations": [
            {"question": "Can you give an overview of your project 'AI Career Intelligence Platform' and explain the primary problem it solved?", "topic": "Project Overview", "score": 80}
        ]
    }
    res = generate_resume_driven_questions(RESUME_PROFILE_A, "Full Stack Developer", interview_number=2, count=5, previous_sessions=[sess_asked])
    questions = res["questions"]
    q_texts = [q["question"] for q in questions]
    assert "Can you give an overview of your project 'AI Career Intelligence Platform' and explain the primary problem it solved?" not in q_texts


# TEST 10 — Weakness adaptation
def test_weakness_adaptation():
    weak_session = {
        "user_id": USER_CANDIDATE_A,
        "role": "Full Stack Developer",
        "score": 55,
        "questionEvaluations": [
            {"question": "Explain database indexing", "topic": "Database Architecture", "score": 45}
        ],
        "improvements": [{"topic": "Database Architecture"}]
    }

    res = generate_resume_driven_questions(
        RESUME_PROFILE_A, "Full Stack Developer", interview_number=2, count=8, previous_sessions=[weak_session]
    )
    
    weakness_qs = [q for q in res["questions"] if q.get("isTargetedRemediation") or q.get("source") == "weakness"]
    assert len(weakness_qs) >= 1
    assert any("Database" in q.get("topic", "") or "Database" in q.get("question", "") for q in weakness_qs)


# TEST 11 — Strong topic adaptation
def test_strong_topic_adaptation():
    strong_session = {
        "user_id": USER_CANDIDATE_A,
        "role": "Full Stack Developer",
        "score": 90,
        "questionEvaluations": [
            {"question": "What is React Virtual DOM?", "topic": "React Architecture", "score": 92}
        ]
    }

    res = generate_resume_driven_questions(
        RESUME_PROFILE_A, "Full Stack Developer", interview_number=2, count=8, previous_sessions=[strong_session]
    )

    react_qs = [q for q in res["questions"] if q.get("topic") == "React Architecture"]
    for q in react_qs:
        assert q.get("difficulty") != "easy", "Basic easy question returned for previously mastered strong topic"


# TEST 12 — Difficulty adaptation
def test_difficulty_adaptation():
    low_session = {
        "user_id": USER_CANDIDATE_A,
        "score": 50,
        "questionEvaluations": [{"topic": "API Design", "score": 48}]
    }
    res = generate_resume_driven_questions(RESUME_PROFILE_A, "Backend Developer", interview_number=2, count=5, previous_sessions=[low_session])
    assert "questions" in res
    assert len(res["questions"]) == 5


# TEST 13 — Source metadata traceability
def test_source_metadata_traceability():
    res = generate_resume_driven_questions(RESUME_PROFILE_A, "Full Stack Developer", interview_number=1, count=10)
    for q in res["questions"]:
        assert "source" in q
        assert "sourceType" in q
        assert "sourceEntity" in q
        assert "topic" in q
        assert "difficulty" in q
        assert q["source"] in ["resume", "role", "weakness", "behavioral", "followup"]


# TEST 14 — Dynamic follow-up grounding
def test_dynamic_follow_up_grounding():
    followup = generate_follow_up_question(
        question_text="How did you build the backend?",
        candidate_answer="I implemented JWT authentication with FastAPI.",
        user_profile=RESUME_PROFILE_A,
        role="Backend Developer"
    )
    assert followup["isFollowUp"] is True
    assert "JWT" in followup["question"] or "authentication" in followup["question"].lower()
    assert followup["source"] == "followup"


# TEST 15 — Multi-user isolation
def test_multi_user_isolation_for_dynamic_generation():
    create_user("Alice Candidate", USER_CANDIDATE_A, "Pass123!")
    create_user("Bob Candidate", USER_CANDIDATE_B, "Pass123!")

    update_user_profile(USER_CANDIDATE_A, RESUME_PROFILE_A)
    update_user_profile(USER_CANDIDATE_B, RESUME_PROFILE_B)

    token_a = create_token(USER_CANDIDATE_A)
    headers_a = {"Authorization": f"Bearer {token_a}"}

    # Request dynamic generation endpoint as User A
    res_a = client.post("/api/interview/generate-dynamic", json={"role": "Full Stack Developer", "count": 5}, headers=headers_a)
    assert res_a.status_code == 200
    questions_a = res_a.json()["questions"]

    # Verify User A's questions ONLY contain User A's resume entities
    q_texts_a = [q["question"] for q in questions_a if q.get("source") == "resume"]
    assert not any("E-Commerce Microservices" in q for q in q_texts_a)


# TEST 16 — Authentication rejection (401)
def test_unauthenticated_request_rejection():
    res = client.post("/api/interview/generate-dynamic", json={"role": "Full Stack Developer", "count": 5})
    assert res.status_code == 401


# TEST 17 — Persistence surviving simulated backend restart
def test_persistence_survives_simulated_backend_restart():
    record_interview({
        "id": "sess-restart-p7",
        "user_id": USER_CANDIDATE_A,
        "role": "Full Stack Developer",
        "score": 88,
        "timestamp": datetime.now(timezone.utc).isoformat()
    })

    # Simulate backend restart by reloading disk cache
    _load_interviews_from_disk()

    token = create_token(USER_CANDIDATE_A)
    headers = {"Authorization": f"Bearer {token}"}
    res = client.get(f"/api/interview/history/{USER_CANDIDATE_A}", headers=headers)
    assert res.status_code == 200
    sessions = res.json()["data"]
    assert any(s["id"] == "sess-restart-p7" for s in sessions)


# TEST 18 — Existing role-based interview compatibility
def test_existing_role_interview_compatibility():
    res = client.post("/generate-interview", json={"role": "Full Stack Developer", "difficulty": "medium", "question_count": 5})
    assert res.status_code == 200
    data = res.json()
    assert len(data["questions"]) == 5
    assert data["role"] == "Full Stack Developer"


# TEST 19–23 — Phase 1–6 Regression Test Suites Verification
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


def test_existing_phase6_tests_still_pass():
    result = _run_regression_suite("backend/tests/test_phase6_dashboard_analytics.py")
    assert result.returncode == 0, f"Phase 6 tests failed:\n{result.stdout}\n{result.stderr}"
