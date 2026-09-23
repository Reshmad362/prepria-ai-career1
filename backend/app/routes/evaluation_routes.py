from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
import sys
import os
import json

# Fix import path issue to resolve external ml-services folder
ml_services_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../ml-services/nlp-evaluation"))
if ml_services_path not in sys.path:
    sys.path.append(ml_services_path)

# Handle model loading errors gracefully so backend doesn't crash
try:
    import answer_evaluator
    from answer_evaluator import evaluate_answer
except Exception as e:
    e_msg = str(e)
    def evaluate_answer(user_answer: str, ideal_answer: str) -> str:
        return json.dumps({
            "score": 0.0,
            "quality": "Error",
            "feedback": f"NLP Engine fallback: {e_msg}"
        })

from app.services.speech_analysis_service import analyze_speech

router = APIRouter()

class EvalRequest(BaseModel):
    user_answer: str
    ideal_answer: str
    duration_seconds: int = 0
    base64_image: Optional[str] = None

@router.post("/evaluate-answer")
def evaluate(req: EvalRequest):
    """
    Evaluates a candidate answer against an ideal answer using NLP similarity
    and objective speech analysis metrics (filler words, pauses, fluency).
    Enforces strict zero-answer defense.
    """
    clean_answer = (req.user_answer or "").strip()
    clean_ideal = (req.ideal_answer or "").strip()

    # Zero-Answer defense
    if not clean_answer or len(clean_answer) <= 5 or clean_answer == "[Skipped]":
        speech_data = analyze_speech("", 0)
        return {
            "score": 0.0,
            "quality": "Poor",
            "feedback": "Answer is empty or insufficient. Please provide a substantive response.",
            "speech_analysis": speech_data,
            "emotion_analysis": {
                "face_detected": False,
                "lighting_quality": "N/A",
                "frame_quality": "N/A",
                "confidence": 0.0
            }
        }

    # NLP Semantic evaluation
    result_str = evaluate_answer(clean_answer, clean_ideal or clean_answer)
    result_dict = json.loads(result_str)
    
    # Objective speech analysis (WPM, pauses, fillers)
    speech_data = analyze_speech(clean_answer, req.duration_seconds)
    result_dict["speech_analysis"] = speech_data
    
    # Decoupled auxiliary emotion metadata (never used as authoritative candidate score)
    try:
        from app.services.emotion_analysis_service import analyze_emotion
        emotion_data = analyze_emotion(req.base64_image)
    except Exception:
        emotion_data = {
            "face_detected": False,
            "lighting_quality": "N/A",
            "frame_quality": "N/A",
            "confidence": 0.0
        }
    
    result_dict["emotion_analysis"] = emotion_data
    return result_dict

