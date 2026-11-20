# GRIPR.STUDIO — Wireframe Specifications (Phase 1)

**Product Principle:** *"Don't start with ideas. Start with reality."*  
**Platform Scope:** Evidence-first AI-powered Problem Intelligence Platform  
**Document Version:** 1.0 (Phase 1 Checkpoint)  
**Target Viewports:** Desktop (1280px / 1140px container) & Mobile (375px - 430px)

---

## 1. Design System & UX Architecture Foundation

### 1.1 Color Palette
- **Warm Cream (Base Light):** `#FAF5F0` (`--bg-light`)
- **Near-Black (Base Dark):** `#141414` (`--bg-dark`)
- **Card Dark (Explorer / Evidence):** `#1E1E1E` (`--bg-dark-card`)
- **Pure White:** `#FFFFFF` (`--bg-white`)
- **Accent Orange:** `#EA580C` (`--accent`)
- **Accent Hover:** `#F97316` (`--accent-hover`)
- **Accent Light Tint:** `#FFF3EB` (`--accent-light`)
- **Text Primary (Dark):** `#1A1A1A` (`--text-dark`)
- **Text Body:** `#3D3D3D` (`--text-body`)
- **Text Secondary:** `#6B6B6B` (`--text-secondary`)
- **Text Light:** `#F5F5F5` (`--text-light`)
- **Text Light Muted:** `#888888` (`--text-light-muted`)
- **Evidence Verification Badges:**
  - Verified Firsthand: `#10B981` (Emerald green bg tint: `rgba(16, 185, 129, 0.12)`)
  - Triangulated Signal: `#3B82F6` (Blue tint: `rgba(59, 130, 246, 0.12)`)
  - Emerging / Unverified: `#F59E0B` (Amber tint: `rgba(245, 158, 11, 0.12)`)

### 1.2 Typography Hierarchy
- **Editorial Headings:** `DM Serif Display`, serif (400, italic accents)
- **Labels, Navigation, Buttons, Codes, Badges:** `Space Grotesk`, sans-serif (500, 600, 700)
- **Body & Longform Descriptions:** `DM Sans`, -apple-system, sans-serif (400, 500)

### 1.3 Core Product Principles & Evidence Guardrails
1. **No Invented Metrics:** No fake upvote counters, fabricated market size (\$B TAM), or synthetic follower counts.
2. **Explicit Verification Status:** Every problem card clearly states whether evidence is firsthand, triangulated, or pending verification.
3. **Traceability:** Case files expose original anonymized quotes, context, reported workarounds, and documented unknowns/research gaps.
4. **Consent Separation:** Contributor submission explicitly decouples permission to publish an anonymized problem brief from permission for private builder follow-up.
5. **Clear Commercial Model:** Research Missions are transparently scoped investigations (e.g. ₹49,000 test pilot for 5 screened operator interviews, evidence brief, and decision workshop) rather than selling raw personal data.

---

## 2. Navigation Architecture

```
[ GLOBAL NAVIGATION - WARM CREAM (LANDING / SUBMIT / MISSIONS) ]
+-----------------------------------------------------------------------------------------+
| [LOGO] GRIPR [BETA]            Explorer    Report Problem    Research Missions   [Admin] |
+-----------------------------------------------------------------------------------------+

[ GLOBAL NAVIGATION - DARK (PROBLEM EXPLORER / CASE FILE / ADMIN) ]
+-----------------------------------------------------------------------------------------+
| [LOGO] GRIPR [BETA]            Explorer    Report Problem    Research Missions   [Admin] |
+-----------------------------------------------------------------------------------------+
```

### Mobile Drawer Navigation
On screens `< 768px`, a top bar with the logo and a hamburger icon expands into an accessible slide-down menu with direct links to:
- Signal Explorer (`feed.html`)
- Report a Problem (`submit.html`)
- Research Missions (`missions.html`)
- Admin Review (`admin.html`)
- Quick CTA: "Submit Signal" / "Explore Feed"

---

## 3. Screen 1: Landing Page (`index.html`)

