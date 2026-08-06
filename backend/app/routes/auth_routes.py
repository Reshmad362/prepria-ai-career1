from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional
import re
import logging
import traceback
from app.services.auth_service import create_user, authenticate_user, generate_token, users_db, verify_google_token, google_login as google_login_service, generate_reset_token, reset_password, otp_manager
from app.services.email_service import send_notification_email

logger = logging.getLogger(__name__)

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

class GenerateOTPRequest(BaseModel):
    email: str
    purpose: str = "LOGIN"

class VerifyOTPRequest(BaseModel):
    email: str
    otp: str
    purpose: str = "LOGIN"

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

@router.post("/generate-otp")
async def generate_otp_route(req: GenerateOTPRequest):
    logger.info(f"OTP generation requested for email: {req.email}, purpose: {req.purpose}")
    email = req.email.strip().lower()
    
    if not is_valid_email(email):
        logger.warning(f"Invalid email format provided: {email}")
        raise HTTPException(status_code=400, detail="Invalid email format")
    
    # 1. User lookup (Logging only, we still generate OTP for LOGIN if user doesn't exist)
    user_exists = bool(find_user_by_email(email))
    logger.info(f"User exists in database: {user_exists}")
    
    try:
        otp = otp_manager.generate_otp(email, req.purpose)
        if otp:
            logger.info("OTP generated and stored successfully.")
        else:
            logger.warning("OTP generation returned None (Likely PASSWORD_RESET for non-existent user).")
    except ValueError as e:
        logger.warning(f"OTP generation blocked: {str(e)}")
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
        logger.info(f"Initiating email delivery to {email} via SMTP...")
        success = send_notification_email(
            subject=subject,
            event_type="otp",
            data={"email": email, "otp": otp, "purpose": req.purpose}
        )
        
        if not success:
            logger.error("Email service returned failure status.")
            raise HTTPException(status_code=500, detail="Failed to deliver OTP email. Please check SMTP configuration.")
            
        logger.info(f"OTP email successfully sent to {email}")
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
            import uuid
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
