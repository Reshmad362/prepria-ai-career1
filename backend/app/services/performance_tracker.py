import os
import json
import shutil
import uuid
import logging
from typing import List, Dict, Any, Optional
from datetime import datetime

logger = logging.getLogger(__name__)

# ─── Data Directory & File Paths ─────────────────────────────────────────────
_DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "data")
_INTERVIEWS_FILE = os.path.join(_DATA_DIR, "interview_history.json")

os.makedirs(_DATA_DIR, exist_ok=True)

# In-memory cache synchronized with disk
interviews_db: List[Dict[str, Any]] = []
_INTERVIEWS_CACHE = interviews_db


def _load_interviews_from_disk() -> None:
    """Loads stored interview sessions from disk into memory."""
    global interviews_db, _INTERVIEWS_CACHE
    if not os.path.exists(_INTERVIEWS_FILE):
        interviews_db.clear()
        _INTERVIEWS_CACHE = interviews_db
        return
    try:
        with open(_INTERVIEWS_FILE, "r", encoding="utf-8") as f:
            data = json.load(f)
        if isinstance(data, list):
            interviews_db.clear()
            interviews_db.extend(data)
            _INTERVIEWS_CACHE = interviews_db
            logger.info("Loaded %d interview records from disk.", len(interviews_db))
        else:
            interviews_db.clear()
            _INTERVIEWS_CACHE = interviews_db
    except Exception as e:
        logger.error("Failed to load interview history from disk: %s", e)
        interviews_db.clear()
        _INTERVIEWS_CACHE = interviews_db


def _save_interviews_to_disk() -> None:
    """Atomically writes memory interview records to disk with backup."""
    try:
        tmp = _INTERVIEWS_FILE + ".tmp"
        with open(tmp, "w", encoding="utf-8") as f:
            json.dump(interviews_db, f, indent=2, default=str)
        if os.path.exists(_INTERVIEWS_FILE):
            shutil.copy2(_INTERVIEWS_FILE, _INTERVIEWS_FILE + ".bak")
        os.replace(tmp, _INTERVIEWS_FILE)
    except Exception as e:
        logger.error("Failed to save interview history to disk: %s", e)


# Initialize from disk on module import
_load_interviews_from_disk()


