# PREPRIA — Remaining Engineering Work & Revised Phase Roadmap
**Document Version:** 2.0.0 (Post-Review Revision)  
**Date:** September 2026  
**Scope:** Canonical future development sequence and rigorous acceptance criteria based on Phase 0 audit findings.

---

## 1. Summary of Unfinished & Defective Functionality

| Subsystem | Verified Defect / Incompletion | Severity | Target Phase |
|---|---|---|---|
| **Auth & Data Security** | Plaintext password storage in `users.json`. | **P0 (Critical)** | Phase 1 |
| **Endpoint Authorization** | Missing JWT / resource ownership checks on analytics, dashboard, documents, and progress APIs. | **P0 (Critical)** | Phase 1 |
| **Resume Extraction** | `.docx` files bypass text extraction in `resume_service.py` (empty parsed output). | **P0 (Critical)** | Phase 2 |
| **NLP Interview Evaluation** | FastAPI `/evaluate-answer` endpoint is disconnected from frontend interview submissions. | **P1 (High)** | Phase 3 |
| **Interview Persistence** | `performance_tracker.py` uses in-memory `interviews_db = []` (lost on server reboot). | **P1 (High)** | Phase 3 |
| **Adaptive Interview Loop** | Interview #2 does not consume Interview #1 historical weaknesses to adapt questions. | **P1 (High)** | Phase 4 |
| **Learning Hub Multi-Device Sync**| Second-by-second dwell timer only exists in browser `localStorage`, not persisted to server mid-lesson. | **P2 (Medium)** | Phase 5 |
| **Progress Analytics** | `Scorecard.jsx` displays heuristic/local calculations instead of backend multi-dimensional history. | **P2 (Medium)** | Phase 6 |
| **Emotion ML Subsystem** | Emotion classification uses `random.choice()` instead of a scientifically valid model or objective metrics. | **P2 (Medium)** | Phase 7 |

---

## 2. Definitive Future Development Phases

### Phase 1 — Security & Data Ownership
- **Objective:** Eliminate plaintext passwords, enforce JWT validation on all private data endpoints, and verify user resource ownership.
- **Scope & Changes:**
  - Hash passwords using bcrypt (`passlib` / `bcrypt`) in `backend/app/services/auth_service.py`.
  - Secure all endpoints in `analytics_routes.py`, `document_routes.py`, and `career_routes.py` with `Depends(get_current_user_from_header)`.
  - Enforce that `user_id` matches the authenticated JWT token identity.
  - Normalize all frontend API calls in `Dashboard.jsx` and other pages to `import.meta.env.VITE_API_URL`.
- **Acceptance Criteria:**
  - Zero plaintext passwords in `users.json`.
  - Calling `/analytics/dashboard/{user_id}` without a valid Bearer token returns HTTP 401.
  - User A cannot access User B's dashboard or documents (HTTP 403 / 401).

---

### Phase 2 — Resume Intelligence / DOCX Text Extraction
- **Objective:** Implement structured `.docx` text extraction and achieve parity with PDF ATS parsing.
- **Scope & Changes:**
  - Add `python-docx` extraction logic in `backend/app/services/resume_service.py`.
  - **Explicitly Supported DOCX Structures:** Paragraphs, headings (H1–H6), bulleted/numbered lists, standard table cells, and text runs.
  - **Documented Unsupported Structures:** Embedded OLE objects, drawn canvas shapes, macro-enabled XML scripts, and password-protected files.
- **Acceptance Criteria:**
  - Uploading `.docx` resumes extracts all supported text structures into the skill extractor.
  - ATS score calculation matches identical metrics across both PDF and DOCX formats.

---

### Phase 3 — Interview Evaluation + Persistent History
- **Objective:** Connect the FastAPI evaluation engine to the interview workflow and persist all interview sessions to disk.
- **Scope & Changes:**
  - Create persistent JSON store `backend/app/data/interview_history.json`.
  - Connect semantic answer evaluation via `POST /evaluate-answer` and `nlp-evaluation`.
  - Remove hardcoded weak areas/improved skills from `performance_tracker.py`.
- **Acceptance Criteria:**
  - Completed interview sessions survive server restarts.
  - Zero-Answer Protection remains strictly enforced (0 answers = 0 score / not completed).
  - Scorecard dimensions reflect evaluated candidate transcripts.

---