### 3.1 Information Hierarchy
1. **Live Status Banner:** "MULTILINGUAL LIVE SIGNAL FEED · EVIDENCE-FIRST"
2. **Hero Editorial Header:** "Discover problems people actually want solved." / "Don't start with ideas. Start with reality."
3. **Hero Subtitle:** Explains GRIPR's role in converting fragmented operator frustrations across India into evidence-linked intelligence for builders.
4. **Dual Entry Points:**
   - Builder: "Explore Problem Intelligence →" (`feed.html`)
   - Contributor: "Report Firsthand Problem" (`submit.html`)
   - Enterprise: "Commission Research Mission" (`missions.html`)
5. **Evidence Preview Grid:** Curated real problem cards showing actual quotes, sector, region, and verification status (no fake upvote counters).
6. **Core 4-Step Workflow (How GRIPR Operates):**
   - 01 COLLECT (Firsthand narrative + verified consent)
   - 02 STRUCTURE (Facts, actors, workarounds, flagged unknowns)
   - 03 CONNECT (Evidence-linked candidate clusters without merging distinct roots)
   - 04 INVESTIGATE (Problem Case Files & Commissioned Missions)
7. **Research Missions Teaser:** Scoped problem investigations for B2B teams building for unserved workflows.
8. **Trust & Governance Manifesto:** Responsible evidence claims, privacy by default, zero artificial engagement manipulation.
9. **Builder Digest / Subscription Form:** Clean email intake for verified weekly signal briefs.
10. **Footer:** Comprehensive site links, legal disclosures, and build notice.

### 3.2 Desktop Wireframe (1140px)
```
+------------------------------------------------------------------------------------+
| [NAV]  GRIPR [BETA]          Problem Explorer   Report Problem   Missions   [Admin] |
+------------------------------------------------------------------------------------+
|                                                                                    |
|  [●] MULTILINGUAL LIVE SIGNAL FEED · EVIDENCE-FIRST                                |
|                                                                                    |
|  Discover problems                                                                 |
|  *people actually want solved.*                                                    |
|                                                                                    |
|  Real firsthand inefficiencies, broken workflows, and unserved demand across       |
|  India. Structured into verifiable case files for builders and founders.           |
|                                                                                    |
|  [ Explore Problems → ]     [ Report a Problem ]     [ Commission Mission ]        |
|                                                                                    |
|  ✓ Firsthand evidence   ·   ✓ Traceable facts   ·   ✓ Zero synthetic hype          |
|                                                                                    |
+------------------------------------------------------------------------------------+
| SECTION: THIS WEEK'S VERIFIED SIGNALS                                              |
|                                                                                    |
| [SIG-019] [Agriculture] [Rural MP]            [SIG-021] [Logistics] [Tamil Nadu]  |
| "Gaon mein fertilizer rates ka koi live      "Local transport isn't available      |
| system nahi hai. Dealership wale apni         without full advance payment. Trust  |
| marzi ka rate lagate hain..."                 is zero."                            |
| Status: Triangulated Report                   Status: Firsthand Verified           |
| Workaround: Physical dealer calls             Workaround: Uninsured local brokers  |
| [ View Case File → ]                          [ View Case File → ]                 |
|                                                                                    |
| [SIG-010] [Commerce] [Pan India]              [SIG-002] [Logistics] [Maharashtra]  |
| "Street food vendors can't accept digital     "Cold storage trucks refuse small-   |
| payments reliably. Apps crash on low-end..."  tonnage farm loads while running     |
| Status: Firsthand Verified                    half-empty..."                       |
| Workaround: Cash buffer / peer borrow         Status: Firsthand Verified           |
| [ View Case File → ]                          [ View Case File → ]                 |
|                                                                                    |
|                            [ View All 24 Signals → ]                               |
+------------------------------------------------------------------------------------+
| SECTION: HOW GRIPR WORKS (THE 4-STEP PROTOCOL)                                     |
|                                                                                    |
| [ 01 COLLECT ]           [ 02 STRUCTURE ]       [ 03 CONNECT ]      [ 04 INVESTIGATE]
| Operator submits recent  Structured facts,      Candidate clusters  Builders inspect
| incident & workarounds   actors & unknowns      suggested without   evidence; teams 
| with 2-tier consent.     flagged clearly.       merging roots.      commission missions
+------------------------------------------------------------------------------------+
| SECTION: RESEARCH MISSIONS (FOR ORGANIZATIONS & TEAMS)                             |
|                                                                                    |
| Start with paid problem investigations — prove demand before writing code.         |
| Pilot Offer: ₹49,000 Scoped Research Mission (5 screened interviews + brief)       |
|                                                                                    |
|                                      [ Commission a Research Mission → ]           |
+------------------------------------------------------------------------------------+
| FOOTER: Links, Copyright 2026, Responsible Research Protocol                       |
+------------------------------------------------------------------------------------+
```

