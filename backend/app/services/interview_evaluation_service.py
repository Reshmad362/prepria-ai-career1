import os
import sys
import re
import json
import logging
from typing import Dict, Any, List, Optional
from datetime import datetime

logger = logging.getLogger(__name__)

# Import NLP and Speech Analysis modules
ml_services_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../ml-services/nlp-evaluation"))
if ml_services_path not in sys.path:
    sys.path.append(ml_services_path)

try:
    from answer_evaluator import evaluate_answer as nlp_evaluate_answer
except Exception as e:
    logger.warning("Could not load NLP answer_evaluator: %s", e)
    def nlp_evaluate_answer(user_answer: str, ideal_answer: str) -> str:
        words = user_answer.strip().split()
        score = min(1.0, len(words) * 0.05) if words else 0.0
        return json.dumps({
            "score": round(score, 2),
            "quality": "Good" if score >= 0.6 else "Poor",
            "feedback": "Answer analyzed based on content volume."
        })

from app.services.speech_analysis_service import analyze_speech


def evaluate_single_answer(
    user_answer: str,
    question_text: str,
    ideal_guidelines: Optional[str] = None,
    duration_seconds: int = 0
) -> Dict[str, Any]:
    """
    Evaluates a single answer transcript deterministically:
    - Runs semantic similarity via answer_evaluator.py
    - Runs speech metrics (speaking rate, filler count, pause count, fluency) via speech_analysis_service.py
    - Strictly enforces zero-answer defense.
    """
    raw = str(user_answer or "").strip()
    is_skipped = raw == "[Skipped]" or "[Question Skipped]" in raw
    clean_text = raw.replace("[Skipped]", "").replace("[Question Skipped]", "").replace("[No Answer Submitted]", "").strip()

    # Zero-answer check for single question
    if not clean_text or is_skipped or len(clean_text) <= 5:
        speech = analyze_speech("", 0)
        return {
            "score": 0,
            "similarityScore": 0.0,
            "quality": "Poor",
            "feedback": "No meaningful answer provided." if not is_skipped else "Question was skipped.",
            "wordCount": 0,
            "hasSTARStructure": False,
            "status": "skipped" if is_skipped else "unanswered",
            "speech_analysis": speech
        }

    # Reference text for semantic evaluation
    reference = ideal_guidelines if (ideal_guidelines and len(ideal_guidelines.strip()) > 5) else question_text

    # 1. Semantic evaluation
    nlp_res_str = nlp_evaluate_answer(clean_text, reference)
    nlp_res = json.loads(nlp_res_str)
    similarity_score = float(nlp_res.get("score", 0.0))

    # 2. Speech & fluency evaluation
    speech_data = analyze_speech(clean_text, duration_seconds)
    fluency_score = speech_data.get("fluency_score", 80)
    filler_count = speech_data.get("filler_count", 0)
    pause_count = speech_data.get("pause_count", 0)

    # 3. Structural depth & STAR detection
    words = clean_text.split()
    word_count = len(words)
    has_star = bool(re.search(r'\b(when|situation|task|action|result|because|outcome|achieved|built|managed|resolved)\b', clean_text, re.IGNORECASE))

    # Composite question score (0-100)
    # Technical accuracy (semantic similarity) is the core factor
    semantic_pts = similarity_score * 70.0
    fluency_pts = (fluency_score / 100.0) * 20.0 * (min(1.0, similarity_score + 0.3) if similarity_score < 0.4 else 1.0)
    depth_pts = min(10.0, (word_count / 30.0) * 10.0) if similarity_score >= 0.4 else min(5.0, (word_count / 30.0) * 5.0)
    if has_star and similarity_score >= 0.5:
        depth_pts = min(10.0, depth_pts + 3.0)

    raw_q_score = int(round(semantic_pts + fluency_pts + depth_pts))
    if similarity_score < 0.35:
        q_score = min(45, max(0, raw_q_score))
    elif similarity_score < 0.5:
        q_score = min(58, max(0, raw_q_score))
    else:
        q_score = min(100, max(0, raw_q_score))

    return {
        "score": q_score,
        "similarityScore": round(similarity_score, 4),
        "quality": nlp_res.get("quality", "Good"),
        "feedback": nlp_res.get("feedback", "Response received."),
        "wordCount": word_count,
        "hasSTARStructure": has_star,
        "status": "answered",
        "speech_analysis": speech_data
    }


