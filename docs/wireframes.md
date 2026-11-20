# GRIPR.STUDIO — Wireframe Specifications (Corrected B2B Architecture)

**Platform:** GRIPR.STUDIO  
**Version:** 2.0 (Phase 1 Product Correction)  
**Product Principle:** *"Don't start with ideas. Start with reality."*  
**Architecture:** B2B Problem Intelligence & Commissioned Research Missions  
**Target Viewports:** Desktop (1140px container) & Mobile (375px - 430px)

---

## 1. Information Architecture & Navigation

```
[ GLOBAL NAVIGATION - WARM CREAM (HOMEPAGE / MISSIONS / BRIEF) ]
+-----------------------------------------------------------------------------------------+
| [LOGO] GRIPR [BETA]            Product    How It Works    Example Brief    Missions  [Start Mission] |
+-----------------------------------------------------------------------------------------+

[ GLOBAL NAVIGATION - DARK (MISSION WORKSPACE / OPS DESK) ]
+-----------------------------------------------------------------------------------------+
| [LOGO] GRIPR [BETA]            Product    How It Works    Example Brief    Missions  [+ New Mission] |
+-----------------------------------------------------------------------------------------+
```

### Key Navigation Principles:
- Primary buyer: Organizations and product leaders.
- Public navigation focuses on: **Product**, **How It Works**, **Example Research Brief**, and **Research Missions**.
- Retired from public nav: *Submit a Frustration*, *Public Signal Feed*, *Leaderboards*.
- Research participant sessions are invitation-based (`participate.html?invite=...`).
- Research operations are internal-only (`ops.html`).

---

## 2. Screen 1: B2B Editorial Homepage (`index.html`)

### 2.1 Information Hierarchy
1. **Live Header:** "AI-POWERED PROBLEM INTELLIGENCE · FOR PRODUCT ORGANIZATIONS"
2. **Hero Editorial Title:** "Better products begin with better problem understanding."
3. **Hero Positioning:** "GRIPR turns firsthand operational experiences into evidence-backed research that helps organizations make better product decisions."
4. **Primary Actions:**
   - Primary: "Start a Research Mission →" (`missions.html`)
   - Secondary: "Explore an Example Brief" (`brief.html`)
5. **The Failure of Guesswork:** Explaining domain blindness, echo chambers, and premature execution.
6. **The 4-Step Discovery Pipeline:**
   - 01 Define Decision & Scope
   - 02 Recruit Screened Operators
   - 03 Permissioned Qualitative Sessions
   - 04 Evidence Synthesis & Decision Brief
7. **Commercial Mission Offer:** Experimental pilot offer of ₹49,000 for 5 screened participants.
8. **Illustrative Case Preview:** Real-world case study showing how a $180,000 B2C app was reframed into a B2B dealer credit network.
9. **Evidence Governance:** Traceable source quotes, 3-tier consent, contradiction auditing, and zero synthetic engagement.

### 2.2 Desktop Wireframe (1140px)
```
+------------------------------------------------------------------------------------+
| [NAV]  GRIPR [BETA]       Product   How It Works   Example Brief   Missions [Start] |
+------------------------------------------------------------------------------------+
|                                                                                    |
|  [●] AI-POWERED PROBLEM INTELLIGENCE · FOR PRODUCT ORGANIZATIONS                   |
|                                                                                    |
|  Better products begin with                                                        |
|  *better problem understanding.*                                                   |
|                                                                                    |
|  GRIPR turns firsthand operational experiences into evidence-backed research       |
|  that helps organizations make better product decisions.                           |
|                                                                                    |
|  [ Start a Research Mission → ]          [ Explore an Example Brief ]              |
|                                                                                    |
|  ✓ Firsthand operator evidence   ·   ✓ Falsifiable testing   ·   ✓ Traceable briefs |
+------------------------------------------------------------------------------------+
| SECTION: WHY PRODUCT TEAMS FAIL                                                    |
|                                                                                    |
| [ 01 / DOMAIN BLINDNESS ]      [ 02 / ECHO CHAMBERS ]     [ 03 / PREMATURE EXECUTION ]
| Unfamiliar operational         Social forums & surveys    Coding before validating  
| workflows in real sectors.     amplify unverified noise.  the human workaround.     
+------------------------------------------------------------------------------------+
| SECTION: CORE 4-STEP WORKFLOW                                                      |
|                                                                                    |
| [ 01 DEFINE DECISION ] -> [ 02 RECRUIT OPERATORS ] -> [ 03 SESSIONS ] -> [ 04 BRIEF ]
+------------------------------------------------------------------------------------+
| SECTION: ILLUSTRATIVE CASE STUDY (MSN-2026-081)                                    |
| "Rural Fertilizer Spot-Pricing & Procurement Dynamics"                             |
| Outcome: Falsified hypothesis. Replaced planned $180K B2C app with B2B trade network.|
|                                                  [ Inspect Decision Brief → ]      |
+------------------------------------------------------------------------------------+
| SECTION: COMMERCIAL OFFER                                                          |
| Pilot Mission Scope: ₹49,000 · 5 Screened Participants · 10 Business Days          |
|                                                  [ Commission a Mission → ]        |
+------------------------------------------------------------------------------------+
```

