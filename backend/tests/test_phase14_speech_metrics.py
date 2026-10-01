import pytest
import os
import sys
import json
from datetime import datetime, timedelta
import jwt
from fastapi.testclient import TestClient

# Ensure backend and ml-services are in path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
ml_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../ml-services/speech-analysis"))
if ml_path not in sys.path:
    sys.path.append(ml_path)

from filler_detector import detect_fillers
from app.services.speech_analysis_service import analyze_speech
from app.services.interview_evaluation_service import (
    evaluate_single_answer,
    evaluate_interview_session
)
from app.services.auth_service import JWT_SECRET, JWT_ALGORITHM
from main import app

client = TestClient(app)

def generate_test_token(email: str = "phase14_user@prepria.com", user_id: str = "user-p14"):
    payload = {
        "id": user_id,
        "email": email,
        "role": "candidate",
        "exp": datetime.utcnow() + timedelta(hours=1)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


class TestPhase14FillerDetectionAndNormalization:
    """Tests 1-7: Canonical filler detector, breakdown, case insensitivity, multi-word fillers."""

    def test_1_no_fillers(self):
        res = detect_fillers("PostgreSQL supports ACID compliance with multi-version concurrency control.")
        assert res["filler_count"] == 0
        assert res["fillers"] == []
        assert res["filler_breakdown"] == {}

    def test_2_one_filler(self):
        res = detect_fillers("The algorithm is um efficient.")
        assert res["filler_count"] == 1
        assert res["fillers"] == ["um"]
        assert res["filler_breakdown"] == {"um": 1}

    def test_3_multiple_filler_types(self):
        res = detect_fillers("Well um I like basically implemented the feature actually.")
        assert res["filler_count"] == 4
        assert set(res["fillers"]) == {"um", "like", "basically", "actually"}
        assert res["filler_breakdown"] == {"um": 1, "like": 1, "basically": 1, "actually": 1}

    def test_4_repeated_fillers_and_prolongation(self):
        res = detect_fillers("umm umm we used Redis and umm Kafka")
        assert res["filler_count"] == 3
        # Canonicalizes prolonged phonemes "umm" to "um"
        assert res["fillers"] == ["um", "um", "um"]
        assert res["filler_breakdown"] == {"um": 3}

    def test_5_multi_word_fillers(self):
        res = detect_fillers("You know, it was kind of complex and sort of challenging.")
        assert res["filler_count"] == 3
        assert "you know" in res["filler_breakdown"]
        assert "kind of" in res["filler_breakdown"]
        assert "sort of" in res["filler_breakdown"]
        assert res["filler_breakdown"]["you know"] == 1
        assert res["filler_breakdown"]["kind of"] == 1
        assert res["filler_breakdown"]["sort of"] == 1

    def test_6_case_normalization(self):
        res = detect_fillers("UMM... ACTUALLY, Like, You Know, sort of.")
        assert res["filler_count"] == 5
        assert "um" in res["filler_breakdown"]
        assert "actually" in res["filler_breakdown"]
        assert "like" in res["filler_breakdown"]
        assert "you know" in res["filler_breakdown"]
        assert "sort of" in res["filler_breakdown"]

    def test_7_punctuation_handling(self):
        res = detect_fillers("It was, like, really fast! And, um... basically done.")
        assert res["filler_count"] == 3
        assert res["filler_breakdown"]["like"] == 1
        assert res["filler_breakdown"]["um"] == 1
        assert res["filler_breakdown"]["basically"] == 1


class TestPhase14SpeechAnalysisMetrics:
    """Tests 8-14: Speech metrics, WPM, denominator protection, zero-answer defense."""

    def test_8_empty_and_null_transcript(self):
        res_empty = analyze_speech("", duration_seconds=10)
        assert res_empty["filler_count"] == 0
        assert res_empty["filler_breakdown"] == {}
        assert res_empty["words"] == 0
        assert res_empty["wpm"] == 0

        res_none = analyze_speech(None, duration_seconds=10)
        assert res_none["filler_count"] == 0
        assert res_none["filler_breakdown"] == {}

    def test_9_wpm_calculation_valid(self):
        # 30 words in 15 seconds -> 30 / (15/60) = 120 WPM
        text = "React is a JavaScript library for building user interfaces based on components which manage their own state and render efficiently using a virtual DOM representation."
        words = len(text.split())
        res = analyze_speech(text, duration_seconds=15)
        expected_wpm = round(words / (15 / 60.0), 1)
        assert res["wpm"] == expected_wpm
        assert res["words"] == words

    def test_10_wpm_zero_duration_defense(self):
        res = analyze_speech("Some valid spoken text", duration_seconds=0)
        assert res["wpm"] == 0
        assert res["duration_seconds"] == 0


class TestPhase14SessionAggregationAndEvaluation:
    """Tests 15-18: Multi-answer session aggregation, 5-pillar preservation, zero defense."""

    def test_11_multi_answer_aggregation(self):
        questions = [
            {"question": "Explain indexing.", "topic": "Databases"},
            {"question": "Explain caching.", "topic": "System Design"}
        ]
        answers = [
            {
                "questionId": "q1",
                "transcript": "Um, indexing like creates a B-tree to speed up queries.",
                "answerDurationSeconds": 10,
                "status": "answered",
                "isAnswered": True
            },
            {
                "questionId": "q2",
                "transcript": "Um, caching with Redis basically stores hot data in memory, you know.",
                "answerDurationSeconds": 12,
                "status": "answered",
                "isAnswered": True
            }
        ]

        eval_res = evaluate_interview_session(
            role_name="Backend Developer",
            difficulty="Intermediate",
            questions=questions,
            answers=answers
        )

        assert eval_res["isValid"] is True
        assert "speech_metrics" in eval_res
        sm = eval_res["speech_metrics"]

        # Q1: "um" (1), "like" (1)
        # Q2: "um" (1), "basically" (1), "you know" (1)
        # Total: 5 fillers (um: 2, like: 1, basically: 1, you know: 1)
        assert sm["total_filler_count"] == 5
        assert sm["filler_breakdown"]["um"] == 2
        assert sm["filler_breakdown"]["like"] == 1
        assert sm["filler_breakdown"]["basically"] == 1
        assert sm["filler_breakdown"]["you know"] == 1

        # Denominator check
        assert sm["total_words"] > 0
        assert sm["filler_rate"] is not None
        assert sm["words_per_minute"] is not None
        assert sm["speaking_duration_seconds"] == 22
        assert len(sm["speech_observations"]) > 0
        assert "um" in sm["speech_observations"][0]

    def test_12_zero_fillers_session(self):
        questions = [{"question": "Explain ACID.", "topic": "Databases"}]
        answers = [{
            "questionId": "q1",
            "transcript": "ACID guarantees Atomicity Consistency Isolation and Durability for database transactions.",
            "answerDurationSeconds": 10,
            "status": "answered",
            "isAnswered": True
        }]

        eval_res = evaluate_interview_session(
            role_name="Backend Developer",
            difficulty="Intermediate",
            questions=questions,
            answers=answers
        )

        assert eval_res["isValid"] is True
        sm = eval_res["speech_metrics"]
        assert sm["total_filler_count"] == 0
        assert sm["filler_breakdown"] == {}
        assert any("zero filler words" in obs.lower() for obs in sm["speech_observations"])

    def test_13_zero_answer_defense_preserves_null_metrics(self):
        questions = [{"question": "Explain Docker.", "topic": "DevOps"}]
        answers = [{"questionId": "q1", "transcript": "[Skipped]", "status": "skipped"}]

        eval_res = evaluate_interview_session(
            role_name="DevOps Engineer",
            difficulty="Intermediate",
            questions=questions,
            answers=answers
        )

        assert eval_res["isValid"] is False
        sm = eval_res["speech_metrics"]
        assert sm["total_filler_count"] == 0
        assert sm["filler_rate"] is None
        assert sm["words_per_minute"] is None

    def test_14_5_pillar_dimensions_remain_intact(self):
        questions = [{"question": "Explain REST.", "topic": "Web"}]
        answers = [{
            "questionId": "q1",
            "transcript": "REST is representational state transfer utilizing standard HTTP verbs like GET, POST, PUT, DELETE for stateless resource management.",
            "answerDurationSeconds": 15,
            "status": "answered",
            "isAnswered": True
        }]

        eval_res = evaluate_interview_session(
            role_name="Full Stack Developer",
            difficulty="Intermediate",
            questions=questions,
            answers=answers
        )

        assert "technicalKnowledge" in eval_res["dimensions"]
        assert "problemSolving" in eval_res["dimensions"]
        assert "communication" in eval_res["dimensions"]
        assert "roleKnowledge" in eval_res["dimensions"]
        assert "confidence" in eval_res["dimensions"]
        assert isinstance(eval_res["overallScore"], int)


class TestPhase14ApiAndSecurity:
    """Tests 19-20: API schema compatibility, user isolation."""

    def test_15_api_session_submit_returns_speech_metrics(self):
        token = generate_test_token("phase14_user@prepria.com", "user-p14")
        payload = {
            "roleName": "Backend Developer",
            "difficulty": "Intermediate",
            "questions": [{"question": "What is Redis?", "topic": "Databases"}],
            "answers": [{
                "questionId": "q1",
                "transcript": "Redis is um an in-memory key-value data store used for caching.",
                "answerDurationSeconds": 10,
                "status": "answered",
                "isAnswered": True
            }],
            "duration": "01:00"
        }

        resp = client.post(
            "/api/interview/session/submit",
            json=payload,
            headers={"Authorization": f"Bearer {token}"}
        )

        assert resp.status_code == 200
        data = resp.json()
        assert data["success"] is True
        assert "speech_metrics" in data["evaluation"]
        sm = data["evaluation"]["speech_metrics"]
        assert sm["total_filler_count"] == 1
        assert sm["filler_breakdown"] == {"um": 1}

    def test_16_user_isolation_preserves_jwt_authority(self):
        token_a = generate_test_token("user_alpha@prepria.com", "user-alpha")
        token_b = generate_test_token("user_beta@prepria.com", "user-beta")

        # User Alpha submits session
        payload = {
            "roleName": "Data Analyst",
            "questions": [{"question": "Explain SQL joins.", "topic": "SQL"}],
            "answers": [{
                "questionId": "q1",
                "transcript": "Inner join returns matching rows from both tables.",
                "answerDurationSeconds": 8,
                "status": "answered",
                "isAnswered": True
            }]
        }
        resp = client.post(
            "/api/interview/session/submit",
            json=payload,
            headers={"Authorization": f"Bearer {token_a}"}
        )
        assert resp.status_code == 200

        # User Beta tries to read User Alpha's history
        forbidden_resp = client.get(
            "/api/interview/history/user_alpha@prepria.com",
            headers={"Authorization": f"Bearer {token_b}"}
        )
        assert forbidden_resp.status_code == 403
