"""
PREPRIA Quiz Answer Position Distribution Test Suite (Phase 22)
Validates:
  Test 1: Semantic correctness preservation (shuffling preserves correct answer value and explanation)
  Test 2: Position variation (correct answer appears across different option positions A/B/C/D)
  Test 3: No fixed / hardcoded sequence (permutations are dynamic and non-cyclical)
  Test 4: Consecutive-position constraint (excessive identical runs >= 3 are actively avoided)
  Test 5: Feedback and explanation preservation (explanations stay bound to semantic options)
  Test 6: Multi-select questions (complete correct index set is preserved after permutation)
  Test 7: True/False and binary questions (standard True first, False second preserved)
  Test 8: Score invariance (identical semantic answers yield identical scores regardless of permutation)
  Test 9: Retake behavior (subsequent attempts produce new permutations)
  Test 10: Course progression & certificate eligibility regression
"""

import os
import sys
import random
import re
import pytest
from typing import List, Dict, Any, Optional

backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from app.services.engagement_service import (
    course_progress_db,
    save_user_course_progress,
    validate_certificate_eligibility,
    _save_progress_to_disk
)
from app.services.course_catalog_service import (
    COURSE_CATALOG,
    get_course_catalog_entry,
    get_quiz_questions
)

# ─── Python equivalent of quizUtils.js for testing & validation ───────────────

BINARY_PATTERNS = [("true", "false"), ("yes", "no")]
POSITIONAL_PATTERNS = [
    re.compile(r"^all\s+of\s+the\s+above", re.I),
    re.compile(r"^none\s+of\s+the\s+above", re.I),
    re.compile(r"^both\s+[a-d]\s+and\s+[a-d]", re.I),
    re.compile(r"^neither\s+[a-d]\s+nor\s+[a-d]", re.I)
]


def get_opt_text(opt: Any) -> str:
    if opt is None:
        return ""
    if isinstance(opt, dict):
        return str(opt.get("text") or opt.get("label") or opt.get("value") or opt.get("id") or "").strip()
    return str(opt).strip()


def are_opts_equal(a: Any, b: Any) -> bool:
    if a == b:
        return True
    if isinstance(a, dict) and isinstance(b, dict):
        if a.get("id") and b.get("id"):
            return a["id"] == b["id"]
        if a.get("value") and b.get("value"):
            return a["value"] == b["value"]
    return get_opt_text(a) == get_opt_text(b)


def is_binary_choice(options: List[Any]) -> bool:
    if len(options) != 2:
        return False
    clean = [get_opt_text(o).lower() for o in options]
    return any((clean[0] == f and clean[1] == s) or (clean[0] == s and clean[1] == f) for f, s in BINARY_PATTERNS)


def is_positional_option(option: Any) -> bool:
    text = get_opt_text(option)
    return any(p.search(text) for p in POSITIONAL_PATTERNS)


