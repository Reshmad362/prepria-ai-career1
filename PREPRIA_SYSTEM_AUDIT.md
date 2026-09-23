# PREPRIA — Authoritative System Audit & Verification Baseline
**Audit Version:** 2.0.0 (Post-Review Revision)  
**Date:** September 2026  
**Platform:** PREPRIA — AI Career Intelligence Platform  
**Audit Scope:** Full repository review across Frontend (`React 19 / Vite`), Backend (`Python FastAPI`), and ML Subsystems (`ml-services`).

---

## 1. Executive Summary & Audit Methodology

This audit establishes an evidence-based baseline for the PREPRIA platform. Features are classified strictly according to empirical verification:
- **WORKING:** Verified via executed tests, live API request/response cycles, or authenticated browser sessions with persistent state.
- **PARTIALLY WORKING:** Implemented in parts, but missing backend sync, cross-session persistence, or adaptive closed-loop connections.
- **BROKEN / DEFECTIVE:** Implementation exists but contains functional bugs, unhandled exceptions, or fabricated/randomized data generation.
- **UNUSED / UNINTEGRATED:** Code exists in backend or ML services but is not invoked by the active frontend user flows.

---

## 2. Feature-by-Feature Evidence-Based Audit

### A. Authentication & User Profile
- **Classification:** **PARTIALLY WORKING / CRITICAL SECURITY DEFECTS**
- **Empirical Findings:**
  - `POST /auth/signup`, `POST /auth/login`, `POST /auth/google`, `POST /auth/generate-otp`, `POST /auth/verify-otp` are functional.
  - Profile and preference reads/updates (`GET /auth/me`, `PUT /auth/profile`) correctly enforce JWT Bearer authentication.
  - **Critical Security Finding #1 (Plaintext Passwords):** In `backend/app/services/auth_service.py` (lines 79, 110, 283), candidate passwords are saved and compared as plaintext strings in `users.json`.
  - **Critical Security Finding #2 (Missing Endpoint Authorization):** Analytics, Dashboard, Course Progress, Documents, and Activity endpoints take `user_id` in the URL path or body without validating JWT tokens or checking resource ownership. Any unauthenticated caller can query another user's dashboard by passing their email/id in the URL.

### B. Resume / ATS Intelligence
- **Classification:** **WORKING (PDF) / BROKEN (DOCX)**
- **Empirical Findings:**
  - `POST /upload-resume` parses PDF resumes using `pdfplumber`, extracts skills (with abbreviation expansion), calculates ATS scores (0–95), and updates the user's persistent record.
  - **Defect:** In `resume_service.py` (line 183), text extraction is only executed if `ext == ".pdf"`. While `.docx` is allowed in the file extension validator, it bypasses text extraction, returning an empty text string and a 0 score.

### C. Job Role Matching & Roadmapping
- **Classification:** **WORKING**
- **Empirical Findings:**
  - `POST /match-role` calculates skill matches across 25+ role definitions.
  - `CareerRoadmap.jsx` renders a dynamic 4-phase milestone pathway based on candidate skill gaps.

### D. AI Mock Interview & Audio/Video Streams
- **Classification:** **WORKING**
- **Empirical Findings:**
  - Preflight environment check (`PracticePrerequisite.jsx`) acquires and tests camera, microphone, and display media streams.
  - `SpeechRecognition` transcription parses spoken responses with `resultIndex` offset tracking, preventing duplicate text accumulation.
  - Speech synthesis reads questions aloud.

### E. Anti-Cheating & Proctoring System
- **Classification:** **WORKING**
- **Empirical Findings:**
  - `useInterviewProctoring.js` monitors Page Visibility (`document.hidden`), window blur, camera/mic track status, screen share track events, and canvas face presence (with a 5-second grace period).
  - Enforces a 3-warning limit with automatic session termination.

