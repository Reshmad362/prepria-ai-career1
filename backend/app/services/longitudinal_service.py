"""
PREPRIA Advanced Multi-Session Longitudinal Intelligence Service (Phase 9)
Provides deep, deterministic, evidence-backed longitudinal progression analysis
across multiple mock interview sessions, learning interventions, and recommendations.

Tracks:
1. Performance Trends & Score Deltas
2. Dimension-Level Progression (Technical, Problem Solving, Communication, Role Knowledge, Confidence)
3. Recurring, Persistent, and Resolved Weaknesses
4. Consistently Strong Skills & Evidence
5. Topic & Question Exposure History
6. Difficulty Progression
7. Learning Intervention Outcomes (Before vs. After)
8. Recommendation History Correlation
9. Conservative Evidence-Backed Mastery States per Topic
10. Multi-Role Context Separation
"""

import os
import json
import logging
from typing import List, Dict, Any, Optional
from datetime import datetime

from app.services.performance_tracker import get_user_interviews
from app.services.engagement_service import get_user_progress_summary, get_all_user_course_progress
from app.services.recommendation_service import get_user_recommendations
from app.services.course_catalog_service import COURSE_CATALOG, get_course_catalog_entry

logger = logging.getLogger(__name__)

# ─── Helper Functions ────────────────────────────────────────────────────────

def _parse_timestamp(ts: Any) -> datetime:
    if isinstance(ts, datetime):
        return ts
    if isinstance(ts, str) and ts.strip():
        try:
            return datetime.fromisoformat(ts.replace("Z", "+00:00"))
        except Exception:
            pass
    return datetime.min


def _extract_score(sess: Dict[str, Any]) -> int:
    raw = sess.get("overallScore")
    if raw is None:
        raw = sess.get("score", 0)
    if isinstance(raw, float) and 0 < raw <= 1.0:
        return int(round(raw * 100))
    return int(round(raw or 0))


# ─── Core Longitudinal Engine ────────────────────────────────────────────────

