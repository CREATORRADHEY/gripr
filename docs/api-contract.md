# GRIPR.STUDIO — API Contract Specification (Phase 2)

## Base URL
Local Development: `http://127.0.0.1:3000/api`

## Response Envelopes

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
    "code": "VALIDATION_ERROR | NOT_FOUND | UNAUTHORIZED | FORBIDDEN | INTERNAL_SERVER_ERROR",
    "message": "Human-readable summary of the error",
    "details": []
  }
}
```

---

## Endpoint Catalog

### 1. System Health
- **`GET /api/health`**
  - **Access:** Public
  - **Response (200 OK):**
    ```json
    {
      "status": "ok",
      "service": "gripr-problem-intelligence-api",
      "version": "1.0.0",
      "timestamp": "2026-11-20T07:55:51.909Z",
      "environment": "development",
      "gemini": {
        "configured": true,
        "model": "gemini-2.5-flash"
      },
      "commercialNotice": "Phase 2 Development API. Experimental pilot research model."
    }
    ```

---

### 2. Research Missions
- **`POST /api/missions`**
  - **Access:** Public (Rate limited: 30 req/min)
  - **Request Body (JSON):**
    ```json
    {
      "orgName": "AgroLogix Solutions Ltd",
      "contactPerson": "Meera Deshmukh",
      "contactEmail": "meera@agrologix-test.in",
      "role": "Head of Product",
      "sector": "agritech",
      "decisionAtStake": "Should we engineer an on-demand refrigerated truck booking mobile app?",
      "hypothesis": "Growers will pay ₹800 per booking for cold dispatch.",
      "falsificationCriteria": "Falsified if growers prefer uncooled shared tempos due to informal driver credit.",
      "problemToInvestigate": "Cold chain perishability losses during village produce aggregation.",
      "targetParticipantProfile": "Strawberry growers cultivating 3-10 acres in Nashik.",
      "industry": "Agricultural Cold Chain",
      "geography": "Maharashtra (Nashik cluster)",
      "urgency": "Standard (4-6 weeks)",
      "constraints": "Capture Marathi/Hinglish accounts.",
      "deliverables": ["Decision Intelligence Brief", "Workflow Friction Map"],
      "consentPrivacy": true
    }
    ```
  - **Response (201 Created):**
    ```json
    {
      "success": true,
      "missionId": "MSN-2026-185",
      "status": "Requested",
      "message": "Research mission scoping request recorded. Our research team will review scoping parameters.",
      "pricingNotice": "Experimental pilot pricing. Unvalidated research model."
    }
    ```

- **`GET /api/missions`**
  - **Access:** Protected (`x-gripr-auth` header or localhost dev adapter)
  - **Response (200 OK):** Array of all active missions.

- **`GET /api/missions/:id`**
  - **Access:** Protected
  - **Response (200 OK):** Mission details, linked session count, and Decision Brief availability.

- **`PATCH /api/missions/:id/status`**
  - **Access:** Internal / Protected
  - **Request Body:** `{ "status": "Scoping Alignment" | "Recruiting" | "Fieldwork Active" | "Synthesis" | "Brief Ready" | "Closed" }`

---

### 3. Participant Research Invitations & Sessions
- **`GET /api/research/invitations/:token`**
  - **Access:** Public
  - **Behavior:** Validates bearer invitation token and returns **minimal study context**. Internal client identity, budget, and business hypotheses are completely stripped.
  - **Response (200 OK):**
    ```json
    {
      "success": true,
      "invitation": {
        "token": "INV-AGRI-081",
        "studyTitle": "Rural Input Procurement & Fertilizer Supply Research Study",
        "studyDescription": "Academic and operational study into how active farming operators manage emergency fertilizer procurement...",
        "targetRole": "Active Smallholder Farmer / Farm Operator (2-10 acres)",
        "permittedQuestions": [
          "Describe your last fertilizer purchase during peak sowing season.",
          "Did you compare prices across different sources?",
          "How did payment work, and what happened if delivery was delayed?"
        ],
        "honorarium": "₹1,500 direct bank transfer upon session completion",
        "expiresAt": "2026-12-31T23:59:59Z",
        "status": "active"
      }
    }
    ```

- **`POST /api/research/invitations/:token/responses`**
  - **Access:** Public (Rate limited: 20 req/min)
  - **Request Body:**
    ```json
    {
      "incidentNarrative": "Sowing ke time par fertilizer nahi mila toh fasal kharab ho jayegi. Dukan wale Sharma ji se udhaar milta hai fasal katne tak...",
      "affectedWorkflow": "Peak seasonal sowing procurement & credit financing",
      "triggeringEvent": "Monsoon onset requiring rapid 48-hour planting",
      "operationalImpact": "Pays ₹70-90 premium per bag over MRP",
      "existingWorkaround": "Personal village retailer credit ledger (Khata book)",
      "frequency": "Seasonal (twice a year)",
      "financialImpact": "₹70-90 premium per bag",
      "role": "Smallholder Farmer (Sugarcane)",
      "location": "Meerut, Uttar Pradesh",
      "language": "Hinglish / Hindi",
      "consentStudyProcessing": true,
      "consentSanitizedBriefSharing": true,
      "consentFollowUpInterview": false,
      "contactEmail": null
    }
    ```
  - **Validation:** `consentStudyProcessing: true` is strictly enforced. `consentSanitizedBriefSharing` and `consentFollowUpInterview` are independent opt-ins.
  - **Response (201 Created):**
    ```json
    {
      "success": true,
      "sessionId": "SES-403",
      "status": "Recorded",
      "message": "Participant research session recorded. Thank you for providing your firsthand operational experience.",
      "consentRecorded": {
        "studyProcessing": true,
        "sanitizedBriefSharing": true,
        "followUpInterview": false
      }
    }
    ```

---

### 4. Evidence Extraction & Cross-Participant Analysis
- **`POST /api/research/responses/:id/analyze`**
  - **Access:** Protected (`x-gripr-auth`)
  - **Behavior:** Triggers Gemini AI structured evidence extraction and runs deterministic quotation substring validation against the raw narrative.
  - **Response (200 OK):**
    ```json
    {
      "success": true,
      "analysisId": "ANL-401",
      "sessionId": "SES-401",
      "missionId": "MSN-2026-081",
      "status": "awaiting_review",
      "modelUsed": "gemini-2.5-flash",
      "validation": {
        "valid": true,
        "quotationVerificationErrors": [],
        "missingFields": ["Exact seasonal volume turnover"],
        "flags": []
      },
      "extraction": { "...14 structured dimensions..." }
    }
    ```

- **`POST /api/research/missions/:id/cross-analysis`**
  - **Access:** Protected
  - **Behavior:** Evaluates qualitative response pairs. Classifies into `RELATED_SAME_MECHANISM` vs `RELATED_DIFFERENT_MECHANISM` vs `INSUFFICIENT_EVIDENCE` vs `UNRELATED`. Flags operational contradictions.

---

### 5. Decision Intelligence Briefs
- **`GET /api/missions/:id/brief`**
  - **Access:** Protected
  - **Response (200 OK):** Complete 15-section Decision Intelligence Brief with traceable citations and researcher recommendations.

- **`POST /api/missions/:id/brief/generate`**
  - **Access:** Protected
  - **Behavior:** Synthesizes draft brief from verified session records. Initial status is strictly set to `DRAFT — REQUIRES HUMAN REVIEW`.

- **`POST /api/missions/:id/brief/approve`**
  - **Access:** Protected (Human researcher sign-off)
  - **Request Body:** `{ "approvedBy": "Lead Problem Intelligence Researcher" }`
  - **Response (200 OK):** Updates brief status to `APPROVED` and advances mission lifecycle to `Brief Ready`.

---

### 6. Operations Desk
- **`GET /api/operations/queue`**
  - **Access:** Protected (`x-gripr-auth`)
  - **Response (200 OK):** Task list of pending scoping reviews, session moderations, and brief sign-offs.

- **`POST /api/operations/evidence/:id/review`**
  - **Access:** Protected
  - **Request Body:** `{ "decision": "approve" | "flag" | "reject", "notes": "..." }`
