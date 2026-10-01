# PREPRIA — End-to-End (E2E) Browser Testing Infrastructure

## 1. Overview
PREPRIA's automated E2E testing harness provides local, repository-controlled browser verification using **Playwright**. It executes against the running application (Vite frontend on `http://localhost:5173` and FastAPI backend on `http://localhost:8000`) without relying on remote subagent or cloud testing services.

---

## 2. Architecture & Directory Layout

```text
frontend/
├── playwright.config.js          # Playwright E2E configuration
├── e2e/
│   ├── fixtures/
│   │   ├── auth.fixture.js       # Reusable UI login & JWT session injection
│   │   └── test_data.js          # Isolated deterministic test candidate fixtures
│   ├── utils/
│   │   └── helpers.js            # Console error monitor & network request interceptors
│   ├── smoke.spec.js             # Core smoke test (landing -> login -> dashboard -> logout)
│   ├── phase13_learning_hub.spec.js       # Course catalog, lesson player, dwell time & sequential locks
│   ├── phase14_speech_ui.spec.js          # Interview speech UI, WPM meter & filler word breakdown
│   ├── phase15_pdf_report.spec.js         # Evaluation report & server PDF download validation
│   ├── phase16_proctoring.spec.js         # Canvas proctoring HUD, head pose & 3-warning termination UI
│   ├── phase17_voice_turn_taking.spec.js  # Conversational voice turn-taking states & manual fallback
│   ├── phase18_recommendations.spec.js    # Grounded recommendations & native vs external provider attribution
│   ├── phase19_longitudinal.spec.js       # Scorecard 5-pillar progression charts & weakness lifecycle
│   ├── phase20_career_roadmap.spec.js     # Target role selection, readiness score & milestone progression
│   ├── phase20_closed_loop_e2e.spec.js    # Full closed loop (Interview -> Evaluation -> Learning -> Roadmap)
│   ├── phase21_certificate_eligibility.spec.js # Certificate unlock, 39-item parity & gating enforcement
│   └── security_isolation.spec.js         # Cross-tenant data isolation between Candidate A & B
```

---

## 3. Test Fixtures & Isolation Strategy

1. **Test User Identification:**
   - Test accounts (`e2e_candidate_a@prepria.test`, `e2e_candidate_b@prepria.test`) are strictly designated as test-only fixtures.
   - All tests use `injectAuthSession` or `loginViaUI` with clean `localStorage` / `sessionStorage` teardown.
2. **Media Stream Emulation:**
   - Headless Chromium runs with `--use-fake-ui-for-media-stream` and `--use-fake-device-for-media-stream` to enable reliable canvas proctoring and Web Audio STT testing in automated environments.
3. **Console & Network Error Monitoring:**
   - Every test attaches listeners to detect uncaught exceptions, fatal JavaScript errors, or HTTP 5xx responses.

---

## 4. Execution Commands

### Prerequisites
Ensure both local services are active:
```bash
# Terminal 1: Backend ASGI Server
cd backend
python -m uvicorn main:app --reload --port 8000

# Terminal 2: Frontend Vite Server
cd frontend
npm run dev
```

### Running E2E Tests
```bash
# Run full E2E test suite headlessly
cd frontend
npm run test:e2e

# Run E2E test suite in headed browser mode
npm run test:e2e:headed

# Open interactive HTML test report
npm run test:e2e:report
```

---

## 5. Artifacts and Reports
- **HTML Report:** Generated at `frontend/playwright-report/index.html`.
- **JSON Test Results:** Saved to `frontend/playwright-report/test-results.json`.
- **Failure Artifacts:** Screenshots and traces are automatically saved to `frontend/test-results/` only upon test failure.

---

## 6. Real Browser vs. Code-Verified Boundaries
- **LIVE-BROWSER-VERIFIED:** Real Chromium browser rendering DOM elements, clicking navigation items, filling input fields, triggering client-side transitions, and inspecting console errors.
- **CODE-VERIFIED:** Backend pytest suites verifying NLP evaluation algorithms, ReportLab PDF byte generation, and disk persistence atomicity.
