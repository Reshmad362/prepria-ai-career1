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
    # Get stats from individual detectors
    filler_data = detect_fillers(text)
    
    # Handle negative / invalid duration
    if duration_seconds < 0:
        duration_seconds = 0
        
    pause_data = detect_pauses(duration_seconds, text)
    
    # Calculate fluency score
    filler_count = filler_data["filler_count"]
    pause_count = pause_data["pause_count"]
    long_pauses = pause_data["long_pauses"]
    
    fluency_score = max(
        0,
        100 - (filler_count * 5) - (pause_count * 2) - (long_pauses * 5)
    )
    
    words = len(text.strip().split()) if text.strip() else 0
    wpm = round((words / (duration_seconds / 60.0)), 1) if duration_seconds > 0 else 0
        
    return {
        "filler_count": filler_count,
        "fillers": filler_data["fillers"],
        "pause_count": pause_count,
        "long_pauses": long_pauses,
        "max_pause_duration": pause_data["max_pause_duration"],
        "fluency_score": int(fluency_score),
        "wpm": wpm,
        "words": words,
        "duration_seconds": duration_seconds
    }