### 3.3 Mobile Wireframe (375px)
```
+-----------------------------------+
| [=] GRIPR [BETA]            [+]   |
+-----------------------------------+
| [●] EVIDENCE-FIRST INTELLIGENCE   |
|                                   |
| Discover problems                 |
| *people actually*                 |
| *want solved.*                    |
|                                   |
| Firsthand inefficiencies across   |
| India. No guesswork.              |
|                                   |
| [ Explore Problems → ]            |
| [ Report a Problem ]              |
| [ Commission Mission ]            |
+-----------------------------------+
| RECENT SIGNALS                    |
| +-------------------------------+ |
| | [SIG-019] [Agriculture]       | |
| | "Gaon mein fertilizer rates..."| |
| | Status: Triangulated          | |
| | [ View Case File → ]          | |
| +-------------------------------+ |
| | [SIG-021] [Logistics]         | |
| | "Local transport isn't..."    | |
| | Status: Verified              | |
| | [ View Case File → ]          | |
| +-------------------------------+ |
| [ View All Signals (24) → ]       |
+-----------------------------------+
| 4-STEP PROTOCOL (Stacked)         |
| 01 Collect -> 02 Structure        |
| 03 Connect -> 04 Investigate      |
+-----------------------------------+
| FOOTER                            |
+-----------------------------------+
```

---

## 4. Screen 2: Report a Problem (`submit.html`)

### 4.1 Information Hierarchy & Multi-Tier Form Steps
1. **Context Header:** "SHARE FIRSTHAND REALITY — What feels broken that nobody has fixed?"
2. **Step 1: The Firsthand Observation (Natural Language Narrative):**
   - Large auto-expanding textarea (min 20 chars, max 1200 chars).
   - Multilingual support hint (English, Hindi, Hinglish, Tamil, Bengali, Marathi, etc.).
   - Character count and prompt rotator ("What workflow makes you quietly furious?").
3. **Step 2: Who & Where (Context):**
   - Category selector (Healthcare, Logistics, Education, Agriculture, Finance, Commerce, Compliance, Employment, Other).
   - Broad Location (e.g. "Jaipur, Rajasthan", "Tier-2 Tamil Nadu", "Rural MP").
   - Role / Who Faces This (e.g. "Small clinic doctor", "Kirana store owner", "Truck driver").
4. **Step 3: The Current Workaround (Crucial for Problem Intelligence):**
   - "How do people currently deal with this problem today?" (e.g. "Paper register + WhatsApp group", "Paying local middleman cash").
5. **Step 4: Explicit 2-Tier Consent Controls:**
   - **Tier 1 (Publication):** "I consent to publishing an anonymized, stripped version of this problem statement in the public intelligence feed." (Required)
   - **Tier 2 (Builder Contact):** "I am open to being contacted confidentially by verified builders researching this problem." (Optional, reveals email input).
6. **Form Validation Feedback:** Real-time inline field validation, error summaries, and character counts.
7. **Success State:** Instant visual confirmation card with assigned Submission Tracking ID, verification queue explanation, and next steps.

