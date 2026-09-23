import pytest
import os
import jwt
from datetime import datetime, timedelta
from fastapi.testclient import TestClient
import uuid

import sys
import os

backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

# Set test environment
os.environ["APP_ENV"] = "test"
os.environ["JWT_SECRET"] = "test-secret-key-for-phase1-verification-2026"
os.environ["JWT_EXPIRATION_HOURS"] = "24"

from main import app
from app.services.auth_service import (
    users_db,
    _save_users_to_disk,
    hash_password,
    verify_password,
    is_hashed_password,
    sanitize_user,
    generate_token,
    JWT_SECRET,
    JWT_ALGORITHM
)

client = TestClient(app)

# Helper fixtures
@pytest.fixture(autouse=True)
def setup_test_users():
    # Setup test users without affecting any existing real accounts
    user_a_email = "security-test-user-a@example.test"
    user_b_email = "security-test-user-b@example.test"
    legacy_user_email = "security-legacy-user@example.test"
    
    # Remove previous test accounts if any
    for email in [user_a_email, user_b_email, legacy_user_email]:
        for u in list(users_db):
            if u.get("email") == email:
                users_db.remove(u)
    
    # User A (Bcrypt Hashed)
    user_a = {
        "id": "test-uuid-user-a",
        "name": "User A",
        "email": user_a_email,
        "password": hash_password("PasswordA123!"),
        "google_id": None,
        "picture": None,
        "profile": {"name": "User A", "email": user_a_email, "phone": "1234567890"},
        "preferences": {"targetRole": "Frontend Developer"},
        "scoreHistory": []
    }
    
    # User B (Bcrypt Hashed)
    user_b = {
        "id": "test-uuid-user-b",
        "name": "User B",
        "email": user_b_email,
        "password": hash_password("PasswordB123!"),
        "google_id": None,
        "picture": None,
        "profile": {"name": "User B", "email": user_b_email, "phone": "0987654321"},
        "preferences": {"targetRole": "Backend Developer"},
        "scoreHistory": []
    }
    
    # Legacy User (Plaintext Password for migration testing)
    legacy_user = {
        "id": "test-uuid-legacy",
        "name": "Legacy User",
        "email": legacy_user_email,
        "password": "PlaintextPassword999!", # Legacy plaintext
        "google_id": None,
        "picture": None,
        "profile": {"name": "Legacy User", "email": legacy_user_email},
        "preferences": {},
        "scoreHistory": []
    }
    
    users_db.extend([user_a, user_b, legacy_user])
    _save_users_to_disk()
    
    yield {
        "user_a": user_a,
        "user_b": user_b,
        "legacy_user": legacy_user
    }
    
    # Clean up test accounts after test
    for email in [user_a_email, user_b_email, legacy_user_email]:
        for u in list(users_db):
            if u.get("email") == email:
                users_db.remove(u)
    _save_users_to_disk()

def get_auth_token_for(user):
    token_res = generate_token(user["id"], user["email"], user["name"])
    return token_res["access_token"]

# ==========================================
# 1. AUTHENTICATION & PASSWORD TESTS (1-9)
# ==========================================

def test_1_new_signup_stores_bcrypt_hash():
    email = f"signup-test-{uuid.uuid4().hex[:6]}@example.test"
    res = client.post("/auth/signup", json={
        "name": "New User",
        "email": email,
        "password": "NewSecretPassword123!"
    })
    assert res.status_code == 200
    # Verify in users_db that password is a bcrypt/salted hash, not plaintext
    created_user = next((u for u in users_db if u["email"] == email), None)
    assert created_user is not None
    assert created_user["password"] != "NewSecretPassword123!"
    assert is_hashed_password(created_user["password"])
    assert verify_password("NewSecretPassword123!", created_user["password"])

def test_2_login_success_with_hash():
    res = client.post("/auth/login", json={
        "email": "security-test-user-a@example.test",
        "password": "PasswordA123!"
    })
    assert res.status_code == 200
    data = res.json()
    assert data["success"] is True
    assert "access_token" in data
    assert data["token_type"] == "bearer"