def get_user_longitudinal_profile(user_id: str, target_role_filter: Optional[str] = None) -> Dict[str, Any]:
    """
    Computes a comprehensive, deterministic multi-session longitudinal profile for a user
    using authentic historical data from interviews, learning progress, and recommendations.
    """
    email_clean = str(user_id or "").strip().lower()
    if not email_clean:
        return _build_empty_longitudinal_profile(email_clean, "No user ID provided.")

    # 1. Fetch user interview sessions (sorted chronologically: oldest to newest)
    raw_sessions = get_user_interviews(email_clean)
    
    # Filter by target role if requested and valid
    if target_role_filter and target_role_filter.strip():
        r_filter = target_role_filter.strip().lower()
        role_matched = [s for s in raw_sessions if r_filter in str(s.get("roleName") or s.get("role", "")).lower()]
        if role_matched:
            sessions = list(reversed(role_matched))
        else:
            sessions = list(reversed(raw_sessions))
    else:
        sessions = list(reversed(raw_sessions))

    # Filter sessions with valid evaluations/scores
    evaluated_sessions = [
        s for s in sessions 
        if (s.get("questionEvaluations") or s.get("overallScore") is not None or s.get("score") is not None or s.get("dimensions"))
    ]

    total_interviews = len(evaluated_sessions)

    # Fetch Learning Progress and Recommendations for Intervention Analysis
    learning_summary = get_user_progress_summary(email_clean)
    completed_course_ids = set(learning_summary.get("completed_course_ids", []))
    all_course_records = learning_summary.get("progress_records", [])

    user_recommendations = get_user_recommendations(email_clean)

    if total_interviews == 0:
        profile = _build_empty_longitudinal_profile(email_clean, "No completed interview sessions found.")
        profile["learningInterventions"] = _extract_learning_interventions(completed_course_ids, all_course_records)
        profile["recommendationHistory"] = user_recommendations
        return profile

    # ─── A. Score Trends & Overall Performance Metrics ──────────────────────
    scores = [_extract_score(s) for s in evaluated_sessions]
    latest_score = scores[-1]
    initial_score = scores[0]
    average_score = round(sum(scores) / len(scores), 1)
    highest_score = max(scores)
    score_delta = latest_score - initial_score
    pct_change = round(((latest_score - initial_score) / max(1, initial_score)) * 100, 1)

    if total_interviews < 2:
        trend = "insufficient_evidence"
    elif score_delta >= 5:
        trend = "improving"
    elif score_delta <= -5:
        trend = "declining"
    else:
        trend = "stable"

    # ─── B. Dimension Progression across Sessions ────────────────────────────
    dimension_names = ["technicalKnowledge", "problemSolving", "communication", "roleKnowledge", "confidence"]
    dimension_progression = {}

    for dim in dimension_names:
        seq = []
        for s in evaluated_sessions:
            dims = s.get("dimensions") or {}
            val = dims.get(dim)
            if val is None:
                # Fallback to session score if dimension not specifically set
                val = _extract_score(s)
            else:
                val = int(val * 100) if isinstance(val, float) and 0 < val <= 1.0 else int(val)
            seq.append(val)

        init_val = seq[0] if seq else 0
        lat_val = seq[-1] if seq else 0
        d_delta = lat_val - init_val

        d_trend = "improving" if d_delta >= 5 else ("declining" if d_delta <= -5 else "stable")
        dimension_progression[dim] = {
            "history": seq,
            "initial": init_val,
            "latest": lat_val,
            "delta": d_delta,
            "trend": d_trend if len(seq) >= 2 else "insufficient_evidence"
        }

    # ─── C. Topic & Question Exposure Tracking ────────────────────────────────
    topic_exposure: Dict[str, Dict[str, Any]] = {}
    question_exposure: Dict[str, Dict[str, Any]] = {}

    for idx, s in enumerate(evaluated_sessions):
        s_id = s.get("id", f"sess_{idx+1}")
        s_diff = str(s.get("difficulty", "medium")).lower()

        # Check questionEvaluations or user_answers
        q_evals = s.get("questionEvaluations") or []
        for qe in q_evals:
            topic = str(qe.get("topic") or "General").strip()
            q_score = qe.get("score", 0)
            q_text = str(qe.get("question") or qe.get("question_text") or "").strip()
            q_hash = qe.get("question_hash") or f"q_{hash(q_text) & 0xffffffff}"

            if topic and topic != "General":
                if topic not in topic_exposure:
                    topic_exposure[topic] = {
                        "topic": topic,
                        "timesTested": 0,
                        "sessionIds": [],
                        "scores": [],
                        "latestScore": 0,
                        "difficultiesEncountered": set()
                    }
                topic_exposure[topic]["timesTested"] += 1
                topic_exposure[topic]["sessionIds"].append(s_id)
                topic_exposure[topic]["scores"].append(q_score)
                topic_exposure[topic]["latestScore"] = q_score
                topic_exposure[topic]["difficultiesEncountered"].add(s_diff)

            if q_text:
                q_key = q_hash if q_hash else q_text.lower()[:30]
                if q_key not in question_exposure:
                    question_exposure[q_key] = {
                        "questionHash": q_hash,
                        "questionText": q_text,
                        "topic": topic,
                        "timesAsked": 0,
                        "sessionsAsked": [],
                        "latestScore": q_score
                    }
                question_exposure[q_key]["timesAsked"] += 1
                question_exposure[q_key]["sessionsAsked"].append(s_id)
                question_exposure[q_key]["latestScore"] = q_score

    # Convert sets in topic_exposure to lists for JSON serialization
    formatted_topic_exposure = []
    for t_key, t_data in topic_exposure.items():
        formatted_topic_exposure.append({
            "topic": t_data["topic"],
            "timesTested": t_data["timesTested"],
            "sessionIds": t_data["sessionIds"],
            "scores": t_data["scores"],
            "latestScore": t_data["latestScore"],
            "averageScore": round(sum(t_data["scores"]) / len(t_data["scores"]), 1),
            "difficultiesEncountered": sorted(list(t_data["difficultiesEncountered"]))
        })

    # ─── D. Weakness Classification (Recurring, Persistent, Resolved) ──────────
    topic_weakness_occurrences: Dict[str, List[Dict[str, Any]]] = {}

    for idx, s in enumerate(evaluated_sessions):
        s_id = s.get("id", f"sess_{idx+1}")
        s_date = s.get("completedAt") or s.get("timestamp") or ""
        
        eval_data = s.get("evaluation") or s.get("evaluation_results") or {}
        w_list = list(eval_data.get("weaknesses", [])) + list(s.get("weaknesses", []))
        
        # Add question-level weaknesses (< 65%)
        for qe in s.get("questionEvaluations", []):
            if qe.get("topic") and qe.get("topic") != "General" and qe.get("score", 100) < 65:
                w_list.append(qe["topic"])

        for w_item in set(w_list):
            w_str = str(w_item).strip()
            if not w_str:
                continue
            if w_str not in topic_weakness_occurrences:
                topic_weakness_occurrences[w_str] = []
            topic_weakness_occurrences[w_str].append({
                "sessionIndex": idx + 1,
                "sessionId": s_id,
                "timestamp": s_date
            })

    recurring_weaknesses = []
    persistent_weaknesses = []
    resolved_weaknesses = []
    consistent_strengths = []

    # Detect Weakness States and Resolution
    for topic, occurrences in topic_weakness_occurrences.items():
        occ_count = len(occurrences)
        topic_lower = topic.lower()

        # Check performance on this topic in later sessions
        latest_topic_perf = topic_exposure.get(topic, {}).get("latestScore")
        
        # Is topic resolved? (Topic was weak in earlier session, but latest score >= 75% or no longer flagged in last session)
        last_weak_idx = occurrences[-1]["sessionIndex"]
        is_latest_session = (last_weak_idx == total_interviews)

        if not is_latest_session and (latest_topic_perf is not None and latest_topic_perf >= 75):
            # Verified Resolution!
            earliest_idx = occurrences[0]["sessionIndex"]
            resolved_weaknesses.append({
                "topic": topic,
                "firstDetectedSession": earliest_idx,
                "resolvedInSession": total_interviews,
                "occurrenceCount": occ_count,
                "initialScore": topic_exposure.get(topic, {}).get("scores", [50])[0],
                "resolvedScore": latest_topic_perf,
                "status": "resolved",
                "evidence": [
                    f"Topic '{topic}' was flagged weak in Session {earliest_idx}",
                    f"Performance improved to {latest_topic_perf}% in Session {total_interviews}",
                    f"Weakness resolved based on subsequent mock interview performance evidence"
                ]
            })
        elif occ_count >= 2:
            # Recurring vs Persistent
            # Check if user completed a course or recommendation related to this topic
            has_intervention = any(
                c_id for c_id in completed_course_ids 
                if any(k in c_id for k in topic_lower.split())
            )
            
            if has_intervention and is_latest_session:
                persistent_weaknesses.append({
                    "topic": topic,
                    "firstDetectedSession": occurrences[0]["sessionIndex"],
                    "lastDetectedSession": last_weak_idx,
                    "occurrenceCount": occ_count,
                    "latestScore": latest_topic_perf or 55,
                    "status": "persistent",
                    "evidence": [
                        f"Weakness in '{topic}' persisted across {occ_count} sessions",
                        "Remains unresolved despite recorded learning intervention"
                    ]
                })
            else:
                recurring_weaknesses.append({
                    "topic": topic,
                    "firstDetectedSession": occurrences[0]["sessionIndex"],
                    "lastDetectedSession": last_weak_idx,
                    "occurrenceCount": occ_count,
                    "latestScore": latest_topic_perf or 60,
                    "status": "recurring",
                    "evidence": [
                        f"Identified as weakness in {occ_count} separate mock interview sessions",
                        f"First flagged in Session {occurrences[0]['sessionIndex']}"
                    ]
                })

    # Detect Consistent Strengths
    for t_item in formatted_topic_exposure:
        t_name = t_item["topic"]
        t_scores = t_item["scores"]
        if len(t_scores) >= 2 and all(s >= 75 for s in t_scores[-2:]):
            consistent_strengths.append({
                "topic": t_name,
                "timesTested": t_item["timesTested"],
                "averageScore": t_item["averageScore"],
                "latestScore": t_item["latestScore"],
                "status": "consistent",
                "evidence": [
                    f"Consistently strong based on available interview evidence ({t_item['latestScore']}% score)",
                    f"Maintained high performance across {t_item['timesTested']} evaluation sessions"
                ]
            })

    # ─── E. Difficulty Progression ─────────────────────────────────────────────
    difficulty_history = []
    for idx, s in enumerate(evaluated_sessions):
        difficulty_history.append({
            "sessionIndex": idx + 1,
            "sessionId": s.get("id"),
            "difficulty": s.get("difficulty", "medium"),
            "score": _extract_score(s),
            "completedAt": s.get("completedAt") or s.get("timestamp")
        })

    diff_levels = [d["difficulty"].lower() for d in difficulty_history]
    if len(diff_levels) >= 2:
        diff_order = {"easy": 1, "medium": 2, "hard": 3}
        first_d = diff_order.get(diff_levels[0], 2)
        last_d = diff_order.get(diff_levels[-1], 2)
        if last_d > first_d and scores[-1] >= 65:
            difficulty_progression = "progressed"
        elif last_d < first_d:
            difficulty_progression = "regressed"
        else:
            difficulty_progression = "maintained"
    else:
        difficulty_progression = "insufficient_evidence"

    # ─── F. Learning Interventions & Outcome Tracking ─────────────────────────
    interventions = _extract_learning_interventions(completed_course_ids, all_course_records)
    intervention_outcomes = []

    for interv in interventions:
        c_id = interv["courseId"]
        c_title = interv["title"]
        comp_date = interv.get("completedAt")

        # Map course to related topic using title/id/description keywords
        topic_match = None
        c_entry = get_course_catalog_entry(c_id)
        c_search_text = (c_id + " " + c_title + " " + c_entry.get("description", "") + " " + c_entry.get("category", "")).lower()

        abbrev_map = {
            "fe": ["frontend", "front"],
            "be": ["backend", "back"],
            "db": ["database", "sql"],
            "sql": ["database", "sql"],
            "js": ["javascript", "react", "node"],
            "ts": ["typescript"],
            "py": ["python", "fastapi", "django"],
            "devops": ["docker", "kubernetes", "cloud", "ci/cd"]
        }

        c_tokens = set(c_search_text.replace("-", " ").replace("_", " ").split())
        expanded_c_tokens = set(c_tokens)
        for tok in c_tokens:
            if tok in abbrev_map:
                expanded_c_tokens.update(abbrev_map[tok])

        for t_info in formatted_topic_exposure:
            t_name_lower = t_info["topic"].lower()
            t_words = [w for w in t_name_lower.replace("-", " ").split() if len(w) >= 2]
            
            # Direct keyword match or expanded token match
            if any(tw in c_search_text for tw in t_words if len(tw) >= 3):
                topic_match = t_info
                break
            if any(tw in expanded_c_tokens for tw in t_words):
                topic_match = t_info
                break
            if any(cw in t_name_lower for cw in expanded_c_tokens if len(cw) >= 3):
                topic_match = t_info
                break
            # Prefix check (e.g. fe -> frontend)
            if any(tw.startswith(cw) or cw.startswith(tw) for tw in t_words for cw in c_tokens if len(cw) >= 2):
                topic_match = t_info
                break

        if not topic_match and len(formatted_topic_exposure) == 1:
            topic_match = formatted_topic_exposure[0]

        if topic_match and len(evaluated_sessions) >= 2:
            scores_seq = topic_match["scores"]
            before_score = scores_seq[0] if len(scores_seq) > 1 else scores[0]
            after_score = topic_match["latestScore"]
            s_delta = after_score - before_score

            if s_delta >= 5:
                outcome_status = "improved"
                desc = f"Improvement was observed after completion of the learning intervention '{c_title}'."
            elif s_delta <= -5:
                outcome_status = "declining"
                desc = f"Performance declined slightly in subsequent session despite completing '{c_title}'."
            else:
                outcome_status = "unchanged"
                desc = f"Performance remained stable following '{c_title}'."

            intervention_outcomes.append({
                "interventionId": c_id,
                "courseTitle": c_title,
                "topic": topic_match["topic"],
                "beforeScore": before_score,
                "afterScore": after_score,
                "scoreDelta": s_delta,
                "outcome": outcome_status,
                "description": desc,
                "evidence": [
                    f"Baseline topic score before intervention was {before_score}%",
                    f"Subsequent mock interview topic score reached {after_score}%",
                    desc
                ]
            })

    # ─── G. Deterministic Mastery States per Topic ──────────────────────────────
    mastery_states = []
    all_known_topics = set(t["topic"] for t in formatted_topic_exposure)
    for r in recurring_weaknesses + persistent_weaknesses + resolved_weaknesses:
        all_known_topics.add(r["topic"])

    for topic in sorted(list(all_known_topics)):
        t_exp = topic_exposure.get(topic)
        is_persistent = any(p["topic"] == topic for p in persistent_weaknesses)
        is_resolved = any(r["topic"] == topic for r in resolved_weaknesses)
        is_consistent = any(s["topic"] == topic for s in consistent_strengths)

        if is_persistent:
            state = "unresolved"
        elif is_resolved:
            state = "improving"
        elif is_consistent:
            state = "strong" if (t_exp and t_exp["latestScore"] >= 85) else "consistent"
        elif t_exp and t_exp["timesTested"] >= 2:
            scores_l = t_exp["scores"]
            if scores_l[-1] - scores_l[0] >= 10:
                state = "improving"
            elif scores_l[-1] >= 75:
                state = "consistent"
            else:
                state = "developing"
        elif t_exp and t_exp["timesTested"] == 1:
            state = "developing"
        else:
            state = "insufficient_evidence"

        mastery_states.append({
            "topic": topic,
            "masteryState": state,
            "timesTested": t_exp["timesTested"] if t_exp else 0,
            "latestScore": t_exp["latestScore"] if t_exp else 0,
            "averageScore": round(sum(t_exp["scores"])/len(t_exp["scores"]), 1) if (t_exp and t_exp["scores"]) else 0
        })

    # ─── H. Multi-Role Context Separation ───────────────────────────────────────
    multi_role_context = []
    role_groups: Dict[str, List[Dict[str, Any]]] = {}
    for s in evaluated_sessions:
        r_name = str(s.get("roleName") or s.get("role") or "General Technical").strip()
        if r_name not in role_groups:
            role_groups[r_name] = []
        role_groups[r_name].append(s)

    for r_name, r_sess in role_groups.items():
        r_scores = [_extract_score(rs) for rs in r_sess]
        multi_role_context.append({
            "role": r_name,
            "interviewCount": len(r_sess),
            "latestScore": r_scores[-1],
            "averageScore": round(sum(r_scores) / len(r_scores), 1),
            "highestScore": max(r_scores)
        })

    # Build Final Snapshot
    now_iso = datetime.utcnow().isoformat()
    snapshot = {
        "userId": email_clean,
        "totalInterviews": total_interviews,
        "latestScore": latest_score,
        "initialScore": initial_score,
        "averageScore": average_score,
        "highestScore": highest_score,
        "scoreDelta": score_delta,
        "percentageChange": pct_change,
        "trend": trend,
        "dimensionProgression": dimension_progression,
        "strengths": consistent_strengths,
        "recurringWeaknesses": recurring_weaknesses,
        "persistentWeaknesses": persistent_weaknesses,
        "resolvedWeaknesses": resolved_weaknesses,
        "topicProgress": formatted_topic_exposure,
        "questionExposure": list(question_exposure.values()),
        "difficultyHistory": difficulty_history,
        "difficultyProgression": difficulty_progression,
        "learningInterventions": interventions,
        "interventionOutcomes": intervention_outcomes,
        "recommendationHistory": user_recommendations,
        "masteryStates": mastery_states,
        "multiRoleContext": multi_role_context,
        "updatedAt": now_iso
    }

    return snapshot


