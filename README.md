# GRIPR.STUDIO — AI-Powered B2B Problem Intelligence Platform

> **"Better products begin with better problem understanding."**  
> GRIPR transforms firsthand practitioner evidence into structured qualitative intelligence that protects organizations from building software based on assumption.

---

## 🌐 Live Production Deployments

| Component | Platform | Live URL | Region |
| :--- | :--- | :--- | :--- |
| **Public Frontend** | Cloudflare Pages | **[https://gripr-studio.pages.dev](https://gripr-studio.pages.dev)** | Global Edge CDN |
| **API Backend & Direct Serving** | Google Cloud Run | **[https://gripr-backend-611571278421.asia-south1.run.app](https://gripr-backend-611571278421.asia-south1.run.app)** | `asia-south1` (Mumbai) |
| **AI Intelligence Service** | Google GenAI SDK | `models/gemini-3.5-flash-lite` | Google Cloud API |
| **GitHub Repository** | GitHub | **[https://github.com/CREATORRADHEY/gripr](https://github.com/CREATORRADHEY/gripr)** | Branch `main` |

---

## 1. What is GRIPR?

GRIPR.STUDIO is a **B2B Problem Intelligence Platform**. Its core commercial deliverable is **GRIPR Missions**—fixed-scope qualitative investigations commissioned by product teams, venture builders, and startup founders before allocating significant engineering capital.

Rather than relying on generic surveys or social media echo chambers, organizations commission GRIPR to:
1. **Frame Critical Product Decisions:** Formulate unambiguous roadmaps, operational hypotheses, and clear falsification criteria.
2. **Engage Verified Practitioners:** Recruit genuine field operators (e.g. neighborhood kirana store owners) with deep domain tenure.
3. **Capture Permissioned Evidence:** Conduct structured qualitative research sessions under versioned 3-tier informed consent.
4. **Extract Intelligence via Google Gemini:** Structure findings into 14 causal dimensions using `gemini-3.5-flash-lite` with 100% verbatim quote audits.
5. **Synthesize Decision Intelligence Briefs:** Produce executive briefs featuring clear **Reject / Reframe**, **Investigate Further**, or **Proceed to Pilot** recommendations under human researcher oversight.

---

## 2. Core Architecture & Technology Stack

```
 ┌────────────────────────────────────────────────────────────────────────┐
 │                      CLOUDFLARE PAGES (EDGE CDN)                       │
 │  - Static Delivery: index.html, missions.html, demo.html, brief.html  │
 │  - Custom Typography & Design Tokens (DM Serif Display, Space Grotesk) │
 │  - Decoupled API abstraction: js/api.js                                │
 └───────────────────────────────────┬────────────────────────────────────┘
                                     │ HTTPS REST / Bearer Token
                                     ▼
 ┌────────────────────────────────────────────────────────────────────────┐
 │                   GOOGLE CLOUD RUN (FASTIFY BACKEND)                   │
 │  - Runtime: Node.js v22 (Alpine) | TypeScript v5.9                     │
 │  - Fastify v4 HTTP Engine (Strict CORS, Rate Limiting, 64KB limits)    │
 │  - Dual Serving: /api routes + fallback static serving (SERVE_STATIC)  │
 └─────────────────┬──────────────────────────────────┬───────────────────┘
                   │                                  │
                   ▼                                  ▼
 ┌───────────────────────────────────┐  ┌─────────────────────────────────┐
 │       GOOGLE GEMINI AI SDK        │  │       PERSISTENCE ENGINE        │
 │ - @google/genai v3.6.1            │  │ - Cloud Firestore Client        │
 │ - Model: gemini-3.5-flash-lite    │  │ - DEMO_ONLY Safe Mode (Active)  │
 │ - Structured JSON (Zod Parity)    │  │ - Volatile local storage banned │
 │ - Fail-closed: No mock degradation│  │ - Zero cost overhead            │
 └───────────────────────────────────┘  └─────────────────────────────────┘
```

### Technology Highlights
- **Frontend:** Semantic HTML5, CSS custom properties, vanilla ES6 modules, zero heavy framework bundle overhead, sub-100ms First Contentful Paint.
- **Backend:** Node.js v22.22.2, Fastify v4.29.1, TypeScript v5.9.3 with strict `NodeNext` ESM imports.
- **Validation:** Zod v3.25.76 schemas protecting every input, extraction, and comparison.
- **AI Intelligence:** Official Google Gen AI SDK (`@google/genai`) targeting `gemini-3.5-flash-lite`.
- **Authentication & Security:** Firebase Admin SDK, server-signed presenter session tokens, timing-safe crypto comparisons, rate limiting, and PII redaction.
- **Testing:** 17 test suites, 128 tests running on Vitest v2.1.9 with 100% pass rate.

---

## 3. Platform Screen Map & User Journeys

| Screen / Page | Route | Description & Key Capabilities |
| :--- | :--- | :--- |
| **Editorial Homepage** | `index.html` | B2B product positioning, problem discovery overview, exploratory pilot offer (₹49,000 for 5 operators), and illustrative brief teaser. |
| **Scoping Wizard & Demo** | `missions.html` | **Dual Experience:**<br>1. *Real Scoping Wizard*: 4-step B2B inquiry form with falsification framing.<br>2. *Guided Walkthrough*: 5-stage interactive simulator inspecting 5 operator evidence packets and live Gemini extraction. |
| **Decision Intelligence Brief** | `brief.html` | 15-section executive deliverable (Mission MSN-2026-081) with Reject/Reframe recommendation, contradiction audits, and verbatim citations. |
| **Research Operations Desk** | `ops.html` | Internal workbench for research team: participant screening, session moderation, and brief approval. |
| **Operations Demo Desk** | `research-operations-demo.html` | Standalone interactive operations desk demonstration with live Gemini trigger. |
| **Legal & Compliance** | `privacy.html`, `terms.html` | B2B qualitative research terms, GDPR/DPDP informed consent protocols, and data retention standards. |

---

## 4. Interactive AI Demonstration (Modes A & B)

On **`missions.html` (Stage 5)** and **`research-operations-demo.html`**, users can evaluate qualitative extraction through two distinct engines:

### Mode A: Deterministic Synthetic Intelligence (Offline / Instant)
- Operates entirely offline from verified schema fixtures (`js/fixtures.js`).
- Demonstrates instant multi-operator pattern clustering across all 5 synthetic operator packets (`PKT-401` to `PKT-405`).
- Guaranteed operational availability regardless of network conditions or cloud quotas.

### Mode B: Live Google Gemini Inference (Official Google GenAI SDK)
- Calls `POST /api/demo/live-gemini-analysis` on Google Cloud Run.
- Executes real-time inference using `gemini-3.5-flash-lite`.
- Features **Deterministic Verbatim Quotation Validation**: checks that all extracted quotes exist verbatim in the Hindi/Hinglish source transcript.
- Measures and displays real server round-trip latency (typically 1.8s - 3.2s) and token counts.
- **Fail-Closed Guarantee:** If the API key is missing or quota is exhausted, it returns an explicit `HTTP 502/503` non-2xx error rather than silently serving mock data disguised as `LIVE_GEMINI`.

---

## 5. Local Development & Testing

### Prerequisites
- Node.js v22+
- `pnpm` v10+

### Setup & Run
```bash
# 1. Clone repository
git clone https://github.com/CREATORRADHEY/gripr.git
cd gripr

# 2. Install backend dependencies
cd api
pnpm install

# 3. Configure environment variables
cp .env.example .env
# Add your GEMINI_API_KEY and INTERNAL_AUTH_SECRET

# 4. Run TypeScript typecheck
pnpm run typecheck

# 5. Run test suite (17 suites, 128 tests)
pnpm test

# 6. Start backend development server
pnpm run dev
```

The backend starts at `http://127.0.0.1:3000`. You can serve the frontend with any static HTTP server (e.g. `python3 -m http.server 8080` or `npx serve .`).

---

## 6. Complete Documentation Index

### Core Architecture & Specifications (`docs/`)
- **[docs/README.md](file:///Users/divyanshdusad/Downloads/GRIPR.STUDIO/docs/README.md)** — Master table of contents for the documentation library.
- **[docs/deployment-guide.md](file:///Users/divyanshdusad/Downloads/GRIPR.STUDIO/docs/deployment-guide.md)** — Production deployment guide for Google Cloud Run and Cloudflare Pages.
- **[docs/backend-architecture.md](file:///Users/divyanshdusad/Downloads/GRIPR.STUDIO/docs/backend-architecture.md)** — Fastify backend design, persistence modes, and repository patterns.
- **[docs/api-contract.md](file:///Users/divyanshdusad/Downloads/GRIPR.STUDIO/docs/api-contract.md)** — REST API specifications, request/response envelopes, and status codes.
- **[docs/gemini-evidence-protocol.md](file:///Users/divyanshdusad/Downloads/GRIPR.STUDIO/docs/gemini-evidence-protocol.md)** — AI evidence protocol, 14 extracted dimensions, and verbatim quote audits.
- **[docs/phase-3-architecture.md](file:///Users/divyanshdusad/Downloads/GRIPR.STUDIO/docs/phase-3-architecture.md)** — System architecture, Firestore persistence, and RBAC governance.
- **[docs/phase-3-test-report.md](file:///Users/divyanshdusad/Downloads/GRIPR.STUDIO/docs/phase-3-test-report.md)** — Test execution report (17 test suites, 128 tests passing).
- **[docs/phase-3-security-audit.md](file:///Users/divyanshdusad/Downloads/GRIPR.STUDIO/docs/phase-3-security-audit.md)** — Security audit covering CORS, header spoofing, and PII isolation.
- **[docs/product-architecture.md](file:///Users/divyanshdusad/Downloads/GRIPR.STUDIO/docs/product-architecture.md)** — Product discovery philosophy, mission scoping, and ethical research frameworks.
- **[docs/business-flow.md](file:///Users/divyanshdusad/Downloads/GRIPR.STUDIO/docs/business-flow.md)** — End-to-end mission lifecycle flowchart and honorarium protocol.
- **[docs/wireframes.md](file:///Users/divyanshdusad/Downloads/GRIPR.STUDIO/docs/wireframes.md)** — Wireframes and visual layout specifications for all 6 screens.

### Strategic Deep-Dive Mapping Reports (`mapping/`)
- **[mapping/01_TECHNICAL_ARCHITECTURE.md](file:///Users/divyanshdusad/Downloads/GRIPR.STUDIO/mapping/01_TECHNICAL_ARCHITECTURE.md)** — Cloud topology and deployment architecture.
- **[mapping/02_FUNCTIONAL_IMPLEMENTATION.md](file:///Users/divyanshdusad/Downloads/GRIPR.STUDIO/mapping/02_FUNCTIONAL_IMPLEMENTATION.md)** — 14-stage operational workflow implementation.
- **[mapping/03_GOOGLE_AI_INTEGRATION.md](file:///Users/divyanshdusad/Downloads/GRIPR.STUDIO/mapping/03_GOOGLE_AI_INTEGRATION.md)** — Google Gemini AI SDK implementation details.
- **[mapping/04_PROBLEM_SOLUTION.md](file:///Users/divyanshdusad/Downloads/GRIPR.STUDIO/mapping/04_PROBLEM_SOLUTION.md)** — Problem/solution fit, qualitative gap, and commercial model.
- **[mapping/05_UX_UI_USABILITY.md](file:///Users/divyanshdusad/Downloads/GRIPR.STUDIO/mapping/05_UX_UI_USABILITY.md)** — Design system, tokens, and usability walkthrough.
- **[mapping/06_INNOVATION_DIFFERENTIATION.md](file:///Users/divyanshdusad/Downloads/GRIPR.STUDIO/mapping/06_INNOVATION_DIFFERENTIATION.md)** — Falsification criteria, competitive moat, and defensibility.
- **[mapping/view-diagrams.html](file:///Users/divyanshdusad/Downloads/GRIPR.STUDIO/mapping/view-diagrams.html)** — Interactive Mermaid diagram viewer.

---

## 7. Commercial & Ethical Disclaimers

1. **Indicative Pilot Pricing:** The ₹49,000 scoping scope for 5 participants is an exploratory discovery hypothesis, not a standard transactional SaaS subscription.
2. **Voluntary Informed Consent:** Field participants contribute voluntarily under granular 3-tier consent and receive direct honorariums for their time.
3. **No Automated Market Sizing:** Qualitative problem discovery investigates causal mechanism failure; it does not claim statistical macro TAM extrapolation.
4. **Data Protection & DEMO_ONLY Guard:** When durable Cloud Firestore credentials are not configured, real personal and commercial inquiry submission returns HTTP 503 to ensure zero data loss.
