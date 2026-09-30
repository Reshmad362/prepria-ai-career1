"""
Phase 10 Automated Test Suite — Complete 14-Stage End-to-End Candidate Lifecycle Validation

Validates the full sequential candidate lifecycle with real data flow and persistence:
  Stage 1: Candidate Registration (/auth/signup)
  Stage 2: Authentication & JWT Generation (/auth/login)
  Stage 3: Profile Bootstrap & Preferences (/auth/me, /auth/profile)
  Stage 4: Resume Upload (/upload-resume)
  Stage 5: Structured Resume Extraction & Profile Update
  Stage 6: Role Matching & Skill Gap Analysis (/match-role)
  Stage 7: Interview #1 Grounded Generation (/api/interview/generate-dynamic)
  Stage 8: Interview #1 Semantic Evaluation & Weakness Identification (/api/interview/session/submit)
  Stage 9: Recommendation Engine Integration (/recommendations)
  Stage 10: Learning Hub Course Progress & Dwell-Time Heartbeats (/analytics/course/progress)
  Stage 11: Interview #2 Adaptive Remediation & Weakness Targeting (/api/interview/generate-adaptive)
  Stage 12: Longitudinal Intelligence & Trajectory Derivation (/longitudinal/profile)
  Stage 13: Topic Detail & Conservative Mastery Progression (/longitudinal/topic/{topic})
  Stage 14: Unified Executive Dashboard & Growth Analytics (/analytics/dashboard/{user_id}, /analytics/growth/{user_id})
"""

import pytest
import os
import sys
import uuid
import jwt
import io
from datetime import datetime, timedelta, timezone
from fastapi.testclient import TestClient
import docx
from docx import Document

backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

os.environ["APP_ENV"] = "test"
os.environ["JWT_SECRET"] = "test-secret-key-for-phase10-e2e-2026"

from main import app
from app.services.auth_service import (
    users_db,
    _save_users_to_disk,
    JWT_SECRET,
    JWT_ALGORITHM
)
from app.services.performance_tracker import interviews_db, _save_interviews_to_disk
from app.services.engagement_service import course_progress_db, _save_progress_to_disk
from app.services.recommendation_service import recommendations_db, _save_recommendations_to_disk

client = TestClient(app)

E2E_CANDIDATE_EMAIL = "e2e_candidate_2026@prepria.test"
E2E_PASSWORD = "StrongSecurePassword123!"


def build_e2e_docx_resume() -> bytes:
    """Builds a real valid DOCX resume in memory for the candidate."""
    doc = Document()
    doc.add_heading("E2E Test Candidate", level=1)
    doc.add_paragraph("Email: e2e_candidate_2026@prepria.test")
    doc.add_paragraph("Summary: Experienced Full Stack Engineer specializing in React, FastAPI, and PostgreSQL.")
    
    doc.add_heading("Technical Skills", level=2)
    doc.add_paragraph("Skills: React, JavaScript, FastAPI, Python, PostgreSQL, REST APIs, HTML, CSS", style='List Bullet')
    
    doc.add_heading("Projects", level=2)
    doc.add_paragraph("Project: AI Career Intelligence Platform - Built end-to-end intelligence platform with FastAPI and React.", style='List Bullet')
    
    doc.add_heading("Experience", level=2)
    doc.add_paragraph("Software Engineer at Tech Innovations - 2 years experience building web applications.", style='List Bullet')
    
    doc.add_heading("Education", level=2)
    doc.add_paragraph("B.Tech in Computer Science and Engineering", style='List Bullet')
    
    stream = io.BytesIO()
    doc.save(stream)
    return stream.getvalue()