### 4.2 Desktop Wireframe (1140px)
```
+------------------------------------------------------------------------------------+
| [NAV]  GRIPR [BETA]          Problem Explorer   Report Problem   Missions   [Admin] |
+------------------------------------------------------------------------------------+
| SHARE SOMETHING BROKEN                                                             |
| "Tell us what's broken in reality — we structure it for builders to solve."        |
+------------------------------------------------------------------------------------+
| [ FORM COLUMN - LEFT (65%) ]                  | [ GUIDANCE COLUMN - RIGHT (35%) ]   |
|                                               |                                     |
| 1. The Frustration / Incident *               | WHAT MAKES VALUABLE EVIDENCE        |
| +-------------------------------------------+ | • Firsthand observation > opinion   |
| | Describe what happened or what's broken.  | | • Name the specific workflow        |
| | Be specific. Include what failed.         | | • Mention who suffered the cost     |
| |                                           | |                                     |
| +-------------------------------------------+ | EXAMPLES FROM THE FIELD             |
| [Any language accepted]             0 / 1200  | "Cold storage trucks refuse <2 ton  |
|                                               | loads; small farmers lose 30%..."   |
| 2. Classification & Location                  |                                     |
| Category: [ Healthcare              ▼ ]       |                                     |
| Broad Region: [ e.g. Tier-2 Maharashtra     ] |                                     |
| Who faces this: [ e.g. Community Pharmacist ] |                                     |
|                                               |                                     |
| 3. Current Workaround *                       |                                     |
| +-------------------------------------------+ |                                     |
| | What do people do right now instead?      | |                                     |
| | (e.g. paper notebook, hiring middlemen)   | |                                     |
| +-------------------------------------------+ |                                     |
|                                               |                                     |
| 4. Verification & Consent Controls            |                                     |
| [x] I consent to publishing an anonymized     |                                     |
|     version on the public problem feed. *     |                                     |
|                                               |                                     |
| [ ] Allow verified builders to contact me     |                                     |
|     confidentially regarding this problem.    |                                     |
|     Email: [ your@email.com                 ] |                                     |
|                                               |                                     |
| [ Submit Firsthand Signal → ]                 |                                     |
| Status: Anonymous by default · Manual review  |                                     |
+------------------------------------------------------------------------------------+
```

### 4.3 Form States
- **Empty State:** Textarea empty, submit button disabled, helper text visible.
- **Validating State:** User enters < 20 chars; button shows "Need 20+ chars"; counter increments.
- **Error State:** Missing required fields (frustration < 20 chars, workaround empty, or publication consent unchecked); red border on inputs, accessible `aria-invalid="true"`, message displayed below input.
- **Loading State:** Button disabled with spinner / "Validating & Recording Signal...".
- **Success State:** Form swaps to a clean confirmation card:
  - Green checkmark icon
  - Assigned Signal ID: `SIG-PENDING-4812`
  - Explanatory copy: "Your report has been queued for human verification and extraction. If approved, it will be published to the Problem Explorer."
  - Action buttons: "Submit another problem" or "Browse existing signals".

---

## 5. Screen 3: Problem Explorer (`feed.html`)

### 5.1 Information Hierarchy
1. **Header & Context:** "Problems worth *building for.*" (Dark mode background `#141414`).
2. **Real-time Filter & Search Bar:**
   - Text search query input (searches quotes, categories, regions, workarounds, IDs).
   - Category filter pills (All, Healthcare, Logistics, Education, Agriculture, Local Commerce, Compliance, Employment).
   - Verification status filter dropdown (All Evidence, Firsthand Verified, Triangulated, Emerging).
3. **Signal Count & Evidence Status Summary:** "Showing X verified problem signals · Manually reviewed · No synthetic ranks".
4. **Card Grid (Responsive 3-column desktop, 1-column mobile):**
   - Problem ID (`SIG-019`)
   - Category badge & Language pill
   - Evidence Status Badge (`Verified Firsthand` / `Triangulated` / `Emerging`)
   - Region / Sector tag
   - Core Problem Statement (Quotation style)
   - Extracted Workaround snippet
   - Primary Action: "Inspect Case File →" (`case-file.html?id=SIG-019`)
   - Secondary Action: "Share Signal" (copies direct case-file link)
