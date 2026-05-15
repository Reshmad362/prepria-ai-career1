def detect_pauses(duration_seconds: float, text: str) -> dict:
    if not text:
        if duration_seconds <= 0:
            return {
                "pause_count": 0,
                "long_pauses": 0,
                "max_pause_duration": 0
            }
        # If no text but there is duration
        pause_time = duration_seconds
        return {
            "pause_count": max(0, int(pause_time // 5)),
            "long_pauses": max(0, int(pause_time // 10)),
            "max_pause_duration": min(6.0, float(pause_time))
        }
            
    word_count = len(text.split())
    # 2.5 words per second calculation
    expected_speech_time = word_count / 2.5
    pause_time = max(0, duration_seconds - expected_speech_time)

    pause_count = max(0, int(pause_time // 5))
    long_pauses = max(0, int(pause_time // 10))
    max_pause_duration = min(6.0, float(pause_time))
    
    return {
        "pause_count": pause_count,
        "long_pauses": long_pauses,
        "max_pause_duration": round(max_pause_duration, 1)
    }