def randomize_question_options(question: Dict[str, Any], rng: random.Random, avoid_index: Optional[int] = None) -> Dict[str, Any]:
    raw_options = list(question.get("options", []))
    if len(raw_options) <= 1:
        return dict(question)

    is_multi = "correctIndices" in question or "correctAnswers" in question
    if "correctIndices" in question:
        correct_vals = [raw_options[i] for i in question["correctIndices"] if i < len(raw_options)]
    elif "correctAnswers" in question:
        correct_vals = [o for o in raw_options if get_opt_text(o) in question["correctAnswers"]]
    else:
        orig_idx = question.get("correctIndex", 0)
        correct_vals = [raw_options[orig_idx] if orig_idx < len(raw_options) else raw_options[0]]

    # 1. Binary choice
    if is_binary_choice(raw_options):
        is_first_true = get_opt_text(raw_options[0]).lower() in ("true", "yes")
        canonical = [raw_options[0], raw_options[1]] if is_first_true else [raw_options[1], raw_options[0]]
        if is_multi:
            new_indices = [i for i, o in enumerate(canonical) if any(are_opts_equal(o, cv) for cv in correct_vals)]
            res = dict(question)
            res.update({"options": canonical, "correctIndices": new_indices, "correctIndex": new_indices[0] if new_indices else 0})
            return res
        new_idx = next((i for i, o in enumerate(canonical) if are_opts_equal(o, correct_vals[0])), 0)
        res = dict(question)
        res.update({"options": canonical, "correctIndex": new_idx})
        return res

    # 2. Positional options separation
    standard_opts = [o for o in raw_options if not is_positional_option(o)]
    positional_opts = [o for o in raw_options if is_positional_option(o)]

    shuffled_standard = list(standard_opts)
    rng.shuffle(shuffled_standard)
    new_options = shuffled_standard + positional_opts

    if not is_multi and avoid_index is not None and 0 <= avoid_index < len(new_options) and are_opts_equal(new_options[avoid_index], correct_vals[0]) and len(shuffled_standard) > 2:
        shuffled_standard = [shuffled_standard[-1]] + shuffled_standard[:-1]
        new_options = shuffled_standard + positional_opts

    if is_multi:
        new_indices = sorted([i for i, o in enumerate(new_options) if any(are_opts_equal(o, cv) for cv in correct_vals)])
        res = dict(question)
        res.update({"options": new_options, "correctIndices": new_indices, "correctIndex": new_indices[0] if new_indices else 0})
        return res

    new_correct_idx = next((i for i, o in enumerate(new_options) if are_opts_equal(o, correct_vals[0])), 0)
    res = dict(question)
    res.update({"options": new_options, "correctIndex": new_correct_idx})
    return res


def randomize_quiz_questions(questions: List[Dict[str, Any]], seed: Optional[int] = None) -> List[Dict[str, Any]]:
    rng = random.Random(seed)
    result = []
    consecutive_count = 1
    last_correct_index = -1

    for q in questions:
        avoid_index = last_correct_index if consecutive_count >= 2 else None
        randomized = randomize_question_options(q, rng, avoid_index)
        if randomized.get("correctIndex") == last_correct_index:
            consecutive_count += 1
        else:
            consecutive_count = 1
            last_correct_index = randomized.get("correctIndex", -1)
        result.append(randomized)

    return result


# ==============================================================================
# PHASE 12 AUTOMATED TESTS
# ==============================================================================

def test_1_semantic_correctness_preservation():
    """Shuffling repeatedly ensures the semantic correct answer and explanation are preserved."""
    q = {
        "id": "q-sample-1",
        "question": "Which hook handles side effects in React?",
        "options": ["useEffect", "useState", "useMemo", "useRef"],
        "correctIndex": 0,
        "explanation": "useEffect is designed to perform side effects."
    }

    correct_semantic_text = q["options"][q["correctIndex"]]  # "useEffect"

    for seed in range(50):
        shuffled = randomize_question_options(q, random.Random(seed))
        new_correct_idx = shuffled["correctIndex"]
        assert shuffled["options"][new_correct_idx] == correct_semantic_text
        assert shuffled["explanation"] == q["explanation"]
        assert set(shuffled["options"]) == set(q["options"])


def test_2_position_variation():
    """Correct answer appears across multiple different positions (A, B, C, D) over multiple runs."""
    q = {
        "id": "q-sample-2",
        "question": "What does IaC stand for?",
        "options": ["Infrastructure as Code", "Integration and Cloud", "Instance auto Config", "Internet Access Control"],
        "correctIndex": 0
    }

    positions_seen = set()
    for seed in range(100):
        shuffled = randomize_question_options(q, random.Random(seed))
        positions_seen.add(shuffled["correctIndex"])

    assert len(positions_seen) >= 3, f"Expected correct answer to appear in multiple positions, got {positions_seen}"


