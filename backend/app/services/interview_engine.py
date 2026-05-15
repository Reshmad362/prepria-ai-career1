import random
import re
from app.data.interview_questions import INTERVIEW_DATASET

def determine_category_by_role(role: str) -> str:
    role_lower = role.lower()
    if "front" in role_lower or "ui" in role_lower or "react" in role_lower:
        return "Frontend"
    if "back" in role_lower or "node" in role_lower or "fastapi" in role_lower or "data" in role_lower:
        return "Backend"
    if "cloud" in role_lower or "devops" in role_lower or "aws" in role_lower:
        return "Cloud"
    if "ml" in role_lower or "ai" in role_lower or "data sci" in role_lower:
        return "AI/ML"
    return "Behavioral"

def generate_next_question(role: str, resume_skills: list, asked_questions: list, current_difficulty: str, is_follow_up: bool = False, previous_question: str = None):
    """
    Intelligently select the next interview question.
    """
    # 1. Handle Follow-up scenarios
    if is_follow_up and previous_question:
        # Find the question in dataset to extract predefined follow-ups
        for q in INTERVIEW_DATASET:
            if q["question"] == previous_question and q["follow_ups"]:
                # Pick a follow-up that hasn't been asked
                available_follow_ups = [f for f in q["follow_ups"] if f not in asked_questions]
                if available_follow_ups:
                    selected = random.choice(available_follow_ups)
                    return {
                        "question": selected,
                        "type": "Follow-up",
                        "difficulty": current_difficulty,
                        "skill": q["skill"]
                    }

    # 2. Find new Base Question
    # Filter by not asked
    available_questions = [q for q in INTERVIEW_DATASET if q["question"] not in asked_questions]
    
    if not available_questions:
        return {
            "question": "Can you summarize your overall career goals and what you are looking for in this specific role?",
            "type": "Behavioral",
            "difficulty": "medium",
            "skill": "Generic"
        }

    # Filter by Skills matching candidate resume
    skill_match_questions = []
    for q in available_questions:
        if q["skill"].lower() in [s.lower() for s in resume_skills]:
            skill_match_questions.append(q)

    # Filter by Role Category
    target_category = determine_category_by_role(role)
    category_match_questions = [q for q in available_questions if q["category"] == target_category or q["category"] == "Behavioral"]

    # Filter by Difficulty
    def filter_by_diff(q_list, diff):
        return [q for q in q_list if q["difficulty"] == diff]

    pool = skill_match_questions if skill_match_questions else category_match_questions
    if not pool:
        pool = available_questions

    diff_pool = filter_by_diff(pool, current_difficulty)
    if not diff_pool:
        diff_pool = pool # Fallback if no difficulty match

    selected_q = random.choice(diff_pool)

    return {
        "question": selected_q["question"],
        "type": "Technical" if selected_q["category"] != "Behavioral" else "Behavioral",
        "difficulty": selected_q["difficulty"],
        "skill": selected_q["skill"]
    }

def analyze_answer(transcript: str, question: str):
    """
    Analyze the transcript of the user's answer.
    """
    transcript_lower = transcript.lower()
    words = transcript_lower.split()
    word_count = len(words)
    
    # Filler word detection
    fillers = ["um", "uh", "like", "you know", "basically", "actually", "so", "right", "I mean"]
    filler_count = sum(1 for f in fillers if f in transcript_lower)
    
    # Basic technical validation heuristic (check if they are using technical nouns)
    technical_jargon_count = len([w for w in words if len(w) > 5]) 
    
    # Score calculation
    # Base is length
    base_score = min(100, word_count * 1.5)
    
    # Penalize for fillers
    communication_score = max(0, 100 - (filler_count * 5))
    if word_count < 10:
        communication_score = min(communication_score, 40)
        
    technical_score = min(100, base_score + (technical_jargon_count * 2))
    if word_count < 10:
        technical_score = min(technical_score, 30)

    # Determine next difficulty
    next_difficulty = "medium"
    if technical_score > 80:
        next_difficulty = "hard"
    elif technical_score < 40:
        next_difficulty = "easy"

    # Identify strengths and weaknesses
    strengths = []
    weaknesses = []
    
    if communication_score > 80:
        strengths.append("Clear communication")
    elif filler_count > 3:
        weaknesses.append("High usage of filler words")
        
    if word_count < 15:
        weaknesses.append("Answers are too brief")
    elif technical_score > 70:
        strengths.append("Good technical depth")

    # STAR Method detection heuristic
    star_used = False
    if "situation" in transcript_lower or "task" in transcript_lower or "action" in transcript_lower or "result" in transcript_lower or "because" in transcript_lower or "resolved" in transcript_lower:
        star_used = True

    return {
        "technicalScore": int(technical_score),
        "communicationScore": int(communication_score),
        "confidenceScore": int((technical_score + communication_score) / 2),
        "fillerWords": filler_count,
        "answerQuality": "Good" if technical_score > 60 else "Needs Improvement",
        "starMethod": star_used,
        "nextDifficulty": next_difficulty,
        "strengths": strengths,
        "weaknesses": weaknesses
    }
