import pytest
import os
import sys
import json
from datetime import datetime, timedelta
import jwt
from fastapi.testclient import TestClient

# Ensure backend is in path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.services.recommendation_service import (
    generate_recommendations_for_user,
    get_user_recommendations,
    update_recommendation_status,
    recommendations_db,
    SKILL_TO_EXTERNAL_RESOURCE_MAP
)
from app.services.engagement_service import (
    record_course_progress,
    get_course_progress,
    course_progress_db
)
from app.services.performance_tracker import record_interview
from app.services.auth_service import JWT_SECRET, JWT_ALGORITHM
from main import app

client = TestClient(app)

def generate_test_token(email: str = "phase18_candidate@prepria.com", user_id: str = "user-p18"):
    payload = {
        "id": user_id,
        "email": email,
        "role": "candidate",
        "exp": datetime.utcnow() + timedelta(hours=1)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


class TestPhase18LearningAndRecommendations:
    """Tests 1-6: Grounded recommendations, native vs external learning, and completion boundaries."""

    def test_1_native_course_dwell_and_completion_flow(self):
        """Native PREPRIA course progress validates dwell time and server completion."""
        user_email = "native_learner@prepria.com"
        course_id = "devops-foundations"

        # Record valid reading lesson completion with 60s dwell
        res = record_course_progress(
            user_id=user_email,
            course_id=course_id,
            item_id="devops-mod1-les1",
            dwell_seconds=65,
            completed=True
        )

        assert res["success"] is True
        prog = get_course_progress(user_email, course_id)
        assert "devops-mod1-les1" in prog.get("completedItemIds", [])

    def test_2_recommendation_grounded_in_interview_weakness(self):
        """Interview technical weakness deterministically generates an evidence-grounded recommendation."""
        user_email = "weakness_candidate@prepria.com"

        # Persist an interview with a confirmed Docker weakness
        record_interview({
            "id": "sess-weakness-test",
            "user_id": user_email,
            "roleName": "DevOps Engineer",
            "score": 60,
            "evaluation": {
                "weaknesses": ["Docker containerization", "Kubernetes networking"],
                "dimensionScores": {"technical": 55, "communication": 80}
            }
        })

        recs = generate_recommendations_for_user(user_email)
        assert len(recs) > 0

        # Find docker recommendation
        docker_rec = next((r for r in recs if "docker" in r.get("relatedSkill", "").lower() or "docker" in r.get("title", "").lower()), None)
        assert docker_rec is not None
        assert "interview_history" in docker_rec["source"]
        assert len(docker_rec["sourceEvidence"]) >= 2
        assert docker_rec["userId"] == user_email
        assert docker_rec["recommendationId"].startswith("rec_")

    def test_3_recommendation_deduplication(self):
        """Repeated generation calls yield deterministic identical recommendation IDs."""
        user_email = "dedup_candidate@prepria.com"

        recs_run1 = generate_recommendations_for_user(user_email)
        recs_run2 = generate_recommendations_for_user(user_email)

        ids_run1 = [r["recommendationId"] for r in recs_run1]
        ids_run2 = [r["recommendationId"] for r in recs_run2]

        assert ids_run1 == ids_run2
        assert len(ids_run1) == len(set(ids_run1))  # Zero duplicate IDs within a single run

    def test_4_native_course_completion_syncs_recommendation(self):
        """Completing a native course syncs recommendation status to completed."""
        user_email = "completing_candidate@prepria.com"
        course_id = "react-mastery"

        # Set course as passed in DB
        course_progress_db[f"{user_email}_{course_id}"] = {
            "userId": user_email,
            "courseId": course_id,
            "isPassed": True,
            "eligibleForCertificate": True,
            "completedItemIds": ["react-mod1-les1", "react-mod1-les2", "react-mod1-quiz"]
        }

        # Candidate with React weakness
        record_interview({
            "id": "sess-react-weak",
            "user_id": user_email,
            "roleName": "Frontend Engineer",
            "score": 65,
            "evaluation": {"weaknesses": ["React architecture"]}
        })

        recs = generate_recommendations_for_user(user_email)
        react_rec = next((r for r in recs if r.get("relatedCourseId") == course_id), None)
        assert react_rec is not None
        assert react_rec["status"] == "completed"

    def test_5_external_course_recommendation_labeling(self):
        """External courses from Coursera, Infosys Springboard, edX, Udemy are labeled explicitly."""
        user_email = "external_learner@prepria.com"

        # Candidate with AWS gap
        record_interview({
            "id": "sess-aws-gap",
            "user_id": user_email,
            "roleName": "Cloud Engineer",
            "score": 70,
            "evaluation": {"weaknesses": ["AWS cloud architecture"]}
        })

        recs = generate_recommendations_for_user(user_email)
        ext_rec = next((r for r in recs if r.get("isExternal") is True), None)
        assert ext_rec is not None
        assert ext_rec["resourceType"] == "external"
        assert ext_rec["provider"] in ["Coursera", "Infosys Springboard", "edX", "Udemy"]
        assert ext_rec["url"].startswith("https://")
        assert ext_rec["verificationStatus"] == "unverified_external"

    def test_6_external_completion_boundary_defense(self):
        """Attempting to mark external recommendation completed sets external_self_reported status."""
        user_email = "self_report_user@prepria.com"

        record_interview({
            "id": "sess-ext-self",
            "user_id": user_email,
            "roleName": "Cloud Engineer",
            "score": 70,
            "evaluation": {"weaknesses": ["AWS cloud architecture"]}
        })

        recs = generate_recommendations_for_user(user_email)
        ext_rec = next(r for r in recs if r.get("isExternal") is True)
        rec_id = ext_rec["recommendationId"]

        # User attempts to update status to "completed"
        updated = update_recommendation_status(user_email, rec_id, "completed")
        assert updated["status"] == "external_self_reported"
        assert updated["verificationStatus"] == "self_reported"


class TestPhase18APIAndSecurity:
    """Tests 7-8: Cross-user recommendation and progress isolation."""

    def test_7_cross_user_recommendation_isolation(self):
        token_a = generate_test_token("user_rec_a@prepria.com", "user-ra")
        token_b = generate_test_token("user_rec_b@prepria.com", "user-rb")

        resp = client.get(
            "/recommendations?user_id=user_rec_b@prepria.com",
            headers={"Authorization": f"Bearer {token_a}"}
        )
        assert resp.status_code == 403

    def test_8_cross_user_course_progress_isolation(self):
        token_a = generate_test_token("user_prog_a@prepria.com", "user-pa")
        token_b = generate_test_token("user_prog_b@prepria.com", "user-pb")

        resp = client.get(
            "/analytics/course/certificate/user_prog_b@prepria.com/devops-foundations",
            headers={"Authorization": f"Bearer {token_a}"}
        )
        assert resp.status_code == 403