@pytest.fixture(autouse=True)
def cleanup_e2e_data():
    """Ensure clean starting and ending state."""
    users_db[:] = [u for u in users_db if u.get("email") != E2E_CANDIDATE_EMAIL]
    interviews_db[:] = [i for i in interviews_db if str(i.get("user_id")).lower() != E2E_CANDIDATE_EMAIL]
    recommendations_db.pop(E2E_CANDIDATE_EMAIL, None)
    prefix = f"{E2E_CANDIDATE_EMAIL}_"
    for k in list(course_progress_db.keys()):
        if k.startswith(prefix):
            course_progress_db.pop(k, None)
    _save_users_to_disk()
    _save_interviews_to_disk()
    _save_progress_to_disk()
    _save_recommendations_to_disk()

    yield

    users_db[:] = [u for u in users_db if u.get("email") != E2E_CANDIDATE_EMAIL]
    interviews_db[:] = [i for i in interviews_db if str(i.get("user_id")).lower() != E2E_CANDIDATE_EMAIL]
    recommendations_db.pop(E2E_CANDIDATE_EMAIL, None)
    for k in list(course_progress_db.keys()):
        if k.startswith(prefix):
            course_progress_db.pop(k, None)
    _save_users_to_disk()
    _save_interviews_to_disk()
    _save_progress_to_disk()
    _save_recommendations_to_disk()