def test_3_login_failure_wrong_password():
    res = client.post("/auth/login", json={
        "email": "security-test-user-a@example.test",
        "password": "WrongPassword!"
    })
    assert res.status_code == 401

def test_4_legacy_plaintext_account_migrates_on_login(setup_test_users):
    legacy_user = setup_test_users["legacy_user"]
    assert legacy_user["password"] == "PlaintextPassword999!"
    assert not is_hashed_password(legacy_user["password"])

    res = client.post("/auth/login", json={
        "email": legacy_user["email"],
        "password": "PlaintextPassword999!"
    })
    assert res.status_code == 200
    assert "access_token" in res.json()

def test_5_after_migration_stored_password_is_hash(setup_test_users):
    legacy_email = setup_test_users["legacy_user"]["email"]
    # Trigger migration
    client.post("/auth/login", json={
        "email": legacy_email,
        "password": "PlaintextPassword999!"
    })
    migrated_user = next(u for u in users_db if u["email"] == legacy_email)
    assert migrated_user["password"] != "PlaintextPassword999!"
    assert is_hashed_password(migrated_user["password"])
    assert verify_password("PlaintextPassword999!", migrated_user["password"])

def test_6_missing_bearer_token_returns_401():
    res = client.get("/auth/me")
    assert res.status_code == 401
    assert "Missing or invalid authentication token" in res.json()["detail"]

def test_7_invalid_bearer_token_returns_401():
    res = client.get("/auth/me", headers={"Authorization": "Bearer invalid_garbage_token_12345"})
    assert res.status_code == 401
    assert "Invalid or expired session token" in res.json()["detail"]

def test_8_expired_jwt_returns_401(setup_test_users):
    user = setup_test_users["user_a"]
    expired_payload = {
        "sub": user["id"],
        "email": user["email"],
        "name": user["name"],
        "exp": datetime.utcnow() - timedelta(hours=1) # expired
    }
    expired_token = jwt.encode(expired_payload, JWT_SECRET, algorithm=JWT_ALGORITHM)
    res = client.get("/auth/me", headers={"Authorization": f"Bearer {expired_token}"})
    assert res.status_code == 401

def test_9_malformed_auth_header_returns_401():
    res = client.get("/auth/me", headers={"Authorization": "TokenWithoutBearerPrefix"})
    assert res.status_code == 401

# ==========================================
# 2. OWNERSHIP & DATA ISOLATION TESTS (10-16)
# ==========================================

def test_10_user_a_can_access_own_dashboard(setup_test_users):
    user_a = setup_test_users["user_a"]
    token_a = get_auth_token_for(user_a)
    res = client.get(f"/analytics/dashboard/{user_a['email']}", headers={"Authorization": f"Bearer {token_a}"})
    assert res.status_code == 200
    assert res.json()["success"] is True

def test_11_user_a_cannot_access_user_b_dashboard(setup_test_users):
    user_a = setup_test_users["user_a"]
    user_b = setup_test_users["user_b"]
    token_a = get_auth_token_for(user_a)
    
    # User A tries to access User B's dashboard by email
    res = client.get(f"/analytics/dashboard/{user_b['email']}", headers={"Authorization": f"Bearer {token_a}"})
    assert res.status_code == 403
    
    # User A tries to access User B's dashboard by UUID
    res2 = client.get(f"/analytics/dashboard/{user_b['id']}", headers={"Authorization": f"Bearer {token_a}"})
    assert res2.status_code == 403

def test_12_user_a_cannot_access_user_b_documents(setup_test_users):
    user_a = setup_test_users["user_a"]
    user_b = setup_test_users["user_b"]
    token_a = get_auth_token_for(user_a)
    
    res = client.get(f"/documents/list/{user_b['email']}", headers={"Authorization": f"Bearer {token_a}"})
    assert res.status_code == 403

