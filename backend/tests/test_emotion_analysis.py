import pytest
import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.services.emotion_analysis_service import analyze_emotion

class TestEmotionAnalysis:
    # ---------------- Functional Cases ----------------
    def test_happy_face(self):
        res = analyze_emotion("base64_image_data_mock_happy")
        assert res["emotion"] == "Happy"
        assert res["face_detected"] == True

    def test_neutral_face(self):
        res = analyze_emotion("base64_image_data_mock_neutral")
        assert res["emotion"] == "Neutral"
        assert res["face_detected"] == True
        
    def test_nervous_face(self):
        res = analyze_emotion("base64_image_data_mock_nervous")
        assert res["emotion"] == "Nervous"
        
    def test_confused_face(self):
        res = analyze_emotion("mock_confused_base64")
        assert res["emotion"] == "Confused"
        
    def test_stressed_face(self):
        res = analyze_emotion("mock_stressed_img")
        assert res["emotion"] == "Stressed"
        
    def test_confident_face(self):
        res = analyze_emotion("mock_img_confident")
        assert res["emotion"] == "Confident"

    # ---------------- Detection Cases ----------------
    def test_no_face(self):
        res = analyze_emotion("mock_noface_base64")
        assert res["emotion"] == "No Face"
        assert res["face_detected"] == False

    def test_multiple_faces(self):
        res = analyze_emotion("base64_mock_multiple_people")
        assert res["multiple_faces"] == True
        assert res["emotion"] == "Multiple Faces"

    def test_partial_face(self):
        # Treated as neutral/valid in heuristic unless specific logic fails it
        res = analyze_emotion("mock_partial_face_neutral")
        assert res["face_detected"] == True

    def test_side_face(self):
        res = analyze_emotion("mock_side_face_happy")
        assert res["face_detected"] == True
        
    def test_tilted_face(self):
        res = analyze_emotion("mock_tilted_face")
        assert type(res["emotion"]) == str

    def test_face_with_glasses(self):
        res = analyze_emotion("mock_happy_glasses")
        assert res["emotion"] == "Happy"

    def test_face_with_mask(self):
        res = analyze_emotion("mock_neutral_mask")
        assert res["emotion"] == "Neutral"

    # ---------------- Frame Quality Cases ----------------
    def test_poor_lighting(self):
        res = analyze_emotion("mock_dark_room_happy")
        assert res["lighting_quality"] == "Poor"

    def test_low_light(self):
        res = analyze_emotion("mock_dark_face")
        assert res["lighting_quality"] == "Poor"

    def test_overexposed_frame(self):
        res = analyze_emotion("mock_overexposed_sunlight_neutral")
        assert res["lighting_quality"] == "Poor"

    def test_blurry_frame(self):
        res = analyze_emotion("mock_blur_motion")
        assert res["frame_quality"] == "Poor"

    def test_motion_blur(self):
        res = analyze_emotion("mock_blur_image")
        assert res["frame_quality"] == "Poor"

    def test_pixelated_frame(self):
        res = analyze_emotion("mock_pixelated_feed")
        assert res["frame_quality"] == "Poor"

    def test_low_resolution_webcam(self):
        res = analyze_emotion("mock_pixelated_lowres")
        assert res["frame_quality"] == "Poor"

    # ---------------- Edge Cases ----------------
    def test_empty_image(self):
        res = analyze_emotion("")
        assert res["emotion"] == "No Face"
        assert res["face_detected"] == False

    def test_corrupted_image(self):
        res = analyze_emotion("null")
        assert res["face_detected"] == False

    def test_invalid_base64(self):
        res = analyze_emotion(None)
        assert res["face_detected"] == False

    def test_black_frame(self):
        res = analyze_emotion("mock_black_dark_frame_noface")
        assert res["lighting_quality"] == "Poor"
        assert res["face_detected"] == False

    def test_white_frame(self):
        res = analyze_emotion("mock_overexposed_white_noface")
        assert res["lighting_quality"] == "Poor"
        assert res["face_detected"] == False

    def test_face_partially_outside_frame(self):
        res = analyze_emotion("mock_partial_happy")
        assert res["face_detected"] == True

    # ---------------- Negative Cases ----------------
    def test_unsupported_format(self):
        res = analyze_emotion("mock_noface_txt")
        assert res["face_detected"] == False
        
    def test_null_frame(self):
        res = analyze_emotion(None)
        assert res["emotion"] == "No Face"

    def test_multiple_random_objects(self):
        res = analyze_emotion("mock_noface_objects")
        assert res["face_detected"] == False

    def test_cartoon_face(self):
        res = analyze_emotion("mock_noface_cartoon")
        assert res["face_detected"] == False

    def test_ai_generated_avatar(self):
        res = analyze_emotion("mock_noface_ai_avatar")
        assert res["face_detected"] == False

    # ---------------- Determinism & Scientific Quality Cases ----------------
    def test_deterministic_output_across_repeated_calls(self):
        """Verify that outputs are 100% deterministic with zero randomized values."""
        res1 = analyze_emotion("base64_image_data_mock_neutral")
        res2 = analyze_emotion("base64_image_data_mock_neutral")
        assert res1["emotion"] == res2["emotion"]
        assert res1["confidence"] == res2["confidence"]
        assert res1["lighting_quality"] == res2["lighting_quality"]
        assert res1["frame_quality"] == res2["frame_quality"]

    def test_zero_random_choice_fabrications(self):
        """Verify that 10 consecutive calls with identical input return identical deterministic results."""
        results = [analyze_emotion("base64_image_data_mock_happy") for _ in range(10)]
        first = results[0]
        for r in results[1:]:
            assert r["emotion"] == first["emotion"]
            assert r["confidence"] == first["confidence"]
            assert r["face_detected"] == first["face_detected"]