5. **Empty State:** Helpful message when search/filter returns zero matches, with a "Reset Filters" button and "Report this problem" link.

### 5.2 Desktop Wireframe (1140px)
```
+------------------------------------------------------------------------------------+
| [NAV - DARK]  GRIPR [BETA]     Problem Explorer   Report Problem   Missions [Admin]|
+------------------------------------------------------------------------------------+
| PROBLEMS WORTH                                   | Total Verified Signals: 24      |
| *building for.*                                  | Updated: Weekly curation        |
+------------------------------------------------------------------------------------+
| [ 🔍 Search keywords, sectors, workarounds...                             ]        |
| Filter: [ All ] [ Healthcare ] [ Logistics ] [ Agriculture ] [ Commerce ] [ ... ]   |
| Evidence: [ All Evidence Types ▼ ]    Sort: [ Most Recent ▼ ]                      |
+------------------------------------------------------------------------------------+
| [ CARD 1 ]                       [ CARD 2 ]                   [ CARD 3 ]           |
| SIG-019 · Agriculture            SIG-020 · Healthcare         SIG-021 · Logistics  |
| [ Hinglish ] [ Triangulated ]    [ Hindi ] [ Verified ]       [ Tamil ] [ Verified]|
| Region: Rural MP                 Region: Delhi NCR            Region: Tamil Nadu   |
|                                                                                    |
| "Gaon mein fertilizer rates ka   "Hospital discharge summary  "Local transport     |
| koi live system nahi hai. Deal-  WhatsApp pe bhejni padti     advance payment ke   |
| ership wale manmani karte..."    hai. Central record nahi..." bina nahi milta..."  |
|                                                                                    |
| Workaround: Word of mouth calls  Workaround: Printouts/WA     Workaround: Cash     |
| [ Inspect Case File → ]          [ Inspect Case File → ]      [ Inspect Case File→]|
+------------------------------------------------------------------------------------+
| [ CARD 4 ]                       [ CARD 5 ]                   [ CARD 6 ]           |
| ...                              ...                          ...                  |
+------------------------------------------------------------------------------------+
```

---

## 6. Screen 4: Problem Case File (`case-file.html`)

### 6.1 Information Hierarchy
1. **Case Header & Breadcrumb:** `Explorer / SIG-019`
2. **Metadata Bar:**
   - Signal ID (`SIG-019`)
   - Sector (`Agriculture`)
   - Primary Language (`Hinglish / Hindi`)
   - Verification Grade (`Triangulated Firsthand Evidence`)
   - Submission Date (`May 2025 / Active`)
3. **Headline Problem Statement:** Clear editorial title synthesized from original report.
4. **Verbatim Firsthand Evidence Box:**
   - Raw quote in original language
   - English translation (if applicable)
   - Contributor context (e.g. "Smallholder farmer & tractor operator, Sehore district, MP")
5. **System Extraction Matrix (Structured Intelligence):**
   - **Primary Actor:** Who experiences the failure
   - **Trigger Event:** What causes the breakdown
   - **Observed Impact:** Time lost, financial friction, crop spoilage, or compliance hazard
   - **Current Workaround:** How people cope today without software
6. **Unknowns & Research Gaps (Responsible AI):**
   - Transparent disclosure of what is NOT yet known (e.g. "Exact dealer margin variance unverified", "Seasonal price surge patterns need broader sample").
7. **Evidence Limitations & Bias Notes:** Explicit declaration preventing premature market-size claims.
8. **Candidate Related Signals:** Links to other related case files in the same cluster.
9. **Primary Action / Investigation Trigger:**
   - "Request Focused Investigation" (Opens pre-filled Research Mission form for this problem).
   - "I have firsthand evidence on this" (Opens contributor submit form with link to this ID).

