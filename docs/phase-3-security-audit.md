# GRIPR.STUDIO — Phase 3 Pre-Implementation Security Audit

**Date:** November 20, 2026  
**Auditor:** Principal Google Cloud Architect & Security Engineer  
**Baseline Git Commit:** `abd9dfb3d96f66443991439a88a87a5f08213fea` (Phase 2 Checkpoint)  
**Status:** Audit Complete — Remediation Plan Defined  

---

## 1. Executive Summary

Phase 2 successfully delivered a working prototype with 28 automated tests, Fastify backend, Gemini LLM extraction, and deterministic verbatim substring auditing. However, Phase 2 utilized in-memory persistence and development-only authorization adapters. 

This audit documents critical security vulnerabilities, tenant isolation flaws, and architectural gaps that must be remediated in Phase 3 before production deployment.

---

## 2. Critical Security Findings

### 2.1 Static Dev Secret Header (`x-gripr-auth: reviewer-test`)
- **Severity:** HIGH
- **Location:** `api/src/middleware/authorization.ts` lines 15–37
- **Vulnerability:** Internal endpoints rely on a static header `x-gripr-auth: reviewer-test` or `env.INTERNAL_AUTH_SECRET`. Any client that knows or guesses this string gains full internal operations and review authority.
- **Remediation:** Replace with Firebase Authentication ID token verification (`Authorization: Bearer <idToken>`). Enforce verifiable claims with roles (`RESEARCHER`, `ADMIN`, `ORGANIZATION_USER`, `RESEARCH_PARTICIPANT`).

### 2.2 Localhost Dev Authentication Bypass
- **Severity:** HIGH
- **Location:** `api/src/middleware/authorization.ts` lines 23–28 & 47–50
- **Vulnerability:** When running in development mode, requests originating from `127.0.0.1`, `::1`, or `localhost` completely bypass authorization checks. If a developer runs this on a shared server, container, or behind a reverse proxy that sets `X-Forwarded-For: 127.0.0.1`, unauthorized actors can access operations and private missions.
- **Remediation:** Remove the IP-based authorization bypass. Require explicit mocked tokens even in automated tests and local development.

### 2.3 Cross-Organization Data Leakage in Mission Listing
- **Severity:** CRITICAL
- **Location:** `api/src/routes/missions.ts` lines 36–45 (`GET /api/missions`)
- **Vulnerability:** `GET /api/missions` returns all missions stored in the database. An authenticated Organization user can inspect other organizations' confidential business problems, hypotheses, and participant targets.
- **Remediation:** Filter `GET /api/missions` by the authenticated user's `organizationId`. Only users with `RESEARCHER` or `ADMIN` roles may view the global mission list.

### 2.4 Unenforced Ownership on Mission & Brief Workspaces
- **Severity:** HIGH
- **Location:** `api/src/routes/missions.ts` lines 48–75, `api/src/routes/briefs.ts` lines 14–39
- **Vulnerability:** Route guards check only `requireMissionAccess` (which checks dev auth or localhost), but do not verify whether the authenticated user or organization owns mission `:id`.
- **Remediation:** Implement server-side organization ownership validation on all `/api/missions/:id/*` and `/api/missions/:id/brief` routes.

### 2.5 Public Inquiries Conflated with Active Missions
- **Severity:** MEDIUM
- **Location:** `api/src/routes/missions.ts` lines 15–33 (`POST /api/missions`)
- **Vulnerability:** Anyone could submit a public form via `POST /api/missions` which wrote directly into the missions repository. A public inquiry must NOT automatically become an active research mission or customer commitment.
- **Remediation:** Implement `POST /api/mission-inquiries` targeting a separate `mission_inquiries/` collection with status `REQUESTED` / `AWAITING_SCOPE_REVIEW`. Only authorized researchers can approve and promote an inquiry to a formal mission. Maintain backward-compatible redirection/proxying for the existing frontend.

