# GRIPR.STUDIO — API Contract Specification

## Base URLs
* **Live Production Cloud Run:** `https://gripr-backend-611571278421.asia-south1.run.app/api`
* **Local Development:** `http://127.0.0.1:3000/api`

---

## 1. Response Envelopes

### Success Envelope
```json
{
  "success": true,
  "...data": {}
}
```

### Error Envelope
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR | NOT_FOUND | UNAUTHORIZED | FORBIDDEN | DEMO_ONLY_MODE | INTERNAL_SERVER_ERROR",
    "message": "Human-readable summary of the error",
    "details": []
  }
}
```

---

## 2. Complete Endpoint Catalog

### System Health & Status
#### `GET /api/health`
* **Access:** Public
* **Response (200 OK):**
```json
{
  "status": "ok",
  "service": "gripr-problem-intelligence-api",
  "version": "1.0.0",
  "timestamp": "2026-11-21T04:42:55.232Z",
  "environment": "production",
  "persistence": {
    "engine": "DEMO_ONLY",
    "description": "Safe container demo-only mode. Precomputed walkthrough runs fully; live database mutations return 503.",
    "isCloudFirestore": false,
    "isEmulator": false,
    "durabilityNotice": "Zero persistent storage overhead. Safe for free trial / ephemeral container hosting."
  },
  "auth": {
    "provider": "Firebase Admin SDK",
    "verification": "Official Firebase Admin verifyIdToken()",
    "hs256AllowedInProduction": false
  },
  "gemini": {
    "configured": true,
    "model": "gemini-3.5-flash-lite",
    "processingMode": "LIVE_GEMINI"
  },
  "commercialNotice": "Phase 3 Persistent API. Experimental pilot research model."
}
```

---

### Interactive Demo & Presenter Endpoints

#### `GET /api/demo/session` or `POST /api/demo/session`
* **Access:** Public (Rate limited: 20 req/min)
* **Purpose:** Generates a temporary, server-signed session token scoped strictly to role `RESEARCHER` for running live canonical synthetic demonstration analysis.
* **Response (200 OK):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImRlbW9TZXNzaW9uIjp0cnVlfQ...",
  "expiresIn": 3600,
  "role": "RESEARCHER",
  "message": "Demo session token issued for interactive synthetic research demonstration."
}
```

#### `POST /api/demo/live-gemini-analysis`
* **Access:** Presenter Token (`Authorization: Bearer <token>`) or Trusted Origin (`https://gripr-studio.pages.dev`). Rate limited: 10 req/min.
* **Purpose:** Triggers live, server-side Google Gemini 3.5 Flash Lite qualitative extraction on a fixed canonical synthetic evidence packet (`PKT-401` to `PKT-405`).
* **Request Body:**
```json
{
  "packetId": "PKT-401"
}
```
* **Response (200 OK):**
```json
{
  "success": true,
  "mode": "LIVE_GEMINI",
  "packetId": "PKT-401",
  "sourceOperator": "Ramesh Kumar (#SYNTHETIC_DEMO)",
  "locality": "Raja Park, Jaipur, Rajasthan",
  "modelUsed": "gemini-3.5-flash-lite",
  "latencyMs": 2863,
  "tokenEstimate": 2027,
  "extraction": {
    "affectedParticipant": {
      "content": "Kirana store owner operating in Jaipur with 18 years in business",
      "category": "REPORTED",
      "sourceQuote": "Main Jaipur mein ek kirana store chalata hoon."
    },
    "operationalWorkflow": {
      "content": "Tracking customer credit (udhaar) using a physical notebook",
      "category": "REPORTED",
      "sourceQuote": "Main notebook use karta hoon."
    },
    "reportedProblem": {
      "content": "Difficulty tracking customer credit and missing payment records occasionally",
      "category": "REPORTED",
      "sourceQuote": "Har hafte mujhe customer udhaar track karne mein problem hoti hai. Main notebook use karta hoon. Kabhi-kabhi payment records miss ho jaate hain."
    },
    "frequency": {
      "content": "Every week",
      "category": "REPORTED",
      "sourceQuote": "Har hafte mujhe customer udhaar track karne mein problem hoti hai."
    },
    "financialImpact": {
      "content": "Not stated",
      "category": "UNKNOWN",
      "sourceQuote": null
    },
    "currentWorkaround": {
      "content": "Using a physical notebook to record transactions",
      "category": "REPORTED",
      "sourceQuote": "Main notebook use karta hoon."
    }
  },
  "quotationValidation": {
    "reportedProblem": { "valid": true },
    "frequency": { "valid": true },
    "financialImpact": { "valid": true, "isUnknown": true },
    "workaround": { "valid": true }
  },
  "disclaimer": "SYNTHETIC DEMONSTRATION INTELLIGENCE · PROCESSED VIA GEMINI AI"
}
```
* **Error Response (401 Unauthorized):** Returned when caller lacks valid Bearer token or trusted origin.
* **Error Response (502 / 503):** Returned if Gemini API quota is exhausted or key is unconfigured (fail-closed, never returns mock data disguised as `LIVE_GEMINI`).

