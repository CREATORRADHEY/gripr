# GRIPR.STUDIO Phase 3 Architecture: Persistence, Security & Production Foundation

## 1. Executive Summary

GRIPR.STUDIO is an evidence-first Problem Intelligence Platform designed to protect product organizations from building software based on assumption. Its initial commercial offering is **GRIPR Missions**—a structured qualitative research engagement where organizations commission focused operational inquiries.

Phase 3 elevates the platform from an in-memory prototype into an enterprise-grade, persistent, secure, and independently testable architecture deployed on Google Cloud Platform (Google Cloud Run + Cloud Firestore + Firebase Authentication + Google Gemini 1.5).

```
   ┌────────────────────────────────────────────────────────┐
   │                  Prospective Client                    │
   └──────────────────────────┬─────────────────────────────┘
                              │ POST /api/mission-inquiries (Rate Limited)
                              ▼
   ┌────────────────────────────────────────────────────────┐
   │             Mission Inquiries Repository               │
   │           (Status: RECEIVED -> UNDER_REVIEW)           │
   └──────────────────────────┬─────────────────────────────┘
                              │ Researcher Scoping Approval
                              ▼
   ┌────────────────────────────────────────────────────────┐
   │             Active Research Mission (B2B)              │
   │  Tenant-Scoped: organizationId | ₹49,000 Pilot Scope   │
   └─────────────┬────────────────────────────┬─────────────┘
                 │ Generates                  │ Generates
                 ▼                            ▼
   ┌──────────────────────────┐  ┌──────────────────────────┐
   │  Hashed Invitation Link  │  │  Audit Log & Tenant Isolation
   │  (SHA-256 Token Store)   │  │  (Researcher / Admin Guard)│
   └─────────────┬────────────┘  └──────────────────────────┘
                 │ Participant Consents & Submits
                 ▼
   ┌────────────────────────────────────────────────────────┐
   │           Consented Qualitative Response               │
   │   (3-Tier Granular Consent: Internal / Brief / Contact)│
   └──────────────────────────┬─────────────────────────────┘
                              │
                              ▼
   ┌────────────────────────────────────────────────────────┐
   │            Gemini 1.5 Evidence Extraction              │
   │    Prompt-injection sanitized | Fail-Closed in Prod    │
   └──────────────────────────┬─────────────────────────────┘
                              │
                              ▼
   ┌────────────────────────────────────────────────────────┐
   │              Cross-Participant Synthesis               │
   │    Causal chains, friction points, contradictions     │
   └──────────────────────────┬─────────────────────────────┘
                              │
                              ▼
   ┌────────────────────────────────────────────────────────┐
   │         Human Researcher Review & Approval             │
   │     (Gatekeeper: Organizations cannot view unapproved) │
   └──────────────────────────┬─────────────────────────────┘
                              │ Status: APPROVED
                              ▼
   ┌────────────────────────────────────────────────────────┐
   │            Decision Intelligence Brief                 │
   │  Delivered to Authorized Tenant (PII Fully Stripped)   │
   └────────────────────────────────────────────────────────┘
```

---

## 2. Storage & Persistence Architecture

### 2.1 Storage Engine Design
To ensure full durability across server process restarts and zero reliance on ephemeral process memory, the Phase 3 backend implements a modular repository abstraction (`IMissionRepository`, `IMissionInquiryRepository`, `IConsentRepository`, `IAuditLogRepository`, etc.) backed by two interchangeable implementations:

1. **`FirestoreStorageEngine` (`api/src/repositories/firestore.repository.ts`)**:
   - Persists state to structured JSON documents with write-ahead atomic operations.
   - Defaults to `/app/data/firestore` (or local `api/data/firestore`).
   - Supports direct migration to native Google Cloud Firestore client via the `@google-cloud/firestore` SDK in production environments.
   - Partitions documents by collection (`missions`, `inquiries`, `invitations`, `responses`, `evidence`, `briefs`, `consents`, `audit_logs`).
2. **`MemoryStorageEngine` (`api/src/repositories/memory.repository.ts`)**:
   - Lightweight ephemeral repository instantiated during automated test suites (`NODE_ENV=test`) to guarantee absolute test isolation without disk contention.

### 2.2 Entity Relational Model

| Entity | Primary Key | Key Attributes | Tenant Isolation Key |
| :--- | :--- | :--- | :--- |
| **MissionInquiry** | `INQ-YYYY-NNN` | `orgName`, `contactEmail`, `decisionAtStake`, `hypothesis`, `status` | N/A (Pre-client inquiry) |
| **Mission** | `MSN-YYYY-NNN` | `organizationId`, `inquiryId`, `status`, `targetCount`, `pricing` | `organizationId` |
| **ResearchInvitation** | `INV-YYYY-NNN` | `missionId`, `tokenHash` (SHA-256), `status`, `expiresAt`, `failedAttempts` | `missionId` |
| **ResearchResponse** | `SES-YYYY-NNN` | `missionId`, `tokenHash`, `narrativeVerbatim`, `recentIncident`, `workaround` | `missionId` |
| **ConsentRecord** | `CNS-YYYY-NNN` | `sessionId`, `missionId`, `internalResearch`, `quoteInExecutiveBrief`, `version` | `missionId` |
| **EvidenceExtraction** | `EXT-YYYY-NNN` | `sessionId`, `missionId`, `frictionPoints`, `processingMode`, `status` | `missionId` |
| **DecisionBrief** | `BRF-YYYY-NNN` | `missionId`, `organizationId`, `recommendationOutcome`, `status` | `organizationId` |
| **AuditLogEntry** | `AUD-UUID` | `actorId`, `actorRole`, `action`, `resourceType`, `resourceId`, `timestamp` | `organizationId` |