### F. Interview Evaluation & Zero-Answer Protection
- **Classification:** **PARTIALLY WORKING / DISCONNECTED BACKEND API**
- **Empirical Findings:**
  - `InterviewScreen.jsx` evaluates candidate responses locally using `evaluateInterviewSubmission()` in `interviewQuestionEngine.js`.
  - **Zero-Answer Protection (Verified):** Submitting 0 answers triggers `isValid: false`, displaying a *"Interview Not Completed - No Responses Submitted"* view with 0 score, preventing fake scorecard generation.
  - **Architectural Disconnect:** `backend/app/routes/evaluation_routes.py` (`POST /evaluate-answer`) and `ml-services/nlp-evaluation/answer_evaluator.py` exist in the repository but are **UNUSED** by the frontend interview flow.

### G. Longitudinal Intelligence & Adaptive Interviewing
- **Classification:** **PARTIALLY WORKING**
- **Empirical Findings:**
  - Completed interview records are saved in `localStorage` (`interview_history_{email}`).
  - **Missing Closed Loop:** Completing Interview #1 does **NOT** cause Interview #2 to adaptively modify its question set based on Interview #1 weaknesses.
  - `performance_tracker.py` maintains an in-memory list (`interviews_db = []`) and appends hardcoded weak areas (`["SQL", "System Design"]`), which are lost on server reboot.

### H. AI Learning Hub & Course Gating
- **Classification:** **PARTIALLY WORKING**
- **Empirical Findings:**
  - Syllabus, lesson viewing, timer countdowns (`requiredDurationSeconds`), and checkpoint quizzes render properly.
  - Intermediate lesson dwell times persist in `localStorage` (`course_progress_${userEmail}_${courseId}`) across browser refresh.
  - However, real-time second-by-second timer progress is not synchronized to the backend across multiple devices before lesson completion.

### I. Certificate Security & Eligibility
- **Classification:** **WORKING (Backend Gated)**
- **Empirical Findings:**
  - Tested: `GET /analytics/course/certificate/reshmad362@gmail.com/fs-mastery` on uncompleted course returned:
    `{"success":true,"data":{"eligible":false,"reason":"No progress record found for this course.","progress":null}}`.
  - Direct URL access without passing all required module lessons and quizzes is rejected by the backend.

### J. Emotion Detection Subsystem
- **Classification:** **BROKEN / UNSAFE FOR RESEARCH CLAIMS**
- **Empirical Findings:**
  - In `ml-services/emotion-detection/emotion_service.py` (lines 86-91), OpenCV face tracking and lighting checks work, but emotion classification uses `random.choice(["Happy", "Neutral", "Nervous", "Confident"])` and `confidence: round(random.uniform(0.75, 0.98), 2)`.
  - This is scientifically invalid and unsafe for research or production evaluation.

### K. Executive Dashboard & Progress Analytics
- **Classification:** **PARTIALLY WORKING**
- **Empirical Findings:**
  - `GET /analytics/dashboard/:userId` successfully aggregates metrics and is consumed by `Dashboard.jsx`.
  - `Dashboard.jsx` contains a hardcoded URL `http://localhost:8000/analytics/dashboard/...` on line 90.
  - `Scorecard.jsx` (Progress Analytics) constructs radar and pie charts from local activity arrays with mock offsets (`latestIntScore - 15`) rather than aggregating real multi-dimensional evaluations from the backend.

---

## 3. Comprehensive Backend API Inventory

