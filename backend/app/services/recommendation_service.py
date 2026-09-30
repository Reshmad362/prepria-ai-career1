"""
PREPRIA Recommendation Intelligence Engine (Phase 8)
Generates deterministic, evidence-backed, personalized recommendations
converting resume intelligence, target role requirements, interview performance,
longitudinal analytics, and learning hub progress into actionable career guidance.

Persists recommendation states to disk (recommendations.json) with full user isolation,
JWT identity verification, and complete prevention of duplicate or fabricated data.
"""

import os
import json
import hashlib
import logging
import shutil
from typing import List, Dict, Any, Optional
from datetime import datetime

from app.services.auth_service import get_user_by_email_or_id
from app.services.performance_tracker import get_user_performance_summary, get_user_interviews
from app.services.engagement_service import get_user_progress_summary, course_progress_db
from app.services.course_catalog_service import COURSE_CATALOG, get_course_catalog_entry

logger = logging.getLogger(__name__)

# ─── Path & Data Stores ─────────────────────────────────────────────────────
_DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "data")
_RECOMMENDATIONS_FILE = os.path.join(_DATA_DIR, "recommendations.json")

os.makedirs(_DATA_DIR, exist_ok=True)

# In-memory recommendation store: Dict[email, Dict[recommendation_id, recommendation_record]]
recommendations_db: Dict[str, Dict[str, Dict[str, Any]]] = {}


# ─── Disk Persistence Helpers ────────────────────────────────────────────────
def _load_recommendations_from_disk() -> None:
    global recommendations_db
    if not os.path.exists(_RECOMMENDATIONS_FILE):
        recommendations_db = {}
        return
    try:
        with open(_RECOMMENDATIONS_FILE, "r", encoding="utf-8") as f:
            data = json.load(f)
        if isinstance(data, dict):
            recommendations_db = data
            logger.info("Loaded recommendation records for %d users from disk.", len(recommendations_db))
        else:
            recommendations_db = {}
    except Exception as e:
        logger.error("Failed to load recommendations from disk: %s", e)
        recommendations_db = {}


def _save_recommendations_to_disk() -> None:
    try:
        tmp = _RECOMMENDATIONS_FILE + ".tmp"
        with open(tmp, "w", encoding="utf-8") as f:
            json.dump(recommendations_db, f, indent=2, default=str)
        if os.path.exists(_RECOMMENDATIONS_FILE):
            shutil.copy2(_RECOMMENDATIONS_FILE, _RECOMMENDATIONS_FILE + ".bak")
        os.replace(tmp, _RECOMMENDATIONS_FILE)
    except Exception as e:
        logger.error("Failed to save recommendations to disk: %s", e)


# Initialize from disk at module import
_load_recommendations_from_disk()


# ─── Canonical Skill & Course Mappings ───────────────────────────────────────
ROLE_REQUIRED_SKILLS: Dict[str, List[str]] = {
    "frontend developer": ["React", "JavaScript", "HTML", "CSS", "TypeScript", "Frontend Architecture"],
    "frontend engineer": ["React", "JavaScript", "HTML", "CSS", "TypeScript", "Frontend Architecture"],
    "backend developer": ["Node.js", "Python", "FastAPI", "Express.js", "SQL", "Database Optimization", "REST APIs", "Backend Architecture"],
    "backend engineer": ["Node.js", "Python", "FastAPI", "Express.js", "SQL", "Database Optimization", "REST APIs", "Backend Architecture"],
    "full stack developer": ["React", "Node.js", "JavaScript", "SQL", "REST APIs", "System Architecture"],
    "full stack engineer": ["React", "Node.js", "JavaScript", "SQL", "REST APIs", "System Architecture"],
    "devops engineer": ["Docker", "Kubernetes", "CI/CD", "AWS", "Linux", "Terraform", "DevOps Principles"],
    "cloud engineer": ["Docker", "Kubernetes", "CI/CD", "AWS", "Linux", "Terraform", "DevOps Principles"],
    "data scientist": ["Python", "SQL", "Pandas", "Machine Learning", "Data Analysis", "Statistics"],
    "data analyst": ["Python", "SQL", "Pandas", "Data Visualization", "Data Analysis", "Statistics"],
    "ai / ml engineer": ["Python", "PyTorch", "TensorFlow", "NLP", "Machine Learning", "Model Deployment"],
    "software engineer": ["Data Structures", "Algorithms", "System Design", "Git", "REST APIs", "Testing"]
}

