# GRIPR.STUDIO — Product Architecture (Corrected B2B Model)

**Platform:** GRIPR.STUDIO  
**Version:** 2.0 (Phase 1 Correction)  
**Product Category:** AI-Powered Problem Intelligence Platform  
**Primary Commercial Offer:** GRIPR Research Missions  
**Core Product Principle:** *"Don't start with ideas. Start with reality."*

---

## 1. Executive Summary & Paradigm Shift

The initial legacy concept of GRIPR as a public consumer complaint board, crowdsourced idea feed, or upvoted problem leaderboard has been **completely retired**. 

GRIPR.STUDIO is a **B2B Problem Intelligence Platform**. Its core value proposition is enabling product teams, startup founders, and research organizations to make confident, evidence-grounded decisions before committing engineering and capital to product development.

### The Problem GRIPR Solves
Product teams entering unfamiliar sectors (especially in India's ground economy, non-English workflows, and fragmented B2B supply chains) face severe **domain blindness**. They rely on:
1. Internal assumptions and guesses
2. Surface-level social media listening (Twitter/Reddit)
3. Generalized quantitative surveys that fail to uncover actual operational workarounds

This leads to building products that fail upon contact with real operators.

### The Solution: GRIPR Research Missions
Organizations commission targeted, fixed-scope research investigations. GRIPR:
- Scopes the critical business decision at stake and defines falsification criteria.
- Recruits and screens authentic, permissioned field operators (not professional survey-takers).
- Conducts structured, confidential research sessions capturing incidents, impacts, and workarounds.
- Leverages Gemini-assisted intelligence to extract structured facts, isolate contradictions, and flag missing information.
- Delivers a comprehensive **Decision Intelligence Brief** that helps leaders decide whether to:
  - **Reject / Reframe** the hypothesis
  - **Investigate More** with a subsequent cohort
  - **Proceed to a Pilot** with defined constraints

---

## 2. Core Entities & Data Architecture

```
[ Organization ]
       |
       v (Requests)
[ Research Mission (MSN-XXX) ]
       |
       +---> [ Scope & Falsification Criteria ]
       |
       +---> [ Invitation Tokens (INV-XXX) ]
                   |
                   v (Issued to)
             [ Research Participant (Screened Field Operator) ]
                   |
                   v (Submits)
             [ Firsthand Research Session ]
                   |
                   v (Structured & Moderated)
             [ Evidence Records & Contradictions ]
                   |
                   v (Synthesized into)
             [ Decision Intelligence Brief ]
                   |
                   v (Guides)
             [ Strategic Decision: Reject | Investigate | Pilot ]
```

### Entity Specifications

1. **Research Mission (`Mission`):**
   - `id`: Unique identifier (e.g., `MSN-2026-081`)
   - `orgName`: Client organization name
   - `contactEmail`: Lead contact work email
   - `decisionAtStake`: The specific product or go-to-market fork under evaluation
   - `hypothesis`: What the organization currently believes
   - `falsificationCriteria`: What evidence would prove the hypothesis wrong
   - `targetParticipantProfile`: Detailed operational persona, industry, geography
   - `status`: Lifecycle stage (`Requested` -> `Scoping` -> `Awaiting Agreement` -> `Researching` -> `Evidence Review` -> `Brief Ready` -> `Closed`)
   - `pricing`: Explicitly labelled experimental pilot pricing (e.g., ₹49,000 pilot scope)

2. **Research Session (`ParticipantSession`):**
   - `id`: Session identifier (e.g., `SES-401`)
   - `invitationToken`: Linked mission invitation token
   - `participantContext`: Operator role, district/region, business scale
   - `incidentNarrative`: Verbatim account of recent operational failure
   - `affectedWorkflow`: The operational process that broke down
   - `reportedFrequency`: How often the issue occurs in practice
   - `operationalImpact`: Quantified time loss, financial haircut, spoilage, or compliance hazard
   - `existingWorkaround`: Concrete fallback methods currently used
   - `consentFlags`:
     - `studyProcessing`: Required consent to analyze data for this mission
     - `sanitizedBriefSharing`: Optional consent to include anonymized quote in brief
     - `followUpInterview`: Optional consent for second-stage confidential contact

3. **Decision Intelligence Brief (`DecisionBrief`):**
   - `missionId`: Linked mission reference
   - `researchQuestion`: Clear framing of the core inquiry
   - `keyObservations`: Synthesized operational findings
   - `evidenceMatrix`: Structured observations across participants
   - `contradictoryEvidence`: Explicit documentation of where operator experiences diverged
   - `unknownsAndGaps`: Variables not yet proven by the sample
   - `limitations`: Sample size, geographic boundaries, observer bias warnings
   - `aiInterpretation`: Gemini-assisted pattern synthesis, visibly tagged as interpretation (not raw fact)
   - `recommendedDecision`: `Reject / Reframe`, `Investigate More`, or `Consider Pilot` with actionable criteria

---

## 3. User Journeys

### Journey 1: The B2B Organization (Buyer)
1. **Discover:** Lands on `index.html`. Learns how evidence-first problem research de-risks product decisions.
2. **Explore:** Views an interactive illustrative deliverable (`brief.html?id=MSN-2026-081`) to inspect the rigor of a Decision Intelligence Brief.
3. **Scope:** Navigates to `missions.html`. Fills out the multi-step business scoping questionnaire defining the decision, hypothesis, falsification conditions, and target operators.
4. **Track:** Reviews their mission workspace (`mission-workspace.html?id=...`) to monitor research stages, participant screening, and brief delivery.
5. **Decide:** Accesses the completed Decision Intelligence Brief to decide whether to kill the concept, interview further, or launch a pilot.

### Journey 2: The Invited Research Participant (Field Operator)
1. **Receive:** Receives a direct research invitation link (`participate.html?invite=INV-AGRI-081`).
2. **Contextualize:** Views study details, who is running it, estimated completion time, and honorarium terms.
3. **Report:** Answers structured prompts on recent breakdowns, operational costs, and workarounds.
4. **Consent:** Configures separate permissions for study analysis, brief quote publication, and future follow-up.
5. **Confirm:** Receives an invitation receipt acknowledging their domain contribution.

### Journey 3: The Internal Research Operations Desk
1. **Intake:** Reviews incoming scoping requests in `ops.html`.
2. **Evaluate:** Screens participant submissions against the mission's falsification criteria.
3. **Synthesize:** Reviews AI extractions, flags contradictions and research gaps.
4. **Publish:** Approves the finalized Decision Intelligence Brief for client organization review.

---

## 4. Unvalidated Business Hypotheses & Safeguards

- **Revenue Model:** The ₹49,000 fixed-price pilot for 5 participants is an **initial experimental hypothesis**, not proven traction. The platform transparently discloses this as pilot scope.
- **Delivery SLAs:** No automated 24-hour delivery or guaranteed recruitment SLAs are promised as operational facts.
- **Traceability:** AI interpretation is strictly separated from firsthand quotes. Quotes retain traceability to synthetic participant fixture IDs.