| HTTP Method | Route Path | Auth Requirement | Parameter Location | Data Source | Security / Verification Status |
|---|---|---|---|---|---|
| `POST` | `/auth/signup` | Public | Body (JSON) | `users.json` | **WORKING** (Plaintext password defect) |
| `POST` | `/auth/login` | Public | Body (JSON) | `users.json` | **WORKING** (Plaintext password defect) |
| `POST` | `/auth/google` | Public | Body (JSON) | Google Auth | **WORKING** |
| `POST` | `/auth/generate-otp` | Public | Body (JSON) | In-Memory OTP | **WORKING** |
| `POST` | `/auth/verify-otp` | Public | Body (JSON) | In-Memory OTP | **WORKING** |
| `GET` | `/auth/profile`, `/auth/me` | Bearer JWT | Header | `users.json` | **WORKING (SECURE)** |
| `PUT` | `/auth/profile`, `/auth/me` | Bearer JWT | Header + Body | `users.json` | **WORKING (SECURE)** |
| `POST` | `/upload-resume` | Optional Bearer | Multipart File | `uploads/` + Memory | **WORKING (PDF) / BROKEN (DOCX)** |
| `POST` | `/match-role` | Public | Body (JSON) | In-Memory Rules | **WORKING** |
| `POST` | `/generate-interview` | Public | Body (JSON) | Question Bank | **WORKING** |
| `POST` | `/evaluate-answer` | Public | Body (JSON) | `answer_evaluator.py` | **UNUSED BY FRONTEND** |
| `GET` | `/analytics/dashboard/{user_id}` | Public | Path Parameter | Multi-Service | **WORKING (INSECURE: No JWT / Ownership)** |
| `GET` | `/analytics/engagement/{user_id}`| Public | Path Parameter | `activities.json` | **WORKING (INSECURE: No JWT / Ownership)** |
| `POST` | `/analytics/activity/record` | Public | Body (JSON) | `activities.json` | **WORKING (INSECURE: No JWT / Ownership)** |
| `POST` | `/analytics/course/progress` | Public | Body (JSON) | `course_progress.json` | **WORKING (INSECURE: No JWT / Ownership)** |
| `GET` | `/analytics/course/certificate/{uid}/{cid}` | Public | Path Parameter | `course_progress.json` | **WORKING (INSECURE: No JWT / Ownership)** |
| `GET` | `/api/jobs/` | Public | Query / None | `jobsData.js` | **PARTIAL (404 when loaded via main.py)** |
| `POST` | `/api/jobs/match` | Public | Body (JSON) | In-Memory Catalog | **WORKING** |
| `POST` | `/documents/upload` | Public | Form Data | `uploads/` | **WORKING (INSECURE: No JWT / Ownership)** |
| `GET` | `/documents/list/{user_id}` | Public | Path Parameter | Disk / Memory | **WORKING (INSECURE: No JWT / Ownership)** |
| `POST` | `/emotion-detection` | Public | Body (JSON) | OpenCV / Random | **BROKEN / UNSAFE FOR RESEARCH** |
| `POST` | `/transcribe` | Public | Multipart File | Whisper | **PARTIAL (Requires Whisper)** |

---

## 4. Prioritized Critical Defects

1. **P0 — Plaintext Password Storage:**
   - User passwords in `backend/app/data/users.json` are stored in plaintext without cryptographic hashing.
2. **P0 — Unprotected User Data Endpoints (No Resource Ownership Validation):**
   - Endpoints in `analytics_routes.py`, `document_routes.py`, and `career_routes.py` accept arbitrary `user_id` parameters without requiring JWT authentication or verifying that the requester owns the requested data.
3. **P0 — Missing DOCX Text Extraction:**
   - `.docx` resumes uploaded to `/upload-resume` bypass text extraction, resulting in empty parsed text and 0 ATS scores.
4. **P1 — Disconnected Backend NLP Evaluation:**
   - The FastAPI `/evaluate-answer` endpoint is not invoked during candidate interview completion; evaluations run entirely client-side.
5. **P1 — Non-Persistent Interview History & Inactive Adaptive Loop:**
   - `performance_tracker.py` uses an in-memory list (`interviews_db = []`) that is lost on server restart; Interview #2 does not adaptively target Interview #1 weaknesses.
6. **P1 — Fabricated / Randomized Emotion Classification:**
   - `emotion_service.py` randomly assigns emotion labels and confidence values via `random.choice()`.
7. **P2 — Progress Analytics Radar Heuristics:**
   - `Scorecard.jsx` displays hardcoded/offset calculations (`latestIntScore - 15`) instead of true multi-dimensional session analytics.
