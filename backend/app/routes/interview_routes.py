from fastapi import APIRouter, HTTPException, Body
from pydantic import BaseModel, Field
from typing import List
from app.services.question_generator import generate_questions_for_role

router = APIRouter()

class GenerateInterviewRequest(BaseModel):
    role: str
    difficulty: str
    question_count: int

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "role": "Full Stack Developer",
                    "difficulty": "medium",
                    "question_count": 5
                }
            ]
        }
    }

class Question(BaseModel):
    type: str
    difficulty: str
    question: str

class GenerateInterviewResponse(BaseModel):
    role: str
    questions: List[Question]

@router.post("/generate-interview", response_model=GenerateInterviewResponse)
def generate_interview(data: GenerateInterviewRequest = Body(...)):
    if data.question_count <= 0:
        raise HTTPException(status_code=400, detail="question_count must be strictly positive.")
    if data.question_count > 20:
        raise HTTPException(status_code=400, detail="question_count cannot exceed 20.")
    if data.difficulty.lower() not in ["easy", "medium", "hard"]:
        raise HTTPException(status_code=400, detail="Unsupported difficulty. Choose easy, medium, or hard.")
        
    questions = generate_questions_for_role(
        role=data.role, 
        difficulty=data.difficulty.lower(), 
        count=data.question_count
    )
    
    return GenerateInterviewResponse(
        role=data.role,
        questions=questions
    )
