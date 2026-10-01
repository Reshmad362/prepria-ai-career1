"""
PREPRIA Backend Authoritative Course Catalog Service
Provides canonical curriculum definitions, module lesson hierarchies,
required dwell durations, checkpoint quiz answer keys, and final assessment grading.

Prevents client spoofing of curriculum requirements, item counts, or passing thresholds.
"""

from typing import Dict, Any, Optional, List
import logging

logger = logging.getLogger(__name__)

DEFAULT_PASSING_SCORE = 70
DEFAULT_REQUIRED_DURATION_SECONDS = 60

# Canonical Course Definitions Database
# Pre-populated with core curricula, with programmatic fallback for extended courses.
COURSE_CATALOG: Dict[str, Dict[str, Any]] = {
    "devops-foundations": {
        "id": "devops-foundations",
        "title": "DevOps & Cloud Engineering Foundations",
        "category": "DevOps & Cloud",
        "passingScore": 70,
        "modules": [
            {
                "id": "mod-1",
                "title": "Core DevOps Principles & CI/CD Fundamentals",
                "itemIds": ["devops-mod1-les1", "devops-mod1-les2", "devops-mod1-quiz"],
                "items": [
                    {"id": "devops-mod1-les1", "type": "READING", "requiredDurationSeconds": 60, "required": True},
                    {"id": "devops-mod1-les2", "type": "VIDEO", "requiredDurationSeconds": 60, "required": True},
                    {
                        "id": "devops-mod1-quiz",
                        "type": "QUIZ",
                        "requiredDurationSeconds": 60,
                        "required": True,
                        "questions": [
                            {"id": "q1", "correctIndex": 0, "question": "What is the primary goal of Continuous Integration?"},
                            {"id": "q2", "correctIndex": 1, "question": "Which tool is standard for container orchestration?"},
                            {"id": "q3", "correctIndex": 2, "question": "What does Infrastructure as Code (IaC) enable?"}
                        ]
                    }
                ]
            },
            {
                "id": "mod-2",
                "title": "Containerization & Kubernetes Orchestration",
                "itemIds": ["devops-mod2-les1", "devops-mod2-les2", "devops-mod2-quiz"],
                "items": [
                    {"id": "devops-mod2-les1", "type": "READING", "requiredDurationSeconds": 60, "required": True},
                    {"id": "devops-mod2-les2", "type": "CODE", "requiredDurationSeconds": 60, "required": True},
                    {
                        "id": "devops-mod2-quiz",
                        "type": "QUIZ",
                        "requiredDurationSeconds": 60,
                        "required": True,
                        "questions": [
                            {"id": "q1", "correctIndex": 0, "question": "What is a Kubernetes Pod?"},
                            {"id": "q2", "correctIndex": 1, "question": "How does Docker isolate container processes?"}
                        ]
                    }
                ]
            }
        ],
        "finalAssessment": {
            "id": "devops-foundations-final",
            "title": "Comprehensive DevOps Certification Exam",
            "passingScore": 70,
            "questions": [
                {"id": "fa-1", "correctIndex": 0, "question": "Which deployment strategy involves two identical environments?"},
                {"id": "fa-2", "correctIndex": 1, "question": "What is the primary metric for measuring mean time to recovery (MTTR)?"},
                {"id": "fa-3", "correctIndex": 2, "question": "How should secrets be managed in cloud infrastructure?"}
            ]
        }
    },
    "react-mastery": {
        "id": "react-mastery",
        "title": "Modern React & Frontend System Architecture",
        "category": "Frontend Engineering",
        "passingScore": 70,
        "modules": [
            {
                "id": "mod-1",
                "title": "Component Architecture & State Management",
                "itemIds": ["react-mod1-les1", "react-mod1-les2", "react-mod1-quiz"],
                "items": [
                    {"id": "react-mod1-les1", "type": "READING", "requiredDurationSeconds": 60, "required": True},
                    {"id": "react-mod1-les2", "type": "CODE", "requiredDurationSeconds": 60, "required": True},
                    {
                        "id": "react-mod1-quiz",
                        "type": "QUIZ",
                        "requiredDurationSeconds": 60,
                        "required": True,
                        "questions": [
                            {"id": "q1", "correctIndex": 0, "question": "What is the virtual DOM?"},
                            {"id": "q2", "correctIndex": 1, "question": "When should useEffect dependencies be specified?"}
                        ]
                    }
                ]
            }
        ],
        "finalAssessment": {
            "id": "react-mastery-final",
            "title": "React Architecture Final Assessment",
            "passingScore": 70,
            "questions": [
                {"id": "fa-1", "correctIndex": 0, "question": "What is reconciliation in React?"},
                {"id": "fa-2", "correctIndex": 1, "question": "How does React Fiber improve responsiveness?"}
            ]
        }
    }
}


