import pytest
import sys
import os

# Ensure we can import app
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.services.speech_analysis_service import analyze_speech

class TestSpeechAnalysis:
    # ---------------- Functional Cases ----------------
    def test_no_fillers(self):
        res = analyze_speech("SQL is relational and fast.", duration_seconds=2)
        assert res["filler_count"] == 0
        assert res["fluency_score"] == 100

    def test_repeated_fillers(self):
        res = analyze_speech("umm umm SQL is relational like basically um NoSQL is flexible", duration_seconds=6)
        assert res["filler_count"] == 5
        # 10 words. Exp duration: 10/2.5 = 4s. Duration = 6s. Pause = 2.
        # pause count = 2//5 = 0.
        # 100 - (5*5) - (0) = 75
        assert res["fluency_score"] == 75

    def test_short_response(self):
        res = analyze_speech("Yes definitely.", duration_seconds=1)
        assert res["filler_count"] == 0
        assert res["pause_count"] == 0
        assert res["fluency_score"] == 100

    def test_long_response(self):
        text = "This is a longer response that provides much more depth and explanation over a sustained period of time without any hesitations."
        # 21 words. expected 21/2.5 = 8.4s
        res = analyze_speech(text, duration_seconds=8)
        assert res["pause_count"] == 0
        assert res["long_pauses"] == 0

    def test_duration_greater_than_expected_speech_time(self):
        # 5 words -> expected 2s. Duration 10s. Pause time = 8s
        # pause count = 8//5 = 1, long pause = 8//10 = 0.
        res = analyze_speech("umm SQL is really good", duration_seconds=10)
        assert res["pause_count"] == 1

    def test_realistic_pause_count(self):
        # "umm umm SQL is relational like basically um NoSQL is flexible" (10 words)
        # expected 4s. Duration 45s. pause time = 41s.
        # pause_count: 41//5 = 8
        # long_pauses: 41//10 = 4
        # score = 100 - (5*5) - (8*2) - (4*5) = 100 - 25 - 16 - 20 = 39.
        res = analyze_speech("umm umm SQL is relational like basically um NoSQL is flexible", duration_seconds=45)
        assert res["pause_count"] == 8
        assert res["long_pauses"] == 4
        assert res["fluency_score"] == 39

    # ---------------- Edge Cases ----------------
    def test_empty_transcript(self):
        res = analyze_speech("", duration_seconds=15)
        # duration 15s. pause = 15s. count=3, long=1
        assert res["filler_count"] == 0
        assert res["pause_count"] == 3
        assert res["long_pauses"] == 1
        assert res["fluency_score"] == 100 - (3*2) - (1*5)

    def test_duration_zero(self):
        res = analyze_speech("This is a response", duration_seconds=0)
        assert res["pause_count"] == 0
        assert res["long_pauses"] == 0
        assert res["fluency_score"] == 100

    def test_only_fillers(self):
        res = analyze_speech("um like basically actually", duration_seconds=2)
        assert res["filler_count"] == 4
        assert res["pause_count"] == 0
        assert res["fluency_score"] == 100 - (4*5)

    def test_one_word_answer(self):
        res = analyze_speech("Python", duration_seconds=5)
        # expected = 0.4s. pause = 4.6. count = 0
        assert res["pause_count"] == 0

    def test_hundred_word_answer(self):
        word = "test "
        text = word * 100
        # Expected: 40s
        res = analyze_speech(text, duration_seconds=40)
        assert res["pause_count"] == 0
        assert res["fluency_score"] == 100

    # ---------------- Negative Cases ----------------
    def test_negative_duration(self):
        res = analyze_speech("Hello test", duration_seconds=-10)
        assert res["pause_count"] == 0
        assert res["fluency_score"] == 100

    def test_null_answer(self):
        res = analyze_speech(None, duration_seconds=12)
        assert res["filler_count"] == 0
        assert res["pause_count"] == 2
        assert res["long_pauses"] == 1

    def test_corrupted_timestamps(self):
        res = analyze_speech("Hello", duration_seconds=9999)
        assert res["pause_count"] > 100
        assert res["fluency_score"] == 0