### 6.2 Desktop Wireframe (1140px)
```
+------------------------------------------------------------------------------------+
| [NAV - DARK]  GRIPR [BETA]     Problem Explorer   Report Problem   Missions [Admin]|
+------------------------------------------------------------------------------------+
| ← Back to Problem Explorer                                                         |
|                                                                                    |
| [ EVIDENCE GRADE: TRIANGULATED FIRSTHAND ]   [ SIG-019 ]   [ SECTOR: AGRICULTURE ] |
|                                                                                    |
| Fertilizer Dealer Spot Price Manipulation in Rural Distribution                    |
|                                                                                    |
| FIRSTHAND EVIDENCE (ANONYMIZED)                                                    |
| +--------------------------------------------------------------------------------+ |
| | "Gaon mein fertilizer rates ka koi live system nahi hai. Dealership wale apni  | |
| | marzi ka rate lagate hain jab demand high hoti hai. Kisaan majboor hota hai."  | |
| | — Smallholder Farmer, Sehore District, Rural Madhya Pradesh (Hinglish)         | |
| +--------------------------------------------------------------------------------+ |
|                                                                                    |
| STRUCTURED PROBLEM INTELLIGENCE                                                    |
| +---------------------------------------+----------------------------------------+ |
| | AFFECTED ACTOR                        | REPORTED WORKAROUND                    | |
| | Smallholder farmers (1-5 acres)       | Physically visiting 3-4 shops or phone | |
| | purchasing DAP/Urea during sowing.    | calls to neighboring village relatives.| |
| +---------------------------------------+----------------------------------------+ |
| | REPORTED IMPACT                       | ROOT CAUSE HYPOTHESIS                  | |
| | 15-25% premium paid above MRP during  | Asymmetric inventory visibility and    | |
| | peak sowing; delayed application.     | lack of digital dealer price registry. | |
| +---------------------------------------+----------------------------------------+ |
|                                                                                    |
| RESEARCH GAPS & EVIDENCE LIMITATIONS                                               |
| ⚠️ What this report does NOT prove:                                                |
| • Does not establish nationwide prevalence (limited to central MP district sample). |
| • Dealer-side margin pressures and credit terms remain uninvestigated.             |
| • Willingness-to-pay for a digital price tracker has NOT been validated.           |
|                                                                                    |
| ACTIONS:                                                                           |
| [ Commission Mission on This Problem (₹49,000 Pilot) → ]  [ Contribute Evidence ] |
+------------------------------------------------------------------------------------+
```

---

## 7. Screen 5: Organization Research Missions (`missions.html`)

### 7.1 Information Hierarchy
1. **Headline & Value Proposition:**
   - "Don't build on guesses. Commission a GRIPR Research Mission."
   - "A scoped, evidence-first investigation of unserved workflows in India."
2. **Commercial Offer Transparency:**
   - **Pilot Mission Package:** ₹49,000 (Test Pilot)
   - **Scope Deliverables:**
     - 5 Screened, in-depth operator interviews
     - Verified workflow friction map
     - Unfiltered verbatim audio quotes / transcripts
     - Synthesized Decision Brief & 60-min Strategy Workshop
   - **Timeline:** 10 Business Days
3. **Interactive Mission Scoping Form:**
   - **Step 1: Organization & Buyer Info** (Company Name, Lead Email, Role)
   - **Step 2: Problem or Sector to Investigate** (Text input or reference to an existing Signal ID)
   - **Step 3: Target Audience / Operator Profile** (e.g. "Tier-2 diagnostic lab technicians", "Rural fertilizer retailers")
   - **Step 4: Key Decision to Validate** (e.g. "Deciding whether to build an inventory app or WhatsApp bot")
   - **Step 5: Desired Deliverable Format** (Executive Decision Brief, Raw Transcripts, Workflow Video Map)
4. **Scope Summary & Review State:** Live reactive summary of the mission parameters before final dispatch.
5. **Confirmation & Next Steps:** Clear SLA (24-hour scoping review, NDA agreement, zero upfront spam).

