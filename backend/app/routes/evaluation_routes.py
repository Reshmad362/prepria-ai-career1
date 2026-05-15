from fastapi import APIRouter
from pydantic import BaseModel
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
    print(f"Error loading NLP engine: {e_msg}")
    def evaluate_answer(user_answer: str, ideal_answer: str) -> str:
        return json.dumps({
            "score": 0.0,
            "quality": "Error",
            "feedback": f"NLP Engine failed to load: {e_msg}"
        })

router = APIRouter()

class EvalRequest(BaseModel):
    user_answer: str
    ideal_answer: str
    duration_seconds: int = 0
    base64_image: str = None

@router.post("/evaluate-answer")
def evaluate(req: EvalRequest):
    # Returns dynamic similarity score + feedback parsing JSON from evaluator
    result_str = evaluate_answer(req.user_answer, req.ideal_answer)
    result_dict = json.loads(result_str)
    
    from app.services.speech_analysis_service import analyze_speech
    speech_data = analyze_speech(req.user_answer, req.duration_seconds)
    
    from app.services.emotion_analysis_service import analyze_emotion
    emotion_data = analyze_emotion(req.base64_image)
    
    result_dict["speech_analysis"] = speech_data
    result_dict["emotion_analysis"] = emotion_data
    return result_dict