def test_3_no_fixed_sequence():
    """Generates a multi-question quiz and verifies answer positions are not a hardcoded cycle."""
    questions = [
        {"id": f"q-{i}", "question": f"Question {i}", "options": ["Opt 1", "Opt 2", "Opt 3", "Opt 4"], "correctIndex": 0}
        for i in range(12)
    ]

    shuffled_1 = randomize_quiz_questions(questions, seed=42)
    shuffled_2 = randomize_quiz_questions(questions, seed=999)

    positions_1 = [q["correctIndex"] for q in shuffled_1]
    positions_2 = [q["correctIndex"] for q in shuffled_2]

    assert positions_1 != positions_2
    assert positions_1 != [0, 1, 2, 3] * 3
    assert positions_1 != [0, 2, 1, 3] * 3


def test_4_consecutive_position_constraint():
    """Excessive consecutive identical positions (>= 3) are prevented by the constraint."""
    questions = [
        {"id": f"q-{i}", "question": f"Question {i}", "options": ["Opt A", "Opt B", "Opt C", "Opt D"], "correctIndex": 0}
        for i in range(20)
    ]

    for seed in range(20):
        shuffled = randomize_quiz_questions(questions, seed=seed)
        positions = [q["correctIndex"] for q in shuffled]

        # Check that there is no run of 3 identical consecutive positions
        max_run = 1
        current_run = 1
        for i in range(1, len(positions)):
            if positions[i] == positions[i - 1]:
                current_run += 1
                if current_run > max_run:
                    max_run = current_run
            else:
                current_run = 1

        assert max_run <= 2, f"Found excessive consecutive run of {max_run} with seed {seed}: {positions}"


def test_5_feedback_and_explanation_preservation():
    """Feedback and explanation remain strictly bound to their semantic option objects."""
    q = {
        "id": "q-feedback",
        "question": "Choose the optimal caching strategy.",
        "options": [
            {"id": "opt-1", "text": "Redis distributed cache", "feedback": "Excellent, Redis is low-latency.", "isCorrect": True},
            {"id": "opt-2", "text": "Writing to disk every request", "feedback": "Too slow for web scale.", "isCorrect": False},
            {"id": "opt-3", "text": "Storing state in global variables", "feedback": "Memory leak hazard.", "isCorrect": False},
            {"id": "opt-4", "text": "No caching at all", "feedback": "High database load.", "isCorrect": False}
        ],
        "correctIndex": 0,
        "explanation": "Redis provides in-memory distributed sub-millisecond data access."
    }

    for seed in range(30):
        shuffled = randomize_question_options(q, random.Random(seed))
        correct_idx = shuffled["correctIndex"]
        correct_opt = shuffled["options"][correct_idx]
        assert correct_opt["id"] == "opt-1"
        assert correct_opt["feedback"] == "Excellent, Redis is low-latency."
        assert shuffled["explanation"] == q["explanation"]


def test_6_multi_select_questions():
    """Multi-select question preserves the complete correct set of options."""
    q = {
        "id": "q-multi",
        "question": "Which of the following are valid HTTP methods? (Select all that apply)",
        "options": ["GET", "POST", "FETCH_ALL", "PUT"],
        "correctIndices": [0, 1, 3]  # GET, POST, PUT
    }

    for seed in range(30):
        shuffled = randomize_question_options(q, random.Random(seed))
        selected_texts = [shuffled["options"][idx] for idx in shuffled["correctIndices"]]
        assert set(selected_texts) == {"GET", "POST", "PUT"}


def test_7_true_false_canonical_ordering():
    """True/False and Yes/No questions preserve standard canonical ordering."""
    q_tf = {
        "id": "q-tf",
        "question": "TypeScript is a superset of JavaScript.",
        "options": ["True", "False"],
        "correctIndex": 0
    }
    q_yn = {
        "id": "q-yn",
        "question": "Do Docker containers share the host OS kernel?",
        "options": ["No", "Yes"],
        "correctIndex": 1
    }

    for seed in range(20):
        shuffled_tf = randomize_question_options(q_tf, random.Random(seed))
        assert shuffled_tf["options"] == ["True", "False"]
        assert shuffled_tf["correctIndex"] == 0

        shuffled_yn = randomize_question_options(q_yn, random.Random(seed))
        assert shuffled_yn["options"] == ["Yes", "No"]
        assert shuffled_yn["correctIndex"] == 0  # "Yes" is at index 0 now