---

## 3. Screen 2: Multi-Step Business Scoping Flow (`missions.html`)

### 3.1 Information Hierarchy
- **Step 1: Organization & Lead** (Company Name, Contact Person, Work Email, Role)
- **Step 2: Objective & Falsification** (Decision at stake, Problem/workflow, What company currently believes, Evidence that would falsify it)
- **Step 3: Target Participants** (Operator profile, Industry, Geography, Operational constraints)
- **Step 4: Scope & Review** (Live reactive specification summary, Deliverables checklist, Prototype notice)
- **Confirmation State:** Clean card displaying assigned Mission Reference (`MSN-2026-xxx`) with a direct CTA to open their **Mission Workspace**.

---

## 4. Screen 3: Organization Mission Workspace (`mission-workspace.html`)

### 4.1 Information Hierarchy
1. **Mission Header:** Mission ID (`MSN-2026-081`), Client Organization, Lead Contact, Demo State Switcher.
2. **Lifecycle Stage Tracker:** `Requested` -> `Scoping` -> `Awaiting Agreement` -> `Researching` -> `Evidence Review` -> `Brief Ready` -> `Closed`.
3. **Primary Action:** If `Brief Ready`, direct prominent link to `brief.html?id=...`.
4. **Structured Scope Tiles:** Decision at stake, hypothesis, falsification criteria, cohort profile, deliverables.
5. **Evidence Preview:** Anonymized participant session records (`SES-401`..`SES-405`) showing verbatim quotes and workarounds.
6. **Scope Boundaries:** Disclaimers regarding qualitative sample limits and confidentiality.

---

## 5. Screen 4: Invitation-Based Participant Session (`participate.html`)

### 5.1 Information Hierarchy
1. **Study Overview Banner:** Study title, facilitator, estimated duration (12-15 min), verified honorarium amount (e.g. ₹1,500).
2. **Section 1: Operator Context:** Role, district, operational scale.
3. **Section 2: Firsthand Operational Incident:**
   - Incident narrative (concrete recent breakdown)
   - Interrupted workflow
   - Reported financial/time impact
   - Existing workaround (what you did instead)
4. **Section 3: Granular 3-Tier Consent Controls:**
   - Study analysis consent (mandatory)
   - Sanitized brief quotation permission (optional)
   - Confidential follow-up contact permission (optional)
5. **Confirmation State:** Acknowledgment with session tracking ID (`SES-xxx`) and honorarium verification notes.

---

## 6. Screen 5: Decision Intelligence Brief (`brief.html`)

### 6.1 Information Hierarchy (15 Core Sections)
1. **Research Question**
2. **Decision Under Investigation**
3. **Participant / Sample Context** (Cohort breakdown, geography, methodology)
4. **Key Observations** (Synthesized findings with session citation tags)
5. **Original Source Evidence** (Verbatim quotes in original vernacular + English translation, linked to `SES-401`..`SES-405`)
6. **Affected Operational Workflows** (Step-by-step friction breakdown)
7. **Reported Impact** (Quantified costs, delays, margin haircut)
8. **Existing Workarounds** (What operators do today)
9. **Recurring Patterns, when supported**
10. **Contradictory Evidence** (Where participant experiences diverged)
11. **Missing Information & Research Gaps**
12. **Research Limitations** (Sample size, geographical limits)
13. **AI-Assisted Interpretation** (Gemini-assisted synthesis, strictly tagged as analytical interpretation, not raw fact)
14. **Suggested Next Research Actions**
15. **Decision Options & Recommendation:**
    - `REJECT / REFRAME HYPOTHESIS` (Highlighted executive banner)
    - Specific recommended pivot direction and next action steps.

---

## 7. Screen 6: Research Operations Desk (`ops.html`)

### 7.1 Information Hierarchy
1. **Header:** `RESEARCH OPERATIONS DESK · DEMO SYNTHETIC FIXTURES`.
2. **Operational Metrics:** Active Missions, Tasks Pending Moderation, Screened Participants, Briefs Ready.
3. **Split Workbench:**
   - Left: Operations Queue (Scope reviews, screening candidates, session verifications).
   - Right: Evaluation panel displaying mission hypothesis, participant statements, AI extractions, and decision buttons (`Approve for Brief`, `Flag Missing Evidence`, `Open Workspace`).
4. **Reset Button:** Re-initializes synthetic fixtures for repeatable testing.
