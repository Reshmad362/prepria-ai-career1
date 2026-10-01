import pytest
import os
import sys
import json
from datetime import datetime, timedelta
import jwt
from fastapi.testclient import TestClient

# Ensure backend is in path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.services.interview_report_pdf_service import (
    generate_interview_pdf_report,
    SimplePDFCanvas,
    _sanitize_pdf_text,
    _wrap_text
)
from app.services.performance_tracker import record_interview
from app.services.auth_service import JWT_SECRET, JWT_ALGORITHM
from main import app

client = TestClient(app)

def generate_test_token(email: str = "phase15_user@prepria.com", user_id: str = "user-p15"):
    payload = {
        "id": user_id,
        "email": email,
        "role": "candidate",
        "exp": datetime.utcnow() + timedelta(hours=1)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


class TestPhase15PDFGenerationService:
    """Tests 1-8: PDF generation service, layout engine, text wrapping, Unicode safety."""

    def test_1_valid_pdf_signature_and_mime(self):
        sample_session = {
            "id": "sess-test-01",
            "roleName": "Full Stack Developer",
            "score": 85,
            "overallScore": 85,
            "duration": "15:30",
            "answeredCount": 2,
            "questionCount": 2,
            "dimensions": {
                "technicalKnowledge": 90,
                "problemSolving": 85,
                "communication": 80,
                "roleKnowledge": 85,
                "confidence": 85
            },
            "speech_metrics": {
                "total_filler_count": 2,
                "filler_breakdown": {"um": 2},
                "filler_rate": 1.5,
                "words_per_minute": 135.0,
                "speech_observations": ["Optimal speaking rate within conversational range."]
            },
            "questionEvaluations": [
                {
                    "questionIndex": 1,
                    "question": "Explain React state management.",
                    "topic": "React",
                    "score": 90,
                    "status": "answered",
                    "hasSTARStructure": True,
                    "answerText": "React state can be managed locally with useState or globally with Context and Redux Toolkit.",
                    "speech_analysis": {"filler_count": 1, "filler_breakdown": {"um": 1}, "wpm": 130.0}
                }
            ],
            "strengths": ["Clear conceptual articulation in React architecture"],
            "improvements": [{"topic": "Scalability", "description": "Discuss global store memoization patterns."}]
        }

        pdf_bytes = generate_interview_pdf_report(sample_session, user_identity="test@prepria.com")
        assert isinstance(pdf_bytes, bytes)
        assert len(pdf_bytes) > 500
        # Standard PDF 1.4 header
        assert pdf_bytes.startswith(b"%PDF-1.4")
        # Standard PDF trailer / EOF marker
        assert b"%%EOF" in pdf_bytes

    def test_2_zero_filler_state_represented(self):
        session_clean_speech = {
            "id": "sess-clean-01",
            "roleName": "DevOps Engineer",
            "score": 92,
            "speech_metrics": {
                "total_filler_count": 0,
                "filler_breakdown": {},
                "filler_rate": 0.0,
                "words_per_minute": 140.0,
                "speech_observations": ["Excellent speech clarity with zero filler words detected."]
            }
        }
        pdf_bytes = generate_interview_pdf_report(session_clean_speech)
        assert b"No filler words detected" in pdf_bytes or b"Verbal Clarity" in pdf_bytes

    def test_3_wpm_unavailable_state_handled_safely(self):
        session_no_wpm = {
            "id": "sess-no-wpm",
            "roleName": "Data Analyst",
            "score": 75,
            "speech_metrics": {
                "total_filler_count": 1,
                "filler_breakdown": {"like": 1},
                "filler_rate": None,
                "words_per_minute": None, # Missing duration
                "speech_observations": []
            }
        }
        pdf_bytes = generate_interview_pdf_report(session_no_wpm)
        assert b"Not available" in pdf_bytes

    def test_4_long_answers_do_not_crash_generator(self):
        long_answer = "In our distributed architecture, " + ("we implemented microservices with Kafka, Redis, PostgreSQL, and Kubernetes. " * 30)
        session_long = {
            "id": "sess-long-01",
            "roleName": "Solutions Architect",
            "score": 88,
            "questionEvaluations": [
                {
                    "questionIndex": 1,
                    "question": "Describe an enterprise microservices migration.",
                    "topic": "Architecture",
                    "score": 88,
                    "status": "answered",
                    "answerText": long_answer
                }
            ]
        }
        pdf_bytes = generate_interview_pdf_report(session_long)
        assert len(pdf_bytes) > 1000
        assert pdf_bytes.startswith(b"%PDF-1.4")

    def test_5_unicode_and_special_character_safety(self):
        session_special = {
            "id": "sess-special",
            "roleName": "Full Stack Developer (C++ & React)",
            "score": 80,
            "questionEvaluations": [
                {
                    "questionIndex": 1,
                    "question": "How do you handle \u201csmart pointers\u201d & lambda expressions in C++20?",
                    "topic": "C++",
                    "score": 80,
                    "status": "answered",
                    "answerText": "std::unique_ptr and std::shared_ptr manage memory automatically \u2014 reducing leaks."
                }
            ],
            "strengths": ["Mastery of pointers & memory management \u2713"]
        }
        pdf_bytes = generate_interview_pdf_report(session_special)
        assert pdf_bytes.startswith(b"%PDF-1.4")

    def test_6_proctoring_outcome_represented_when_present(self):
        session_violations = {
            "id": "sess-viol-01",
            "roleName": "Frontend Developer",
            "score": 60,
            "status": "terminated_for_violations",
            "violationsCount": 3
        }
        pdf_bytes = generate_interview_pdf_report(session_violations)
        assert b"Proctoring" in pdf_bytes
        assert b"terminated" in pdf_bytes.lower() or b"warning" in pdf_bytes.lower()


class TestPhase15PDFEndpointsAndSecurity:
    """Tests 9-16: Authenticated API endpoint, user isolation, 404/403 defense."""

    def test_7_unauthenticated_request_denied(self):
        resp = client.get("/api/interview/report/sess-any/pdf")
        assert resp.status_code in [401, 403]

    def test_8_user_a_can_download_own_report(self):
        user_email = "user_alpha_pdf@prepria.com"
        token = generate_test_token(user_email, "user-alpha-pdf")

        # Create authentic session in persistent store
        session_rec = record_interview({
            "id": "sess-alpha-99",
            "user_id": user_email,
            "roleName": "Backend Developer",
            "score": 88,
            "overallScore": 88,
            "duration": "12:00",
            "answeredCount": 1,
            "questionCount": 1,
            "dimensions": {
                "technicalKnowledge": 90,
                "problemSolving": 85,
                "communication": 85,
                "roleKnowledge": 90,
                "confidence": 85
            },
            "speech_metrics": {
                "total_filler_count": 1,
                "filler_breakdown": {"um": 1},
                "filler_rate": 1.2,
                "words_per_minute": 130.0,
                "speech_observations": ["Optimal pace"]
            },
            "questionEvaluations": [
                {
                    "questionIndex": 1,
                    "question": "Explain Redis caching.",
                    "topic": "System Design",
                    "score": 88,
                    "status": "answered",
                    "answerText": "Redis provides sub-millisecond in-memory caching for high-throughput reads."
                }
            ]
        })

        resp = client.get(
            f"/api/interview/report/sess-alpha-99/pdf",
            headers={"Authorization": f"Bearer {token}"}
        )

        assert resp.status_code == 200
        assert resp.headers["content-type"] == "application/pdf"
        assert "prepria-interview-report-sess-alpha-99.pdf" in resp.headers["content-disposition"]
        assert resp.content.startswith(b"%PDF-1.4")
        assert len(resp.content) > 500

    def test_9_user_a_cannot_download_user_b_report(self):
        user_a_email = "user_a_secure@prepria.com"
        user_b_email = "user_b_victim@prepria.com"

        token_a = generate_test_token(user_a_email, "user-a-sec")
        token_b = generate_test_token(user_b_email, "user-b-vic")

        # Save User B session
        record_interview({
            "id": "sess-victim-secret-100",
            "user_id": user_b_email,
            "roleName": "Chief Technology Officer",
            "score": 95,
            "overallScore": 95
        })

        # User A tries to request with explicit path user_id
        forbidden_resp = client.get(
            f"/api/interview/report/{user_b_email}/sess-victim-secret-100/pdf",
            headers={"Authorization": f"Bearer {token_a}"}
        )
        assert forbidden_resp.status_code == 403

        # User A tries to request directly by session_id
        not_found_resp = client.get(
            f"/api/interview/report/sess-victim-secret-100/pdf",
            headers={"Authorization": f"Bearer {token_a}"}
        )
        # Must return 404 because session does not belong to User A
        assert not_found_resp.status_code == 404

    def test_10_nonexistent_session_returns_404(self):
        token = generate_test_token("some_user@prepria.com", "user-some")
        resp = client.get(
            "/api/interview/report/sess-does-not-exist-9999/pdf",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert resp.status_code == 404