### Phase 4 — Longitudinal Intelligence & Adaptive Questioning
- **Objective:** Close the intelligence loop so Interview #2 adaptively incorporates Interview #1 historical performance and skill gaps.
- **Scope & Changes:**
  - Upgrade `interview_engine.py` to query past session evaluations for the active user.
  - Adaptively modulate question difficulty and focus areas targeting unresolved skill gaps.
  - Calculate true longitudinal growth trajectories (Baseline vs Current).
- **Acceptance Criteria:**
  - Candidate completing Interview #1 with weakness in *System Scalability* receives targeted scalability questions in Interview #2.
  - Growth trends reflect actual score and fluency deltas between sessions.

---

### Phase 5 — Learning Hub Hardening & Persistent Progress
- **Objective:** Ensure multi-device intermediate dwell-time persistence and reinforce module/assessment gating.
- **Scope & Changes:**
  - Synchronize periodic dwell time heartbeats to `POST /analytics/course/progress`.
  - Ensure lesson unlock states and quiz records persist across browser refresh, logout/login, and multi-device sessions.
- **Acceptance Criteria:**
  - User spending 3 minutes on a lesson on Device A sees 3 minutes preserved on Device B upon login.
  - Certificates remain strictly locked until all required lessons, quizzes (≥70%), and final exams are passed.

---

### Phase 6 — Dashboard & Progress Analytics Unification
- **Status:** **COMPLETED & TESTED**
- **Scope & Changes Implemented:**
  - Standardized backend responses in `GET /analytics/dashboard/{user_id}` and `GET /analytics/growth/{user_id}`.
  - Connected `Dashboard.jsx` and `Scorecard.jsx` to authentic backend 5-pillar dimensions.
  - Automated test suites: `test_phase6_dashboard_analytics.py` (18 tests), `test_phase6_dynamic_interview.py` (16 tests).

---

### Phase 7 — Resume-Driven Dynamic Interview Intelligence
- **Status:** **COMPLETED & TESTED**
- **Objective:** Generate auditable candidate-specific interview sessions derived from parsed resume evidence.
- **Scope & Changes Implemented:**
  - Implemented `dynamic_question_generator.py` with resume evidence normalization (skills, projects, experience, education, certifications).
  - Enforced zero-fabrication audit (no ungrounded resume claims).
  - Implemented dynamic follow-up generation based on candidate transcripts.
  - Automated test suite: `test_phase7_resume_dynamic_interview.py` (23 tests).

---

### Phase 8 — Multi-Dimensional Personalized Recommendation Engine
- **Status:** **COMPLETED, TESTED & FRONTEND INTEGRATED**
- **Objective:** Provide authenticated, persistent career recommendations derived from real resume evidence, role gaps, interview weaknesses, and learning progress.
- **Scope & Changes Implemented:**
  - Implemented `recommendation_service.py` and `recommendation_routes.py` (`GET /recommendations`, `PUT /recommendations/{id}/status`).
  - Integrated into `Dashboard.jsx` and `CareerRoadmap.jsx` via `api.js`.
  - Automated test suite: `test_phase8_recommendations.py` (21 tests).

---

### Phase 9 — Advanced Longitudinal Intelligence Engine
- **Status:** **COMPLETED, TESTED & FRONTEND INTEGRATED**
- **Objective:** Provide longitudinal mastery tracking, weakness progression (recurring, persistent, resolved), and trajectory analytics across multi-session interview history.
- **Scope & Changes Implemented:**
  - Implemented `longitudinal_service.py` and `longitudinal_routes.py` (`GET /longitudinal/profile`, `GET /longitudinal/topic/{topic}`).
  - Integrated into `Dashboard.jsx`, `Scorecard.jsx`, and `GrowthDashboard.jsx`.
  - Automated test suite: `test_phase9_longitudinal_intelligence.py` (25 tests).

---

### Phase 10 — AI/ML Quality Hardening & Full 14-Stage E2E Validation
- **Status:** **COMPLETED & TESTED**
- **Objective:** Eliminate randomized emotion classifications and validate complete 14-stage candidate lifecycle.
- **Scope & Changes Implemented:**
  - Eliminated `random.choice` / `random.uniform` from `ml-services/emotion-detection/emotion_service.py` and replaced with deterministic, objective visual engagement and quality metrics.
  - Automated E2E test suite: `test_phase10_e2e_lifecycle.py` (14-stage end-to-end integration test).
  - Automated emotion determinism suite: `test_emotion_analysis.py` (32 tests).