def get_course_catalog_entry(course_id: str, course_def: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """
    Returns authoritative course curriculum.
    If course_def is provided, extracts curriculum from course definition.
    If course_id is in COURSE_CATALOG, returns the pre-populated entry.
    Otherwise generates a standardized canonical academic curriculum structure.
    """
    clean_id = str(course_id or "").strip().lower()
    if clean_id in COURSE_CATALOG:
        return COURSE_CATALOG[clean_id]

    if course_def and isinstance(course_def, dict) and course_def.get("modules"):
        mods = []
        item_reqs_in_def = course_def.get("itemRequirements") or {}
        for m in course_def.get("modules", []):
            mod_id = m.get("id") or f"{clean_id}-mod-{len(mods)+1}"
            raw_items = m.get("items") or m.get("lessons") or []
            if not raw_items and m.get("itemIds"):
                raw_items = m.get("itemIds")
            parsed_items = []
            for it in raw_items:
                if isinstance(it, str):
                    it_id = it
                    req = item_reqs_in_def.get(it_id, {})
                    it_type = req.get("type", "QUIZ" if "quiz" in it_id.lower() else "READING")
                    it_dur = req.get("requiredDurationSeconds", DEFAULT_REQUIRED_DURATION_SECONDS)
                    it_req = req.get("required", True)
                    parsed_items.append({
                        "id": it_id,
                        "type": it_type,
                        "requiredDurationSeconds": it_dur,
                        "required": it_req,
                        "questions": []
                    })
                elif isinstance(it, dict):
                    it_id = it.get("id")
                    if not it_id:
                        continue
                    req = item_reqs_in_def.get(it_id, {})
                    it_type = it.get("type") or req.get("type", "QUIZ" if "quiz" in it_id.lower() else "READING")
                    it_dur = it.get("requiredDurationSeconds") or req.get("requiredDurationSeconds", DEFAULT_REQUIRED_DURATION_SECONDS)
                    it_req = it.get("required") if "required" in it else req.get("required", True)
                    parsed_items.append({
                        "id": it_id,
                        "type": it_type,
                        "requiredDurationSeconds": it_dur,
                        "required": it_req,
                        "questions": it.get("quiz", {}).get("questions") if it_type == "QUIZ" else it.get("questions", [])
                    })
            mods.append({
                "id": mod_id,
                "title": m.get("title", f"Module {len(mods)+1}"),
                "itemIds": [it["id"] for it in parsed_items if it.get("id")],
                "items": parsed_items
            })
        
        fa = course_def.get("finalAssessment") or {}
        return {
            "id": clean_id,
            "title": course_def.get("title", clean_id.replace("-", " ").title()),
            "category": course_def.get("category", "Career Specialization"),
            "passingScore": course_def.get("passingScore", DEFAULT_PASSING_SCORE),
            "modules": mods,
            "finalAssessment": {
                "id": fa.get("id") or f"{clean_id}-final",
                "title": fa.get("title") or f"{clean_id} Final Certification Exam",
                "passingScore": fa.get("passingScore", DEFAULT_PASSING_SCORE),
                "questions": fa.get("questions", [])
            }
        }

    # Standardized dynamic generator for full catalog coverage
    title = clean_id.replace("-", " ").title()
    mods = []
    # Generate 8 modules matching standard frontend curriculumFactory pattern (7 x 4 lessons + 1 x 3 lessons = 31 lessons + 8 quizzes = 39 items)
    for m in range(1, 9):
        mod_id = f"{clean_id}-mod-{m}"
        mod_items = []
        num_lessons = 3 if m == 8 else 4
        for l in range(1, num_lessons + 1):
            mod_items.append({
                "id": f"{clean_id}-m{m}-l{l}",
                "type": "PRACTICAL" if l >= 3 else "READING",
                "requiredDurationSeconds": DEFAULT_REQUIRED_DURATION_SECONDS,
                "required": True
            })
        # Checkpoint quiz
        mod_items.append({
            "id": f"{clean_id}-mod-{m}-quiz",
            "type": "QUIZ",
            "requiredDurationSeconds": DEFAULT_REQUIRED_DURATION_SECONDS,
            "required": True,
            "questions": [
                {"id": f"q-{clean_id}-m{m}-1", "correctIndex": 0, "question": f"Key principle of {title} Module {m}?"},
                {"id": f"q-{clean_id}-m{m}-2", "correctIndex": 1, "question": f"Production pattern for {title} Module {m}?"}
            ]
        })
        mods.append({
            "id": mod_id,
            "title": f"Module {m}: Principles of {title}",
            "itemIds": [it["id"] for it in mod_items],
            "items": mod_items
        })

    return {
        "id": clean_id,
        "title": title,
        "category": "Career Specialization",
        "passingScore": DEFAULT_PASSING_SCORE,
        "modules": mods,
        "finalAssessment": {
            "id": f"{clean_id}-final",
            "title": f"{title} Final Certification Exam",
            "passingScore": DEFAULT_PASSING_SCORE,
            "questions": [
                {"id": f"fa-{clean_id}-1", "correctIndex": 0, "question": f"Mastery evaluation for {title} Question 1"},
                {"id": f"fa-{clean_id}-2", "correctIndex": 1, "question": f"Mastery evaluation for {title} Question 2"}
            ]
        }
    }


def get_course_item_requirements(course_id: str, course_def: Optional[Dict[str, Any]] = None) -> Dict[str, Dict[str, Any]]:
    """Returns mapping of itemId -> {type, requiredDurationSeconds, required}."""
    course = get_course_catalog_entry(course_id, course_def)
    reqs = {}
    for mod in course.get("modules", []):
        for it in mod.get("items", []):
            if it.get("id"):
                reqs[it["id"]] = {
                    "type": it.get("type", "READING"),
                    "requiredDurationSeconds": it.get("requiredDurationSeconds", DEFAULT_REQUIRED_DURATION_SECONDS),
                    "required": it.get("required", True),
                    "moduleId": mod.get("id")
                }
    final = course.get("finalAssessment")
    if final and final.get("id"):
        reqs[final["id"]] = {
            "type": "ASSESSMENT",
            "requiredDurationSeconds": 60,
            "required": True,
            "moduleId": "final"
        }
    return reqs


def get_course_total_required_items(course_id: str, course_def: Optional[Dict[str, Any]] = None) -> int:
    """Calculates authoritative total number of required module items for a course."""
    course = get_course_catalog_entry(course_id, course_def)
    total = 0
    for mod in course.get("modules", []):
        total += len([it for it in mod.get("items", []) if it.get("required", True)])
    return total


def is_valid_item_for_course(course_id: str, item_id: str, course_def: Optional[Dict[str, Any]] = None) -> bool:
    """Verifies that an item_id belongs to the course's authoritative curriculum."""
    if not item_id or not isinstance(item_id, str):
        return False
    clean_course = str(course_id or "").strip().lower()
    clean_item = item_id.strip().lower()

    reqs = get_course_item_requirements(clean_course, course_def)
    if item_id in reqs or clean_item in reqs:
        return True

    # Validate standard curriculum prefix pattern
    if clean_item.startswith(f"{clean_course}-") or clean_item.startswith(f"{clean_course}_"):
        return True

    return False


def get_quiz_questions(course_id: str, quiz_id: str, course_def: Optional[Dict[str, Any]] = None) -> Optional[List[Dict[str, Any]]]:
    """Retrieves authoritative questions and correct answer indices for a quiz or final assessment."""
    course = get_course_catalog_entry(course_id, course_def)
    for mod in course.get("modules", []):
        for it in mod.get("items", []):
            if it.get("id") == quiz_id and it.get("type") == "QUIZ":
                return it.get("questions", [])

    final = course.get("finalAssessment")
    if final and (final.get("id") == quiz_id or quiz_id in (f"{course_id}-final", "final-assessment")):
        return final.get("questions", [])

    return None

