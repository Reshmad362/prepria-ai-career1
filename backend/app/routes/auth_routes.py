from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional
import re
from app.services.auth_service import create_user, authenticate_user, generate_token, users_db, verify_google_token, google_login as google_login_service, generate_reset_token, reset_password

router = APIRouter(prefix="/auth", tags=["Authentication"])

def is_valid_email(email: str) -> bool:
    pattern = r'^[\w\.-]+@[\w\.-]+\.\w+$'
    return bool(re.match(pattern, email))

def find_user_by_email(email: str):
    for u in users_db:
        if u['email'] == email:
            return u
    return None

class SignupRequest(BaseModel):
    name: str
    email: str
    password: str
    securityQuestion: Optional[str] = None
    securityAnswer: Optional[str] = None

class LoginRequest(BaseModel):
    email: str
    password: str
    remember_me: Optional[bool] = False

class GoogleLoginRequest(BaseModel):
    token: str

class ForgotPasswordRequest(BaseModel):
    email: str

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str

@router.post("/signup")
async def register(req: SignupRequest):
    if not is_valid_email(req.email):
        raise HTTPException(status_code=400, detail="Invalid email format")
        
    existing_user = find_user_by_email(req.email)
    
    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already exists. Please login instead."
        )

    try:
        user = create_user(req.name, req.email, req.password, security_answer=req.securityAnswer)
        token_response = generate_token(user['id'], user['email'], user['name'], user.get('picture'))
        return {
            "success": True, 
            "message": "User registered successfully", 
            **token_response
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/login")
async def login(req: LoginRequest):
    user = authenticate_user(req.email, req.password)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    token_response = generate_token(user['id'], user['email'], user['name'], user.get('picture'))
    return {
        "success": True,
        **token_response
    }

@router.post("/google")
async def google_auth(req: GoogleLoginRequest):
    # Verify the token
    idinfo = verify_google_token(req.token)
    if not idinfo:
        raise HTTPException(status_code=401, detail="Invalid Google token")

    # Get user details from Google
    email = idinfo.get("email")
    name = idinfo.get("name", "")
    google_id = idinfo.get("sub")
    picture = idinfo.get("picture")

    if not email or not google_id:
        raise HTTPException(status_code=400, detail="Google token missing required info")

    # Create or update user
    try:
        user = google_login_service(email, name, google_id, picture)
        token_response = generate_token(user['id'], user['email'], user['name'], user.get('picture'))
        return {
            "success": True,
            **token_response
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail="Error logging in with Google")

@router.post("/forgot-password")
async def forgot_password(req: ForgotPasswordRequest):
    email = req.email.strip().lower()
    if not is_valid_email(email):
        raise HTTPException(status_code=400, detail="Invalid email format")
    
    # We always return success to prevent email enumeration.
    # The frontend handles token generation and EmailJS integration for the secure flow.
    return {"success": True, "message": "If an account exists, a reset link has been sent."}

@router.post("/reset-password")
async def reset_password_route(req: ResetPasswordRequest):
    success = reset_password(req.token, req.new_password)
    if not success:
        raise HTTPException(status_code=400, detail="Invalid or expired reset token.")
    
    return {"success": True, "message": "Password reset successfully."}
