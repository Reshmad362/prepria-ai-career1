import sys
import os

ml_services_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../ml-services/emotion-detection"))
if ml_services_path not in sys.path:
    sys.path.append(ml_services_path)

try:
    from emotion_service import detect_emotion
except ImportError as e:
    print(f"Failed to import emotion analysis module: {e}")
    def detect_emotion(base64_image: str = None):
        return {
            "emotion": "Unknown",
            "confidence": 0.0,
            "face_detected": False,
            "multiple_faces": False,
            "lighting_quality": "Unknown",
            "frame_quality": "Unknown"
        }

def analyze_emotion(base64_image: str = None) -> dict:
    """
    Service layer wrapper abstracting emotion generation constraints
    """
    return detect_emotion(base64_image)