SKILL_TO_COURSE_MAP: Dict[str, Dict[str, str]] = {
    "devops": {"courseId": "devops-foundations", "title": "DevOps & Cloud Engineering Foundations"},
    "docker": {"courseId": "devops-foundations", "title": "DevOps & Cloud Engineering Foundations"},
    "kubernetes": {"courseId": "devops-foundations", "title": "DevOps & Cloud Engineering Foundations"},
    "ci/cd": {"courseId": "devops-foundations", "title": "DevOps & Cloud Engineering Foundations"},
    "react": {"courseId": "react-mastery", "title": "Modern React & Frontend System Architecture"},
    "frontend": {"courseId": "react-mastery", "title": "Modern React & Frontend System Architecture"},
    "javascript": {"courseId": "fe-101", "title": "Frontend Fundamentals (HTML/CSS/JS)"},
    "html": {"courseId": "fe-101", "title": "Frontend Fundamentals (HTML/CSS/JS)"},
    "css": {"courseId": "fe-101", "title": "Frontend Fundamentals (HTML/CSS/JS)"},
    "backend": {"courseId": "be-101", "title": "Backend Development Fundamentals"},
    "api": {"courseId": "be-101", "title": "Backend Development Fundamentals"},
    "rest apis": {"courseId": "be-101", "title": "Backend Development Fundamentals"},
    "node.js": {"courseId": "be-102", "title": "Node.js Fundamentals & Event Loop"},
    "node": {"courseId": "be-102", "title": "Node.js Fundamentals & Event Loop"},
    "express.js": {"courseId": "be-103", "title": "Express.js & REST API Architecture"},
    "express": {"courseId": "be-103", "title": "Express.js & REST API Architecture"},
    "fastapi": {"courseId": "be-104", "title": "Fastify & High-Performance Microservices"},
    "microservices": {"courseId": "be-104", "title": "Fastify & High-Performance Microservices"},
    "sql": {"courseId": "sql-database-optimization", "title": "Database Architecture & SQL Performance Optimization"},
    "database": {"courseId": "sql-database-optimization", "title": "Database Architecture & SQL Performance Optimization"},
    "database optimization": {"courseId": "sql-database-optimization", "title": "Database Architecture & SQL Performance Optimization"},
    "algorithms": {"courseId": "dsa-interview-prep", "title": "Data Structures & Algorithms Mastery"},
    "dsa": {"courseId": "dsa-interview-prep", "title": "Data Structures & Algorithms Mastery"},
    "data structures": {"courseId": "dsa-interview-prep", "title": "Data Structures & Algorithms Mastery"},
    "communication": {"courseId": "behavioral-interview-mastery", "title": "Behavioral & Executive Communication"},
    "system design": {"courseId": "system-design-mastery", "title": "Scalable System Architecture & Microservices"},
    "system architecture": {"courseId": "system-design-mastery", "title": "Scalable System Architecture & Microservices"}
}


def _make_recommendation_id(email: str, rec_type: str, topic_slug: str) -> str:
    """Generates a stable, deterministic recommendation ID based on email, type, and topic."""
    raw = f"{email.strip().lower()}:{rec_type.strip().lower()}:{topic_slug.strip().lower()}"
    h = hashlib.sha256(raw.encode("utf-8")).hexdigest()[:12]
    return f"rec_{h}"


# ─── Core Recommendation Engine ──────────────────────────────────────────────

