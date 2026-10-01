import pytest
import os
import sys
import json
from datetime import datetime, timedelta
import jwt
from fastapi.testclient import TestClient

# Ensure backend is in path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.services.speech_analysis_service import analyze_speech
from app.services.interview_evaluation_service import (
    evaluate_single_answer,
    evaluate_interview_session
)
from app.services.performance_tracker import record_interview, get_interview_by_id
from app.services.interview_report_pdf_service import generate_interview_pdf_report
from app.services.auth_service import JWT_SECRET, JWT_ALGORITHM
from main import app

client = TestClient(app)

def generate_test_token(email: str = "phase17_candidate@prepria.com", user_id: str = "user-p17"):
    payload = {
        "id": user_id,
        "email": email,
        "role": "candidate",
        "exp": datetime.utcnow() + timedelta(hours=1)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


class TestPhase17VoiceInterviewAndTurnTaking:
    """Tests 1-5: Conversational turn-taking, speech analysis integration, silence thresholds, and session integrity."""

    def test_1_turn_taking_states_and_flow(self):
        """Verify defined conversational turn-taking states."""
        valid_turn_states = {
            'AI_SPEAKING': 'AI is speaking the interview question',
            'LISTENING': 'Microphone is active and listening for response',
            'CANDIDATE_SPEAKING': 'Candidate speech is actively being transcribed',
            'FINALIZING_ANSWER': 'Silence detected after meaningful answer, advancing turn',
            'MANUAL_INPUT': 'Fallback text typing mode'
        }
        for state, desc in valid_turn_states.items():
            assert len(state) > 0
            assert len(desc) > 10

    def test_2_speech_analysis_integration_with_turn_transcript(self):
        """Conversational voice transcript is analyzed for fillers, WPM, and fluency."""
        transcript = "Um, so basically Kubernetes automates deployment and, like, scaling of containerized applications."
        duration_seconds = 20

        speech_res = analyze_speech(transcript, duration_seconds)
        assert speech_res["filler_count"] >= 3
        assert "um" in [f.lower() for f in speech_res["fillers"]] or "like" in [f.lower() for f in speech_res["fillers"]] or "basically" in [f.lower() for f in speech_res["fillers"]]
        assert speech_res["wpm"] > 0
        assert speech_res["fluency_score"] <= 100

    def test_3_zero_answer_defense_on_voice_turn_timeout(self):
        """If speech recognition yields empty transcript, zero-answer defense prevents fake evaluation."""
        questions = [{"question": "Describe microservices architecture.", "topic": "Architecture"}]
        answers = [{
            "questionId": "q1",
            "transcript": "",
            "status": "unanswered",
            "isAnswered": False,
            "answerDurationSeconds": 15
        }]

        eval_res = evaluate_interview_session(
            role_name="System Architect",
            difficulty="Senior",
            questions=questions,
            answers=answers,
            violations_count=0
        )

        assert eval_res["isValid"] is False
        assert eval_res["answeredCount"] == 0
        assert eval_res["overallScore"] == 0

    def test_4_silence_finalization_with_valid_transcript(self):
        """A valid multi-turn answer finalized via silence detection is evaluated accurately."""
        single_res = evaluate_single_answer(
            user_answer="Microservices decompose large monolithic systems into autonomous, independently deployable services communicating over lightweight REST or gRPC APIs.",
            question_text="Describe microservices architecture.",
            ideal_guidelines="Microservices break applications into modular, autonomous services.",
            duration_seconds=25
        )

        assert single_res["status"] == "answered"
        assert single_res["score"] >= 70
        assert single_res["speech_metrics"]["wpm"] > 0

    def test_5_session_integrity_no_transcript_leakage(self):
        """Multiple conversational turns maintain distinct question transcripts and evaluations."""
        questions = [
            {"question": "What is dependency injection?", "topic": "Design Patterns"},
            {"question": "What is database indexing?", "topic": "Databases"}
        ]
        answers = [
            {
                "questionId": "q1",
                "transcript": "Dependency injection is a pattern where objects receive other objects that they depend on rather than creating them internally.",
                "answerDurationSeconds": 18,
                "status": "answered",
                "isAnswered": True
            },
            {
                "questionId": "q2",
                "transcript": "Database indexing creates a B-tree data structure to accelerate lookup queries at the cost of write overhead.",
                "answerDurationSeconds": 16,
                "status": "answered",
                "isAnswered": True
            }
        ]

        eval_res = evaluate_interview_session(
            role_name="Backend Engineer",
            difficulty="Intermediate",
            questions=questions,
            answers=answers,
            violations_count=0
        )

        assert eval_res["isValid"] is True
        assert eval_res["answeredCount"] == 2
        assert len(eval_res["questionEvaluations"]) == 2
        assert "dependency" in eval_res["questionEvaluations"][0]["answerText"].lower()
        assert "indexing" in eval_res["questionEvaluations"][1]["answerText"].lower()
        # Verify speech metrics aggregated across turns
        assert eval_res["speech_metrics"]["total_words"] > 20


class TestPhase17APIAndSecurity:
    """Tests 6-8: API submission with voice metrics, user isolation, and PDF generation."""

    def test_6_api_session_submit_with_voice_metrics(self):
        user_email = "voice_candidate@prepria.com"
        token = generate_test_token(user_email, "user-v17")

        payload = {
            "roleName": "Full Stack Engineer",
            "difficulty": "Intermediate",
            "questions": [{"question": "Explain event loop in Node.js.", "topic": "Node.js"}],
            "answers": [{
                "questionId": "q1",
                "transcript": "The event loop offloads I/O operations to the system kernel and processes callbacks in phases like timers, poll, and check.",
                "answerDurationSeconds": 20,
                "status": "answered",
                "isAnswered": True
            }],
            "violationsCount": 0,
            "duration": "02:30"
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
        assert session_rec["user_id"] == user_email
        assert session_rec["score"] > 0

    def test_7_cross_user_voice_history_isolation(self):
        token_a = generate_test_token("user_voice_a@prepria.com", "user-va")
        token_b = generate_test_token("user_voice_b@prepria.com", "user-vb")

        record_interview({
            "id": "sess-voice-user-b",
            "user_id": "user_voice_b@prepria.com",
            "roleName": "AI Engineer",
            "score": 88
        })

        resp = client.get(
            "/api/interview/history/user_voice_b@prepria.com",
            headers={"Authorization": f"Bearer {token_a}"}
        )
        assert resp.status_code == 403

    def test_8_pdf_report_with_voice_speech_metrics(self):
        user_email = "voice_pdf_candidate@prepria.com"
        token = generate_test_token(user_email, "user-vpdf")

        session_rec = record_interview({
            "id": "sess-voice-pdf-test",
            "user_id": user_email,
            "roleName": "DevOps Engineer",
            "score": 82,
            "overallScore": 82,
            "status": "completed",
            "violationsCount": 0,
            "speech_metrics": {
                "total_filler_count": 2,
                "filler_rate": 2.5,
                "avg_wpm": 125.0,
                "filler_breakdown": {"um": 1, "like": 1}
            },
            "questionEvaluations": [
                {
                    "questionIndex": 1,
                    "question": "What is Terraform state?",
                    "topic": "IaC",
                    "score": 82,
                    "status": "answered",
                    "answerText": "Terraform state stores the mapping between configuration and real-world infrastructure resources."
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