### 7.2 Desktop Wireframe (1140px)
```
+------------------------------------------------------------------------------------+
| [NAV]  GRIPR [BETA]          Problem Explorer   Report Problem   Missions   [Admin] |
+------------------------------------------------------------------------------------+
| GRIPR MISSIONS · BUYER-FUNDED INVESTIGATION                                        |
| Scoped problem research for product teams entering unfamiliar India workflows.     |
+------------------------------------------------------------------------------------+
| [ SCOPING FORM (60%) ]                        | [ MISSION PACKAGE DETAILS (40%) ]  |
|                                               |                                    |
| 1. Organization Information                   | THE PILOT MISSION PACKAGE          |
| Company / Team Name: [                      ] | Price: ₹49,000 (Pilot Scope)       |
| Contact Work Email:  [                      ] | Delivery: 10 Business Days         |
| Your Role:           [ Product Lead       ▼ ] |                                    |
|                                               | WHAT YOU RECEIVE:                  |
| 2. Problem to Investigate                     | ✓ 5 Screened Operator Interviews   |
| [ Describe the workflow, inefficiency, or   ] | ✓ Verified Workflow Friction Map   |
| [ link an existing Signal ID (e.g. SIG-019) ] | ✓ Unfiltered Firsthand Quotes      |
|                                               | ✓ Decision Brief & Strategy Session|
| 3. Target Operator Profile                    |                                    |
| [ e.g. Independent pharmacy owners in Tier-2] | TRUST & ETHICS GUARANTEE:          |
|                                               | We do not sell scraped data. Every |
| 4. Primary Decision at Stake                  | interview is conducted with formal |
| [ e.g. Choosing between building a web tool ] | participant consent & honorarium.  |
| [ vs WhatsApp integration.                  ] |                                    |
|                                               |                                    |
| 5. Desired Deliverables                       |                                    |
| [x] Decision Brief   [x] Workflow Map         |                                    |
| [ ] Raw Anonymized Transcripts                |                                    |
|                                               |                                    |
| [ Review & Submit Mission Scope → ]           |                                    |
+------------------------------------------------------------------------------------+
```

---

## 8. Screen 6: Admin Review Workspace (`admin.html`)

### 8.1 Purpose & Security Perimeter
- Internal workspace for evaluating inbound problem submissions, reviewing extracted facts, checking for duplicate/candidate clusters, and approving or rejecting signals before they reach the public Explorer.
- Labelled clearly as **INTERNAL OPERATIONAL WORKSPACE — DEMO/SYNTHETIC FIXTURES MODE**.

### 8.2 Information Hierarchy
1. **Workspace Header:** "GRIPR Intelligence Intake & Review Desk" + Synthetic Mode Badge.
2. **Review Metrics Bar:**
   - Pending Intake Queue count
   - Approved Signals count
   - Flagged for Follow-up count
   - Candidate Clusters count
3. **Split Workbench View:**
   - **Left Column (Intake Queue):** List of pending submissions with timestamps, raw preview, language, category, and consent status.
   - **Right Column (Detailed Evaluation Panel):**
     - Verbatim text and contributor metadata
     - Consent verification indicators (Public: Yes/No, Contact: Yes/No)
     - AI Extraction Review (Actors, Inefficiencies, Workarounds, Flagged Unknowns)
     - Candidate Match Comparison (Compares new submission side-by-side with existing signals in database)
     - Decision Actions: `[ Approve & Publish to Feed ]`, `[ Request More Evidence ]`, `[ Reject / Mark Out-of-Scope ]`
4. **Audit Log:** Inline log of recent moderator decisions with timestamp.