def evaluate_interview_session(
    role_name: str,
    difficulty: str,
    questions: List[Dict[str, Any]],
    answers: List[Dict[str, Any]],
    session_duration: str = "00:00",
    violations_count: int = 0
) -> Dict[str, Any]:
    """
    Evaluates an entire interview session authoritatively across 5 objective pillars:
    - Technical Knowledge (Semantic similarity & domain depth)
    - Problem Solving (STAR structure & reasoning depth)
    - Communication (Speaking rate, fluency, low filler density)
    - Role Knowledge (Topic coverage & domain concepts)
    - Confidence / Communication Fluency (Deterministic composite of speech fluency, low pause/filler penalties — NO randomized emotion)

    Enforces strict zero-answer defense.
    """
    total_questions = len(questions)
    valid_answers_count = 0
    question_evaluations = []

    tech_scores = []
    problem_solving_scores = []
    comm_scores = []
    role_scores = []
    confidence_scores = []

    for idx in range(total_questions):
        q_item = questions[idx] if idx < len(questions) else {}
        ans_item = answers[idx] if idx < len(answers) else {}

        raw_text = ans_item.get("transcript") or ans_item.get("text") or (ans_item if isinstance(ans_item, str) else "")
        guidelines = q_item.get("modelAnswerGuidelines") or q_item.get("guidelines") or q_item.get("question")
        duration_sec = ans_item.get("answerDurationSeconds", 0) if isinstance(ans_item, dict) else 0

        eval_res = evaluate_single_answer(
            user_answer=raw_text,
            question_text=q_item.get("question", ""),
            ideal_guidelines=guidelines,
            duration_seconds=duration_sec
        )

        q_topic = q_item.get("topic") or "Core Concept"
        q_eval = {
            "questionIndex": idx + 1,
            "question": q_item.get("question", f"Question {idx + 1}"),
            "topic": q_topic,
            "answerText": eval_res.get("answerText", raw_text),
            "score": eval_res["score"],
            "similarityScore": eval_res["similarityScore"],
            "wordCount": eval_res["wordCount"],
            "hasSTARStructure": eval_res["hasSTARStructure"],
            "status": eval_res["status"],
            "feedback": eval_res["feedback"],
            "speech_analysis": eval_res["speech_analysis"],
            "source": q_item.get("source"),
            "sourceType": q_item.get("sourceType"),
            "sourceValue": q_item.get("sourceValue"),
            "difficulty": q_item.get("difficulty"),
            "type": q_item.get("type"),
            "targetedWeakness": q_item.get("targetedWeakness"),
            "isTargetedRemediation": q_item.get("isTargetedRemediation", False)
        }
        question_evaluations.append(q_eval)

        if eval_res["status"] == "answered" and eval_res["wordCount"] > 0:
            valid_answers_count += 1
            
            # Pillar 1: Technical Knowledge (Semantic similarity * 100)
            tech_scores.append(int(round(eval_res["similarityScore"] * 100)))
            
            # Pillar 2: Problem Solving (STAR bonus + answer depth)
            ps_score = min(100, int((eval_res["wordCount"] / 25.0) * 70) + (30 if eval_res["hasSTARStructure"] else 10))
            problem_solving_scores.append(ps_score)
            
            # Pillar 3: Communication (Fluency score from speech analysis)
            comm_score = eval_res["speech_analysis"].get("fluency_score", 80)
            comm_scores.append(comm_score)
            
            # Pillar 4: Role Knowledge (Composite of semantic score + keyword presence)
            role_scores.append(eval_res["score"])
            
            # Pillar 5: Confidence / Objective Communication Fluency
            # Derived only from speaking pacing, zero/low hesitation, low filler ratio
            filler_count = eval_res["speech_analysis"].get("filler_count", 0)
            pause_count = eval_res["speech_analysis"].get("pause_count", 0)
            fluency_base = eval_res["speech_analysis"].get("fluency_score", 80)
            conf_val = max(0, min(100, int(fluency_base - (filler_count * 2) - (pause_count * 2))))
            confidence_scores.append(conf_val)

    # ZERO-ANSWER DEFENSE:
    if valid_answers_count == 0:
        return {
            "isValid": False,
            "isCompleted": False,
            "answeredCount": 0,
            "totalQuestions": total_questions,
            "overallScore": 0,
            "dimensions": {
                "technicalKnowledge": 0,
                "problemSolving": 0,
                "communication": 0,
                "roleKnowledge": 0,
                "confidence": 0
            },
            "speech_metrics": {
                "total_filler_count": 0,
                "filler_breakdown": {},
                "filler_rate": None,
                "words_per_minute": None,
                "total_words": 0,
                "speaking_duration_seconds": 0,
                "pause_count": 0,
                "long_pauses": 0,
                "speech_observations": ["No speech detected for evaluation."]
            },
            "questionEvaluations": question_evaluations,
            "strengths": [],
            "improvements": [],
            "nextInterviewFocus": [],
            "completedAt": None,
            "message": "You did not submit any responses (0 of " + str(total_questions) + " answered), so PREPRIA cannot evaluate your performance."
        }

    # Aggregate speech metrics across answered questions
    total_fillers = 0
    aggregate_filler_breakdown = {}
    total_spoken_words = 0
    total_speaking_duration = 0
    total_pauses = 0
    total_long_pauses = 0

    for qe in question_evaluations:
        if qe.get("status") == "answered":
            sp = qe.get("speech_analysis") or {}
            f_count = sp.get("filler_count", 0)
            total_fillers += f_count
            for f_word, count in sp.get("filler_breakdown", {}).items():
                aggregate_filler_breakdown[f_word] = aggregate_filler_breakdown.get(f_word, 0) + count
            total_spoken_words += sp.get("words", 0)
            total_speaking_duration += sp.get("duration_seconds", 0)
            total_pauses += sp.get("pause_count", 0)
            total_long_pauses += sp.get("long_pauses", 0)

    # Calculate deterministic aggregate WPM and filler rate
    wpm_aggregate = None
    if total_speaking_duration > 0 and total_spoken_words > 0:
        wpm_aggregate = round(total_spoken_words / (total_speaking_duration / 60.0), 1)

    filler_rate_per_100_words = None
    if total_spoken_words > 0:
        filler_rate_per_100_words = round((total_fillers / total_spoken_words) * 100, 1)

    # Sort filler breakdown deterministically by count descending, then word ascending
    sorted_filler_breakdown = dict(
        sorted(aggregate_filler_breakdown.items(), key=lambda item: (-item[1], item[0]))
    )

    # Speech observations & actionable recommendations
    speech_observations = []
    if total_fillers == 0 and total_spoken_words > 0:
        speech_observations.append("Excellent speech clarity with zero filler words detected.")
    elif total_fillers > 0 and sorted_filler_breakdown:
        top_filler, top_count = next(iter(sorted_filler_breakdown.items()))
        speech_observations.append(
            f"Your most frequent filler was '{top_filler}' ({top_count} occurrence{'s' if top_count > 1 else ''}). Practice replacing it with a deliberate short pause."
        )

    if wpm_aggregate is not None:
        if wpm_aggregate > 165:
            speech_observations.append(f"Speaking rate was fast ({wpm_aggregate} WPM). Aim for 120–150 WPM for maximum clarity and executive presence.")
        elif wpm_aggregate < 95:
            speech_observations.append(f"Speaking rate was slow ({wpm_aggregate} WPM). Practice structuring responses to maintain steady momentum.")
        else:
            speech_observations.append(f"Speaking pace is optimal ({wpm_aggregate} WPM) within the conversational executive range.")

    session_speech_metrics = {
        "total_filler_count": total_fillers,
        "filler_breakdown": sorted_filler_breakdown,
        "filler_rate": filler_rate_per_100_words,
        "words_per_minute": wpm_aggregate,
        "total_words": total_spoken_words,
        "speaking_duration_seconds": total_speaking_duration,
        "pause_count": total_pauses,
        "long_pauses": total_long_pauses,
        "speech_observations": speech_observations
    }

    # Calculate 5-Pillar dimensions
    avg_tech = int(round(sum(tech_scores) / len(tech_scores))) if tech_scores else 50
    avg_ps = int(round(sum(problem_solving_scores) / len(problem_solving_scores))) if problem_solving_scores else 50
    avg_comm = int(round(sum(comm_scores) / len(comm_scores))) if comm_scores else 50
    avg_role = int(round(sum(role_scores) / len(role_scores))) if role_scores else 50
    avg_conf = int(round(sum(confidence_scores) / len(confidence_scores))) if confidence_scores else 50

    # Penalties for proctoring violations
    if violations_count > 0:
        avg_comm = max(0, avg_comm - (violations_count * 5))
        avg_conf = max(0, avg_conf - (violations_count * 5))

    # Overall Score (Weighted)
    overall_score = int(round(
        (avg_tech * 0.30) +
        (avg_ps * 0.25) +
        (avg_comm * 0.20) +
        (avg_role * 0.15) +
        (avg_conf * 0.10)
    ))

    # Dynamic Strengths & Improvements derived strictly from question performance
    strengths = []
    improvements = []

    # Sort answered questions by score to identify best and worst topics
    answered_evals = [qe for qe in question_evaluations if qe["status"] == "answered"]
    answered_evals_sorted = sorted(answered_evals, key=lambda x: x["score"], reverse=True)

    if answered_evals_sorted:
        best = answered_evals_sorted[0]
        strengths.append(f"Strong conceptual articulation in {best['topic']} ({best['score']}% score)")
    if avg_comm >= 75:
        strengths.append("Clear and fluent speech pacing with minimal filler words")
    if any(qe["hasSTARStructure"] for qe in answered_evals):
        strengths.append("Structured answers utilizing Situation-Task-Action-Result (STAR) methodology")

    if not strengths:
        strengths.append("Answered role-specific scenarios with functional baseline understanding")

    # Improvements
    lowest = answered_evals_sorted[-1] if answered_evals_sorted else None
    if lowest and lowest["score"] < 70:
        improvements.append({
            "topic": lowest["topic"],
            "description": f"Deepen explanation of {lowest['topic']}. Incorporate specific architectural tradeoffs, edge cases, and concrete outcomes.",
            "actionLabel": "Review Curriculum",
            "actionPath": "/my-courses"
        })

    if avg_comm < 70:
        improvements.append({
            "topic": "Communication & Fluency",
            "description": "Reduce hesitation pauses and filler words by practicing concise, structured delivery.",
            "actionLabel": "Review Roadmap",
            "actionPath": "/career-roadmap"
        })

    is_completed = valid_answers_count >= total_questions

    return {
        "isValid": True,
        "isCompleted": is_completed,
        "isPartial": not is_completed,
        "answeredCount": valid_answers_count,
        "totalQuestions": total_questions,
        "overallScore": overall_score,
        "dimensions": {
            "technicalKnowledge": avg_tech,
            "problemSolving": avg_ps,
            "communication": avg_comm,
            "roleKnowledge": avg_role,
            "confidence": avg_conf
        },
        "speech_metrics": session_speech_metrics,
        "questionEvaluations": question_evaluations,
        "strengths": strengths,
        "improvements": improvements,
        "nextInterviewFocus": [q["topic"] for q in answered_evals_sorted[-2:]] if len(answered_evals_sorted) >= 2 else ["System Fundamentals"],
        "completedAt": datetime.utcnow().strftime("%b %d, %Y")
    }

