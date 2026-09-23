# PREPRIA — Permanent Engineering & Development Rules
**Document Version:** 1.0.0  
**Baseline Date:** September 2026  
**Scope:** Universal contract for all engineering phases on the PREPRIA AI Career Intelligence Platform.

---

## 1. Core Engineering Principles

### Rule 1: Existing UI Must Be Preserved
- **DO NOT** redesign, restyle, rearrange, rename, or replace any existing UI.
- Preserve all existing:
  - Layouts and grid structures
  - Color palettes and theme tokens (dark/light modes)
  - Padding, margins, and component spacing
  - Typography, fonts, and font sizes
  - Navigation hierarchy and route paths
  - Dashboard cards, metrics cards, and chart components
  - Interview studio screen, video frame, and proctoring banners
  - Learning Hub, Course Player, and Certificate layouts
- All future development MUST modify functionality underneath the existing UI unless a UI modification is strictly required by new acceptance criteria.

### Rule 2: Do Not Rebuild Existing Functionality
- Before writing any code, inspect the existing implementation.
- Classify features based on empirical evidence:
  - `WORKING`: Fully functioning with real data flow and persistence.
  - `PARTIALLY WORKING`: Functional in parts, but missing backend sync, validation, or full integration.
  - `BROKEN`: Code exists but crashes, throws runtime errors, or fails to execute logic.
  - `MISSING`: Route or stub exists, but the core engine/API/database logic is absent.
- If a feature exists and works, **do not rewrite it**. Refactor or augment only where necessary to meet acceptance criteria.

### Rule 3: Zero Mock/Fabricated Functionality
- Do **not** mark a feature complete because:
  - A button exists and navigates
  - Dummy/hardcoded numbers appear in a card
  - A static or fake API response is returned
  - A success toast is displayed without underlying execution
- Every feature must have authentic data flow: User Input → Validation → API → Engine/Service → Persistence → State Update → UI.

### Rule 4: No Fabricated Research Results
- Never fabricate or hardcode:
  - Model accuracy percentages
  - Performance improvements
  - User cohort statistics
  - AI ATS match scores
  - Emotion or Speech confidence levels
  - Experimental AI benchmark data
- Demonstration data must be explicitly demarcated from live user data and production ML inferences.

---

## 2. Architecture & Data Integrity Rules

### Rule 5: User-Scoped Data Isolation
- User data must be strictly isolated by authenticated user identity (`user_id` / `email`).
- One user's:
  - Profile and contact data
  - Resume files and parsed ATS intelligence
  - Mock interview recordings, transcripts, and scores
  - Learning course progress, quiz attempts, and certificates
  - Longitudinal analytics and activity feeds
  - Job tracking and application bookmarks
  must **never** leak into or be accessible by another user's session.
- Client-side storage keys MUST be prefixed with the active user identity (e.g., `profile_${email}`, `course_progress_${userId}_${courseId}`).
- Backend endpoints must authenticate requests via Bearer JWT and verify user ownership of requested resources.

### Rule 6: Backend is the Source of Truth
- Persistent application state must reside in backend storage.
- Client-side storage (`localStorage`) may only be used as a fast offline cache or session bootstrap.
- All critical state (interviews, course completion, certificates, profile updates, analytics) must survive:
  - Page refresh
  - Logout and re-login
  - Browser restart / cache clearing
  - Multi-device login

### Rule 7: Security & Secret Protection
- **No Plaintext Passwords:** Passwords must be hashed using a standard secure algorithm (e.g., bcrypt/argon2) before storage.
- **No Secrets in Source Control:** API keys, JWT secrets, database connection strings, and SMTP passwords must only exist in `.env` (which must be ignored in `.gitignore`).
- **No Exposed Secrets in Audit Reports:** Never print raw credentials, tokens, or private keys in logs, audit documents, or pull requests.
- Validate all incoming payloads with Pydantic schemas on the backend and strict prop validation on the frontend.

---

## 3. Quality & Verification Rules

### Rule 8: Test-Driven Acceptance Criteria
- Every future phase must be executed against predefined acceptance criteria.
- Every phase delivery requires:
  - Backend API unit and integration tests
  - Frontend component / utility tests
  - Browser route verification
  - Edge case testing (empty inputs, network drops, malformed data)
  - Regression verification (ensuring prior phases remain 100% operational)

### Rule 9: Zero-Answer & Anti-Cheating Protection
- **Zero-Answer Defense:** The AI interview engine MUST NEVER generate a performance scorecard or score for candidates who submit no answers, gibberish, or blank transcripts. It must output a clear "Interview Not Completed - No Responses Submitted" status.
- **Proctoring Enforcement:** Live proctoring violations (tab switches, camera off, mic muted, screen share stop, face missing) must be logged with a 3-warning limit leading to auto-termination.
- **Course Gating:** Certificates may ONLY be issued when all required module lessons satisfy minimum dwell times, all module quizzes are passed (>=70%), and the final assessment is passed.

### Rule 10: Strict Regression Baseline
- Any code modification must verify:
  1. `npm run build` in `frontend/` succeeds with zero TypeScript/JSX syntax errors.
  2. FastAPI backend boots without runtime import crashes.
  3. Existing database/JSON data structures remain backward compatible.
  4. All existing UI routes render without white-screen or unhandled exceptions.
