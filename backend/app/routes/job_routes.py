from fastapi import APIRouter, HTTPException, Body
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from ..services.job_service import JobService

router = APIRouter(
    prefix="/api/jobs",
    tags=["jobs"]
)

job_service = JobService()

class MatchRequest(BaseModel):
    skills: List[str]

@router.get("/", response_model=List[Dict[str, Any]])
async def get_jobs():
    try:
        return job_service.get_all_jobs()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/match", response_model=List[Dict[str, Any]])
async def get_matched_jobs(request: MatchRequest):
    try:
        return job_service.match_jobs_for_user(request.skills)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
