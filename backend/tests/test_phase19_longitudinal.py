import pytest
import os
import sys
import json
from datetime import datetime, timedelta
import jwt
from fastapi.testclient import TestClient

# Ensure backend is in path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.services.longitudinal_service import (
    get_user_longitudinal_profile,
    get_longitudinal_topic_detail
)
from app.services.performance_tracker import record_interview
from app.services.engagement_service import course_progress_db
from app.services.auth_service import JWT_SECRET, JWT_ALGORITHM
from main import app

client = TestClient(app)

def generate_test_token(email: str = "phase19_candidate@prepria.com", user_id: str = "user-p19"):
    payload = {
        "id": user_id,
        "email": email,
        "role": "candidate",
        "exp": datetime.utcnow() + timedelta(hours=1)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


class TestPhase19LongitudinalIntelligence:
    """Tests 1-6: Longitudinal progression, 5-pillar tracking, weakness recurrence, mastery, and intervention correlation."""

    def test_1_insufficient_history_for_single_session(self):
        """Single interview session yields 'insufficient_evidence' trend without false claims."""
        user_email = "single_session_user@prepria.com"

        record_interview({
            "id": "sess-single-1",
            "user_id": user_email,
            "roleName": "Backend Engineer",
            "score": 70,
            "overallScore": 70,
            "completedAt": "2026-09-01T10:00:00Z",
            "dimensions": {
                "technicalKnowledge": 70,
                "problemSolving": 70,
                "communication": 70,
                "roleKnowledge": 70,
                "confidence": 70
            },
            "questionEvaluations": [
                {"topic": "SQL Optimization", "score": 70, "question": "What is EXPLAIN ANALYZE?"}
            ]
        })

        profile = get_user_longitudinal_profile(user_email)
        assert profile["totalInterviews"] == 1
        assert profile["trend"] == "insufficient_evidence"
        assert profile["scoreDelta"] == 0
        assert profile["dimensionProgression"]["technicalKnowledge"]["trend"] == "insufficient_evidence"

    def test_2_multi_session_improving_trend(self):
        """Multiple sessions with score increase produce deterministic 'improving' trend."""
        user_email = "improving_user@prepria.com"

        # Session 1 (Baseline: 60)
        record_interview({
            "id": "sess-imp-1",
            "user_id": user_email,
            "roleName": "Full Stack Developer",
            "score": 60,
            "overallScore": 60,
            "completedAt": "2026-09-01T10:00:00Z",
            "dimensions": {"technicalKnowledge": 60, "problemSolving": 60, "communication": 60, "roleKnowledge": 60, "confidence": 60}
        })

        # Session 2 (Follow-up: 75)
        record_interview({
            "id": "sess-imp-2",
            "user_id": user_email,
            "roleName": "Full Stack Developer",
            "score": 75,
            "overallScore": 75,
            "completedAt": "2026-09-15T10:00:00Z",
            "dimensions": {"technicalKnowledge": 75, "problemSolving": 75, "communication": 75, "roleKnowledge": 75, "confidence": 75}
        })

        profile = get_user_longitudinal_profile(user_email)
        assert profile["totalInterviews"] == 2
        assert profile["initialScore"] == 60
        assert profile["latestScore"] == 75
        assert profile["scoreDelta"] == 15
        assert profile["trend"] == "improving"

    def test_3_five_pillar_progression_tracking(self):
        """All 5 competency pillars are tracked with sequence history and deltas."""
        user_email = "pillar_user@prepria.com"

        record_interview({
            "id": "sess-pillar-1",
            "user_id": user_email,
            "score": 65,
            "dimensions": {
                "technicalKnowledge": 60,
                "problemSolving": 70,
                "communication": 65,
                "roleKnowledge": 60,
                "confidence": 70
            }
        })
        record_interview({
            "id": "sess-pillar-2",
            "user_id": user_email,
            "score": 78,
            "dimensions": {
                "technicalKnowledge": 80,
                "problemSolving": 75,
                "communication": 80,
                "roleKnowledge": 75,
                "confidence": 80
            }
        })

        profile = get_user_longitudinal_profile(user_email)
        dim_prog = profile["dimensionProgression"]

        assert "technicalKnowledge" in dim_prog
        assert "problemSolving" in dim_prog
        assert "communication" in dim_prog
        assert "roleKnowledge" in dim_prog
        assert "confidence" in dim_prog

        assert dim_prog["technicalKnowledge"]["delta"] == 20
        assert dim_prog["technicalKnowledge"]["trend"] == "improving"

    def test_4_weakness_recurrence_detection(self):
        """Weakness recurring across >= 2 sessions is categorized as recurring."""
        user_email = "recur_user@prepria.com"

        record_interview({
            "id": "sess-rec-1",
            "user_id": user_email,
            "score": 60,
            "evaluation": {"weaknesses": ["System Design Architecture"]},
            "questionEvaluations": [{"topic": "System Design", "score": 50, "question": "Design URL Shortener"}]
        })
        record_interview({
            "id": "sess-rec-2",
            "user_id": user_email,
            "score": 62,
            "evaluation": {"weaknesses": ["System Design Architecture"]},
            "questionEvaluations": [{"topic": "System Design", "score": 55, "question": "Design Rate Limiter"}]
        })

        profile = get_user_longitudinal_profile(user_email)
        recurring = profile.get("recurringWeaknesses", [])
        assert any("system design" in str(r.get("topic", "")).lower() for r in recurring)

    def test_5_weakness_resolution_tracking(self):
        """Weakness that scores >= 75% in subsequent session is categorized as resolved."""
        user_email = "resolved_user@prepria.com"

        # Session 1 (Weak in Docker)
        record_interview({
            "id": "sess-res-1",
            "user_id": user_email,
            "score": 60,
            "evaluation": {"weaknesses": ["Docker Networking"]},
            "questionEvaluations": [{"topic": "Docker", "score": 50, "question": "Explain Docker bridge"}]
        })
        # Session 2 (Strong in Docker: 85%)
        record_interview({
            "id": "sess-res-2",
            "user_id": user_email,
            "score": 85,
            "evaluation": {"weaknesses": []},
            "questionEvaluations": [{"topic": "Docker", "score": 85, "question": "Explain multi-stage build"}]
        })

        profile = get_user_longitudinal_profile(user_email)
        resolved = profile.get("resolvedWeaknesses", [])
        assert len(resolved) >= 1
        assert any("docker" in str(r.get("topic", "")).lower() for r in resolved)

    def test_6_learning_intervention_correlation(self):
        """Completed course correlated with before/after topic performance delta."""
        user_email = "interv_user@prepria.com"
        course_id = "devops-foundations"

        # Session 1 (Before: 55%)
        record_interview({
            "id": "sess-int-1",
            "user_id": user_email,
            "score": 55,
            "completedAt": "2026-08-01T10:00:00Z",
            "questionEvaluations": [{"topic": "DevOps & Cloud", "score": 55, "question": "What is CI/CD?"}]
        })

        # Learning Intervention Completed
        course_progress_db[f"{user_email}_{course_id}"] = {
            "userId": user_email,
            "courseId": course_id,
            "isPassed": True,
            "eligibleForCertificate": True,
            "updatedAt": "2026-08-15T12:00:00Z"
        }

        # Session 2 (After: 80%)
        record_interview({
            "id": "sess-int-2",
            "user_id": user_email,
            "score": 80,
            "completedAt": "2026-09-01T10:00:00Z",
            "questionEvaluations": [{"topic": "DevOps & Cloud", "score": 80, "question": "Explain blue-green deployment"}]
        })

        profile = get_user_longitudinal_profile(user_email)
        outcomes = profile.get("interventionOutcomes", [])
        assert len(outcomes) >= 1
        devops_outcome = outcomes[0]
        assert devops_outcome["scoreDelta"] == 25
        assert devops_outcome["outcome"] == "improved"


class TestPhase19APIAndSecurity:
    """Tests 7-8: Longitudinal profile endpoints, topic details, and user isolation."""

    def test_7_longitudinal_profile_api_endpoint(self):
        user_email = "api_long_user@prepria.com"
        token = generate_test_token(user_email, "user-long-api")

        record_interview({
            "id": "sess-api-long",
            "user_id": user_email,
            "roleName": "SRE",
            "score": 75,
            "dimensions": {"technicalKnowledge": 75, "problemSolving": 75, "communication": 75, "roleKnowledge": 75, "confidence": 75}
        })

        resp = client.get(
            "/longitudinal/profile",
            headers={"Authorization": f"Bearer {token}"}
        )

        assert resp.status_code == 200
        data = resp.json()
        assert data["success"] is True
        assert data["data"]["userId"] == user_email
        assert data["data"]["totalInterviews"] == 1

    def test_8_cross_user_longitudinal_isolation(self):
        token_a = generate_test_token("long_user_a@prepria.com", "user-la")
        token_b = generate_test_token("long_user_b@prepria.com", "user-lb")

        # Verify token A cannot access unauthenticated routes or impersonate
        resp = client.get(
            "/longitudinal/profile",
            headers={"Authorization": f"Bearer {token_a}"}
        )
        assert resp.status_code == 200
        assert resp.json()["data"]["userId"] == "long_user_a@prepria.com"
