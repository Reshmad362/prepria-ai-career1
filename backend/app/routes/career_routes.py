"""
PREPRIA Dynamic Evidence-Grounded Career Roadmap & Career Intelligence Router (Phase 11)
Provides authenticated REST endpoints for personalized career roadmap generation,
milestone progression, target role calibration, and legacy career suggestions.

Enforces strict JWT token authentication, multi-tenant user isolation, and ownership validation.
"""

from fastapi import APIRouter, HTTPException, Header, Query
from pydantic import BaseModel
from typing import List, Optional, Dict, Any

from app.routes.auth_routes import get_current_user, verify_user_ownership
from app.services.career_suggestion import generate_career_suggestions
from app.services.career_roadmap_service import (
    compute_user_career_roadmap,
    update_user_target_role,
    complete_user_milestone,
    CAREER_DOMAINS,
    ROLE_DEFINITIONS
)

router = APIRouter(tags=["Career Roadmap & Intelligence"])


# ─── Pydantic Request Models ────────────────────────────────────────────────

class CareerSuggestionRequest(BaseModel):
    user_id: str
    resume_skills: Optional[List[str]] = []
    matched_roles: Optional[List[str]] = []
    latest_score: Optional[float] = 0.0
    fluency_score: Optional[float] = 0.0
    weak_skills: Optional[List[str]] = []
    history_available: Optional[bool] = False


class TargetRoleUpdateRequest(BaseModel):
    target_role: Optional[str] = None
    targetRole: Optional[str] = None
    user_id: Optional[str] = None

    def get_role(self) -> str:
        return (self.target_role or self.targetRole or "").strip()


# ─── Legacy Career Suggestions Route (Backward Compatibility) ───────────────

@router.post("/career-suggestions")
async def get_career_suggestions_route(req: CareerSuggestionRequest, authorization: Optional[str] = Header(None)):
    current_user = get_current_user(authorization)
    if not verify_user_ownership(req.user_id, current_user):
        raise HTTPException(status_code=403, detail="Forbidden: You do not have permission to access career suggestions for another user.")

    try:
        data = req.dict()
        data["user_id"] = current_user.get("email") or current_user.get("id")
        suggestions = generate_career_suggestions(data)
        return suggestions
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ─── Authenticated Career Roadmap Routes (Phase 11) ──────────────────────────

@router.get("/career-roadmap")
@router.get("/career/roadmap")
@router.get("/api/career/roadmap")
async def get_career_roadmap_endpoint(
    target_role: Optional[str] = Query(None, description="Optional target role override"),
    user_id: Optional[str] = Query(None, description="Optional user_id query parameter to validate"),
    authorization: Optional[str] = Header(None)
):
    """
    Returns the authenticated candidate's authoritative, evidence-grounded career roadmap,
    including readiness score, verified skills, skill gaps, milestone unlock progression,
    and estimated completion timeline.
    """
    current_user = get_current_user(authorization)
    
    if user_id and not verify_user_ownership(user_id, current_user):
        raise HTTPException(status_code=403, detail="Forbidden: You do not have permission to access the career roadmap for another user.")

    auth_email = current_user.get("email") or current_user.get("id")
    if not auth_email:
        raise HTTPException(status_code=401, detail="Unauthorized access: Invalid session token.")

    try:
        roadmap = compute_user_career_roadmap(auth_email, target_role_override=target_role)
        return {
            "success": True,
            "data": roadmap
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to calculate career roadmap: {str(e)}")


@router.post("/career-roadmap/target-role")
@router.post("/career/roadmap/target-role")
@router.post("/api/career/roadmap/target-role")
@router.put("/api/career/target-role")
@router.post("/api/career/target-role")
async def update_target_role_endpoint(
    req: TargetRoleUpdateRequest,
    authorization: Optional[str] = Header(None)
):
    """
    Updates the candidate's target role, triggers deterministic recalculation
    of skill gaps, milestones, and readiness scores, and persists to disk.
    """
    current_user = get_current_user(authorization)
    
    if req.user_id and not verify_user_ownership(req.user_id, current_user):
        raise HTTPException(status_code=403, detail="Forbidden: You do not have permission to update the roadmap for another user.")

    auth_email = current_user.get("email") or current_user.get("id")
    if not auth_email:
        raise HTTPException(status_code=401, detail="Unauthorized access: Invalid session token.")

    role_to_set = req.get_role()
    if not role_to_set:
        raise HTTPException(status_code=400, detail="Target role cannot be empty.")

    try:
        updated_roadmap = update_user_target_role(auth_email, role_to_set)
        return {
            "success": True,
            "message": f"Target role updated to '{role_to_set}' successfully.",
            "data": updated_roadmap
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update target role: {str(e)}")


@router.post("/career-roadmap/milestone/{milestone_id}/complete")
@router.post("/career/roadmap/milestone/{milestone_id}/complete")
@router.post("/api/career/roadmap/milestone/{milestone_id}/complete")
async def complete_milestone_endpoint(
    milestone_id: str,
    user_id: Optional[str] = Query(None),
    authorization: Optional[str] = Header(None)
):
    """
    Validates prerequisites and marks a roadmap milestone as completed.
    Rejects completion with 400 Bad Request if prerequisites are locked.
    """
    current_user = get_current_user(authorization)

    if user_id and not verify_user_ownership(user_id, current_user):
        raise HTTPException(status_code=403, detail="Forbidden: You do not have permission to update milestones for another user.")

    auth_email = current_user.get("email") or current_user.get("id")
    if not auth_email:
        raise HTTPException(status_code=401, detail="Unauthorized access: Invalid session token.")

    try:
        updated_roadmap = complete_user_milestone(auth_email, milestone_id)
        return {
            "success": True,
            "message": f"Milestone '{milestone_id}' completed successfully.",
            "data": updated_roadmap
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to complete milestone: {str(e)}")


@router.get("/career-roadmap/domains")
@router.get("/career/roadmap/domains")
@router.get("/api/career/roadmap/domains")
async def get_career_domains_endpoint(authorization: Optional[str] = Header(None)):
    """
    Returns available multi-domain catalog definitions and supported roles.
    """
    get_current_user(authorization)  # Authenticate request
    return {
        "success": True,
        "domains": CAREER_DOMAINS,
        "roles": {k: {"domain": v["domain"], "coreSkills": v["coreSkills"], "dimensions": v["dimensions"]} for k, v in ROLE_DEFINITIONS.items()}
    }
