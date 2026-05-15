import re
import math
from typing import Dict, List

FILLER_WORDS = ["um", "uh", "like", "basically", "actually", "you know"]

# Dummy role keyword dictionaries for heuristic matching if true NLP is not available
ROLE_KEYWORDS = {
    "Full Stack Developer": ["react", "node", "sql", "nosql", "relational", "api", "database", "frontend", "backend", "javascript", "python", "html", "css", "dom", "component", "server"],
    "Data Scientist": ["model", "data", "machine learning", "regression", "classification", "overfitting", "validation", "gradient", "algorithm"],
    "HR Executive": ["culture", "engagement", "recruitment", "interview", "onboarding", "retention", "performance", "policy"],
    # Generic fallback
    "default": ["experience", "project", "team", "solution", "agile", "development", "strategy", "process"]
}

def evaluate_response(role: str, question: str, answer: str, duration_seconds: int) -> Dict:
    # Edge case handles
    if not answer or answer.strip() == "":
        return {
            "score": 0,
            "confidence": 0,
            "keyword_match_score": 0,
            "filler_word_count": 0,
            "pause_count": duration_seconds // 3 if duration_seconds > 0 else 0,
            "sentiment": "hesitant",
            "feedback": ["No answer provided."]
        }
        
    answer_lower = answer.lower()
    
    # 1. Filler Words Detection
    words = [w.strip() for w in re.split(r'\s+', answer_lower) if w.strip()]
    total_words = len(words)
    
    filler_regex = r"\b(um+|uh+|mm+|hmm+|like|basically|actually|you know|kind of|sort of)\b"
    filler_matches = re.findall(filler_regex, answer_lower)
    filler_count = len(filler_matches)
            
    # 2. Pause Detection Heuristic
    # Average speech rate is ~130-150 words per minute -> ~2.5 words per second
    expected_duration = total_words / 2.5
    
    # If duration heavily exceeds expected, they are pausing / thinking
    excess_seconds = duration_seconds - expected_duration
    pause_count = 0
    if excess_seconds > 5:
        pause_count = math.floor(excess_seconds / 5)  # Let's say one noticeable pause per 5 extra seconds

    # 3. Keyword Match Heuristics
    # Match keywords from the question itself (ignoring common stopwords)
    stop_words = {"what", "is", "the", "differ", "between", "how", "do", "you", "explain", "why", "to", "for", "a", "an", "and", "in", "of", "vs", "which"}
    question_keywords = [w.strip("?") for w in question.lower().split() if w not in stop_words and len(w) > 3]
    
    # Match keywords from role domain
    domain_keywords = ROLE_KEYWORDS.get(role, ROLE_KEYWORDS["default"])
    
    q_matches = sum(1 for kw in question_keywords if kw in answer_lower)
    d_matches = sum(1 for kw in domain_keywords if kw in words)
    
    total_expected_kws = min(len(question_keywords) + 2, 5) # capping at 5 for perfect score
    actual_kws = q_matches + d_matches
    
    # Calculate keyword score
    keyword_match_score = min(100, int((actual_kws / max(1, total_expected_kws)) * 100))
    if total_words < 5: 
        keyword_match_score = min(keyword_match_score, 30) # Penalize heavily short answers

    # 4. Confidence Score
    # Highly impacted by filler words and excessive pauses relative to words
    filler_ratio = filler_count / max(1, total_words)
    pause_penalty = min(40, pause_count * 5)
    filler_penalty = min(40, filler_ratio * 200) # if 20% of words are fillers, 40 penalty
    
    confidence = max(0, 100 - pause_penalty - filler_penalty)
    
    # 5. Length score / technical completeness
    completeness_score = min(100, total_words / 2.0 * 10) # 20+ words considered "complete" for this heuristic
    
    # 6. Overall Score
    score = int((keyword_match_score * 0.5) + (confidence * 0.3) + (completeness_score * 0.2))
    
    # 7. Sentiment / Tone Classificiation
    if confidence >= 80:
        sentiment = "confident"
    elif confidence >= 50:
        sentiment = "neutral"
    else:
        sentiment = "hesitant"
        
    # 8. Feedback Generation
    feedback = []
    
    if score >= 85:
        feedback.append("Excellent technical clarity and depth.")
    elif keyword_match_score >= 60:
        feedback.append("Good technical foundation, but could provide more detail.")
    else:
        feedback.append("Consider providing more role-specific terminology and real-world examples.")
        
    if filler_count > max(2, int(total_words * 0.05)):
        feedback.append(f"Try reducing filler words (detected '{filler_count}' fillers).")
        
    if pause_count > 2:
        feedback.append("There were several noticeable pauses. Try to practice structured STAR format answers to flow better.")
        
    if total_words < 15:
        feedback.append("Your response was very brief. Elaborate to showcase your expertise.")
        
    if not feedback:
        feedback.append("Solid standard response overall.")

    return {
        "score": score,
        "confidence": int(confidence),
        "keyword_match_score": keyword_match_score,
        "filler_word_count": filler_count,
        "pause_count": int(pause_count),
        "sentiment": sentiment,
        "feedback": feedback
    }
