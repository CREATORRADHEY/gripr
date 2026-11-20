# GRIPR.STUDIO — AI-Powered Problem Intelligence Platform

> **"Better products begin with better problem understanding."**  
> GRIPR turns firsthand operational experiences into evidence-backed research that helps organizations make better product decisions.

---

## 1. Product Overview

GRIPR.STUDIO is a **B2B Problem Intelligence Platform**. Its primary commercial product is **GRIPR Missions** — fixed-scope, buyer-funded research investigations commissioned by product teams, startup founders, and research organizations.

Instead of building products on guesswork, Twitter/Reddit echo chambers, or surface-level surveys, organizations commission GRIPR to:
1. **Define the Critical Decision:** Frame the specific product roadmap choice and define falsification conditions.
2. **Recruit Screened Practitioners:** Source genuine field operators (not professional survey respondents) matching the exact workflow context.
3. **Capture Permissioned Evidence:** Conduct structured qualitative research sessions recording incidents, costs, and existing manual workarounds under 3-tier granular consent.
4. **Synthesize with Gemini + Human Review:** Structure findings, audit contradictions, and isolate research gaps under human researcher oversight.
5. **Deliver Decision Intelligence Briefs:** Deliver an executive deliverable recommending whether to **Reject / Reframe**, **Investigate More**, or **Proceed to a Pilot**.

---

## 2. Platform Architecture & Screen Map

| Experience | Route | Role / Purpose | Key Features |
|---|---|---|---|
| **Editorial Homepage** | `index.html` | B2B product positioning and discovery pipeline overview. | Editorial hero, problem with guesswork, 4-step discovery workflow, mission pilot offer, illustrative brief teaser. |
| **Mission Scoping Wizard** | `missions.html` | Client acquisition & research scoping desk. | 4-step wizard: Organization info -> Objective & Falsification -> Target Participants -> Review & Submit. Saves to local demo store. |
| **Mission Workspace** | `mission-workspace.html` | Client tracking portal for commissioned missions. | Lifecycle tracker (`Requested` to `Brief Ready`), scope summary, recorded evidence preview, demo state switcher. |
| **Participant Portal** | `participate.html` | Invitation-based research session desk. | Study briefing, ₹1,500 honorarium notice, incident narrative prompts, granular 3-tier consent controls. |
| **Decision Intelligence Brief** | `brief.html` | Executive research deliverable (MSN-2026-081). | 15-section brief with executive recommendation banner, traceable session citations, contradiction audit, workflow friction map, and limitations. |
| **Research Operations Desk** | `ops.html` | Internal operational workbench for research team. | Intake queue, scope review, participant screening, session verification, and AI interpretation approval. |

---

## 3. Design System & Visual Identity

GRIPR preserves its signature editorial visual identity:
- **Warm Cream (`#FAF5F0`):** Base light background for homepage, scoping flow, and decision briefs.
- **Near-Black (`#141414` / `#0F0F0F`):** Deep dark surfaces for problem deep-dives and operations desk.
- **Accent Orange (`#EA580C`, Hover `#F97316`):** Primary action buttons, badges, and focus indicators.
- **Typography:**
  - `DM Serif Display`: Editorial headlines and quote displays.
  - `Space Grotesk`: Navigation, badges, codes, and interactive labels.
  - `DM Sans`: Body text and narrative descriptions.
- **Focus Visibility:** Standardized accessible focus outlines (`*:focus-visible`) across all interactive elements.

---

## 4. Frontend Data Architecture

The user interface is completely decoupled via a Promise-based API layer (`js/api.js`), enabling seamless drop-in integration with Phase 2 backend microservices:

- `GriprAPI.createMissionRequest(data)`: Scopes and registers a new organization mission.
- `GriprAPI.getMission(id)`: Fetches mission details and lifecycle stages.
- `GriprAPI.getMissionList()`: Retrieves all active missions.
- `GriprAPI.getMissionBrief(missionId)`: Loads the complete 15-section Decision Intelligence Brief.
- `GriprAPI.getResearchInvitation(inviteToken)`: Fetches study metadata for invited practitioners.
- `GriprAPI.submitResearchResponse(data)`: Validates and saves participant qualitative responses.
- `GriprAPI.getResearchOperationsQueue()`: Powers the internal research ops desk.
- `GriprAPI.reviewEvidence(id, decision, details)`: Moderates sessions and extractions.
- `GriprAPI.updateMissionStatus(id, newStatus)`: Advances mission lifecycle state.
- `GriprAPI.resetFixtures()`: Re-initializes synthetic fixtures in `localStorage`.

All seed fixtures are stored in `js/fixtures.js` and explicitly tagged `#DEMO_SYNTHETIC`.

---

## 5. Commercial Disclaimers & Ethics

1. **Unvalidated Pilot Pricing:** The ₹49,000 pilot price for 5 participants is an exploratory commercial hypothesis, not confirmed customer traction.
2. **Voluntary Informed Consent:** Field participants participate under separate permissions for study analysis, brief citation, and future contact.
3. **Traceability:** AI-assisted interpretations are strictly isolated from source statements, which remain traceable to participant fixture IDs.
4. **No Automated TAM Claims:** Qualitative samples do not claim statistical market sizing or automatic macro trend extrapolation.

---

## 6. Running Locally

No build step or Node dependencies are required. Use any static HTTP server:

```bash
# Using Python
python3 -m http.server 8080

# Or using Node npx
npx serve .
```

Navigate to `http://localhost:8080` in your web browser.

---

## 7. Documentation Index

- [docs/product-architecture.md](file:///Users/divyanshdusad/Downloads/GRIPR.STUDIO/docs/product-architecture.md) — Product architecture, entities, and B2B safeguards.
- [docs/business-flow.md](file:///Users/divyanshdusad/Downloads/GRIPR.STUDIO/docs/business-flow.md) — End-to-end Mermaid operational flow and stage specifications.
- [docs/wireframes.md](file:///Users/divyanshdusad/Downloads/GRIPR.STUDIO/docs/wireframes.md) — Low-fidelity wireframes for all 6 core screens.
- [docs/phase-1-correction-report.md](file:///Users/divyanshdusad/Downloads/GRIPR.STUDIO/docs/phase-1-correction-report.md) — Complete migration, change log, and testing report.
