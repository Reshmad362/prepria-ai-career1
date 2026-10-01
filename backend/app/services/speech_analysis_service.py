import sys
import os

ml_services_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../ml-services/speech-analysis"))
if ml_services_path not in sys.path:
    sys.path.append(ml_services_path)

try:
    from filler_detector import detect_fillers
    from pause_detector import detect_pauses
except ImportError as e:
    print(f"Failed to import speech analysis modules: {e}")
    def detect_fillers(text: str):
        return {"filler_count": 0, "fillers": []}
    def detect_pauses(duration_seconds: float, text: str):
        return {"pause_count": 0, "long_pauses": 0, "max_pause_duration": 0.0}

def analyze_speech(text: str, duration_seconds: int) -> dict:
    text_clean = str(text or "").strip()
    # Get stats from individual detectors
    filler_data = detect_fillers(text_clean)
    
    # Handle negative / invalid duration
    if duration_seconds < 0:
        duration_seconds = 0
        
    pause_data = detect_pauses(duration_seconds, text_clean)
    
    # Calculate fluency score
    filler_count = filler_data.get("filler_count", 0)
    filler_breakdown = filler_data.get("filler_breakdown", {})
    pause_count = pause_data.get("pause_count", 0)
    long_pauses = pause_data.get("long_pauses", 0)
    
    fluency_score = max(
        0,
        100 - (filler_count * 5) - (pause_count * 2) - (long_pauses * 5)
    )
    
    words = len(text_clean.split()) if text_clean else 0
    wpm = round((words / (duration_seconds / 60.0)), 1) if (duration_seconds > 0 and words > 0) else 0
        
    return {
        "filler_count": filler_count,
        "fillers": filler_data.get("fillers", []),
        "filler_breakdown": filler_breakdown,
        "pause_count": pause_count,
        "long_pauses": long_pauses,
        "max_pause_duration": pause_data.get("max_pause_duration", 0.0),
        "fluency_score": int(fluency_score),
        "wpm": wpm,
        "words": words,
        "duration_seconds": duration_seconds
    }