def test_13_user_a_cannot_access_user_b_course_progress(setup_test_users):
    user_a = setup_test_users["user_a"]
    user_b = setup_test_users["user_b"]
    token_a = get_auth_token_for(user_a)
    
    res = client.get(f"/analytics/course/progress/{user_b['email']}/course-101", headers={"Authorization": f"Bearer {token_a}"})
    assert res.status_code == 403

def test_14_user_a_cannot_access_user_b_certificate(setup_test_users):
    user_a = setup_test_users["user_a"]
    user_b = setup_test_users["user_b"]
    token_a = get_auth_token_for(user_a)
    
    res = client.get(f"/analytics/course/certificate/{user_b['email']}/course-101", headers={"Authorization": f"Bearer {token_a}"})
    assert res.status_code == 403

def test_15_user_a_cannot_submit_analytics_for_user_b(setup_test_users):
    user_a = setup_test_users["user_a"]
    user_b = setup_test_users["user_b"]
    token_a = get_auth_token_for(user_a)
    
    res = client.post("/analytics/record", json={
        "user_id": user_b["email"], # Impersonating User B
        "role": "Frontend Developer",
        "score": 0.95,
        "fluency_score": 90,
        "emotion_confidence": 0.88,
        "ats_score": 85
    }, headers={"Authorization": f"Bearer {token_a}"})
    assert res.status_code == 403

def test_16_client_supplied_userid_cannot_override_jwt_identity(setup_test_users):
    user_a = setup_test_users["user_a"]
    user_b = setup_test_users["user_b"]
    token_a = get_auth_token_for(user_a)
    
    res = client.post("/analytics/activity/record", json={
        "user_id": user_b["email"],
        "activity_type": "lesson_complete",
        "title": "Module 1"
    }, headers={"Authorization": f"Bearer {token_a}"})
    assert res.status_code == 403

# ==========================================
# 3. DATA LEAKAGE PREVENTION TESTS (17-20)
# ==========================================

def test_17_login_response_does_not_contain_password_or_hash():
    res = client.post("/auth/login", json={
        "email": "security-test-user-a@example.test",
        "password": "PasswordA123!"
    })
    assert res.status_code == 200
    res_text = res.text
    assert "password" not in res.json().get("user", {})
    assert "PasswordA123!" not in res_text
    assert "$2b$" not in res_text

def test_18_signup_response_does_not_contain_password_or_hash():
    email = f"leak-test-{uuid.uuid4().hex[:6]}@example.test"
    res = client.post("/auth/signup", json={
        "name": "Leak Test",
        "email": email,
        "password": "SecretPassword123!"
    })
    assert res.status_code == 200
    res_text = res.text
    assert "password" not in res.json().get("user", {})
    assert "SecretPassword123!" not in res_text
    assert "$2b$" not in res_text

def test_19_profile_response_does_not_contain_password_or_hash(setup_test_users):
    user_a = setup_test_users["user_a"]
    token_a = get_auth_token_for(user_a)
    res = client.get("/auth/me", headers={"Authorization": f"Bearer {token_a}"})
    assert res.status_code == 200
    res_text = res.text
    assert "password" not in res.json().get("user", {})
    assert "$2b$" not in res_text
    assert "PasswordA123!" not in res_text

def test_20_sanitize_user_utility_strips_credentials():
    raw_user = {
        "id": "123",
        "name": "Test",
        "email": "test@example.com",
        "password": "hashed_secret_password",
        "security_answer": "secret_answer",
        "profile": {"name": "Test"}
    }
    sanitized = sanitize_user(raw_user)
    assert "password" not in sanitized
    assert "security_answer" not in sanitized
    assert sanitized["email"] == "test@example.com"

# ==========================================
# 4. ADDITIONAL SECURITY & BOUNDARY TESTS (21-30)
# ==========================================