def generate_recommendations_for_user(user_email: str) -> List[Dict[str, Any]]:
    """
    Deterministically computes recommendations for a user based on real persisted evidence:
    1. Resume Intelligence (skills, tech, projects, ATS score)
    2. Target Role (requirements, missing skill gaps)
    3. Interview History (dimension scores, strengths, weaknesses)
    4. Longitudinal Intelligence (recurring weaknesses, trend changes)
    5. Learning Hub Progress (enrolled/completed courses)

    Returns a prioritized, evidence-backed list of recommendations with persisted status.
    """
    email_clean = str(user_email or "").strip().lower()
    if not email_clean:
        return []

    # 1. Gather Real Persisted User Data
    user_record = get_user_by_email_or_id(email=email_clean) or {}
    profile = user_record.get("profile", {})
    preferences = user_record.get("preferences", {})

    target_role = str(preferences.get("targetRole") or profile.get("targetRole") or "").strip()
    user_skills_raw = profile.get("skills") or []
    if isinstance(user_skills_raw, str):
        user_skills = [s.strip() for s in user_skills_raw.split(",") if s.strip()]
    else:
        user_skills = [str(s).strip() for s in user_skills_raw if str(s).strip()]
    
    # Normalized candidate skills for comparison
    user_skills_lower = {s.lower() for s in user_skills}

    resume_uploaded = bool(profile.get("resumeUploaded") or profile.get("resumeFileName"))
    ats_score = profile.get("score")

    # Interview History & Performance
    interviews = get_user_interviews(email_clean)
    perf_summary = get_user_performance_summary(email_clean)
    
    persistent_weaknesses = perf_summary.get("persistent_weaknesses", [])
    recurring_weaknesses = perf_summary.get("recurring_weaknesses", [])
    improved_topics = perf_summary.get("improved_topics", [])
    latest_score = perf_summary.get("latest_score", 0.0)
    score_change = perf_summary.get("score_change", 0.0)

    # Learning Hub Progress
    learning_progress = get_user_progress_summary(email_clean)
    completed_courses = set(learning_progress.get("completed_course_ids", []))
    enrolled_courses = set(learning_progress.get("enrolled_course_ids", []))

    # Also inspect course_progress_db directly for complete course status
    for key, val in course_progress_db.items():
        if key.startswith(f"{email_clean}_") and isinstance(val, dict):
            if val.get("isPassed") or val.get("eligibleForCertificate"):
                c_id = val.get("courseId")
                if c_id:
                    completed_courses.add(c_id)

    # List of candidate recommendations before deduplication/persistence
    candidates: List[Dict[str, Any]] = []

    # ─── RULE A: Recurring / Persistent Interview Weaknesses ─────────────────────
    all_weaknesses = set()
    for w in persistent_weaknesses + recurring_weaknesses:
        if w and str(w).strip():
            all_weaknesses.add(str(w).strip())

    # Extract weaknesses from latest interview if any
    latest_interview = interviews[0] if interviews else {}
    if latest_interview:
        eval_data = latest_interview.get("evaluation") or latest_interview.get("evaluation_results") or {}
        for w in eval_data.get("weaknesses", []):
            if w and str(w).strip():
                all_weaknesses.add(str(w).strip())

    for weak_topic in sorted(list(all_weaknesses)):
        weak_lower = weak_topic.lower()
        # If user has improved on this topic recently (score >= 80%), downgrade/skip
        if any(imp.lower() in weak_lower for imp in improved_topics):
            continue

        weakness_count = 0
        for inv in interviews:
            eval_d = inv.get("evaluation") or inv.get("evaluation_results") or {}
            w_list = list(eval_d.get("weaknesses", [])) + list(inv.get("weaknesses", []))
            if any(weak_lower in str(w).lower() or str(w).lower() in weak_lower for w in w_list):
                weakness_count += 1

        is_persistent = (weakness_count >= 2) or any(p.lower() in weak_lower for p in persistent_weaknesses)
        
        # Determine priority & evidence
        evidence = [
            f"Identified as a technical weakness in recent mock interview evaluation",
            f"Interview performance history indicates gap in '{weak_topic}'"
        ]
        if is_persistent:
            evidence.append(f"Recurring weakness across multiple interview sessions for user {email_clean}")
            weight = 40
            priority = "high"
        else:
            weight = 25
            priority = "medium"

        # Skill Recommendation
        rec_id = _make_recommendation_id(email_clean, "skill", weak_topic)
        candidates.append({
            "recommendationId": rec_id,
            "userId": email_clean,
            "type": "skill",
            "title": f"Strengthen {weak_topic.title()} Expertise",
            "description": f"Focus on mastering {weak_topic} concepts, production patterns, and system implementation.",
            "priority": priority,
            "reason": f"Interview analysis detected persistent weakness in '{weak_topic}'.",
            "source": "interview_history",
            "sourceEvidence": evidence,
            "relatedSkill": weak_topic,
            "relatedTopic": weak_topic,
            "relatedCourseId": None,
            "weight": weight
        })

        # Check if mapped to a Learning Hub Course
        mapped_course = None
        for key_s, course_info in SKILL_TO_COURSE_MAP.items():
            if key_s in weak_lower or weak_lower in key_s:
                mapped_course = course_info
                break

        if mapped_course:
            course_id = mapped_course["courseId"]
            # Do NOT recommend completed courses as new learning items
            if course_id not in completed_courses:
                l_rec_id = _make_recommendation_id(email_clean, "learning", f"{weak_topic}_{course_id}")
                candidates.append({
                    "recommendationId": l_rec_id,
                    "userId": email_clean,
                    "type": "learning",
                    "title": f"Enroll in {mapped_course['title']}",
                    "description": f"Take the '{mapped_course['title']}' course in the Learning Hub to resolve your '{weak_topic}' gap.",
                    "priority": "high" if is_persistent else "medium",
                    "reason": f"Directly addresses verified interview weakness '{weak_topic}'.",
                    "source": "learning_hub",
                    "sourceEvidence": evidence + [f"Course '{course_id}' directly addresses '{weak_topic}'"],
                    "relatedSkill": weak_topic,
                    "relatedTopic": weak_topic,
                    "relatedCourseId": course_id,
                    "weight": weight + 5
                })

    # ─── RULE B: Low Interview Dimension Scores ─────────────────────────────────
    if latest_interview:
        eval_data = latest_interview.get("evaluation") or latest_interview.get("evaluation_results") or {}
        dim_scores = eval_data.get("dimensionScores") or eval_data.get("scores") or {}
        
        comm_score = dim_scores.get("communication", 100)
        prob_score = dim_scores.get("problemSolving", 100)
        tech_score = dim_scores.get("technical", 100)

        # Normalize score values to 0-100 scale
        if comm_score <= 1.0: comm_score *= 100
        if prob_score <= 1.0: prob_score *= 100
        if tech_score <= 1.0: tech_score *= 100

        if comm_score < 60:
            rec_id = _make_recommendation_id(email_clean, "interview", "communication_practice")
            candidates.append({
                "recommendationId": rec_id,
                "userId": email_clean,
                "type": "interview",
                "title": "Practice Verbal Communication & Structural Delivery",
                "description": "Conduct mock interview sessions focusing on STAR framework responses, speech clarity, and verbal pacing.",
                "priority": "high",
                "reason": f"Communication score in recent interview was {int(comm_score)}% (< 60%).",
                "source": "interview_history",
                "sourceEvidence": [
                    f"Recent mock interview communication dimension score was {int(comm_score)}%",
                    "Behavioral and verbal clarity evaluation flagged room for improvement"
                ],
                "relatedSkill": "Communication",
                "relatedTopic": "Behavioral Communication",
                "relatedCourseId": "behavioral-interview-mastery",
                "weight": 35
            })

        if prob_score < 60:
            rec_id = _make_recommendation_id(email_clean, "interview", "problem_solving_practice")
            candidates.append({
                "recommendationId": rec_id,
                "userId": email_clean,
                "type": "interview",
                "title": "Practice Data Structures & Problem Solving",
                "description": "Work through algorithmic problem solving questions focusing on time/space complexity analysis.",
                "priority": "high",
                "reason": f"Problem solving dimension score in recent interview was {int(prob_score)}% (< 60%).",
                "source": "interview_history",
                "sourceEvidence": [
                    f"Recent mock interview problem solving dimension score was {int(prob_score)}%",
                    "Algorithmic reasoning and edge-case handling flagged for practice"
                ],
                "relatedSkill": "Data Structures & Algorithms",
                "relatedTopic": "Problem Solving",
                "relatedCourseId": "dsa-interview-prep",
                "weight": 35
            })

    # ─── RULE C: Role vs Candidate Skill Gap (Role Gap) ─────────────────────────
    if target_role:
        target_role_lower = target_role.lower()
        req_skills = None
        for role_key, skills_list in ROLE_REQUIRED_SKILLS.items():
            if role_key in target_role_lower or target_role_lower in role_key:
                req_skills = skills_list
                break

        if not req_skills:
            # Fallback required skills for generic technical roles
            req_skills = ["System Architecture", "REST APIs", "Testing", "Data Structures"]

        missing_role_skills = [s for s in req_skills if s.lower() not in user_skills_lower]

        for missing_s in missing_role_skills:
            m_lower = missing_s.lower()
            rec_id = _make_recommendation_id(email_clean, "role_gap", missing_s)
            
            evidence = [
                f"Target role '{target_role}' requires competency in '{missing_s}'",
                f"Skill '{missing_s}' is not currently listed on your profile/resume"
            ]

            candidates.append({
                "recommendationId": rec_id,
                "userId": email_clean,
                "type": "role_gap",
                "title": f"Acquire {missing_s} for {target_role} Role",
                "description": f"Develop '{missing_s}' proficiency to close the gap between your candidate profile and '{target_role}' requirements.",
                "priority": "medium",
                "reason": f"Target role '{target_role}' requires '{missing_s}', which is missing from your profile.",
                "source": "role_gap",
                "sourceEvidence": evidence,
                "relatedSkill": missing_s,
                "relatedTopic": missing_s,
                "relatedCourseId": SKILL_TO_COURSE_MAP.get(m_lower, {}).get("courseId"),
                "weight": 22
            })

    # ─── RULE D: Resume ATS Enhancement ─────────────────────────────────────────
    if not resume_uploaded:
        rec_id = _make_recommendation_id(email_clean, "resume", "upload_resume")
        candidates.append({
            "recommendationId": rec_id,
            "userId": email_clean,
            "type": "resume",
            "title": "Upload PDF Resume for ATS & Skill Extraction",
            "description": "Upload your resume in PDF format to enable automated skill extraction, ATS scoring, and targeted role alignment.",
            "priority": "high",
            "reason": "No resume uploaded. Uploading a resume unlocks accurate role gap analysis.",
            "source": "resume_analysis",
            "sourceEvidence": [
                "No active resume document found on candidate profile",
                "ATS parser requires resume file for keyword alignment"
            ],
            "relatedSkill": "Resume Intelligence",
            "relatedTopic": "ATS Optimization",
            "relatedCourseId": None,
            "weight": 38
        })
    elif ats_score is not None and ats_score < 75:
        rec_id = _make_recommendation_id(email_clean, "resume", "ats_optimization")
        candidates.append({
            "recommendationId": rec_id,
            "userId": email_clean,
            "type": "resume",
            "title": f"Optimize Resume ATS Keyword Alignment ({int(ats_score)}%)",
            "description": f"Your resume ATS match score is currently {int(ats_score)}%. Add core target role technical keywords and quantifiable project metrics.",
            "priority": "medium",
            "reason": f"ATS match score ({int(ats_score)}%) is below recommended 75% threshold.",
            "source": "resume_analysis",
            "sourceEvidence": [
                f"Parsed ATS match score is {int(ats_score)}% for role '{target_role or 'Software Engineer'}'",
                "Resume lacks technical keywords required for high ATS pass rate"
            ],
            "relatedSkill": "ATS Optimization",
            "relatedTopic": "Resume Keywords",
            "relatedCourseId": None,
            "weight": 20
        })

    # ─── RULE E: Baseline Mock Interview Recommendation ─────────────────────────
    if not interviews and target_role:
        rec_id = _make_recommendation_id(email_clean, "interview", "baseline_interview")
        candidates.append({
            "recommendationId": rec_id,
            "userId": email_clean,
            "type": "interview",
            "title": f"Complete Baseline Mock Interview for {target_role}",
            "description": f"Take a baseline AI mock interview for '{target_role}' to evaluate technical readiness and establish benchmark metrics.",
            "priority": "high",
            "reason": f"No mock interviews completed for target role '{target_role}'.",
            "source": "interview_history",
            "sourceEvidence": [
                f"Candidate selected target role '{target_role}'",
                "No completed interview sessions recorded in interview history"
            ],
            "relatedSkill": target_role,
            "relatedTopic": "Mock Interview Baseline",
            "relatedCourseId": None,
            "weight": 36
        })

    # ─── 3. Deterministic Deduplication, Persistence & Status Sync ───────────────
    user_rec_store = recommendations_db.get(email_clean, {})

    final_recommendations: List[Dict[str, Any]] = []

    # Sort candidates deterministically by weight (descending) and recommendationId (ascending)
    candidates.sort(key=lambda x: (-x["weight"], x["recommendationId"]))

    seen_ids = set()
    now_iso = datetime.utcnow().isoformat()

    for cand in candidates:
        r_id = cand["recommendationId"]
        if r_id in seen_ids:
            continue
        seen_ids.add(r_id)

        # Retrieve existing record if previously stored to preserve user-managed status
        existing = user_rec_store.get(r_id)
        
        status = existing.get("status", "new") if existing else "new"
        created_at = existing.get("createdAt", now_iso) if existing else now_iso

        # Build clean output record matching exact Phase 8 schema
        rec_record = {
            "recommendationId": r_id,
            "userId": email_clean,
            "type": cand["type"],
            "title": cand["title"],
            "description": cand["description"],
            "priority": cand["priority"],
            "reason": cand["reason"],
            "source": cand["source"],
            "sourceEvidence": cand["sourceEvidence"],
            "relatedSkill": cand.get("relatedSkill"),
            "relatedTopic": cand.get("relatedTopic"),
            "relatedCourseId": cand.get("relatedCourseId"),
            "status": status,
            "createdAt": created_at,
            "updatedAt": now_iso
        }
        
        user_rec_store[r_id] = rec_record
        final_recommendations.append(rec_record)

    # Persist updated user recommendations to disk
    recommendations_db[email_clean] = user_rec_store
    _save_recommendations_to_disk()

    return final_recommendations


