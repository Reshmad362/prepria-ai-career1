"""
PREPRIA Recommendation Intelligence API Router (Phase 8)
Exposes authenticated REST endpoints for personalized recommendations and status updates.
Enforces strict JWT token authentication, user isolation, and ownership validation.
"""

from fastapi import APIRouter, HTTPException, Depends, Header, Query
from pydantic import BaseModel
from typing import Optional, List, Dict, Any

from app.routes.auth_routes import get_current_user, verify_user_ownership
from app.services.recommendation_service import (
    get_user_recommendations,
    update_recommendation_status
)

router = APIRouter(prefix="/recommendations", tags=["Recommendation Intelligence"])


class RecommendationStatusRequest(BaseModel):
    status: str
    user_id: Optional[str] = None


@router.get("")
@router.get("/")
async def get_recommendations_route(
    status: Optional[str] = Query(None, description="Optional status filter: new, in_progress, completed, dismissed"),
    user_id: Optional[str] = Query(None, description="Optional user_id validation parameter"),
    authorization: Optional[str] = Header(None)
):
    current_user = get_current_user(authorization)
    
    # User isolation enforcement: if user_id query param is supplied, verify it matches authenticated JWT identity
    if user_id and not verify_user_ownership(user_id, current_user):
        raise HTTPException(status_code=403, detail="Forbidden: You do not have permission to access recommendations for another user.")

    authenticated_email = current_user.get("email") or current_user.get("id")
    if not authenticated_email:
        raise HTTPException(status_code=401, detail="Invalid session token identity")

    try:
        recs = get_user_recommendations(authenticated_email, status_filter=status)
        return {
            "success": True,
            "count": len(recs),
            "recommendations": recs
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate recommendations: {str(e)}")


@router.put("/{recommendation_id}/status")
@router.post("/{recommendation_id}/status")
async def update_recommendation_status_route(
    recommendation_id: str,
    req: RecommendationStatusRequest,
    authorization: Optional[str] = Header(None)
):
    current_user = get_current_user(authorization)
    
    # If req contains user_id, verify ownership
    if req.user_id and not verify_user_ownership(req.user_id, current_user):
        raise HTTPException(status_code=403, detail="Forbidden: You do not have permission to update recommendations for another user.")

    authenticated_email = current_user.get("email") or current_user.get("id")
    if not authenticated_email:
        raise HTTPException(status_code=401, detail="Invalid session token identity")

    try:
        updated_rec = update_recommendation_status(authenticated_email, recommendation_id, req.status)
        return {
            "success": True,
            "message": "Recommendation status updated successfully.",
            "recommendation": updated_rec
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update recommendation status: {str(e)}")
