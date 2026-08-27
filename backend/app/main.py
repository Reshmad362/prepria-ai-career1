import os
import logging
from pathlib import Path

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)

logger = logging.getLogger(__name__)

# ── Load .env explicitly into os.environ ─────────────────────────────────────
def load_env_file():
    backend_dir = Path(__file__).resolve().parent.parent
    env_file = backend_dir / ".env"
    if not env_file.exists():
        env_file = Path.cwd() / ".env"
    
    if env_file.exists():
        try:
            with open(env_file, "r", encoding="utf-8") as f:
                for line in f:
                    line = line.strip()
                    if not line or line.startswith("#") or "=" not in line:
                        continue
                    k, v = line.split("=", 1)
                    k = k.strip()
                    v = v.strip().strip("'\"")
                    if k:
                        os.environ[k] = v
            logger.info("Successfully loaded environment variables from %s", env_file)
        except Exception as e:
            logger.warning("Could not parse .env file: %s", e)

load_env_file()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes.resume_routes import router as resume_router
from app.routes.role_routes import router as role_router
from app.routes.interview_routes import router as interview_router
from app.routes.evaluation_routes import router as evaluation_router
from app.routes.audio_routes import router as audio_router
from app.routes.auth_routes import router as auth_router
from app.routes.analytics_routes import router as analytics_router
try:
    from app.routes.emotion_routes import router as emotion_router
except Exception:
    emotion_router = None
from app.routes.career_routes import router as career_router
from app.routes.ai_routes import router as ai_router
from app.routes.email_routes import router as email_router
from app.routes.document_routes import router as document_router
from app.routes.job_routes import router as job_router

app = FastAPI(title="AI Career Intelligence Platform")

app.include_router(audio_router)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(resume_router)
app.include_router(role_router)
app.include_router(interview_router)
app.include_router(evaluation_router)
app.include_router(auth_router)
app.include_router(auth_router, prefix="/api", tags=["API Auth Compatibility"])
app.include_router(analytics_router)
if emotion_router:
    app.include_router(emotion_router)
app.include_router(career_router)
app.include_router(ai_router, prefix="/ai", tags=["ai"])
app.include_router(email_router, prefix="/email", tags=["email"])
app.include_router(document_router)
app.include_router(job_router)

@app.get("/health")
def health():
    return {"status": "ok"}

@app.get("/")
def root():
    return {"message": "Backend running successfully"}