---

## 3. Authentication & Tenant Isolation

### 3.1 Authentication Protocol
Phase 2 relied on a hardcoded development header (`x-gripr-auth: reviewer-test`). In Phase 3, this has been completely dismantled:
- **Authentication Standard**: HTTP `Authorization: Bearer <JWT_TOKEN>`.
- **Token Verification (`FirebaseAuthService`)**:
  - Validates cryptographic signatures using timing-safe comparisons.
  - Verifies token expiration (`exp`), issuance (`iat`), issuer, and audience against configured Firebase Project ID.
  - Extracts user claims: `uid`, `email`, `role`, and `tenantId` (or `organizationId`).
  - Offline testing support: Deterministic test tokens generated via cryptographic HMAC-SHA256 for repeatable CI runs without live external Firebase dependencies.

### 3.2 Role-Based Access Control (RBAC)

The platform enforces four strict operational roles:
1. **`ADMIN`**: Platform superuser; full operational access and audit log inspection.
2. **`RESEARCHER`**: Research operations team; access to research queue, Gemini extraction triggers, evidence moderation, brief synthesis, and status updates.
3. **`ORGANIZATION_USER`**: Commissioning enterprise client; strictly isolated to their own organization's missions (`organizationId === token.organizationId`). May only view **APPROVED** briefs.
4. **`RESEARCH_PARTICIPANT`**: Qualitative interviewee; access strictly governed by one-time invitation tokens.

### 3.3 Access Enforcement Matrix

| Endpoint | Method | Required Role | Tenant Enforced? | Gatekeeper Condition |
| :--- | :--- | :--- | :--- | :--- |
| `/api/mission-inquiries` | `POST` | Public | No | Rate limited (10 req/15min) |
| `/api/mission-inquiries` | `GET` | `RESEARCHER`, `ADMIN` | No | Internal review only |
| `/api/mission-inquiries/:id/convert` | `POST` | `RESEARCHER`, `ADMIN` | No | Promotes inquiry to active mission |
| `/api/missions` | `GET` | `ORGANIZATION_USER`, `RESEARCHER`, `ADMIN` | Yes | Filtered by caller's `organizationId` |
| `/api/missions/:id` | `GET` | `ORGANIZATION_USER`, `RESEARCHER`, `ADMIN` | Yes | 403 if `mission.organizationId !== caller.orgId` |
| `/api/missions/:id/brief` | `GET` | `ORGANIZATION_USER`, `RESEARCHER`, `ADMIN` | Yes | Client blocked until status is `APPROVED` |
| `/api/missions/:id/brief/generate` | `POST` | `RESEARCHER`, `ADMIN` | No | Triggers LLM synthesis |
| `/api/research/invitations/:token` | `GET` | Public (Bearer Token in URL) | Yes (Token) | Replay blocked if status is `completed` |
| `/api/research/invitations/:token/responses` | `POST` | Public (Bearer Token in URL) | Yes (Token) | Atomic single-use; 409 Conflict on replay |
| `/api/operations/*` | Any | `RESEARCHER`, `ADMIN` | No | Audit logged |

---

## 4. Cryptographic Research Invitations & Replay Defense

### 4.1 Token Hashing
Plaintext invitation tokens are never stored in the database. When an invitation is issued:
1. A cryptographically strong 256-bit random URL-safe token is generated (`crypto.randomBytes(32).toString('hex')`).
2. The SHA-256 hash of the token (`crypto.createHash('sha256').update(token).digest('hex')`) is computed.
3. Only the `tokenHash` is stored in the `invitations` repository alongside `expiresAt` and `maxAttempts`.

### 4.2 Replay Attack Prevention
When a participant submits their narrative:
1. The server hashes the provided token and looks up the record by `tokenHash`.
2. If `status !== 'pending'`, the server rejects the request with HTTP `409 Conflict` ("This invitation has already been completed").
3. Upon first successful submission, the invitation status transitions atomically to `completed`, recording the completion timestamp and locking the token permanently.

---

## 5. Gemini AI Intelligence & Fail-Closed Safety

### 5.1 Prompt Injection Defense
Raw qualitative operator narratives may contain vernacular nuances, typos, or adversarial prompt injections attempting to hijack Gemini's output. Before narratives are sent to Gemini:
1. Input undergoes regex sanitization stripping delimiter escapes, system instruction overrides (`Ignore all previous instructions`), and control tokens.
2. Structured prompting encapsulates operator input in distinct XML-style blocks (`<operator_narrative>...</operator_narrative>`).

### 5.2 Fail-Closed Production Stance
In development or demo mode, synthetic heuristic fallbacks allow offline work. In production (`NODE_ENV=production`):
- Silent heuristic fallbacks are **strictly forbidden**.
- If Gemini API quota is exhausted, the network is unreachable, or the API key is missing, the extraction pipeline throws a `GeminiUnavailableError` and flags the session record with `processingMode = 'ERROR_UNAVAILABLE'` and `status = 'analysis_failed'`.
- The human researcher desk is alerted immediately in the Operations Queue. Unverified synthetic evidence is never presented as real intelligence.

---

## 6. Audit Logging & Compliance

Every privileged action (evidence moderation, brief status promotion, inquiry conversion, tenant access violations) writes an immutable structured audit log entry to the `audit_logs` collection:
- `actorId`, `actorRole`, `actorEmail`
- `action` (`INQUIRY_CREATED`, `MISSION_PROMOTED`, `SESSION_SUBMITTED`, `EXTRACTION_RUN`, `BRIEF_APPROVED`, `ACCESS_DENIED`)
- `resourceType`, `resourceId`
- `ipAddress`, `userAgent`, `timestamp`
- `metadata` (including previous status and updated status)