def record_interview(data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Saves an interview session record to the persistent store.
    """
    global interviews_db
    if not data.get("id"):
        data["id"] = f"sess-{uuid.uuid4().hex[:12]}"
    if not data.get("timestamp") and not data.get("completedAt"):
        data["timestamp"] = datetime.utcnow().isoformat()
    if not data.get("completedAt"):
        data["completedAt"] = data.get("timestamp")

    # Normalize user_id for consistent lookups
    if data.get("user_id"):
        data["user_id"] = str(data["user_id"]).strip().lower()

    # Append and persist
    interviews_db.append(data)
    _save_interviews_to_disk()
    return data


def get_user_interviews(user_id: str) -> List[Dict[str, Any]]:
    """
    Retrieves all interview sessions for a specific user, sorted newest first.
    """
    if not interviews_db and os.path.exists(_INTERVIEWS_FILE):
        _load_interviews_from_disk()

    user_key = str(user_id).strip().lower()
    user_sessions = [i for i in interviews_db if str(i.get("user_id", "")).strip().lower() == user_key]
    
    def parse_date(item):
        ts = item.get("completedAt") or item.get("timestamp") or ""
        if isinstance(ts, str):
            try:
                return datetime.fromisoformat(ts.replace("Z", "+00:00"))
            except Exception:
                pass
        return datetime.min

    user_sessions.sort(key=parse_date, reverse=True)
    return user_sessions


def get_interview_by_id(user_id: str, session_id: str) -> Optional[Dict[str, Any]]:
    """
    Retrieves a specific interview session for a user by session ID.
    """
    if not interviews_db and os.path.exists(_INTERVIEWS_FILE):
        _load_interviews_from_disk()

    user_key = str(user_id).strip().lower()
    for s in interviews_db:
        if str(s.get("user_id", "")).strip().lower() == user_key and str(s.get("id")) == str(session_id):
            return s
    return None


def get_growth_analytics(user_id: str) -> Dict[str, Any]:
    """
    Computes longitudinal performance metrics for charting and growth analytics
    derived strictly from the candidate's authentic session history.
    """
    user_interviews = get_user_interviews(user_id)
    # Sort chronologically (oldest to newest) for trends and charts
    user_interviews = list(reversed(user_interviews))

    if not user_interviews:
        return {
             "score_trend": "Insufficient Data",
             "growth_percentage": 0.0,
             "weak_areas": [],
             "improved_skills": [],
             "history": []
        }

    history = []
    
    # Extract numerical scores
    scores = []
    for inv in user_interviews:
        raw_score = inv.get("overallScore") if inv.get("overallScore") is not None else inv.get("score", 0)
        # Normalize to 0-100 integer
        score_val = int(raw_score * 100) if (isinstance(raw_score, float) and raw_score <= 1.0 and raw_score > 0) else int(raw_score or 0)
        scores.append(score_val)

    # Analyze trends
    if len(scores) >= 2:
        first_score = scores[0]
        last_score = scores[-1]
        score_diff = last_score - first_score
        
        if score_diff > 0:
            trend = "Increasing"
            growth_pct = (score_diff / max(first_score, 1)) * 100
        elif score_diff < 0:
            trend = "Decreasing"
            growth_pct = (score_diff / max(first_score, 1)) * 100
        else:
            trend = "Stagnant"
            growth_pct = 0.0
    else:
        trend = "Initial Baseline Established"
        growth_pct = 0.0

    # Derive genuine Weak Areas and Improved Skills from actual question evaluations
    recent_interviews = user_interviews[-3:]
    weak_areas_set = set()
    improved_skills_set = set()

    for inv in recent_interviews:
        q_evals = inv.get("questionEvaluations") or []
        for qe in q_evals:
            topic = qe.get("topic") or "General"
            q_score = qe.get("score", 0)
            if q_score < 60 and topic != "General":
                weak_areas_set.add(topic)
            elif q_score >= 75 and topic != "General":
                improved_skills_set.add(topic)
                
        # Also check communication / fluency metrics
        dims = inv.get("dimensions") or {}
        comm_score = dims.get("communication", inv.get("fluency_score", 100))
        if comm_score < 60:
            weak_areas_set.add("Communication & Pacing")
        elif comm_score >= 80:
            improved_skills_set.add("Clear Communication")

    # Format history strictly for Recharts UI
    for idx, inv in enumerate(user_interviews):
        raw_score = inv.get("overallScore") if inv.get("overallScore") is not None else inv.get("score", 0)
        score_val = int(raw_score * 100) if (isinstance(raw_score, float) and raw_score <= 1.0 and raw_score > 0) else int(raw_score or 0)
        
        dims = inv.get("dimensions") or {}
        fluency = dims.get("communication") or inv.get("fluency_score", score_val)
        confidence = dims.get("confidence") or int((inv.get("emotion_confidence", 0.75) if isinstance(inv.get("emotion_confidence"), float) and inv.get("emotion_confidence") <= 1.0 else 75))
        ats = inv.get("ats_score", 0)

        history.append({
            "name": f"Session {idx + 1}",
            "score": score_val,
            "fluency": int(fluency),
            "confidence": int(confidence),
            "ats": int(ats)
        })

    return {
         "score_trend": trend,
         "growth_percentage": round(growth_pct, 1),
         "weak_areas": sorted(list(weak_areas_set)),
         "improved_skills": sorted(list(improved_skills_set)),
         "demonstrated_skills": sorted(list(improved_skills_set)),
         "history": history
    }


def get_longitudinal_comparison(user_id: str) -> Dict[str, Any]:
    """
    Computes honest, authentic longitudinal comparison between the candidate's
    Baseline session and Current session using authoritative Phase 3 evaluation data.
    """
    user_sessions = get_user_interviews(user_id)
    # Filter only valid evaluated sessions
    valid_sessions = [
        s for s in user_sessions 
        if (s.get("questionEvaluations") or s.get("overallScore") is not None or s.get("score") is not None)
    ]

    if len(valid_sessions) < 2:
        return {
            "hasComparison": False,
            "message": "At least two completed interview sessions are required to compute longitudinal growth.",
            "baselineSession": valid_sessions[0] if valid_sessions else None,
            "currentSession": None,
            "totalSessions": len(valid_sessions)
        }

    # valid_sessions is ordered newest first (from get_user_interviews)
    current_session = valid_sessions[0]
    baseline_session = valid_sessions[1]

    # Authoritative Phase 3 score extraction
    def extract_authoritative_score(sess: Dict[str, Any]) -> int:
        if sess.get("overallScore") is not None:
            raw = sess["overallScore"]
        elif sess.get("score") is not None:
            raw = sess["score"]
        else:
            q_evals = sess.get("questionEvaluations", [])
            answered = [q["score"] for q in q_evals if q.get("score") is not None]
            raw = sum(answered) / len(answered) if answered else 0
        return int(round(raw * 100)) if (isinstance(raw, float) and 0 < raw <= 1.0) else int(round(raw or 0))

    baseline_score = extract_authoritative_score(baseline_session)
    current_score = extract_authoritative_score(current_session)
    score_delta = current_score - baseline_score

    # Honest trajectory classification
    if score_delta > 0:
        trajectory = "Measured Improvement"
    elif score_delta == 0:
        trajectory = "No Measurable Change"
    else:
        trajectory = "Measured Decline"

    # Dimension deltas (Technical, Problem Solving, Communication, Role Knowledge, Confidence)
    base_dims = baseline_session.get("dimensions") or {}
    curr_dims = current_session.get("dimensions") or {}

    dimension_names = ["technicalKnowledge", "problemSolving", "communication", "roleKnowledge", "confidence"]
    dimension_deltas = {}
    baseline_dimensions = {}
    current_dimensions = {}

    for dim in dimension_names:
        b_val = base_dims.get(dim, 0)
        c_val = curr_dims.get(dim, 0)
        baseline_dimensions[dim] = b_val
        current_dimensions[dim] = c_val
        dimension_deltas[dim] = c_val - b_val

    # Identify baseline weaknesses
    baseline_weaknesses = set()
    for qe in baseline_session.get("questionEvaluations", []):
        t = qe.get("topic")
        if t and t != "General" and qe.get("score", 100) < 70:
            baseline_weaknesses.add(t)
    for imp in baseline_session.get("improvements", []):
        if isinstance(imp, dict) and imp.get("topic"):
            baseline_weaknesses.add(imp["topic"])

    # Check topic performance in current session
    curr_topic_scores = {}
    for qe in current_session.get("questionEvaluations", []):
        t = qe.get("topic")
        if t:
            curr_topic_scores[t] = qe.get("score", 0)

    resolved_weaknesses = []
    persistent_weaknesses = []

    for weak_t in baseline_weaknesses:
        if weak_t in curr_topic_scores:
            if curr_topic_scores[weak_t] >= 75:
                resolved_weaknesses.append({
                    "topic": weak_t,
                    "previousScore": next((qe.get("score", 0) for qe in baseline_session.get("questionEvaluations", []) if qe.get("topic") == weak_t), 0),
                    "currentScore": curr_topic_scores[weak_t],
                    "status": "Resolved"
                })
            elif curr_topic_scores[weak_t] < 70:
                persistent_weaknesses.append({
                    "topic": weak_t,
                    "previousScore": next((qe.get("score", 0) for qe in baseline_session.get("questionEvaluations", []) if qe.get("topic") == weak_t), 0),
                    "currentScore": curr_topic_scores[weak_t],
                    "status": "Needs Additional Practice"
                })

    return {
        "hasComparison": True,
        "totalSessions": len(valid_sessions),
        "trajectory": trajectory,
        "scoreDelta": score_delta,
        "baseline": {
            "id": baseline_session.get("id"),
            "role": baseline_session.get("roleName") or baseline_session.get("role"),
            "score": baseline_score,
            "completedAt": baseline_session.get("completedAt") or baseline_session.get("timestamp"),
            "dimensions": baseline_dimensions
        },
        "current": {
            "id": current_session.get("id"),
            "role": current_session.get("roleName") or current_session.get("role"),
            "score": current_score,
            "completedAt": current_session.get("completedAt") or current_session.get("timestamp"),
            "dimensions": current_dimensions
        },
        "dimensionDeltas": dimension_deltas,
        "resolvedWeaknesses": resolved_weaknesses,
        "persistentWeaknesses": persistent_weaknesses,
        "weaknessResolutionRate": round((len(resolved_weaknesses) / max(len(baseline_weaknesses), 1)) * 100, 1) if baseline_weaknesses else 100.0
    }