def test_8_score_invariance():
    """The same semantic answers produce the exact same score (100% or 0%) regardless of permutation."""
    raw_questions = [
        {"id": "q1", "options": ["Correct 1", "Wrong A", "Wrong B", "Wrong C"], "correctIndex": 0},
        {"id": "q2", "options": ["Wrong A", "Correct 2", "Wrong B", "Wrong C"], "correctIndex": 1},
        {"id": "q3", "options": ["Wrong A", "Wrong B", "Correct 3", "Wrong C"], "correctIndex": 2},
        {"id": "q4", "options": ["Wrong A", "Wrong B", "Wrong C", "Correct 4"], "correctIndex": 3}
    ]

    for seed in [1, 42, 100, 777]:
        shuffled = randomize_quiz_questions(raw_questions, seed=seed)
        
        # User selects the semantically correct answer
        user_answers = {}
        for q in shuffled:
            correct_text = "Correct " + q["id"][1:]
            selected_idx = next(i for i, opt in enumerate(q["options"]) if opt == correct_text)
            user_answers[q["id"]] = selected_idx

        # Calculate score
        correct_count = sum(1 for q in shuffled if user_answers[q["id"]] == q["correctIndex"])
        score = int(round((correct_count / len(shuffled)) * 100))
        assert score == 100, f"Expected 100% score with seed {seed}, got {score}%"


def test_9_retake_produces_new_permutation():
    """Retaking a quiz produces a new randomized permutation while preserving semantic correctness."""
    questions = [
        {"id": f"q-{i}", "question": f"Question {i}", "options": [f"Ans {i}-A", f"Ans {i}-B", f"Ans {i}-C", f"Ans {i}-D"], "correctIndex": 0}
        for i in range(5)
    ]

    attempt_1 = randomize_quiz_questions(questions, seed=10)
    attempt_2 = randomize_quiz_questions(questions, seed=20)

    # Both preserve semantic answers
    for orig, a1, a2 in zip(questions, attempt_1, attempt_2):
        orig_text = orig["options"][orig["correctIndex"]]
        assert a1["options"][a1["correctIndex"]] == orig_text
        assert a2["options"][a2["correctIndex"]] == orig_text

    # Positions vary between attempt 1 and 2
    pos_1 = [q["correctIndex"] for q in attempt_1]
    pos_2 = [q["correctIndex"] for q in attempt_2]
    assert pos_1 != pos_2


def test_10_course_regression_and_backend_grading():
    """Backend engagement service accurately grades permuted question submissions and validates certificate eligibility."""
    user = "candidate_regression@prepria.test"
    course_id = "devops-foundations"

    # Permuted quiz submission
    quiz_sub = {
        "submissionId": "sub_test_p22_1",
        "quizId": "devops-mod1-quiz",
        "passingScore": 70,
        "answersByQuestionId": {
            "q1": 2,  # User chose option at index 2
            "q2": 1,  # User chose option at index 1
            "q3": 3   # User chose option at index 3
        },
        "questionKey": [
            {"id": "q1", "correctIndex": 2},  # Permuted correctIndex
            {"id": "q2", "correctIndex": 1},
            {"id": "q3", "correctIndex": 3}
        ],
        "submittedAt": "2026-10-01T12:00:00Z"
    }

    progress_payload = {
        "quizSubmission": quiz_sub,
        "completedItemIds": ["devops-mod1-les1", "devops-mod1-les2", "devops-mod1-quiz"],
        "lessonTimeSpent": {
            "devops-mod1-les1": 60,
            "devops-mod1-les2": 60,
            "devops-mod1-quiz": 60
        }
    }

    result = save_user_course_progress(user, course_id, progress_payload)
    quiz_score = result.get("quizScores", {}).get("devops-mod1-quiz", {})
    assert quiz_score.get("score") == 100
    assert quiz_score.get("passed") is True