def test_complete_14_stage_e2e_candidate_lifecycle():
    """
    Executes all 14 sequential candidate lifecycle stages with 100% authentic data flow.
    """
    # ──────────────────────────────────────────────────────────────────────────
    # STAGE 1: Candidate Registration
    # ──────────────────────────────────────────────────────────────────────────
    signup_res = client.post("/auth/signup", json={
        "name": "E2E Candidate",
        "email": E2E_CANDIDATE_EMAIL,
        "password": E2E_PASSWORD
    })
    assert signup_res.status_code == 200, f"Stage 1 failed: {signup_res.text}"
    signup_data = signup_res.json()
    assert signup_data["success"] is True

    # ──────────────────────────────────────────────────────────────────────────
    # STAGE 2: Candidate Login & JWT Generation
    # ──────────────────────────────────────────────────────────────────────────
    login_res = client.post("/auth/login", json={
        "email": E2E_CANDIDATE_EMAIL,
        "password": E2E_PASSWORD
    })
    assert login_res.status_code == 200, f"Stage 2 failed: {login_res.text}"
    login_data = login_res.json()
    assert login_data["success"] is True
    access_token = login_data["access_token"]
    assert access_token is not None
    auth_headers = {"Authorization": f"Bearer {access_token}"}

    # ──────────────────────────────────────────────────────────────────────────
    # STAGE 3: Profile Bootstrap & Setting Target Role
    # ──────────────────────────────────────────────────────────────────────────
    me_res = client.get("/auth/me", headers=auth_headers)
    assert me_res.status_code == 200, f"Stage 3 get failed: {me_res.text}"
    
    update_prof_res = client.put("/auth/profile", json={
        "targetRole": "Full Stack Developer",
        "bio": "Passionate full-stack developer"
    }, headers=auth_headers)
    assert update_prof_res.status_code == 200, f"Stage 3 update failed: {update_prof_res.text}"

    # ──────────────────────────────────────────────────────────────────────────
    # STAGE 4: Resume Upload (DOCX)
    # ──────────────────────────────────────────────────────────────────────────
    docx_bytes = build_e2e_docx_resume()
    files = {
        'file': ('e2e_resume.docx', docx_bytes, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')
    }
    upload_res = client.post("/upload-resume", files=files, headers=auth_headers)
    assert upload_res.status_code == 200, f"Stage 4 failed: {upload_res.text}"
    upload_data = upload_res.json()
    assert upload_data["success"] is True

    # ──────────────────────────────────────────────────────────────────────────
    # STAGE 5: Resume Extraction & Parsed Profile Verification
    # ──────────────────────────────────────────────────────────────────────────
    extracted_data = upload_data["data"]
    assert "React" in extracted_data["skills"] or "react" in [s.lower() for s in extracted_data["skills"]]
    assert "FastAPI" in extracted_data["skills"] or "fastapi" in [s.lower() for s in extracted_data["skills"]]
    assert extracted_data["score"] > 40

    # Verify profile was updated in backend store
    verified_me = client.get("/auth/me", headers=auth_headers).json()["user"]
    assert verified_me["profile"]["resumeUploaded"] is True

    # ──────────────────────────────────────────────────────────────────────────
    # STAGE 6: Role Matching & Skill Gap Analysis
    # ──────────────────────────────────────────────────────────────────────────
    match_res = client.post("/match-role", json={"skills": extracted_data["skills"]})
    assert match_res.status_code == 200, f"Stage 6 failed: {match_res.text}"
    matched_roles = match_res.json()
    assert len(matched_roles) >= 1
    assert any(r["role"] == "Full Stack Developer" for r in matched_roles)

    # ──────────────────────────────────────────────────────────────────────────
    # STAGE 7: Interview #1 Grounded Dynamic Question Generation
    # ──────────────────────────────────────────────────────────────────────────
    int1_gen_res = client.post("/api/interview/generate-dynamic", json={
        "role": "Full Stack Developer",
        "count": 4
    }, headers=auth_headers)
    assert int1_gen_res.status_code == 200, f"Stage 7 failed: {int1_gen_res.text}"
    int1_questions = int1_gen_res.json()["questions"]
    assert len(int1_questions) == 4
    for q in int1_questions:
        assert "source" in q
        assert "topic" in q

    # ──────────────────────────────────────────────────────────────────────────
    # STAGE 8: Interview #1 Evaluation & Weakness Identification
    # ──────────────────────────────────────────────────────────────────────────
    # Candidate performs well on React/FastAPI but poorly on SQL Optimization
    int1_submit_res = client.post("/api/interview/session/submit", json={
        "roleName": "Full Stack Developer",
        "difficulty": "medium",
        "questions": [
            {"question": "How do you use React hooks for state management?", "topic": "React Architecture"},
            {"question": "How do you troubleshoot and optimize slow SQL queries with indexes?", "topic": "SQL Optimization"}
        ],
        "answers": [
            {
                "questionId": "q1",
                "transcript": "I use useState and useReducer for local state and useContext for shared state. For memoization, I use useMemo and useCallback to avoid unnecessary re-renders.",
                "answerDurationSeconds": 25,
                "status": "answered",
                "isAnswered": True
            },
            {
                "questionId": "q2",
                "transcript": "I am not very experienced with SQL query optimization, maybe just add more RAM to the database server.",
                "answerDurationSeconds": 8,
                "status": "answered",
                "isAnswered": True
            }
        ],
        "duration": "04:30"
    }, headers=auth_headers)

    assert int1_submit_res.status_code == 200, f"Stage 8 failed: {int1_submit_res.text}"
    int1_eval = int1_submit_res.json()["evaluation"]
    assert int1_eval["isValid"] is True
    assert int1_eval["overallScore"] > 0
    # SQL Optimization score must be lower than React
    q_evals = int1_eval["questionEvaluations"]
    react_qe = next(qe for qe in q_evals if qe["topic"] == "React Architecture")
    sql_qe = next(qe for qe in q_evals if qe["topic"] == "SQL Optimization")
    assert react_qe["score"] >= 65
    assert sql_qe["score"] < 60

    # ──────────────────────────────────────────────────────────────────────────
    # STAGE 9: Recommendation Engine Derivation
    # ──────────────────────────────────────────────────────────────────────────
    recs_res = client.get("/recommendations", headers=auth_headers)
    assert recs_res.status_code == 200, f"Stage 9 failed: {recs_res.text}"
    recs_data = recs_res.json()["recommendations"]
    assert len(recs_data) >= 1
    # Check that recommendations include recommendations for learning or SQL weakness
    assert any("SQL" in r["title"] or "sql-database-optimization" == r.get("relatedCourseId") or r["type"] == "learning" for r in recs_data)

    # ──────────────────────────────────────────────────────────────────────────
    # STAGE 10: Learning Hub Progress & Dwell-Time Heartbeats
    # ──────────────────────────────────────────────────────────────────────────
    # User completes lesson in sql-database-optimization course
    course_id = "sql-database-optimization"
    lesson_id = "sql-mod1-les1"
    
    # Send heartbeats totaling 65 seconds
    for i in range(13):
        hb_res = client.post("/analytics/course/progress", json={
            "user_id": E2E_CANDIDATE_EMAIL,
            "course_id": course_id,
            "progress_data": {
                "heartbeat": {
                    "heartbeatId": f"e2e_hb_{i}",
                    "sessionId": "e2e_sess",
                    "itemId": lesson_id,
                    "deltaSeconds": 5
                },
                "totalRequiredItems": 10
            }
        }, headers=auth_headers)
        assert hb_res.status_code == 200

    # Complete lesson
    comp_res = client.post("/analytics/course/progress", json={
        "user_id": E2E_CANDIDATE_EMAIL,
        "course_id": course_id,
        "progress_data": {
            "completedItemIds": [lesson_id],
            "lessonTimeSpent": {lesson_id: 65},
            "completionPercentage": 10,
            "totalRequiredItems": 10
        }
    }, headers=auth_headers)
    assert comp_res.status_code == 200
    assert lesson_id in comp_res.json()["data"]["completedItemIds"]

    # ──────────────────────────────────────────────────────────────────────────
    # STAGE 11: Interview #2 Adaptive Remediation Targeting Interview #1 Weakness
    # ──────────────────────────────────────────────────────────────────────────
    int2_gen_res = client.post("/api/interview/generate-adaptive", json={
        "role": "Full Stack Developer",
        "difficulty": "medium",
        "question_count": 3
    }, headers=auth_headers)
    assert int2_gen_res.status_code == 200, f"Stage 11 failed: {int2_gen_res.text}"
    int2_gen_data = int2_gen_res.json()
    assert int2_gen_data["isAdaptive"] is True
    assert "SQL Optimization" in int2_gen_data["weakTopicsTargeted"]
    assert any(q.get("isTargetedRemediation") for q in int2_gen_data["questions"])

    # Candidate submits Interview #2 with resolved SQL answers (strong performance)
    int2_submit_res = client.post("/api/interview/session/submit", json={
        "roleName": "Full Stack Developer",
        "difficulty": "medium",
        "questions": [
            {"question": "Explain B-tree database indexing and query execution plans.", "topic": "SQL Optimization"}
        ],
        "answers": [
            {
                "questionId": "q1",
                "transcript": "B-Tree indexes provide logarithmic search complexity by storing keys in a balanced tree. When analyzing slow queries, we use EXPLAIN ANALYZE to inspect table scans, index scans, and join costs.",
                "answerDurationSeconds": 28,
                "status": "answered",
                "isAnswered": True
            }
        ],
        "duration": "03:00"
    }, headers=auth_headers)
    assert int2_submit_res.status_code == 200
    assert int2_submit_res.json()["evaluation"]["overallScore"] >= 70

    # ──────────────────────────────────────────────────────────────────────────
    # STAGE 12: Longitudinal Intelligence & Trajectory Derivation
    # ──────────────────────────────────────────────────────────────────────────
    long_res = client.get("/longitudinal/profile", headers=auth_headers)
    assert long_res.status_code == 200, f"Stage 12 failed: {long_res.text}"
    long_data = long_res.json()["data"]
    
    assert long_data["totalInterviews"] == 2
    assert long_data["trend"] in ["improving", "steady"]
    assert long_data["scoreDelta"] >= 0
    # SQL Optimization should now be detected in resolvedWeaknesses or topicProgress
    assert len(long_data["topicProgress"]) >= 1

    # ──────────────────────────────────────────────────────────────────────────
    # STAGE 13: Topic Detail & Conservative Mastery Progression
    # ──────────────────────────────────────────────────────────────────────────
    topic_res = client.get("/longitudinal/topic/SQL%20Optimization", headers=auth_headers)
    assert topic_res.status_code == 200, f"Stage 13 failed: {topic_res.text}"
    topic_data = topic_res.json()["data"]
    assert topic_data["topic"] == "SQL Optimization"
    assert topic_data["timesTested"] >= 1
    assert topic_data["masteryState"] in ["developing", "consistent", "strong", "untested"]

    # ──────────────────────────────────────────────────────────────────────────
    # STAGE 14: Unified Executive Dashboard & Growth Analytics
    # ──────────────────────────────────────────────────────────────────────────
    dash_res = client.get(f"/analytics/dashboard/{E2E_CANDIDATE_EMAIL}", headers=auth_headers)
    assert dash_res.status_code == 200, f"Stage 14 dashboard failed: {dash_res.text}"
    dash_data = dash_res.json()["data"]
    assert dash_data["interviewCount"] == 2
    assert dash_data["atsScore"] > 40
    assert dash_data["lessonsCompleted"] >= 1

    growth_res = client.get(f"/analytics/growth/{E2E_CANDIDATE_EMAIL}", headers=auth_headers)
    assert growth_res.status_code == 200, f"Stage 14 growth failed: {growth_res.text}"
    growth_data = growth_res.json()["data"]
    assert growth_data["hasHistory"] is True
    assert len(growth_data["sessions"]) == 2
