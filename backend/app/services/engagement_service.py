"""
PREPRIA Centralized Engagement & Course Progression Service
Tracks real user learning activities, course progress, module unlocking,
quiz attempts, scores, and server-side certificate eligibility.

Progress is persisted to disk (course_progress.json) so it survives server restarts.
"""

from typing import List, Dict, Any, Optional
from datetime import datetime, date, timedelta
import logging
import json
import os
import shutil

logger = logging.getLogger(__name__)

# ─── Paths ───────────────────────────────────────────────────────────────────
_DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "data")
_PROGRESS_FILE = os.path.join(_DATA_DIR, "course_progress.json")
_ACTIVITIES_FILE = os.path.join(_DATA_DIR, "activities.json")

os.makedirs(_DATA_DIR, exist_ok=True)

# ─── In-memory stores ────────────────────────────────────────────────────────
activities_db: List[Dict[str, Any]] = []
course_progress_db: Dict[str, Dict[str, Any]] = {}


# ─── Disk helpers ────────────────────────────────────────────────────────────

def _load_progress_from_disk() -> None:
    global course_progress_db
    if not os.path.exists(_PROGRESS_FILE):
        course_progress_db = {}
        return
    try:
        with open(_PROGRESS_FILE, "r", encoding="utf-8") as f:
            data = json.load(f)
        if isinstance(data, dict):
            course_progress_db = data
            logger.info("Loaded %d course-progress records from disk.", len(course_progress_db))
        else:
            course_progress_db = {}
    except Exception as e:
        logger.error("Failed to load course progress from disk: %s", e)
        course_progress_db = {}


def _save_progress_to_disk() -> None:
    try:
        tmp = _PROGRESS_FILE + ".tmp"
        with open(tmp, "w", encoding="utf-8") as f:
            json.dump(course_progress_db, f, indent=2, default=str)
        if os.path.exists(_PROGRESS_FILE):
            shutil.copy2(_PROGRESS_FILE, _PROGRESS_FILE + ".bak")
        os.replace(tmp, _PROGRESS_FILE)
    except Exception as e:
        logger.error("Failed to save course progress to disk: %s", e)


def _load_activities_from_disk() -> None:
    global activities_db
    if not os.path.exists(_ACTIVITIES_FILE):
        activities_db = []
        return
    try:
        with open(_ACTIVITIES_FILE, "r", encoding="utf-8") as f:
            data = json.load(f)
        if isinstance(data, list):
            activities_db = data
            logger.info("Loaded %d activity records from disk.", len(activities_db))
        else:
            activities_db = []
    except Exception as e:
        logger.error("Failed to load activities from disk: %s", e)
        activities_db = []


def _save_activities_to_disk() -> None:
    try:
        # Keep only last 500 activities to prevent file bloat
        trimmed = activities_db[-500:]
        tmp = _ACTIVITIES_FILE + ".tmp"
        with open(tmp, "w", encoding="utf-8") as f:
            json.dump(trimmed, f, indent=2, default=str)
        os.replace(tmp, _ACTIVITIES_FILE)
    except Exception as e:
        logger.error("Failed to save activities to disk: %s", e)


# Load on module import
_load_progress_from_disk()
_load_activities_from_disk()


# ─── Activity recording ───────────────────────────────────────────────────────

def record_user_activity(activity: Dict[str, Any]) -> Dict[str, Any]:
    """Records a learning or career event for a user."""
    ts = activity.get("timestamp")
    if not ts:
        ts = datetime.utcnow().isoformat()
        activity["timestamp"] = ts

    if "date" not in activity:
        try:
            if isinstance(ts, str):
                activity["date"] = ts.split("T")[0]
            elif isinstance(ts, datetime):
                activity["date"] = ts.strftime("%Y-%m-%d")
        except Exception:
            activity["date"] = datetime.utcnow().strftime("%Y-%m-%d")

    activity["id"] = f"act_{len(activities_db) + 1}_{int(datetime.utcnow().timestamp())}"
    activities_db.append(activity)

    # Persist every 10 activities to balance write frequency
    if len(activities_db) % 10 == 0:
        _save_activities_to_disk()

    logger.info("Recorded activity %s for user %s", activity.get("activity_type"), activity.get("user_id"))
    return activity


def get_user_activities(user_id: str, limit: int = 20) -> List[Dict[str, Any]]:
    user_acts = [a for a in activities_db if str(a.get("user_id")).lower() == str(user_id).lower()]
    user_acts.sort(key=lambda x: str(x.get("timestamp", "")), reverse=True)
    return user_acts[:limit]


