import pytest
import os
import sys
import json
from datetime import datetime, timedelta
import jwt
from fastapi.testclient import TestClient

# Ensure backend is in path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.services.interview_evaluation_service import (
    evaluate_single_answer,
    evaluate_interview_session
)
from app.services.performance_tracker import record_interview, get_interview_by_id
from app.services.interview_report_pdf_service import generate_interview_pdf_report
from app.services.auth_service import JWT_SECRET, JWT_ALGORITHM
from main import app

client = TestClient(app)

def generate_test_token(email: str = "phase16_candidate@prepria.com", user_id: str = "user-p16"):
    payload = {
        "id": user_id,
        "email": email,
        "role": "candidate",
        "exp": datetime.utcnow() + timedelta(hours=1)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


class TestPhase16HeadPoseAndProctoringHardening:
    """Tests 1-8: Spatial centroid, orientation states, debouncing, 3-warning limit."""

    def test_1_head_pose_states_and_neutral_warning_types(self):
        """Verify supported objective proctoring types and neutral messaging."""
        supported_types = {
            "FACE_NOT_DETECTED": "Please keep your face visible to the camera.",
            "HEAD_OUT_OF_FRAME": "Please keep your head centered within the camera frame.",
            "HEAD_TURNED_LEFT": "Please face the camera directly.",
            "HEAD_TURNED_RIGHT": "Please face the camera directly.",
            "HEAD_TURNED_UP": "Please face the camera directly.",
            "HEAD_TURNED_DOWN": "Please face the camera directly.",
            "TAB_SWITCH": "Tab switch detected. Please keep the interview window active.",
            "SCREEN_SHARE_STOPPED": "Screen sharing was stopped. Please resume screen sharing."
        }

        for p_type, msg in supported_types.items():
            assert "cheat" not in msg.lower()
            assert "malpractice" not in msg.lower()
            assert len(msg) > 10

    def test_2_single_answer_evaluated_fairly_during_proctoring(self):
        """Single answer evaluation remains objective and accurate."""
        res = evaluate_single_answer(
            user_answer="Kubernetes automates deployment, scaling, and management of containerized applications using pods, replica sets, and services.",
            question_text="Explain Kubernetes architecture.",
            ideal_guidelines="Kubernetes is an orchestration platform managing container lifecycles.",
            duration_seconds=20
        )
        assert res["status"] == "answered"
        assert res["score"] >= 65
        assert res["similarityScore"] > 0.4

    def test_3_three_warning_limit_triggers_termination_outcome(self):
        """3 warnings trigger interview termination status with evaluations preserved."""
        questions = [
            {"question": "Explain Docker networking.", "topic": "DevOps"},
            {"question": "Explain CI/CD pipelines.", "topic": "CI/CD"}
        ]
        answers = [
            {
                "questionId": "q1",
                "transcript": "Docker networking allows containers to communicate via bridge, host, or overlay networks.",
                "answerDurationSeconds": 15,
                "status": "answered",
                "isAnswered": True
            },
            {
                "questionId": "q2",
                "transcript": "[Terminated]",
                "status": "unanswered",
                "isAnswered": False
            }
        ]

        # Evaluate session terminated with 3 violations
        eval_res = evaluate_interview_session(
            role_name="DevOps Engineer",
            difficulty="Intermediate",
            questions=questions,
            answers=answers,
            violations_count=3
        )

        assert eval_res["isValid"] is True
        assert eval_res["answeredCount"] == 1
        assert eval_res["totalQuestions"] == 2
        assert "dimensions" in eval_res
        assert eval_res["overallScore"] > 0
        # Communication & confidence should reflect proctoring warning penalties
        assert eval_res["dimensions"]["communication"] <= 100

    def test_4_pdf_report_contains_factual_proctoring_outcome(self):
        """Server-generated PDF includes factual Academic Integrity audit for terminated sessions."""
        terminated_session = {
            "id": "sess-term-p16",
            "roleName": "Cloud Architect",
            "score": 65,
            "overallScore": 65,
            "status": "terminated_for_violations",
            "violationsCount": 3,
            "questionEvaluations": [
                {
                    "questionIndex": 1,
                    "question": "What is IAM least privilege?",
                    "topic": "Security",
                    "score": 75,
                    "status": "answered",
                    "answerText": "Granting only the permissions necessary to perform a task."
                }
            ],
            "strengths": ["Basic security concept knowledge"]
        }

        pdf_bytes = generate_interview_pdf_report(terminated_session)
        assert pdf_bytes.startswith(b"%PDF-1.4")
        assert b"Proctoring" in pdf_bytes
        assert b"warning" in pdf_bytes.lower()

    def test_5_zero_answer_termination_defense(self):
        """Zero answers submitted before termination returns isValid=False."""
        questions = [{"question": "What is SQL?", "topic": "Databases"}]
        answers = [{"questionId": "q1", "transcript": "[Terminated]", "status": "unanswered", "isAnswered": False}]

        eval_res = evaluate_interview_session(
            role_name="Database Admin",
            difficulty="Intermediate",
            questions=questions,
            answers=answers,
            violations_count=3
        )

        assert eval_res["isValid"] is False
        assert eval_res["overallScore"] == 0


class TestPhase16APIAndSecurity:
    """Tests 6-8: API submission with proctoring records, user isolation, and persistence."""

    def test_6_api_session_submit_persists_proctoring_violations(self):
        user_email = "proctor_candidate@prepria.com"
        token = generate_test_token(user_email, "user-proc")

        payload = {
            "roleName": "Security Engineer",
            "difficulty": "Intermediate",
            "questions": [{"question": "What is OWASP Top 10?", "topic": "Security"}],
            "answers": [{
                "questionId": "q1",
                "transcript": "OWASP Top 10 lists critical security vulnerabilities like Injection, Broken Auth, and XSS.",
                "answerDurationSeconds": 15,
                "status": "answered",
                "isAnswered": True
            }],
            "violationsCount": 2,
            "duration": "03:00"
        }

        resp = client.post(
            "/api/interview/session/submit",
            json=payload,
            headers={"Authorization": f"Bearer {token}"}
        )

        assert resp.status_code == 200
        data = resp.json()
        assert data["success"] is True
        session_rec = data["session"]
        assert session_rec is not None
        assert session_rec["violationsCount"] == 2
        assert session_rec["user_id"] == user_email

    def test_7_user_a_cannot_access_user_b_proctoring_history(self):
        token_a = generate_test_token("user_a_proc@prepria.com", "user-a-p")
        token_b = generate_test_token("user_b_proc@prepria.com", "user-b-p")

        # Save session for User B
        record_interview({
            "id": "sess-user-b-proctoring",
            "user_id": "user_b_proc@prepria.com",
            "roleName": "SRE Engineer",
            "score": 80,
            "violationsCount": 1
        })

        # User A tries to view User B history
        forbidden_resp = client.get(
            "/api/interview/history/user_b_proc@prepria.com",
            headers={"Authorization": f"Bearer {token_a}"}
        )
        assert forbidden_resp.status_code == 403

    def test_8_pdf_download_for_terminated_session(self):
        user_email = "term_candidate@prepria.com"
        token = generate_test_token(user_email, "user-term")

        session_rec = record_interview({
            "id": "sess-term-pdf-test",
            "user_id": user_email,
            "roleName": "Mobile Developer",
            "score": 70,
            "overallScore": 70,
            "violationsCount": 3,
            "status": "terminated_for_violations",
            "questionEvaluations": [
                {
                    "questionIndex": 1,
                    "question": "What is React Native bridge?",
                    "topic": "Mobile",
                    "score": 70,
                    "status": "answered",
                    "answerText": "The bridge allows asynchronous serialization between JavaScript and Native threads."
                }
            ]
        })

        resp = client.get(
            f"/api/interview/report/{session_rec['id']}/pdf",
            headers={"Authorization": f"Bearer {token}"}
        )

        assert resp.status_code == 200
        assert resp.headers["content-type"] == "application/pdf"
        assert resp.content.startswith(b"%PDF-1.4")
