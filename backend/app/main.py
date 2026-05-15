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
app.include_router(analytics_router)
if emotion_router: app.include_router(emotion_router)
app.include_router(career_router)
app.include_router(ai_router, prefix="/ai", tags=["ai"])
app.include_router(email_router, prefix="/email", tags=["email"])

@app.get("/health")
def health():
    return {"status": "ok"}

@app.get("/")
def root():
    return {"message": "Backend running successfully"}