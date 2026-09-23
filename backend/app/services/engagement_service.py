"""
PREPRIA Centralized Engagement & Course Progression Service
Tracks real user learning activities, course progress, module unlocking,
quiz attempts, scores, dwell-time heartbeats, and server-side certificate eligibility.

Progress is persisted to disk (course_progress.json) so it survives server restarts.
"""

from typing import List, Dict, Any, Optional, Set
from datetime import datetime, date, timedelta
import logging
import json
import os
import shutil

from app.services.course_catalog_service import (
    get_course_catalog_entry,
    get_course_item_requirements,
    get_course_total_required_items,
    is_valid_item_for_course,
    get_quiz_questions,
    DEFAULT_PASSING_SCORE,
    DEFAULT_REQUIRED_DURATION_SECONDS
)

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


# ─── Course progression engine ────────────────────────────────────────────────

def save_user_course_progress(user_id: str, course_id: str, progress_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Saves and validates course progress against the authoritative backend course catalog.
    Handles:
      1. Incremental dwell-time heartbeats with idempotency and bounds validation (1 <= delta <= 15s).
      2. Idempotent quiz attempts with server-side grading (threshold >= 70%) and highest score preservation.
      3. Monotonic merge of completed lessons across multiple devices.
      4. Server-derived completion percentage and tamper-proof certificate eligibility.
    Persists to disk immediately.
    """
    key = f"{str(user_id).strip().lower()}_{str(course_id).strip().lower()}"
    existing_record = course_progress_db.get(key, {})

    # Authoritative course curriculum lookup
    course_def = progress_data.get("courseDefinition") or existing_record.get("courseDefinition")
    course_cat = get_course_catalog_entry(course_id, course_def)
    item_reqs = get_course_item_requirements(course_id, course_def)
    total_required_items = get_course_total_required_items(course_id, course_def)
    passing_score = int(course_cat.get("passingScore", DEFAULT_PASSING_SCORE))

    # Existing state
    existing_completed_items = set(existing_record.get("completedItemIds", []) or [])
    existing_lesson_time = dict(existing_record.get("lessonTimeSpent", {}) or {})
    existing_quiz_scores = dict(existing_record.get("quizScores", {}) or {})
    existing_final = dict(existing_record.get("finalAssessment", {}) or {})
    processed_heartbeats = set(existing_record.get("processedHeartbeatIds", []) or [])
    processed_quiz_subs = set(existing_record.get("processedQuizSubmissionIds", []) or [])

    # 1. Heartbeat Dwell-Time Processing
    heartbeat = progress_data.get("heartbeat")
    if heartbeat and isinstance(heartbeat, dict):
        hb_id = heartbeat.get("heartbeatId")
        item_id = heartbeat.get("itemId")
        delta = heartbeat.get("deltaSeconds")

        if hb_id and hb_id not in processed_heartbeats:
            # Validate bounds & legitimate lesson ID
            if isinstance(delta, (int, float)) and 1 <= delta <= 15 and item_id and is_valid_item_for_course(course_id, item_id, course_def):
                current_time = existing_lesson_time.get(item_id, 0)
                existing_lesson_time[item_id] = current_time + int(delta)
                processed_heartbeats.add(str(hb_id))
            else:
                logger.warning("Rejected invalid dwell heartbeat: hb_id=%s item=%s delta=%s", hb_id, item_id, delta)

    # 2. Quiz Submission Processing (Idempotent Server-Side Grading)
    quiz_submission = progress_data.get("quizSubmission")
    if quiz_submission and isinstance(quiz_submission, dict):
        sub_id = quiz_submission.get("submissionId") or f"sub_{quiz_submission.get('quizId')}_{quiz_submission.get('submittedAt')}"
        quiz_id = quiz_submission.get("quizId")
        answers_by_qid = quiz_submission.get("answersByQuestionId") or {}

        if quiz_id and sub_id not in processed_quiz_subs:
            auth_questions = get_quiz_questions(course_id, quiz_id, course_def)
            if not auth_questions and "questionKey" in quiz_submission:
                # Fallback to key if quiz is purely dynamic
                auth_questions = quiz_submission.get("questionKey") or []

            if auth_questions:
                total_q = len(auth_questions)
                correct = 0
                for q in auth_questions:
                    qid = q.get("id")
                    if qid is None:
                        continue
                    sel = answers_by_qid.get(qid)
                    if sel is not None and int(sel) == int(q.get("correctIndex", -1)):
                        correct += 1

                score_pct = int(round((correct / total_q) * 100)) if total_q > 0 else 0
                passed = (score_pct >= passing_score)

                prev_q = existing_quiz_scores.get(quiz_id, {})
                prev_attempts = int(prev_q.get("attempts", 0) or 0)
                prev_passed = bool(prev_q.get("passed", False))
                prev_high_score = int(prev_q.get("score", 0) or 0)

                existing_quiz_scores[quiz_id] = {
                    "score": max(prev_high_score, score_pct),
                    "passed": prev_passed or passed,
                    "attempts": prev_attempts + 1,
                    "validated": True,
                    "lastAttemptScore": score_pct
                }
                processed_quiz_subs.add(str(sub_id))

    # 3. Final Comprehensive Assessment Submission Processing
    final_sub = progress_data.get("finalAssessmentSubmission")
    if final_sub and isinstance(final_sub, dict):
        sub_id = final_sub.get("submissionId") or f"sub_final_{final_sub.get('submittedAt')}"
        answers_by_qid = final_sub.get("answersByQuestionId") or {}

        if sub_id not in processed_quiz_subs:
            final_cat = course_cat.get("finalAssessment") or {}
            auth_questions = final_cat.get("questions") or final_sub.get("questionKey") or []

            if auth_questions:
                total_q = len(auth_questions)
                correct = 0
                for q in auth_questions:
                    qid = q.get("id")
                    if qid is None:
                        continue
                    sel = answers_by_qid.get(qid)
                    if sel is not None and int(sel) == int(q.get("correctIndex", -1)):
                        correct += 1

                score_pct = int(round((correct / total_q) * 100)) if total_q > 0 else 0
                passed = (score_pct >= passing_score)

                prev_attempts = int(existing_final.get("attempts", 0) or 0)
                prev_passed = bool(existing_final.get("passed", False))
                prev_high_score = int(existing_final.get("score", 0) or 0)

                existing_final = {
                    "score": max(prev_high_score, score_pct),
                    "passed": prev_passed or passed,
                    "attempts": prev_attempts + 1,
                    "validated": True,
                    "lastAttemptScore": score_pct,
                    "completedAt": datetime.utcnow().isoformat() if (passed or prev_passed) else None
                }
                processed_quiz_subs.add(str(sub_id))

    # 4. Monotonic Merge & Validation of Completed Items
    # Start with legitimate already-completed items from disk
    validated_completed_item_ids: Set[str] = set(existing_completed_items)

    # Consider newly claimed completions from incoming progress_data
    incoming_claims = set(progress_data.get("completedItemIds", []) or [])
    client_lesson_time = dict(progress_data.get("lessonTimeSpent", {}) or {})

    for item_id in incoming_claims:
        if item_id in validated_completed_item_ids:
            continue
        req = item_reqs.get(item_id)
        if not req and is_valid_item_for_course(course_id, item_id, course_def):
            req = {
                "type": "QUIZ" if "quiz" in str(item_id).lower() else ("ASSESSMENT" if ("final" in str(item_id).lower() or "fa" in str(item_id).lower()) else "READING"),
                "requiredDurationSeconds": DEFAULT_REQUIRED_DURATION_SECONDS,
                "required": True
            }
        if not req:
            continue

        item_type = req.get("type", "READING")
        if item_type == "QUIZ":
            q_res = existing_quiz_scores.get(item_id, {})
            if q_res.get("passed", False) and int(q_res.get("score", 0)) >= passing_score:
                validated_completed_item_ids.add(item_id)
        elif item_type in ("ASSESSMENT", "FINAL_ASSESSMENT"):
            if existing_final.get("passed", False) and int(existing_final.get("score", 0)) >= passing_score:
                validated_completed_item_ids.add(item_id)
        else:
            # Lesson item: requires required minimum dwell duration
            req_dur = int(req.get("requiredDurationSeconds", DEFAULT_REQUIRED_DURATION_SECONDS))
            actual_dwell = max(
                int(existing_lesson_time.get(item_id, 0)),
                int(client_lesson_time.get(item_id, 0))
            )
            if actual_dwell >= req_dur:
                validated_completed_item_ids.add(item_id)
                existing_lesson_time[item_id] = actual_dwell

    # 5. Server-Derived Module Gating & Certificate Eligibility
    modules = course_cat.get("modules", [])
    all_modules_passed = True

    for mod in modules:
        mod_item_ids = [it["id"] for it in mod.get("items", []) if it.get("required", True)]
        mod_complete = all(iid in validated_completed_item_ids for iid in mod_item_ids)
        if not mod_complete:
            all_modules_passed = False

    final_passed = bool(existing_final.get("passed", False)) and int(existing_final.get("score", 0)) >= passing_score
    completion_percentage = 0
    if total_required_items > 0:
        completion_percentage = min(100, int((len(validated_completed_item_ids) / total_required_items) * 100))

    certificate_eligible = bool(all_modules_passed and final_passed and (completion_percentage == 100))

    # Persist updated record
    record = {
        "userId": str(user_id),
        "courseId": str(course_id),
        "completedItemIds": sorted(list(validated_completed_item_ids)),
        "quizScores": existing_quiz_scores,
        "finalAssessment": existing_final,
        "lessonTimeSpent": existing_lesson_time,
        "lastAccessed": progress_data.get("lastAccessed") or existing_record.get("lastAccessed") or {},
        "totalRequiredItems": total_required_items,
        "completionPercentage": completion_percentage,
        "certificateEligible": certificate_eligible,
        "processedHeartbeatIds": sorted(list(processed_heartbeats))[-500:],
        "processedQuizSubmissionIds": sorted(list(processed_quiz_subs))[-500:],
        "updatedAt": datetime.utcnow().isoformat()
    }

    course_progress_db[key] = record
    _save_progress_to_disk()

    logger.info(
        "Saved progress for user=%s course=%s completion=%d%% certified=%s",
        user_id, course_id, completion_percentage, certificate_eligible
    )
    return record



def get_user_course_progress(user_id: str, course_id: str) -> Optional[Dict[str, Any]]:
    """Retrieves course progress for a user (persisted across restarts)."""
    key = f"{str(user_id).strip().lower()}_{str(course_id).strip().lower()}"
    return course_progress_db.get(key)


def validate_certificate_eligibility(user_id: str, course_id: str) -> Dict[str, Any]:
    """
    Backend-authoritative certificate eligibility verification endpoint.
    Derives completion, dwell requirements, quiz passes, and final exam results independently.
    """
    record = get_user_course_progress(user_id, course_id)
    if not record:
        return {"eligible": False, "reason": "No verified progress record found for this course.", "progress": None}

    completion = record.get("completionPercentage", 0)
    final = record.get("finalAssessment") or {}
    final_passed = bool(final.get("passed", False))
    final_score = int(final.get("score", 0) or 0)
    is_certified = bool(record.get("certificateEligible", False))

    if not is_certified:
        if completion < 100:
            reason = f"Course is only {completion}% complete. All lessons and checkpoint quizzes must be completed."
        elif not final_passed:
            reason = "Final comprehensive certification exam has not been passed yet."
        elif final_score < 70:
            reason = f"Final exam score ({final_score}%) is below the 70% passing threshold."
        else:
            reason = "Certificate requirements not fully met."
    else:
        reason = "All curriculum and certification requirements satisfied."

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
    """Returns all course progress records for a given user across all courses."""
    prefix = f"{str(user_id).strip().lower()}_"
    return [v for k, v in course_progress_db.items() if k.startswith(prefix)]