### 2.6 Plaintext Research Invitation Tokens
- **Severity:** HIGH
- **Location:** `api/src/services/research.service.ts` & `api/src/routes/research.ts`
- **Vulnerability:** Invitation tokens were stored as plaintext strings (e.g. `INV-AGRI-081`). If an unauthorized database leak occurs, all invitation links are immediately compromised. Furthermore, there was no brute-force enumeration throttling per token.
- **Remediation:** Generate cryptographically secure random 256-bit tokens (`crypto.randomBytes(32).toString('hex')`). Store only the SHA-256 hash in Firestore. Rate limit validation attempts and mark tokens as `completed` upon submission to prevent replays.

### 2.7 Silent Heuristic LLM Fallback in Production
- **Severity:** HIGH
- **Location:** `api/src/services/gemini.service.ts` lines 78–85
- **Vulnerability:** When `GEMINI_API_KEY` was missing or the call failed, the service silently returned deterministic heuristic mock data with label `${model}-mock-provider`. If deployed to production without a key, the platform would silently produce fake analysis and masquerade as live AI.
- **Remediation:** Introduce explicit processing modes: `LIVE_GEMINI`, `DEMO_SYNTHETIC` (explicit test mode only), and `ERROR_UNAVAILABLE`. In production, if Gemini fails or is unconfigured, record processing failure, set status to `analysis_failed`, and fail closed. Never generate synthetic intelligence silently.

### 2.8 Diagnostic Information Disclosure
- **Severity:** LOW
- **Location:** `api/src/routes/health.ts`
- **Vulnerability:** Health check exposes whether Gemini is configured.
- **Remediation:** Sanitize health endpoint in production. Ensure no secrets, stack traces, or internal IP configurations are returned.

### 2.9 Unchecked Volatile Storage
- **Severity:** HIGH
- **Location:** `api/src/repositories/memory.repository.ts`
- **Vulnerability:** All data resides in volatile JavaScript Maps. A server crash or restart erases all mission scopes, participant transcripts, and briefs.
- **Remediation:** Implement Google Cloud Firestore repositories with strict collection schemas, transactions, server timestamps, and audit logging.

---

## 3. Remediation & Implementation Roadmap

| Priority | Area | Required Action |
| :--- | :--- | :--- |
| **P0** | **Firestore Persistence** | Implement `@google-cloud/firestore` repository classes for missions, inquiries, invitations, sessions, evidence, briefs, consents, and audit logs. |
| **P0** | **Firebase Auth** | Implement Firebase ID token verification middleware with role (`ADMIN`, `RESEARCHER`, `ORGANIZATION_USER`, `RESEARCH_PARTICIPANT`) and tenant isolation. |
| **P0** | **Public Inquiry Separation** | Create `POST /api/mission-inquiries` and separate `mission_inquiries/` collection. |
| **P0** | **Token Hashing & Expiration** | Store SHA-256 hashes of invitation tokens; prevent token reuse and enumeration. |
| **P0** | **Gemini Fail-Closed Safety** | Eliminate silent heuristic fallback in production; explicitly report `ERROR_UNAVAILABLE` on LLM failure. |
| **P0** | **Human Approval Gate** | Enforce human researcher sign-off before a brief can be marked `APPROVED` and viewed by the client organization. |
| **P1** | **E2E & Failure Testing** | Comprehensive automated test suites (Vitest + Playwright) testing all failure conditions, restarts, and access control. |
| **P1** | **Cloud Run Deployment** | Provide production Dockerfile and Cloud Run architecture with Google Secret Manager. |

---

## 4. Acceptance Criteria for Phase 3 Completion

1. A mission inquiry is created and persisted in Firestore (`mission_inquiries/`).
2. An authenticated researcher reviews and converts the inquiry to a scoped mission (`missions/`).
3. An invitation token is generated with a stored SHA-256 hash.
4. A participant submits consented research data, creating versioned consent records (`consents/`) and response records (`research_responses/`).
5. Real Gemini AI analyzes the response under strict anti-injection and anti-hallucination guards. If Gemini is down, the system fails closed with accurate error status.
6. A researcher approves the Decision Intelligence Brief.
7. Only the authorized organization user can access the approved brief.
8. Unauthenticated requests return 401; cross-organization requests return 403.
9. All data survives backend process restarts.
