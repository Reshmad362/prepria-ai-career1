from typing import List, Dict, Any
from datetime import datetime
from statistics import mean

# In-memory storage for longitudinal tracking
interviews_db = []

def record_interview(data: Dict[str, Any]):
    """
    Saves the results of an interview to the database.
    """
    interviews_db.append(data)
    return True

def get_growth_analytics(user_id: str) -> Dict[str, Any]:
    """
    Computes longitudinal performance arrays for charting and growth metrics.
    """
    user_interviews = [i for i in interviews_db if i['user_id'] == user_id]
    
    # Sort chronologically by timestamp
    user_interviews.sort(key=lambda x: datetime.fromisoformat(x['timestamp']) if type(x['timestamp'])==str else x['timestamp'])

    if not user_interviews:
        return {
             "score_trend": "Insufficient Data",
             "growth_percentage": 0.0,
             "weak_areas": [],
             "improved_skills": [],
             "history": []
        }

    history = []
    
    # Analyze trends
    if len(user_interviews) >= 2:
        first_score = user_interviews[0]['score']
        last_score = user_interviews[-1]['score']
        score_diff = last_score - first_score
        
        if score_diff > 0:
            trend = "Increasing"
            growth_pct = (score_diff / max(first_score, 0.01)) * 100
        elif score_diff < 0:
            trend = "Decreasing"
            growth_pct = (score_diff / max(first_score, 0.01)) * 100
        else:
            trend = "Stagnant"
            growth_pct = 0.0
            
    else:
        trend = "Initial Baseline Established"
        growth_pct = 0.0

    # Weak Areas Heuristic
    recent_interviews = user_interviews[-3:]
    weak_areas = []
    # Simplified domain heuristic map for demonstration
    if any(i['ats_score'] < 60 for i in recent_interviews):
        weak_areas.append("Resume Formatting")
    if any(i['fluency_score'] < 60 for i in recent_interviews):
        weak_areas.append("Communication & Pacing")
    if any(i['emotion_confidence'] < 0.6 for i in recent_interviews):
        weak_areas.append("Confidence under pressure")

    # Format history strictly for Recharts UI
    for idx, inv in enumerate(user_interviews):
        history.append({
            "name": f"Session {idx+1}",
            "score": int(inv['score'] * 100),
            "fluency": inv['fluency_score'],
            "confidence": int(inv['emotion_confidence'] * 100),
            "ats": inv['ats_score']
        })

    return {
         "score_trend": trend,
         "growth_percentage": round(growth_pct, 1),
         "weak_areas": weak_areas + ["SQL", "System Design"], # Adding hardcoded requested examples
         "improved_skills": ["React", "Python", "Algorithms"],
         "history": history
    }
