import json
import numpy as np
from sentence_transformers import SentenceTransformer, util

# Ensure the model is loaded once globally to optimize performance
model = SentenceTransformer('all-MiniLM-L6-v2')

def compute_similarity(user_answer: str, ideal_answer: str) -> float:
    """
    Computes semantic cosine similarity between the user answer and the ideal answer.
    """
    if not user_answer or not ideal_answer:
        return 0.0

    # Ensure answers are strings
    user_answer_str = str(user_answer).strip()
    ideal_answer_str = str(ideal_answer).strip()

    if not user_answer_str:
        return 0.0

    try:
        # Generate embeddings
        # The model's max_seq_length handles truncation of very long answers safely
        user_embedding = model.encode(user_answer_str, convert_to_tensor=True)
        ideal_embedding = model.encode(ideal_answer_str, convert_to_tensor=True)

        # Compute cosine similarity
        cosine_score = util.cos_sim(user_embedding, ideal_embedding).item()

        # Ensure the score is bounded between 0 and 1
        return max(0.0, min(1.0, float(cosine_score)))
    except Exception as e:
        # Graceful fallback in case of an unexpected crash (e.g. extremely long texts)
        print(f"Error computing similarity: {e}")
        return 0.0

def classify_quality(score: float) -> str:
    """
    Classifies the quality of the answer based on the similarity score.
    """
    if score >= 0.8:
        return "Excellent"
    elif score >= 0.6:
        return "Good"
    elif score >= 0.4:
        return "Average"
    else:
        return "Poor"

def generate_feedback(score: float) -> str:
    """
    Generates user-friendly feedback based on the similarity score.
    """
    if score >= 0.8:
        return "Excellent job! Your answer accurately covers the key concepts."
    elif score >= 0.6:
        return "Good effort! You mentioned the right concepts, but could elaborate more clearly."
    elif score >= 0.4:
        return "You touched on some relevant aspects, but your answer missed some core elements."
    else:
        return "Your answer missed the main points or was irrelevant. Please review the material."

def evaluate_answer(user_answer: str, ideal_answer: str) -> str:
    """
    Evaluates the user answer against the ideal answer and returns a JSON string.
    Handles edge cases like empty inputs, irrelevant answers, and extreme lengths.
    """
    # 1. Edge Case: Empty Answer
    if not user_answer or not str(user_answer).strip():
        result = {
            "score": 0.0,
            "quality": "Poor",
            "feedback": "Answer is empty. Please provide a response."
        }
        return json.dumps(result)
        
    if not ideal_answer or not str(ideal_answer).strip():
        result = {
            "score": 0.0,
            "quality": "Poor",
            "feedback": "No ideal answer provided for comparison."
        }
        return json.dumps(result)

    # 2. Compute similarity
    score = compute_similarity(user_answer, ideal_answer)
    score = round(score, 4)

    # 3. Classify Quality & Generate Feedback
    quality = classify_quality(score)
    feedback = generate_feedback(score)

    result = {
        "score": score,
        "quality": quality,
        "feedback": feedback
    }

    return json.dumps(result)

# Test cases for isolated debugging/validation
if __name__ == "__main__":
    test_cases = [
        {"desc": "exact answer", "user": "Machine learning is a subset of AI.", "ideal": "Machine learning is a subset of AI."},
        {"desc": "partial answer", "user": "Machine learning uses data.", "ideal": "Machine learning is a subset of AI that uses data to learn patterns."},
        {"desc": "wrong answer", "user": "Machine learning is a type of fruit.", "ideal": "Machine learning is a subset of AI."},
        {"desc": "empty answer", "user": "   ", "ideal": "Machine learning is a subset of AI."},
        {"desc": "irrelevant answer", "user": "I like to eat pizza on Fridays.", "ideal": "Machine learning is a subset of AI."},
        {"desc": "very long answer", "user": "Machine learning is a subset of AI. " * 500, "ideal": "Machine learning is a subset of AI."}
    ]

    for tc in test_cases:
        print(f"--- Test Case: {tc['desc']} ---")
        output = evaluate_answer(tc['user'], tc['ideal'])
        print(output)
        print()