# ─── Engagement metrics ───────────────────────────────────────────────────────

def get_user_engagement_metrics(user_id: str) -> Dict[str, Any]:
    user_acts = [a for a in activities_db if str(a.get("user_id")).lower() == str(user_id).lower()]

    today_dt = date.today()
    today_str = today_dt.strftime("%Y-%m-%d")
    yesterday_str = (today_dt - timedelta(days=1)).strftime("%Y-%m-%d")

    daily_summary: Dict[str, Dict[str, Any]] = {}
    for act in user_acts:
        d = act.get("date") or str(act.get("timestamp", ""))[:10]
        if not d:
            continue
        if d not in daily_summary:
            daily_summary[d] = {"date": d, "minutes": 0, "lessons": 0, "assessments": 0, "courses": 0, "certificates": 0, "meaningful": False}

        atype = act.get("activity_type", "")
        mins = act.get("duration_minutes", 0)
        daily_summary[d]["minutes"] += mins

        if atype in ("LESSON_COMPLETED", "lesson_complete"):
            daily_summary[d]["lessons"] += 1
            daily_summary[d]["meaningful"] = True
        elif atype in ("QUIZ_COMPLETED", "ASSESSMENT_COMPLETED", "assessment_complete"):
            daily_summary[d]["assessments"] += 1
            daily_summary[d]["meaningful"] = True
        elif atype in ("COURSE_COMPLETED", "course_completed"):
            daily_summary[d]["courses"] += 1
            daily_summary[d]["meaningful"] = True
        elif atype in ("CERTIFICATE_EARNED", "certificate_earned"):
            daily_summary[d]["certificates"] += 1
            daily_summary[d]["meaningful"] = True
        elif atype in ("interview_complete", "mock_interview"):
            daily_summary[d]["meaningful"] = True
            if mins == 0:
                daily_summary[d]["minutes"] += 20
        elif mins >= 5:
            daily_summary[d]["meaningful"] = True

    current_streak = 0
    check_date = today_dt
    if today_str not in daily_summary or not daily_summary[today_str]["meaningful"]:
        if yesterday_str in daily_summary and daily_summary[yesterday_str]["meaningful"]:
            check_date = today_dt - timedelta(days=1)
        else:
            check_date = None

    if check_date:
        while True:
            ds = check_date.strftime("%Y-%m-%d")
            if ds in daily_summary and daily_summary[ds]["meaningful"]:
                current_streak += 1
                check_date -= timedelta(days=1)
            else:
                break

    start_of_week = today_dt - timedelta(days=today_dt.weekday())
    this_week_minutes = 0
    for i in range(7):
        day_date = start_of_week + timedelta(days=i)
        day_str = day_date.strftime("%Y-%m-%d")
        if day_str in daily_summary:
            this_week_minutes += daily_summary[day_str]["minutes"]

    hours = this_week_minutes // 60
    rem_mins = this_week_minutes % 60
    time_formatted = f"{hours}h {rem_mins}m" if hours > 0 else f"{rem_mins}m"

    total_lessons = sum(d["lessons"] for d in daily_summary.values())
    total_assessments = sum(d["assessments"] for d in daily_summary.values())
    total_courses = sum(d["courses"] for d in daily_summary.values())
    total_certificates = sum(d["certificates"] for d in daily_summary.values())

    day_labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    weekly_breakdown = []
    for i in range(7):
        day_date = start_of_week + timedelta(days=i)
        day_str = day_date.strftime("%Y-%m-%d")
        day_data = daily_summary.get(day_str, {"minutes": 0, "meaningful": False})
        weekly_breakdown.append({"day": day_labels[i], "date": day_str, "minutes": day_data["minutes"], "active": day_data["meaningful"]})

    return {
        "currentStreak": current_streak,
        "learningTime": {"thisWeekMinutes": this_week_minutes, "thisWeekFormatted": time_formatted},
        "lessonsCompleted": total_lessons,
        "assessmentsPassed": total_assessments,
        "coursesCompleted": total_courses,
        "certificatesEarned": total_certificates,
        "weeklyBreakdown": weekly_breakdown
    }


# ─── Course progress ──────────────────────────────────────────────────────────

