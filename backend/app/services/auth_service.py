import uuid
import os
import jwt
from datetime import datetime, timedelta
from typing import Dict, Any, Optional
import secrets
from google.oauth2 import id_token
from google.auth.transport import requests

from pathlib import Path
import json
import logging

logger = logging.getLogger(__name__)

# File-backed JSON Database Persistence
DATA_DIR = Path(__file__).resolve().parent.parent / "data"
USERS_FILE = DATA_DIR / "users.json"

def _load_users_from_disk():
    """Load users array from JSON file."""
    try:
        DATA_DIR.mkdir(parents=True, exist_ok=True)
        if USERS_FILE.exists():
            with open(USERS_FILE, "r", encoding="utf-8") as f:
                content = f.read().strip()
                if content:
                    data = json.loads(content)
                    if isinstance(data, list):
                        logger.info("Loaded %d users from disk.", len(data))
                        return data
        return []
    except Exception as e:
        logger.error("Error loading users database from disk: %s", e)
        return []

def _save_users_to_disk():
    """Atomically save users array to disk with backup protection."""
    try:
        DATA_DIR.mkdir(parents=True, exist_ok=True)
        # Create backup before overwriting to prevent data loss
        if USERS_FILE.exists():
            backup = USERS_FILE.with_suffix(".bak")
            try:
                import shutil
                shutil.copy2(USERS_FILE, backup)
            except Exception:
                pass
        temp_file = USERS_FILE.with_suffix(".tmp")
        with open(temp_file, "w", encoding="utf-8") as f:
            json.dump(users_db, f, indent=2, ensure_ascii=False)
        temp_file.replace(USERS_FILE)
    except Exception as e:
        logger.error("Error saving users database to disk: %s", e)

users_db = _load_users_from_disk()
password_resets = {}

JWT_SECRET = os.getenv("JWT_SECRET", "your-jwt-secret-here-replace-in-production")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
JWT_EXPIRATION_HOURS = int(os.getenv("JWT_EXPIRATION_HOURS", "24"))
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID", "your-google-client-id-here")

def create_user(name: str, email: str, password: str, google_id: str = None, security_answer: str = None):
    # In a real app we would hash the password
    email_clean = email.strip().lower()
    for u in users_db:
        if u['email'].strip().lower() == email_clean:
            if google_id and not u.get('google_id'):
                u['google_id'] = google_id
                _save_users_to_disk()
                return u
            raise ValueError("Email already registered")
    
    user = {
        "id": str(uuid.uuid4()),
        "name": name,
        "email": email_clean,
        "password": password, # plain text purely for simulated test environments
        "google_id": google_id,
        "picture": None,
        "security_answer": security_answer,
        "profile": {
            "name": name,
            "email": email_clean,
            "phone": "",
            "gender": "",
            "city": "",
            "state": "",
            "pincode": "",
            "picture": None
        },
        "preferences": {
            "targetRole": "",
            "techStack": "",
            "careerGoals": "",
            "workPreference": "Remote",
            "experienceLevel": "Fresher"
        },
        "scoreHistory": []
    }
    users_db.append(user)
    _save_users_to_disk()
    return user

def authenticate_user(email: str, password: str):
    email_clean = email.strip().lower()
    for u in users_db:
        if u['email'].strip().lower() == email_clean:
            if u['password'] == password:
                return u
            logger.info("Authentication failed for user: %s (password mismatch)", email_clean)
            return None
    logger.info("Authentication failed: no user found with email: %s", email_clean)
    return None

def verify_google_token(token: str) -> Optional[Dict[str, Any]]:
    try:
        idinfo = id_token.verify_oauth2_token(token, requests.Request(), GOOGLE_CLIENT_ID)
        return idinfo
    except ValueError:
        return None

def google_login(email: str, name: str, google_id: str, picture: str = None):
    email_clean = email.strip().lower()
    for u in users_db:
        if u['email'].strip().lower() == email_clean:
            u['google_id'] = google_id
            if picture:
                u['picture'] = picture
            _save_users_to_disk()
            return u
    # Create new if doesn't exist
    user = create_user(name, email_clean, password=str(uuid.uuid4()), google_id=google_id)
    if picture:
        user['picture'] = picture
    _save_users_to_disk()
    return user

def generate_reset_token(email: str) -> Optional[str]:
    email_clean = email.strip().lower()
    for u in users_db:
        if u['email'].strip().lower() == email_clean:
            token = str(uuid.uuid4())
            password_resets[token] = email_clean
            return token
    return None

def reset_password(token: str, new_password: str) -> bool:
    email = password_resets.get(token)
    if not email:
        return False
    email_clean = email.strip().lower()
    for u in users_db:
        if u['email'].strip().lower() == email_clean:
            u['password'] = new_password
            del password_resets[token]
            _save_users_to_disk()
            return True
    return False

