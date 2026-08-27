from fastapi import APIRouter, HTTPException, Depends, Header
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import re
import uuid
import logging
import traceback
from app.services.auth_service import (
    create_user,
    authenticate_user,
    generate_token,
    decode_token,
    get_user_by_email_or_id,
    update_user_profile,
    users_db,
    _save_users_to_disk,
    verify_google_token,
    google_login as google_login_service,
    generate_reset_token,
    reset_password,
    otp_manager
)
from app.services.email_service import (
    send_notification_email,
    get_email_credentials,
    is_development_mode
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/auth", tags=["Authentication"])

def is_valid_email(email: str) -> bool:
    pattern = r'^[\w\.-]+@[\w\.-]+\.\w+$'
    return bool(re.match(pattern, email))

def find_user_by_email(email: str):
    email_clean = email.strip().lower()
    for u in users_db:
        if u.get('email', '').strip().lower() == email_clean:
            return u
    return None

def get_current_user_from_header(authorization: Optional[str] = Header(None)) -> Dict[str, Any]:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid authentication token")
    token = authorization.split("Bearer ")[1].strip()
    payload = decode_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired session token")
    
    email = payload.get("email")
    user_id = payload.get("sub")
    user = get_user_by_email_or_id(email=email, user_id=user_id)
    if not user:
        raise HTTPException(status_code=401, detail="User session expired. Please log in again.")
    return user

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

class GenerateOTPRequest(BaseModel):
    email: str
    purpose: str = "LOGIN"

class VerifyOTPRequest(BaseModel):
    email: str
    otp: str
    purpose: str = "LOGIN"

class ProfileUpdateRequest(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    gender: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    pincode: Optional[str] = None
    picture: Optional[str] = None
    targetRole: Optional[str] = None
    techStack: Optional[str] = None
    careerGoals: Optional[str] = None
    workPreference: Optional[str] = None
    experienceLevel: Optional[str] = None
    preferredCompanies: Optional[str] = None
    learningFocus: Optional[List[str]] = None
    skills: Optional[List[str]] = None
    score: Optional[int] = None
    experience: Optional[Any] = None
    projects: Optional[Any] = None
    education: Optional[Any] = None
    resumeUploaded: Optional[bool] = None
    resumeFileName: Optional[str] = None

@router.get("/profile")
@router.get("/me")
async def get_current_user_info(authorization: Optional[str] = Header(None)):
    user = get_current_user_from_header(authorization)
    return {
        "success": True,
        "profile": user.get("profile", {}),
        "preferences": user.get("preferences", {}),
        "user": {
            "id": user.get("id"),
            "email": user.get("email"),
            "name": user.get("name"),
            "picture": user.get("picture"),
            "profile": user.get("profile", {}),
            "preferences": user.get("preferences", {}),
            "scoreHistory": user.get("scoreHistory", [])
        }
    }

@router.put("/profile")
@router.post("/profile")
@router.put("/me")
async def update_profile_route(req: ProfileUpdateRequest, authorization: Optional[str] = Header(None)):
    user = get_current_user_from_header(authorization)
    email = user["email"]
    existing_prof = user.get("profile", {})
    
    profile_data = {
        "name": req.name if req.name is not None else user.get("name", ""),
        "email": email,
        "phone": req.phone if req.phone is not None else existing_prof.get("phone", ""),
        "gender": req.gender if req.gender is not None else existing_prof.get("gender", ""),
        "city": req.city if req.city is not None else existing_prof.get("city", ""),
        "state": req.state if req.state is not None else existing_prof.get("state", ""),
        "pincode": req.pincode if req.pincode is not None else existing_prof.get("pincode", ""),
        "picture": req.picture if req.picture is not None else existing_prof.get("picture") or user.get("picture"),
        "skills": req.skills if req.skills is not None else existing_prof.get("skills", []),
        "score": req.score if req.score is not None else existing_prof.get("score"),
        "experience": req.experience if req.experience is not None else existing_prof.get("experience"),
        "projects": req.projects if req.projects is not None else existing_prof.get("projects", []),
        "education": req.education if req.education is not None else existing_prof.get("education"),
        "resumeUploaded": req.resumeUploaded if req.resumeUploaded is not None else existing_prof.get("resumeUploaded", False),
        "resumeFileName": req.resumeFileName if req.resumeFileName is not None else existing_prof.get("resumeFileName", "")
    }
    
    preferences_data = {
        "targetRole": req.targetRole if req.targetRole is not None else user.get("preferences", {}).get("targetRole", ""),
        "techStack": req.techStack if req.techStack is not None else user.get("preferences", {}).get("techStack", ""),
        "careerGoals": req.careerGoals if req.careerGoals is not None else user.get("preferences", {}).get("careerGoals", ""),
        "workPreference": req.workPreference if req.workPreference is not None else user.get("preferences", {}).get("workPreference", "Remote"),
        "experienceLevel": req.experienceLevel if req.experienceLevel is not None else user.get("preferences", {}).get("experienceLevel", "Fresher"),
        "preferredCompanies": req.preferredCompanies if req.preferredCompanies is not None else user.get("preferences", {}).get("preferredCompanies", ""),
        "learningFocus": req.learningFocus if req.learningFocus is not None else user.get("preferences", {}).get("learningFocus", [])
    }
    
    try:
        updated_user = update_user_profile(email, profile_data, preferences_data)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    logger.info("Profile updated successfully for user: %s", email)
    return {
        "success": True,
        "message": "Profile updated successfully.",
        "user": {
            "id": updated_user.get("id"),
            "email": updated_user.get("email"),
            "name": updated_user.get("name"),
            "profile": updated_user.get("profile", {}),
            "preferences": updated_user.get("preferences", {})
        }
    }

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
    idinfo = verify_google_token(req.token)
    if not idinfo:
        raise HTTPException(status_code=401, detail="Invalid Google token")

    email = idinfo.get("email")
    name = idinfo.get("name", "")
    google_id = idinfo.get("sub")
    picture = idinfo.get("picture")

    if not email or not google_id:
        raise HTTPException(status_code=400, detail="Google token missing required info")

    try:
        user = google_login_service(email, name, google_id, picture)
        token_response = generate_token(user['id'], user['email'], user['name'], user.get('picture'))
        return {
            "success": True,
            **token_response
        }
    except Exception as e:
        logger.error(f"Google auth error: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail="Error logging in with Google")

@router.post("/forgot-password")
async def forgot_password(req: ForgotPasswordRequest):
    email = req.email.strip().lower()
    if not is_valid_email(email):
        raise HTTPException(status_code=400, detail="Invalid email format")
    
    return {"success": True, "message": "If an account exists, a reset link has been sent."}

@router.post("/reset-password")
async def reset_password_route(req: ResetPasswordRequest):
    success = reset_password(req.token, req.new_password)
    if not success:
        raise HTTPException(status_code=400, detail="Invalid or expired reset token.")
    
    return {"success": True, "message": "Password reset successfully."}

class SetPasswordRequest(BaseModel):
    new_password: str
    confirm_password: str

@router.post("/set-password")
async def set_password_route(req: SetPasswordRequest, authorization: Optional[str] = Header(None)):
    """Allow an authenticated user to set or update their password.
    Useful for accounts originally created via OTP that never had a password.
    """
    user = get_current_user_from_header(authorization)
    
    if not req.new_password or len(req.new_password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters.")
    
    if req.new_password != req.confirm_password:
        raise HTTPException(status_code=400, detail="Passwords do not match.")
    
    email = user["email"]
    for u in users_db:
        if u.get("email", "").strip().lower() == email.strip().lower():
            u["password"] = req.new_password
            _save_users_to_disk()
            logger.info("Password updated successfully for user: %s", email)
            return {"success": True, "message": "Password set successfully. You can now log in with your email and password."}
    
    raise HTTPException(status_code=404, detail="User not found.")

@router.post("/generate-otp")
async def generate_otp_route(req: GenerateOTPRequest):
    logger.info(f"OTP generation requested for email: {req.email}, purpose: {req.purpose}")
    email = req.email.strip().lower()
    
    if not is_valid_email(email):
        logger.warning(f"Invalid email format provided: {email}")
        raise HTTPException(status_code=400, detail="Invalid email format")
    
    user_exists = bool(find_user_by_email(email))
    logger.info(f"User exists in database: {user_exists}")
    
    try:
        otp = otp_manager.generate_otp(email, req.purpose)
        if otp:
            logger.info("OTP generated and stored successfully in memory.")
        else:
            logger.warning("OTP generation returned None (Likely PASSWORD_RESET for non-existent user).")
    except ValueError as e:
        logger.warning(f"OTP generation blocked by rate limiter: {str(e)}")
        raise HTTPException(status_code=429, detail=str(e))
    except Exception as e:
        logger.error(f"Unexpected error during OTP generation: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail="Failed to generate OTP due to internal error.")

    if not otp:
        return {"success": True, "message": "If an account exists, an OTP has been sent."}
    
    subject = "Your Verification Code"
    if req.purpose == "LOGIN":
        subject = "Your Login Verification Code"
    elif req.purpose == "PASSWORD_RESET":
        subject = "Reset Your Password"
        
    try:
        _email_user, _email_pass = get_email_credentials()
        is_dev = is_development_mode()
        
        if (not _email_user or not _email_pass) and not is_dev:
            logger.error("OTP email aborted: EMAIL_USER / EMAIL_PASS not configured in backend/.env for production")
            raise HTTPException(
                status_code=503,
                detail="Email delivery is not configured on this server. Please contact support or configure SMTP in .env."
            )

        logger.info(f"Dispatching OTP notification for {email} (Mode: {'Development' if is_dev else 'Production'})...")
        success = send_notification_email(
            subject=subject,
            event_type="otp",
            data={"email": email, "otp": otp, "purpose": req.purpose}
        )
        
        if not success:
            logger.error("Email service returned failure status.")
            raise HTTPException(
                status_code=500,
                detail="Failed to send OTP email. Please check your SMTP configuration in backend/.env."
            )
            
        logger.info(f"OTP successfully processed for {email}")
        return {"success": True, "message": "OTP generated and sent."}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error during email delivery: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail="Internal server error during email delivery.")

@router.post("/verify-otp")
async def verify_otp_route(req: VerifyOTPRequest):
    logger.info(f"OTP verification requested for email: {req.email}, purpose: {req.purpose}")
    email = req.email.strip().lower()
    otp = req.otp.strip()
    
    if not otp_manager.verify_otp(email, otp, req.purpose):
        logger.warning(f"OTP verification failed for {email}")
        raise HTTPException(status_code=400, detail="Invalid or expired OTP, or too many attempts.")
        
    logger.info(f"OTP verification successful for {email}")
    user = find_user_by_email(email)
    
    if req.purpose == "PASSWORD_RESET":
        if not user:
            logger.error(f"Password reset attempted for non-existent user {email}")
            raise HTTPException(status_code=401, detail="User not found.")
        reset_token = generate_reset_token(email)
        otp_manager.delete_otp(email, req.purpose)
        return {
            "success": True,
            "reset_token": reset_token
        }
    else:
        # Default LOGIN (Passwordless Auth)
        if not user:
            logger.info(f"User not found for {email}, initiating automatic registration.")
            # Auto-create user with a random password since it's OTP auth
            user = create_user(
                name=email.split("@")[0], 
                email=email, 
                password=str(uuid.uuid4())
            )
            logger.info(f"User automatically registered successfully: {user['id']}")

        token_response = generate_token(user['id'], user['email'], user['name'], user.get('picture'))
        otp_manager.delete_otp(email, req.purpose)
        logger.info(f"JWT generated and user logged in successfully: {email}")
        return {
            "success": True,
            **token_response
        }
