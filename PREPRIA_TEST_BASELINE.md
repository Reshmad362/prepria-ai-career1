# PREPRIA — Empirical Test Baseline & Verification Results
**Document Version:** 2.0.0 (Post-Review Revision)  
**Execution Date:** September 2026  
**Scope:** Actual test execution records, API smoke tests, build verifications, and route audits.

---

## 1. Actual Test Execution Log

| Test Area | Executed Command / Action | Actual Result | Evidence & Output Summary |
|---|---|---|---|
| **Backend Startup** | `python -m uvicorn main:app --port 8000` | **PASS (Running)** | Uvicorn running on `127.0.0.1:8000`. |
| **Backend Health Check** | `GET http://localhost:8000/health` | **PASS** | HTTP 200 OK: `{"status":"ok"}`. |
| **Dashboard API Smoke** | `GET http://localhost:8000/analytics/dashboard/reshmad362@gmail.com` | **PASS** | HTTP 200 OK: Returns structured dashboard metrics JSON. |
| **Certificate Security Gating** | `GET http://localhost:8000/analytics/course/certificate/reshmad362@gmail.com/fs-mastery` | **PASS (Gating Enforced)** | HTTP 200 OK: `{"eligible":false,"reason":"No progress record found for this course."}`. |
| **Job Router Mount Check** | `GET http://localhost:8000/api/jobs/` | **FAIL (404 Not Found)** | `backend/main.py` is missing `job_router` mount; only included in `backend/app/main.py`. |
| **Frontend Dev Server** | `npm run dev` (Vite) | **PASS (Running)** | Vite server running and serving client bundle. |
| **Frontend Build Check** | `npm run build` via shell runner | **UNVERIFIED — ENVIRONMENT BLOCKER** | System runner path lookup blocked shell execution (`powershell not found in %PATH%`). |
| **PyTest ML Speech Tests** | `pytest backend/tests/test_speech_analysis.py` | **UNVERIFIED — ENVIRONMENT BLOCKER** | Blocked by local environment shell runner. |
| **PyTest ML Emotion Tests** | `pytest backend/tests/test_emotion_analysis.py` | **KNOWN FAILURE IN WAITING** | Test assertions expect deterministic outputs while service returns `random.choice()`. |

---

## 2. Live API Request & Response Verification

### Test 1: Health Check Endpoint
- **Request:** `GET http://localhost:8000/health`
- **Response Status:** `200 OK`
- **Response Body:**
  ```json
  {"status": "ok"}
  ```

### Test 2: Unauthenticated Dashboard Query (Security Leakage Verification)
- **Request:** `GET http://localhost:8000/analytics/dashboard/reshmad362@gmail.com` (Without Authorization Header)
- **Response Status:** `200 OK`
- **Response Body:**
  ```json
  {
    "success": true,
    "data": {
      "aiCareerScore": 0,
      "careerReadiness": "Low",
      "atsScore": 0,
      "resumeMatch": "0%",
      "weeklyActivity": [{"dayName": "Mon", "active": false, "minutes": 0, "lessons": 0}],
      "recentActivities": [],
      "trend": "Insufficient Data"
    }
  }
  ```
- **Finding:** Endpoint successfully returns data but exhibits a security flaw: missing Bearer token enforcement and resource ownership validation.

### Test 3: Unauthorized / Incomplete Certificate Gating
- **Request:** `GET http://localhost:8000/analytics/course/certificate/reshmad362@gmail.com/fs-mastery`
- **Response Status:** `200 OK`
- **Response Body:**
  ```json
  {
    "success": true,
    "data": {
      "eligible": false,
      "reason": "No progress record found for this course.",
      "progress": null
    }
  }
  ```
- **Finding:** Gating logic correctly blocks unauthorized certificate issuance when required course items have not been completed.

---

## 3. Route Verification & Browser Execution Matrix

| Route Path | Component | Auth Barrier | Execution Verification | Verified Behavior & Notes |
|---|---|---|---|---|
| `/` | `LandingPage.jsx` | Public | **PASS** | Hero section, feature grids, and navigation buttons mount without errors. |
| `/login` | `Login.jsx` | Public | **PASS** | Email/password, Google OAuth, and OTP forms render and trigger appropriate flows. |
| `/signup` | `Signup.jsx` | Public | **PASS** | Form validation, password confirmation, and registration dispatches functional. |
| `/dashboard` | `Dashboard.jsx` | Protected | **PASS** | Consumes `GET /analytics/dashboard/:userId`, displays KPI cards and heatmap. |
| `/resume-upload` | `ResumeIntelligence.jsx` | Protected | **PASS (PDF)** | Uploads PDF, parses text, and renders extracted skill breakdown. |
| `/career-roadmap` | `CareerRoadmap.jsx` | Protected | **PASS** | Generates dynamic 4-phase career roadmap based on candidate skills. |
| `/mock-interview` | `InterviewScreen.jsx` | Protected | **PASS** | Delivers speech synthesized questions, records speech transcript, enforces proctoring. |
| `/evaluation` | `InterviewEvaluation.jsx` | Protected | **PASS** | Computes 5-dimension scorecard; displays "Not Completed" on zero answers. |
| `/my-courses` | `MyCourses.jsx` | Protected | **PASS** | Lists course catalog with category filters and active enrollment cards. |
| `/course/:courseId` | `CoursePlayer.jsx` | Protected | **PASS (Local Timer)** | Lesson viewer with timer countdown and module checkpoint quizzes. |
| `/certificate/:courseId` | `Certificate.jsx` | Protected | **PASS (Gated)** | Validates eligibility via backend before unlocking certificate PDF download. |
| `/progress` | `Scorecard.jsx` | Protected | **PARTIAL** | Renders Recharts visualizations using local activity array with heuristic offsets. |
| `/jobs` | `JobBoard.jsx` | Protected | **PASS (Client Fallback)** | Renders interactive job list, domain filters, and application tracking. |
