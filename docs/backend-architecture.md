# GRIPR.STUDIO — Backend Architecture (Phase 2)

## 1. Executive Summary

GRIPR.STUDIO Phase 2 introduces a production-structured Fastify + TypeScript backend that operationalizes the B2B Problem Intelligence Platform. It provides deterministic validation, in-memory repository abstractions, Google Gemini AI structured evidence extraction, cross-participant causal comparison, and decision-ready brief generation.

```
                      +---------------------------------------+
                      |         GRIPR Frontend (HTML/JS)      |
                      +---------------------------------------+
                                          |
                              REST API via js/api.js
                                          |
                      +---------------------------------------+
                      |      Fastify HTTP Router & Security    |
                      |  - CORS & Rate Limiting               |
                      |  - Request Body Limits (64KB)         |
                      |  - Authorization Middleware           |
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
                      +---------------------------------------+
                      |  MemoryRepository (Phase 2 Dev Store) |
                      |  * In-memory Map structures           |
                      |  * Pre-seeded #DEMO_SYNTHETIC fixtures|
                      |  * Immutable SHA-256 provenance hashes|
                      +---------------------------------------+
                                          |
                               (Phase 3 Boundary)
                      +---------------------------------------+
                      |  Cloud Firestore + Firebase Auth      |
                      |  (Reserved for Phase 3 implementation)|
                      +---------------------------------------+
```

---

## 2. Technology Stack

- **Runtime:** Node.js v22.22.2 with native ECMAScript Modules (`NodeNext`).
- **Framework:** Fastify v4.29.1 with `@fastify/cors`, `@fastify/rate-limit`, and `@fastify/sensible`.
- **Schema Validation:** Zod v3.25.76.
- **AI Engine:** Official Google Gen AI SDK (`@google/genai` v3.6.1).
- **Test Runner:** Vitest v2.1.9 with Fastify inject tests.
- **TypeScript:** v5.9.3 with strict type-checking (`tsc --noEmit`).

---

## 3. Storage Boundary & Repository Pattern

In accordance with Phase 2 requirements, **Cloud Firestore is strictly reserved for Phase 3**.

The persistence layer uses a strict repository interface pattern located in `api/src/repositories/interfaces.ts`:
- `IMissionRepository`: Scoping intake, status transitions, lifecycle tracking.
- `IInvitationRepository`: Bearer token issuance, verification, expiration.
- `IResearchResponseRepository`: Participant session records, 3-tier consent logging.
- `IEvidenceRepository`: Validated AI extraction analyses, quotation audits.
- `IBriefRepository`: Draft and approved Decision Intelligence Briefs.
- `IOperationsRepository`: Research team task queue.

The in-memory implementation in `api/src/repositories/memory.repository.ts` stores state in JavaScript Maps during process runtime and resets cleanly on server restart.

### Phase 3 Transition Plan
In Phase 3, a `FirestoreRepository` implementing these identical interfaces will be created in `api/src/repositories/firestore.repository.ts`. Because business services rely exclusively on interface contracts, zero service or AI extraction code will need to be rewritten.

---

## 4. Security & Privacy Controls

1. **Server-Side API Credentials:** `GEMINI_API_KEY` is loaded exclusively on the backend via validated environment variables (`api/src/config/env.ts`). It is never leaked to browser bundles.
2. **Strict Request Body Size Limits:** Fastify enforces a 64 KB payload cap (`bodyLimit: 65536`) to mitigate resource-exhaustion attacks.
3. **Internal Operations Shielding:** Operations queue (`/api/operations/*`) and private mission workspaces (`/api/missions/:id`) require authentication. In Phase 2 development mode, the `x-gripr-auth` header (or isolated localhost adapter) guards internal routes.
4. **Invitation Token Isolation:** Research invitation endpoints (`/api/research/invitations/:token`) return only the minimum necessary study briefing and permitted questions. Internal client budgets, hypotheses, and company identities are never leaked to participants.
5. **No PII Logging:** Request serializers strip narrative bodies and contact emails from stdout logs.