### 8.3 Desktop Wireframe (1140px)
```
+------------------------------------------------------------------------------------+
| [NAV - DARK]  GRIPR [BETA]     Problem Explorer   Report Problem   Missions [Admin]|
+------------------------------------------------------------------------------------+
| ADMIN WORKSPACE · EVIDENCE REVIEW DESK                      [ MODE: DEMO FIXTURES ]|
| Pending Intake: 4   ·   Approved: 24   ·   Flagged Gaps: 2   ·   Active Clusters: 6|
+------------------------------------------------------------------------------------+
| QUEUE (35%)                     | EVALUATION WORKBENCH (65%)                       |
|                                 |                                                  |
| [PENDING-041] 2h ago            | SUBMISSION: PENDING-041                          |
| "Diagnostic lab test rates..."  | Contributor: Pathologist, Tier-2 UP              |
| Category: Healthcare · Hinglish | Consent: [✓ Public Anonymized] [✓ Follow-up OK]  |
| Consent: Dual Granted           |                                                  |
|                                 | VERBATIM SUBMISSION:                             |
| [PENDING-042] 5h ago            | "Reagents expire before small batches can be run.|
| "Cold storage loading delay..." | Distributors enforce 10-pack minimums."          |
| Category: Logistics · Marathi   |                                                  |
| Consent: Public Only            | EXTRACTED INTELLIGENCE:                          |
|                                 | • Actor: Standalone diagnostic lab technician    |
| [PENDING-043] 1d ago            | • Friction: Minimum purchase volume mismatch     |
| "Tutor payment defaults..."     | • Workaround: Pooling orders via informal group  |
| Category: Education · English   | • Unknowns: Frequency of reagent obsolescence   |
|                                 |                                                  |
|                                 | CANDIDATE MATCH CHECK:                           |
|                                 | Potential link to [SIG-017: Diagnostic Labs]     |
|                                 | [ Keep Separate ]      [ Link as Related ]       |
|                                 |                                                  |
|                                 | DECISION ACTIONS:                                |
|                                 | [ Approve & Publish ]  [ Flag Gap ]  [ Reject ]  |
+------------------------------------------------------------------------------------+
```

---

## 9. Comprehensive UX States & Matrix

| Screen | Empty State | Loading Skeleton | Error State | Success Confirmation |
|---|---|---|---|---|
| **Landing** (`index.html`) | Fallback hero with direct submit & mission links. | Subtle shimmer placeholders for rotating signal cards. | Inline toast if newsletter fails to register. | "You're subscribed to the weekly problem digest." |
| **Report Problem** (`submit.html`) | Clean form with rotating prompt cues. | Button shows spinner "Analyzing & Submitting Signal...". | Red highlight on missing fields with specific correction text. | Assigned Signal ID card with review timeline explanation. |
| **Problem Explorer** (`feed.html`) | "No signals match this filter. Try clearing filters or submit a new problem." | 6 skeleton cards with animated gradient shimmer. | "Unable to load signals. Please refresh or check connection." | Live update of filtered signal counts. |
| **Case File** (`case-file.html`) | "Signal ID not found. Return to Explorer." | Skeleton header, quote block, and data grid. | "Error loading case file data." | "Investigation request logged for this problem." |
| **Research Missions** (`missions.html`) | Scoping form ready with default pilot values. | Button spinner "Reviewing Scope & Preparing Brief...". | Required fields highlighted (Company, Problem statement). | Mission Scope Confirmed with SLA and assigned Mission Reference Code. |
| **Admin Review** (`admin.html`) | "All submissions reviewed. Intake queue is clear." | Loading queue items with pulse animation. | Error notice if synthetic fixture action fails. | Toast banner: "Signal approved and dispatched to Explorer." |

---

## 10. Frontend Architecture & Modular Component Strategy

To ensure seamless transition to Phase 2 (Backend + Firestore + Gemini) without rewriting screens:
1. **API Abstraction Layer (`js/api.js`):** Unified service exposing:
   - `api.getSignals(filter, search)`
   - `api.getSignalById(id)`
   - `api.submitSignal(data)`
   - `api.createMission(missionData)`
   - `api.getAdminQueue()`
   - `api.reviewSignal(id, decision)`
2. **Synthetic Fixtures Store (`js/fixtures.js`):** High-fidelity seed data representing firsthand Indian operator problems across 8 sectors, clearly tagged with `#DEMO_SYNTHETIC` metadata and realistic workarounds.
3. **Shared Navigation & UI Utilities (`js/nav.js`):** Standardizes mobile drawer, active link styling, and accessible focus outlines across all HTML documents.
4. **CSS Modular Architecture:** Preserves `css/main.css` and `css/feed.css` while introducing consistent utility classes for responsive grids, badges, modals, and skeletons.