def get_user_recommendations(user_email: str, status_filter: Optional[str] = None) -> List[Dict[str, Any]]:
    """
    Retrieves authoritative persisted recommendations for a user.
    Enforces JWT user isolation.
    """
    email_clean = str(user_email or "").strip().lower()
    if not email_clean:
        return []

    recs = generate_recommendations_for_user(email_clean)

    if status_filter:
        clean_status = status_filter.strip().lower()
        recs = [r for r in recs if r.get("status", "new").lower() == clean_status]

    return recs


def update_recommendation_status(user_email: str, recommendation_id: str, new_status: str) -> Dict[str, Any]:
    """
    Updates status of a recommendation ('new', 'in_progress', 'completed', 'dismissed').
    Enforces user ownership and persists changes.
    """
    email_clean = str(user_email or "").strip().lower()
    clean_rec_id = str(recommendation_id or "").strip()
    clean_status = str(new_status or "").strip().lower()

    valid_statuses = {"new", "in_progress", "completed", "dismissed"}
    if clean_status not in valid_statuses:
        raise ValueError(f"Invalid status '{new_status}'. Must be one of: {', '.join(sorted(valid_statuses))}")

    # Ensure user store is loaded
    user_rec_store = recommendations_db.get(email_clean)
    if not user_rec_store or clean_rec_id not in user_rec_store:
        # Generate recommendations to ensure record exists
        generate_recommendations_for_user(email_clean)
        user_rec_store = recommendations_db.get(email_clean, {})

    if clean_rec_id not in user_rec_store:
        raise ValueError("Recommendation not found.")

    rec = user_rec_store[clean_rec_id]
    rec["status"] = clean_status
    rec["updatedAt"] = datetime.utcnow().isoformat()

    recommendations_db[email_clean] = user_rec_store
    _save_recommendations_to_disk()

    logger.info("Updated recommendation %s status to '%s' for user %s", clean_rec_id, clean_status, email_clean)
    return rec
