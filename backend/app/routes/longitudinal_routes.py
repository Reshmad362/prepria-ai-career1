"""
PREPRIA Advanced Multi-Session Longitudinal Intelligence Routes (Phase 9)
Provides authenticated FastAPI endpoints to retrieve deep longitudinal snapshots,
mastery states, weakness progression, intervention outcomes, and topic exposure.

Enforces JWT identity, user ownership verification, and strict multi-tenant isolation.
"""

from fastapi import APIRouter, HTTPException, Header, Query
from typing import Dict, Any, Optional

from app.routes.auth_routes import get_current_user, verify_user_ownership
from app.services.longitudinal_service import (
    get_user_longitudinal_profile,
    get_longitudinal_topic_detail
)

router = APIRouter(prefix="/longitudinal", tags=["Phase 9 Longitudinal Intelligence"])


@router.get("/profile")
async def get_longitudinal_profile_endpoint(
    target_role: Optional[str] = Query(None),
    authorization: Optional[str] = Header(None)
):
    """
    Returns authenticated user's complete multi-session longitudinal intelligence profile.
    Strictly derives trend, dimension progression, recurring/persistent/resolved weaknesses,
    consistent strengths, intervention outcomes, and mastery states from real persisted evidence.
    """
    current_user = get_current_user(authorization)
    auth_user_key = current_user.get("email") or current_user.get("id")

    if not auth_user_key:
        raise HTTPException(status_code=401, detail="Unauthorized access: Invalid JWT token.")

    try:
        profile = get_user_longitudinal_profile(auth_user_key, target_role_filter=target_role)
        return {"success": True, "data": profile}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate longitudinal profile: {str(e)}")


@router.get("/topic/{topic}")
async def get_topic_longitudinal_detail_endpoint(
    topic: str,
    authorization: Optional[str] = Header(None)
):
    """
    Returns deep longitudinal evaluation history, intervention outcomes,
    and mastery state for a specific topic.
    """
    current_user = get_current_user(authorization)
    auth_user_key = current_user.get("email") or current_user.get("id")

    if not auth_user_key:
        raise HTTPException(status_code=401, detail="Unauthorized access: Invalid JWT token.")

    try:
        detail = get_longitudinal_topic_detail(auth_user_key, topic_name=topic)
        return {"success": True, "data": detail}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve topic longitudinal detail: {str(e)}")
