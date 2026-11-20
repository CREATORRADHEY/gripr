# GRIPR.STUDIO — Evidence-First Problem Intelligence Platform

> **"Don't start with ideas. Start with reality."**  
> GRIPR collects firsthand operator experiences and transforms them into evidence-linked problem intelligence for builders, founders, and research organizations.

---

## 1. Overview & Product Principle

Most product teams begin by guessing user problems or following social media trends. The cost: investing capital and engineering effort into solutions before understanding the underlying people, workflows, and evidence.

GRIPR reverses this paradigm through an **evidence-first discovery pipeline**:
1. **COLLECT:** Operators and field observers report recent incidents, workflows, and workarounds with explicit 2-tier consent.
2. **STRUCTURE:** Extracted facts, affected actors, and friction costs are isolated while unknown variables and sample limitations are clearly flagged.
3. **CONNECT:** Possible recurring issues are suggested as candidate clusters without prematurely merging distinct root causes.
4. **INVESTIGATE:** Builders inspect detailed Problem Case Files; organizations commission focused, buyer-funded GRIPR Research Missions.

---

## 2. Product Areas & Page Map

| Product Area | File | Description | Key Features |
|---|---|---|---|
| **Landing Page** | `index.html` | Editorial homepage introducing the problem discovery pipeline. | Editorial hero, entry points for contributors/builders/organizations, curated preview cards, 4-step workflow, mission pilot offer, builder dispatch signup. |
| **Contributor Experience** | `submit.html` | Firsthand problem reporting desk. | Natural-language incident input, context questions (sector, region, role), current workaround description, 2-tier consent controls (public brief vs. builder contact), live validation, confirmation card with tracking ID. |
| **Builder Experience** | `feed.html` | Problem Explorer registry. | Real-time search across quotes/workarounds/IDs, sector filtering, explicit evidence grade badges (*Verified Firsthand*, *Triangulated*, *Emerging*), zero synthetic upvote counts, loading skeletons, responsive grid. |
| **Problem Case File** | `case-file.html` | In-depth case investigation view. | Verbatim quote with translation, structured intelligence matrix (actor, trigger, impact, workaround), responsible unknowns and research gaps, sample limitations, mission request triggers. |
| **Research Missions** | `missions.html` | Commercial scoping desk for product teams. | ₹49,000 test pilot offer (5 screened operator interviews, workflow friction map, decision brief, 10-day SLA), interactive scoping form, reactive scope summary. |
| **Admin Review Desk** | `admin.html` | Internal moderation workbench. | Submission review queue, side-by-side candidate match comparison, extraction review, moderation decisions (*Approve & Publish*, *Flag Missing Evidence*, *Reject*), synthetic fixture reset. |

---

## 3. Design System & Typography

Preserving the authentic editorial GRIPR visual identity:

### Color Palette
- **Warm Cream (`--bg-light`):** `#FAF5F0` (Editorial landing, submit, missions)
- **Near-Black (`--bg-dark`):** `#141414` (Dark problem explorer, case files, admin)
- **Dark Card (`--bg-dark-card`):** `#1E1E1E` (Explorer card surfaces)
- **Pure White (`--bg-white`):** `#FFFFFF` (Forms, content cards)
- **Accent Orange (`--accent`):** `#EA580C` (Primary highlights & interactive actions)
- **Accent Hover (`--accent-hover`):** `#F97316`
- **Accent Light Tint (`--accent-light`):** `#FFF3EB`

### Typography Hierarchy
- **Editorial Headings:** `DM Serif Display`, serif (400, italic accents)
- **Navigation, Buttons, Badges, Labels:** `Space Grotesk`, sans-serif (500, 600, 700)
- **Body & Explanatory Text:** `DM Sans`, sans-serif (400, 500)

### Visual Characteristics
- Premium editorial aesthetic without generic AI dashboard gradients
- High contrast, dark-mode problem explorer
- Warm cream contributor and commercial intake experiences
- Clean typography and minimal visual clutter
- Full keyboard focus visibility (`:focus-visible`)
- Fully responsive across mobile (375px), tablet (768px), and desktop (1140px)

---

## 4. Frontend Architecture & API Abstraction

To ensure that backend integration in Phase 2 (Cloud Run, Firestore, Gemini API) does not require rewriting frontend screens, the UI is decoupled via a lightweight API service layer:

- **`js/api.js` (`window.GriprAPI`):**
  - `getSignals({ category, search, evidenceStatus })`: Queries verified signals.
  - `getSignalById(id)`: Fetches a single case file with related signals.
  - `submitSignal(formData)`: Validates input and creates an intake record in the admin queue.
  - `createMission(missionData)`: Registers a scoped organization research mission.
  - `getAdminQueue()`: Retrieves pending and reviewed submissions for the desk.
  - `reviewSignal(id, decision, details)`: Processes moderation decisions (*Approve & Publish*, *Flag*, *Reject*).
  - `resetFixtures()`: Re-initializes synthetic fixtures in `localStorage`.
- **`js/fixtures.js` (`window.GRIPR_FIXTURES`):** High-fidelity synthetic fixtures representing real Indian ground-reality problems across 8 sectors. Explicitly tagged `#DEMO_SYNTHETIC`.
- **`js/nav.js`:** Shared navigation controller managing mobile drawer state, active page links, ARIA accessibility, and global toast notifications (`window.GriprUI.showToast`).

---

## 5. Responsible Evidence & Ethics Manifesto

1. **Zero Synthetic Engagement:** No artificial upvote counts, fake popularity ranks, or simulated active user counts.
2. **Explicit Evidence Grades:** Every problem statement is explicitly badged as *Verified Firsthand*, *Triangulated*, or *Emerging*.
3. **No Automatic Market Claims:** Problem case files explicitly document *Research Gaps* and *Limitations* to prevent premature TAM assumptions.
4. **Consent Decoupling:** Contributors independently grant or withhold permission for public feed brief publication versus confidential builder follow-up.
5. **No Data Brokerage:** We do not scrape or sell raw personal contact data. Field investigations are conducted with informed operator consent and direct honorariums.

---

## 6. Running Locally

GRIPR.STUDIO is built using vanilla HTML5, CSS3, and modern ES6 JavaScript. No build step, bundling, or node dependencies are required.

To run locally with any local static HTTP server:

```bash
# Using Python 3
python3 -m http.server 8080

# Or using Node npx
npx serve .
```

Open `http://localhost:8080` in any modern web browser.

---

## 7. Phase 1 Verification Checklist

- [x] Wireframe specifications documented in `docs/wireframes.md`.
- [x] Landing page (`index.html`) introduces the 4-step workflow, missions, and verified signal previews.
- [x] Contributor intake (`submit.html`) implements natural language narrative, context, workaround, and 2-tier consent.
- [x] Problem Explorer (`feed.html`) features real-time search, category filtering, evidence grade filtering, and case file deep-links.
- [x] Problem Case File (`case-file.html`) dynamically renders structured extraction, raw quotes, research gaps, and investigation actions.
- [x] Research Missions (`missions.html`) allows B2B teams to scope a ₹49,000 test pilot investigation.
- [x] Admin Desk (`admin.html`) supports intake review, candidate match comparison, and moderation decisions.
- [x] Responsive layout verified for mobile (375px), tablet (768px), and desktop (1140px).
- [x] Accessible focus indicators and keyboard navigation tested.
