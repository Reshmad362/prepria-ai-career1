from fastapi import APIRouter, Body
from pydantic import BaseModel
import re
from typing import List, Optional
from app.services.interview_engine import generate_next_question, analyze_answer

router = APIRouter()

class GenerateQuestionRequest(BaseModel):
    prompt: str

@router.post("/generate-question")
def generate_question(data: dict = Body(...)):
    prompt = data.get("prompt", "").lower()
    
    # Deterministic mock backend for generating a follow up question
    # This searches the prompt text to heuristically identify the role and generate a realistic question.
    
    question = "Can you elaborate on your problem-solving process during a challenging task?"
    question_type = "Behavioral"
    
    # Very naive heuristic logic to identify context
    if "full stack" in prompt or "react" in prompt or "node" in prompt:
        if "answer" in prompt and len(prompt) > 200:
            question = "That's an interesting approach. How would you optimize that architecture to handle a 10x spike in traffic?"
            question_type = "Technical"
        else:
            question = "Can you walk me through a complex web application you've built from scratch?"
            question_type = "Technical"
    elif "data" in prompt or "python" in prompt or "ml" in prompt:
        if "answer" in prompt and len(prompt) > 200:
            question = "Since you mentioned that, how do you ensure the model doesn't overfit in production?"
            question_type = "Technical"
        else:
            question = "Describe a time you had to clean a very messy dataset. What was your strategy?"
            question_type = "Technical"
    elif "aviation" in prompt or "cabin" in prompt or "hostess" in prompt:
        if "answer" in prompt and len(prompt) > 200:
            question = "Given that situation, how would you ensure the safety of other passengers around?"
            question_type = "Scenario"
        else:
            question = "Tell me about a time you handled a medical emergency or difficult passenger on board."
            question_type = "Scenario"
    elif "sales" in prompt or "marketing" in prompt:
        question = "Can you describe a situation where you had to persuade a highly reluctant client?"
        question_type = "Scenario"
    elif len(prompt) > 300: # Has given a prior answer
        question = "Interesting. What were the key lessons you learned from that experience, and what would you do differently?"
        question_type = "Behavioral"
        
    return {
        "question": question,
        "type": question_type
    }

class InterviewNextRequest(BaseModel):
    role: str
    resume_skills: List[str]
    asked_questions: List[str]
    current_difficulty: str
    is_follow_up: bool
    previous_question: Optional[str] = None

@router.post("/interview/next")
def get_next_interview_question(req: InterviewNextRequest):
    result = generate_next_question(
        role=req.role,
        resume_skills=req.resume_skills,
        asked_questions=req.asked_questions,
        current_difficulty=req.current_difficulty,
        is_follow_up=req.is_follow_up,
        previous_question=req.previous_question
    )
    return result

class InterviewAnalyzeRequest(BaseModel):
    transcript: str
    question: str

@router.post("/interview/analyze")
def analyze_interview_answer(req: InterviewAnalyzeRequest):
    result = analyze_answer(req.transcript, req.question)
    return result