def test_21_upload_resume_with_invalid_token_returns_401():
    # Multipart file upload with invalid token
    files = {'file': ('resume.pdf', b'%PDF-1.4 dummy pdf content', 'application/pdf')}
    res = client.post("/upload-resume", files=files, headers={"Authorization": "Bearer invalid_token_xyz"})
    assert res.status_code == 401

def test_22_upload_resume_anonymous_succeeds_without_persisting():
    files = {'file': ('resume.pdf', b'%PDF-1.4 dummy pdf content', 'application/pdf')}
    res = client.post("/upload-resume", files=files)
    assert res.status_code == 200
    data = res.json()
    assert data["success"] is True
    assert "data" in data

def test_23_set_password_hashes_new_password(setup_test_users):
    user_a = setup_test_users["user_a"]
    token_a = get_auth_token_for(user_a)
    res = client.post("/auth/set-password", json={
        "new_password": "NewUpdatedPassword123!",
        "confirm_password": "NewUpdatedPassword123!"
    }, headers={"Authorization": f"Bearer {token_a}"})
    assert res.status_code == 200
    
    updated_user = next(u for u in users_db if u["email"] == user_a["email"])
    assert updated_user["password"] != "NewUpdatedPassword123!"
    assert is_hashed_password(updated_user["password"])
    assert verify_password("NewUpdatedPassword123!", updated_user["password"])

def test_24_career_suggestions_cross_user_forbidden(setup_test_users):
    user_a = setup_test_users["user_a"]
    user_b = setup_test_users["user_b"]
    token_a = get_auth_token_for(user_a)
    
    res = client.post("/career-suggestions", json={
        "user_id": user_b["email"],
        "resume_skills": ["Java"],
        "matched_roles": ["Backend Developer"]
    }, headers={"Authorization": f"Bearer {token_a}"})
    assert res.status_code == 403

def test_25_document_delete_cross_user_forbidden(setup_test_users):
    user_a = setup_test_users["user_a"]
    user_b = setup_test_users["user_b"]
    token_a = get_auth_token_for(user_a)
    
    res = client.delete(f"/documents/{user_b['email']}/doc-123", headers={"Authorization": f"Bearer {token_a}"})
    assert res.status_code == 403

def test_26_public_health_and_role_match_accessible():
    res = client.get("/health")
    assert res.status_code == 200
    
    res2 = client.post("/match-role", json={"skills": ["Python", "SQL"]})
    assert res2.status_code == 200

def test_27_public_generate_interview_accessible():
    res = client.post("/generate-interview", json={
        "role": "Frontend Developer",
        "difficulty": "medium",
        "question_count": 3
    })
    assert res.status_code == 200
    assert "questions" in res.json()

def test_28_growth_analytics_cross_user_forbidden(setup_test_users):
    user_a = setup_test_users["user_a"]
    user_b = setup_test_users["user_b"]
    token_a = get_auth_token_for(user_a)
    
    res = client.get(f"/analytics/growth/{user_b['email']}", headers={"Authorization": f"Bearer {token_a}"})
    assert res.status_code == 403

def test_29_engagement_metrics_cross_user_forbidden(setup_test_users):
    user_a = setup_test_users["user_a"]
    user_b = setup_test_users["user_b"]
    token_a = get_auth_token_for(user_a)
    
    res = client.get(f"/analytics/engagement/{user_b['email']}", headers={"Authorization": f"Bearer {token_a}"})
    assert res.status_code == 403

def test_30_document_upload_cross_user_forbidden(setup_test_users):
    user_a = setup_test_users["user_a"]
    user_b = setup_test_users["user_b"]
    token_a = get_auth_token_for(user_a)
    
    data = {"user_id": user_b["email"], "category": "Certificate"}
    files = {"file": ("cert.pdf", b"%PDF-1.4 dummy cert", "application/pdf")}
    res = client.post("/documents/upload", data=data, files=files, headers={"Authorization": f"Bearer {token_a}"})
    assert res.status_code == 403
