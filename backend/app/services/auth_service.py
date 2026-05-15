import uuid
import os
import jwt
from datetime import datetime, timedelta
from typing import Dict, Any, Optional
from google.oauth2 import id_token
from google.auth.transport import requests

# Mock Database
users_db = []
password_resets = {}

JWT_SECRET = os.getenv("JWT_SECRET", "your-jwt-secret-here-replace-in-production")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
JWT_EXPIRATION_HOURS = int(os.getenv("JWT_EXPIRATION_HOURS", "24"))
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID", "your-google-client-id-here")

def create_user(name: str, email: str, password: str, google_id: str = None, security_answer: str = None):
    # In a real app we would hash the password
    for u in users_db:
        if u['email'] == email:
            if google_id and not u.get('google_id'):
                u['google_id'] = google_id
                return u
            raise ValueError("Email already registered")
    
    user = {
        "id": str(uuid.uuid4()),
        "name": name,
        "email": email,
        "password": password, # plain text purely for simulated test environments
        "google_id": google_id,
        "picture": None,
        "security_answer": security_answer
    }
    users_db.append(user)
    return user

def authenticate_user(email: str, password: str):
    for u in users_db:
        if u['email'] == email and u['password'] == password:
            return u
    return None

def verify_google_token(token: str) -> Optional[Dict[str, Any]]:
    try:
        # Specify the CLIENT_ID of the app that accesses the backend
        idinfo = id_token.verify_oauth2_token(token, requests.Request(), GOOGLE_CLIENT_ID)
        
        # ID token is valid. Get the user's Google Account ID from the decoded token.
        return idinfo
    except ValueError:
        # Invalid token
        return None

def google_login(email: str, name: str, google_id: str, picture: str = None):
    for u in users_db:
        if u['email'] == email:
            u['google_id'] = google_id # link account
            if picture:
                u['picture'] = picture
            return u
    # Create new if doesn't exist
    user = create_user(name, email, password=str(uuid.uuid4()), google_id=google_id)
    if picture:
        user['picture'] = picture
    return user

def generate_reset_token(email: str) -> Optional[str]:
    for u in users_db:
        if u['email'] == email:
            token = str(uuid.uuid4())
            password_resets[token] = email
            return token
    return None

def reset_password(token: str, new_password: str) -> bool:
    email = password_resets.get(token)
    if not email:
        return False
    for u in users_db:
        if u['email'] == email:
            u['password'] = new_password
            del password_resets[token]
            return True
    return False

def generate_token(user_id: str, email: str, name: str, picture: str = None):
    expiration = datetime.utcnow() + timedelta(hours=JWT_EXPIRATION_HOURS)
    payload = {
        "sub": user_id,
        "email": email,
        "name": name,
        "picture": picture,
        "exp": expiration
    }
    encoded_jwt = jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)
    return {
        "access_token": encoded_jwt,
        "token_type": "bearer",
        "expires_in": JWT_EXPIRATION_HOURS * 3600,
        "user": {
            "id": user_id,
            "email": email,
            "name": name,
            "picture": picture
        }
    }