---

### Mission Inquiries (B2B Lead Intake)

#### `POST /api/mission-inquiries`
* **Access:** Public (Rate limited: 15 req/min)
* **Request Body:**
```json
{
  "orgName": "RetailFlow Intelligence Labs",
  "contactPerson": "Aditi Sharma",
  "contactEmail": "aditi.sharma@retailflow.test",
  "decisionAtStake": "Deciding whether to allocate capital toward WhatsApp UPI credit collection bot or manual ledger workflows.",
  "problemToInvestigate": "Why do Jaipur kirana retailers struggle to track customer credit?",
  "hypothesis": "Kirana store owners lose 8-12% revenue and will adopt WhatsApp reminders.",
  "falsificationCriteria": "If retailers avoid automated digital reminders to preserve personal trust, automated collection will be rejected.",
  "targetParticipantProfile": "Independent kirana store owners in Jaipur operating >5 years.",
  "geography": "Jaipur, Rajasthan",
  "consentContact": true,
  "consentPrivacy": true
}
```
* **Production Response in DEMO_ONLY mode (503 Service Unavailable):**
```json
{
  "success": false,
  "error": {
    "code": "DEMO_ONLY_MODE",
    "message": "Real mission inquiry intake is disabled in DEMO_ONLY mode. Durable Cloud Firestore persistence is unconfigured. Client data is protected from volatile storage loss."
  }
}
```

---

### Authenticated Operations Desk (RBAC: Researcher / Admin)

#### `GET /api/operations/queue`
* **Access:** Protected (`Authorization: Bearer <Firebase_ID_Token>`)
* **Role Requirement:** `RESEARCHER` or `ADMIN`
* **Response (200 OK):** Full operational queue of pending participant submissions, scoping reviews, and brief approvals.
* **Response (403 Forbidden):** Returned if caller role is `ORGANIZATION_USER` or `RESEARCH_PARTICIPANT`.

#### `POST /api/operations/evidence/:id/review`
* **Access:** Protected (Researcher / Admin)
* **Request Body:** `{ "decision": "approve" | "flag" | "reject", "notes": "Verified against transcript" }`
* **Response (200 OK):** Confirmation of moderation decision recorded in audit log.

---

### Research Responses & Informed Consent

#### `GET /api/research/invitations/:token`
* **Access:** Public (via cryptographically hashed invitation URL)
* **Response (200 OK):** Minimal study briefing, topic, and honorarium notice. Internal client secrets, budgets, and hypotheses are permanently stripped.

#### `POST /api/research/invitations/:token/responses`
* **Access:** Public with valid one-time invitation token
* **Mandatory Consent:** `consentStudyProcessing: true` required.
* **Optional Consents:** `consentVerbatimBriefCitation` (default false), `consentFutureResearchFollowup` (default false).
* **Response (201 Created):** Recorded session ID. Returns `409 Conflict` on replay attempt.