def _extract_learning_interventions(completed_ids: set, progress_records: list) -> List[Dict[str, Any]]:
    interventions = []
    for c_id in sorted(list(completed_ids)):
        cat_entry = get_course_catalog_entry(c_id)
        title = cat_entry.get("title", f"Course {c_id}")
        
        # Find completed date if record available
        comp_date = None
        for r in progress_records:
            if r.get("courseId") == c_id:
                comp_date = r.get("updatedAt")
                break

        interventions.append({
            "courseId": c_id,
            "title": title,
            "status": "completed",
            "completedAt": comp_date
        })
    return interventions


def _build_empty_longitudinal_profile(user_id: str, reason: str) -> Dict[str, Any]:
    return {
        "userId": user_id,
        "totalInterviews": 0,
        "latestScore": 0,
        "initialScore": 0,
        "averageScore": 0,
        "highestScore": 0,
        "scoreDelta": 0,
        "percentageChange": 0.0,
        "trend": "insufficient_evidence",
        "message": reason,
        "dimensionProgression": {
            "technicalKnowledge": {"history": [], "initial": 0, "latest": 0, "delta": 0, "trend": "insufficient_evidence"},
            "problemSolving": {"history": [], "initial": 0, "latest": 0, "delta": 0, "trend": "insufficient_evidence"},
            "communication": {"history": [], "initial": 0, "latest": 0, "delta": 0, "trend": "insufficient_evidence"},
            "roleKnowledge": {"history": [], "initial": 0, "latest": 0, "delta": 0, "trend": "insufficient_evidence"},
            "confidence": {"history": [], "initial": 0, "latest": 0, "delta": 0, "trend": "insufficient_evidence"}
        },
        "strengths": [],
        "recurringWeaknesses": [],
        "persistentWeaknesses": [],
        "resolvedWeaknesses": [],
        "topicProgress": [],
        "questionExposure": [],
        "difficultyHistory": [],
        "difficultyProgression": "insufficient_evidence",
        "learningInterventions": [],
        "interventionOutcomes": [],
        "recommendationHistory": [],
        "masteryStates": [],
        "multiRoleContext": [],
        "updatedAt": datetime.utcnow().isoformat()
    }


def get_longitudinal_topic_detail(user_id: str, topic_name: str) -> Dict[str, Any]:
    """Retrieves deep longitudinal history and mastery state for a specific topic."""
    profile = get_user_longitudinal_profile(user_id)
    topic_clean = topic_name.strip().lower()
    
    t_exposure = next((t for t in profile.get("topicProgress", []) if t["topic"].lower() == topic_clean), None)
    t_mastery = next((m for m in profile.get("masteryStates", []) if m["topic"].lower() == topic_clean), None)
    t_outcome = next((o for o in profile.get("interventionOutcomes", []) if o["topic"].lower() == topic_clean), None)

    if not t_exposure and not t_mastery:
        return {
            "userId": user_id,
            "topic": topic_name,
            "hasData": False,
            "masteryState": "insufficient_evidence",
            "message": f"No interview evaluation history found for topic '{topic_name}'."
        }

    return {
        "userId": user_id,
        "topic": topic_name,
        "hasData": True,
        "masteryState": t_mastery["masteryState"] if t_mastery else "insufficient_evidence",
        "exposure": t_exposure,
        "interventionOutcome": t_outcome,
        "history": t_exposure["scores"] if t_exposure else []
    }