def generate_token(user_id: str, email: str, name: str, picture: str = None, user_obj: Optional[Dict[str, Any]] = None):
    expiration = datetime.utcnow() + timedelta(hours=JWT_EXPIRATION_HOURS)
    payload = {
        "sub": user_id,
        "email": email,
        "name": name,
        "picture": picture,
        "exp": expiration
    }
    encoded_jwt = jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)
    
    # Retrieve user record to return full profile and preferences
    user = user_obj or get_user_by_email_or_id(email=email, user_id=user_id) or {}
    
    return {
        "access_token": encoded_jwt,
        "token_type": "bearer",
        "expires_in": JWT_EXPIRATION_HOURS * 3600,
        "user": {
            "id": user_id,
            "email": email,
            "name": name,
            "picture": picture or user.get("picture"),
            "profile": user.get("profile", {}),
            "preferences": user.get("preferences", {}),
            "scoreHistory": user.get("scoreHistory", [])
        }
    }

def decode_token(token: str) -> Optional[Dict[str, Any]]:
    """Decode and validate a JWT access token."""
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
    except Exception:
        return None

def get_user_by_email_or_id(email: Optional[str] = None, user_id: Optional[str] = None) -> Optional[Dict[str, Any]]:
    """Find user record in database."""
    email_clean = email.strip().lower() if email else None
    for u in users_db:
        if (email_clean and u.get('email', '').strip().lower() == email_clean) or (user_id and u.get('id') == user_id):
            return u
    return None

def update_user_profile(email: str, profile_data: Dict[str, Any], preferences_data: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """Update profile and preference data for a user in the database."""
    email_clean = email.strip().lower()
    target_user = None
    for u in users_db:
        if u.get('email', '').strip().lower() == email_clean or u.get('id') == email:
            target_user = u
            break

    if target_user:
        if 'profile' not in target_user or not isinstance(target_user['profile'], dict):
            target_user['profile'] = {}
        if 'preferences' not in target_user or not isinstance(target_user['preferences'], dict):
            target_user['preferences'] = {}
            
        if profile_data.get('name'):
            target_user['name'] = profile_data['name']
        if profile_data.get('picture') is not None:
            target_user['picture'] = profile_data['picture']
            
        target_user['profile'].update(profile_data)
        if preferences_data:
            target_user['preferences'].update(preferences_data)
            
        _save_users_to_disk()
        return target_user

    logger.warning("Profile update requested for non-existent user: %s", email)
    raise ValueError("User not found. Please log in again.")

class OTPManager:
    def __init__(self):
        # Dictionary key: f"{email}_{purpose}"
        self.store: Dict[str, Dict[str, Any]] = {}
        self.cooldown_seconds = 30
        self.max_attempts = 5
        self.expires_minutes = 5

    def _cleanup_expired(self):
        now = datetime.utcnow()
        expired_keys = [k for k, v in self.store.items() if now > v["expires_at"]]
        for k in expired_keys:
            del self.store[k]

    def generate_otp(self, email: str, purpose: str = "LOGIN") -> Optional[str]:
        self._cleanup_expired()
        key = f"{email}_{purpose}"
        now = datetime.utcnow()
        
        # Check cooldown
        if key in self.store:
            record = self.store[key]
            time_since_generation = (now - record["generated_at"]).total_seconds()
            if time_since_generation < self.cooldown_seconds:
                raise ValueError(f"Please wait {int(self.cooldown_seconds - time_since_generation)} seconds before requesting a new OTP.")

        # Check if user exists for specific purposes
        if purpose in ["PASSWORD_RESET"]:
            email_clean_check = email.strip().lower()
            user_exists = any(u['email'].strip().lower() == email_clean_check for u in users_db)
            if not user_exists:
                return None
        
        otp = str(secrets.randbelow(900000) + 100000)
        expires_at = now + timedelta(minutes=self.expires_minutes)
        
        self.store[key] = {
            "email": email,
            "purpose": purpose,
            "otp": otp,
            "generated_at": now,
            "expires_at": expires_at,
            "attempts": 0,
            "verified": False
        }
        return otp

    def verify_otp(self, email: str, otp: str, purpose: str = "LOGIN") -> bool:
        self._cleanup_expired()
        key = f"{email}_{purpose}"
        
        record = self.store.get(key)
        if not record:
            return False
            
        # Check expiration
        if datetime.utcnow() > record["expires_at"]:
            del self.store[key]
            return False
            
        # Check attempts
        if record["attempts"] >= self.max_attempts:
            del self.store[key]
            return False
            
        if record["otp"] == otp:
            record["verified"] = True
            return True
            
        # Increment attempts on failure
        record["attempts"] += 1
        return False
        
    def delete_otp(self, email: str, purpose: str):
        key = f"{email}_{purpose}"
        if key in self.store:
            del self.store[key]

otp_manager = OTPManager()