def save_user_course_progress(user_id: str, course_id: str, progress_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Saves verified course progress and calculates server-side certificate eligibility.
    Persists to disk immediately.
    """
    key = f"{str(user_id).strip().lower()}_{str(course_id).strip().lower()}"

    completed_items_frontend = set(progress_data.get("completedItemIds", []) or [])
    lesson_time_spent = progress_data.get("lessonTimeSpent", {}) or {}
    quiz_scores = progress_data.get("quizScores", {}) or {}
    final_assessment = progress_data.get("finalAssessment") or {}

    quiz_submission = progress_data.get("quizSubmission") or None
    final_assessment_submission = progress_data.get("finalAssessmentSubmission") or None

    # Compute effective quiz scores using submissions when provided.
    # This prevents the frontend from spoofing quiz result scores.
    effective_quiz_scores = dict(quiz_scores) if isinstance(quiz_scores, dict) else {}

    if quiz_submission and isinstance(quiz_submission, dict):
        quiz_id = quiz_submission.get("quizId")
        question_key = quiz_submission.get("questionKey") or []
        answers_by_qid = quiz_submission.get("answersByQuestionId") or {}
        # passing_score is defined later from courseDefinition; default to 70 here.
        sub_passing = int(quiz_submission.get("passingScore") or 70)

        if quiz_id and isinstance(question_key, list):
            total = len(question_key)
            correct = 0
            for q in question_key:
                qid = q.get("id")
                if qid is None:
                    continue
                selected = answers_by_qid.get(qid)
                if selected is not None and int(selected) == int(q.get("correctIndex", -1)):
                    correct += 1

            score_pct = int(round((correct / total) * 100)) if total > 0 else 0
            passed = bool(score_pct >= sub_passing)

            prev = effective_quiz_scores.get(quiz_id) or {}
            attempts = (int(prev.get("attempts") or 0) + 1) if isinstance(prev, dict) else 1
            effective_quiz_scores[quiz_id] = {
                "score": score_pct,
                "passed": passed,
                "attempts": attempts,
                "validated": True
            }

    # Optional, but required for real security validation.
    course_def = progress_data.get("courseDefinition") or {}
    item_requirements = course_def.get("itemRequirements") or {}
    modules_def = course_def.get("modules") or []
    total_items = course_def.get("totalRequiredItems") or progress_data.get("totalRequiredItems") or 0
    passing_score = course_def.get("passingScore") or 70

    # If no course definition was provided, do not mark anything certified.
    can_validate = bool(modules_def) and bool(item_requirements) and total_items > 0

    validated_completed_item_ids = set()
    modules_fully_passed = True

    # Compute final assessment from submission when provided.
    if final_assessment_submission and isinstance(final_assessment_submission, dict):
        question_key = final_assessment_submission.get("questionKey") or []
        answers_by_qid = final_assessment_submission.get("answersByQuestionId") or {}
        sub_passing = int(final_assessment_submission.get("passingScore") or passing_score)

        total = len(question_key)
        correct = 0
        for q in question_key:
            qid = q.get("id")
            if qid is None:
                continue
            selected = answers_by_qid.get(qid)
            if selected is not None and int(selected) == int(q.get("correctIndex", -1)):
                correct += 1

        score_pct = int(round((correct / total) * 100)) if total > 0 else 0
        passed = bool(score_pct >= sub_passing)

        prev = final_assessment if isinstance(final_assessment, dict) else {}
        attempts = (int(prev.get("attempts") or 0) + 1) if isinstance(prev, dict) else 1
        final_assessment = {
            **(prev if isinstance(prev, dict) else {}),
            "score": score_pct,
            "passed": passed,
            "attempts": attempts,
            "validated": True,
            "completedAt": prev.get("completedAt") if isinstance(prev, dict) else None
        }

    if can_validate:
        # Validate module items sequentially (module pass = all required items valid)
        for mod in modules_def:
            module_item_ids = mod.get("itemIds") or []
            module_passed = True

            for item_id in module_item_ids:
                req = item_requirements.get(item_id) or {}
                item_type = req.get("type")

                if item_type == "QUIZ":
                    q = effective_quiz_scores.get(item_id) or {}
                    quiz_score = int(q.get("score", 0) or 0)
                    quiz_passed = bool(q.get("passed", False)) and (quiz_score >= int(passing_score))
                    # Only accept quiz outcome when it was validated by backend at least once.
                    # Backwards compatibility: if quizScores were stored by older frontend versions
                    # (no validated flag), accept only if the frontend marked the quiz as completed.
                    quiz_validated = (
                        bool(q.get("validated", False)) or
                        bool(quiz_submission and quiz_submission.get("quizId") == item_id) or
                        (item_id in completed_items_frontend and quiz_passed)
                    )
                    quiz_passed = quiz_passed and quiz_validated
                    if quiz_passed:
                        validated_completed_item_ids.add(item_id)
                    else:
                        module_passed = False
                elif item_type == "ASSESSMENT":
                    # Final assessment is validated separately; module definition should not include it.
                    module_passed = False
                else:
                    required_seconds = int(req.get("requiredDurationSeconds") or 0)
                    time_spent = int(lesson_time_spent.get(item_id) or 0)
                    # For lesson completion we require both: user clicked completion flag AND min time reached.
                    lesson_completed_valid = (item_id in completed_items_frontend) and (time_spent >= required_seconds)
                    if lesson_completed_valid:
                        validated_completed_item_ids.add(item_id)
                    else:
                        module_passed = False

            if not module_passed:
                modules_fully_passed = False

    # Validate final assessment
    final_passed_flag = bool(final_assessment.get("passed", False))
    final_score = int(final_assessment.get("score", 0) or 0)
    final_validated = bool(final_assessment.get("validated", False)) or bool(final_assessment_submission)
    # Backwards compatibility: if no validated flag exists, accept only when the frontend
    # claims the final was passed and scored enough.
    if not final_validated and final_passed_flag and final_score >= int(passing_score):
        final_validated = True
    final_valid = final_passed_flag and (final_score >= int(passing_score)) and final_validated

    # Compute validated completion percentage from validated completions only
    completion_percentage = 0
    if can_validate and total_items > 0:
        completion_percentage = min(100, int((len(validated_completed_item_ids) / total_items) * 100))

    # Certificate eligibility requires full validated completion + final assessment pass
    is_certified = bool(can_validate and modules_fully_passed and final_valid and completion_percentage == 100)

    record = {
        "userId": str(user_id),
        "courseId": str(course_id),
        "completedItemIds": sorted(list(validated_completed_item_ids)) if can_validate else progress_data.get("completedItemIds", []) or [],
        "quizScores": effective_quiz_scores,
        "finalAssessment": final_assessment,
        "lessonTimeSpent": lesson_time_spent,
        "lastAccessed": progress_data.get("lastAccessed", {}),
        "totalRequiredItems": total_items,
        "completionPercentage": completion_percentage,
        "certificateEligible": is_certified,
        "updatedAt": datetime.utcnow().isoformat()
    }

    course_progress_db[key] = record
    _save_progress_to_disk()

    logger.info(
        "Saved progress for user=%s course=%s completion=%d%% certified=%s",
        user_id, course_id, completion_percentage, is_certified
    )
    return record


def get_user_course_progress(user_id: str, course_id: str) -> Optional[Dict[str, Any]]:
    """Retrieves course progress for a user (from in-memory, which is loaded from disk on startup)."""
    key = f"{str(user_id).strip().lower()}_{str(course_id).strip().lower()}"
    return course_progress_db.get(key)


def validate_certificate_eligibility(user_id: str, course_id: str) -> Dict[str, Any]:
    """
    Backend-only certificate eligibility check.
    Returns { eligible: bool, reason: str, progress: dict }.
    """
    record = get_user_course_progress(user_id, course_id)
    if not record:
        return {"eligible": False, "reason": "No progress record found for this course.", "progress": None}

    completion = record.get("completionPercentage", 0)
    final = record.get("finalAssessment") or {}
    final_passed = bool(final.get("passed", False))
    final_score = final.get("score", 0)
    is_certified = record.get("certificateEligible", False)

    if not is_certified:
        if completion < 100:
            reason = f"Course is only {completion}% complete. All lessons must be finished."
        elif not final_passed:
            reason = "Final assessment has not been passed yet."
        elif final_score < 70:
            reason = f"Final assessment score ({final_score}%) is below the 70% passing threshold."
        else:
            reason = "Certificate requirements not fully met."
    else:
        reason = "All requirements satisfied."

    return {
        "eligible": is_certified,
        "reason": reason,
        "progress": {
            "completionPercentage": completion,
            "finalAssessmentPassed": final_passed,
            "finalAssessmentScore": final_score,
            "completedItems": len(record.get("completedItemIds", [])),
            "totalItems": record.get("totalRequiredItems", 0)
        }
    }


def get_all_user_course_progress(user_id: str) -> List[Dict[str, Any]]:
    """Returns all course progress records for a given user."""
    prefix = f"{str(user_id).strip().lower()}_"
    return [v for k, v in course_progress_db.items() if k.startswith(prefix)]
