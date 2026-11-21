# GRIPR.STUDIO — Backend Architecture (Phase 3 Production Foundation)

## 1. Executive Summary

GRIPR.STUDIO is powered by an enterprise-grade, deterministic Fastify + TypeScript backend that operationalizes the B2B Problem Intelligence Platform. It features robust domain schemas (Zod), Google Gemini AI qualitative extraction (`@google/genai`), repository abstractions with durable Firestore and safe `DEMO_ONLY` mode, RBAC authentication (Firebase Admin SDK), and single-origin static serving on Google Cloud Run.

```
                      +---------------------------------------+
                      |         GRIPR Frontend (HTML/JS)      |
                      |   Cloudflare Pages / Cloud Run Direct |
                      +---------------------------------------+
                                          |
                              REST API via js/api.js
                                          |
                      +---------------------------------------+
                      |      Fastify HTTP Router & Security    |
                      |  - Strict CORS Policy (Pages origin)  |
                      |  - Rate Limiting (10-120 req/min)     |
                      |  - Request Body Limits (64KB)         |
                      |  - Role-Based Authorization (RBAC)    |
                      |  - Session Token Verification         |
                      |  - Centralized Error Envelope         |
                      +---------------------------------------+
                                          |
                        +-----------------+-----------------+
                        |                                   |
              Business Services                     Domain Schemas (Zod)
        - ResearchService                     - MissionSchema
        - EvidenceService                     - ResponseSchema
        - MatchingService                     - ExtractionSchema
        - BriefService                        - BriefSchema
        - GeminiService                       - ComparisonSchema
                        |
                        +-----------------+-----------------+
                                          |
                               Repository Abstraction Layer
                      +---------------------------------------+
                      |       IMissionRepository              |
                      |       IInvitationRepository           |
                      |       IResearchResponseRepository     |
                      |       IEvidenceRepository             |
                      |       IBriefRepository                |
                      |       IOperationsRepository           |
                      +---------------------------------------+
                                          |
                        +-----------------+-----------------+
                        |                                   |
         FirestoreStorageEngine                 DemoOnlyRepository
      - Google Cloud Firestore               - Safe Production Mode
      - Multi-tenant data segregation        - Rejects live intake with 503
      - Audit provenance logging             - Zero persistent storage cost
```

---

## 2. Technology Stack

- **Runtime:** Node.js v22.22.2 with ECMAScript Modules (`NodeNext`).
- **Framework:** Fastify v4.29.1 with `@fastify/cors`, `@fastify/rate-limit`, `@fastify/sensible`, `@fastify/static`.
- **Language:** TypeScript v5.9.3 with strict type checking (`tsc --noEmit`).
- **Validation:** Zod v3.25.76 schemas across all requests, extractions, and responses.
- **AI Intelligence:** Official Google Gen AI SDK (`@google/genai` v3.6.1) targeting `gemini-3.5-flash-lite`.
- **Security & Cryptography:** Firebase Admin SDK, timing-safe Node `crypto` HMAC-SHA256, 256-bit random invitation tokens.
- **Persistence:** Cloud Firestore Client (`@google-cloud/firestore` v7.11.0) with `DEMO_ONLY` fail-safe repository.
- **Testing:** Vitest v2.1.9 (17 test suites, 128 tests passing).

---

## 3. Storage Boundary & Persistence Modes

In accordance with Phase 3 security guidelines, volatile local file storage (`LOCAL_FILE_STORAGE`) is strictly prohibited in production. The repository supports two production persistence modes:

1. **`cloud_firestore` Mode:** Durable document storage using Google Cloud Firestore with native collections (`mission_inquiries`, `missions`, `participant_sessions`, `evidence`, `briefs`, `audit_logs`).
2. **`demo_only` Mode (Default Production Setting):** When durable Firestore credentials are not configured, the platform activates `DemoOnlyMissionInquiryRepository`. This guarantees that:
   - All synthetic guided walkthroughs (scoping, simulated approval, Gemini extraction, brief inspection) run 100% smoothly.
   - Any attempt to submit real personal/commercial data returns an immediate `503 Service Unavailable` with code `DEMO_ONLY_MODE`.
   - No customer data is ever lost in ephemeral container storage.

---

## 4. Authentication, RBAC & Presenter Session Tokens

The backend implements strict role-based access control (RBAC):
- `ADMIN`: Full platform access, moderation, and infrastructure control.
- `RESEARCHER`: Access to the internal research operations desk (`/api/operations/*`), session review, and brief approval.
- `ORGANIZATION_USER`: Scoped strictly to their own organization's missions and approved briefs (`/api/missions/:id`).
- `RESEARCH_PARTICIPANT`: Access restricted exclusively to their assigned invitation session (`/api/research/invitations/:token`).

### Demo Presenter Session Protocol
To allow seamless public demonstration of server-side Gemini intelligence without exposing admin credentials:
1. The frontend or presenter requests a session token via `POST /api/demo/session`.
2. The server generates a temporary JWT token signed with `INTERNAL_AUTH_SECRET` containing `role: RESEARCHER`.
3. The live demo route (`POST /api/demo/live-gemini-analysis`) validates the session token or verifies origin matching `https://gripr-studio.pages.dev`.
4. Outside isolated local dev mode, any unauthenticated request without token or trusted origin is strictly rejected with `401 Unauthorized`.
