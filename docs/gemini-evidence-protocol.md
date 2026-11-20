# GRIPR.STUDIO — Gemini Evidence Extraction & Verification Protocol

## 1. Core Operating Principle
> **"Don't start with ideas. Start with reality."**  
> Qualitative problem discovery requires unwavering truthfulness. Model speculation or statistical extrapolation must never be masqueraded as empirical user evidence.

---

## 2. Model Selection & Integration

- **SDK:** Official Google Gen AI SDK (`@google/genai` v3.6.1).
- **Default Production Model:** `gemini-2.5-flash` (configurable via `GEMINI_MODEL` environment variable).
- **Output Mode:** Native Structured JSON generation configured with Zod schema parity.
- **Resilience:** Exponential backoff retry logic (3 attempts with 1s, 2s, 4s delays for transient 429/503 errors) and a 15-second execution timeout.

---

## 3. Strict Evidence Triad: REPORTED vs INFERRED vs UNKNOWN

Every piece of information parsed by Gemini must belong to one of three non-negotiable categories:

| Category | Definition | Verbatim Quote Requirement | Example |
|---|---|---|---|
| **`REPORTED`** | Directly and unambiguously stated by the operator in their narrative. | **Mandatory.** Must match an exact substring of the original participant narrative. | *"Dukan wale Sharma ji se udhaar milta hai fasal katne tak."* |
| **`INFERRED`** | AI interpretation, hypothesis, or possible explanation derived from context. | Must NOT cite a quote. `sourceQuote: null`. | *"Informal credit lock-in prevents price shopping."* |
| **`UNKNOWN`** | Absent, omitted, or unquantified information. | Must NOT be estimated. Content must be `"Not stated"` with `sourceQuote: null`. | Frequency or financial loss when not explicitly stated. |

---

## 4. The 14 Extracted Dimensions

1. **Affected Participant / Actor:** Role and operational profile.
2. **Relevant Industry or Domain:** Sector context.
3. **Operational Workflow:** The exact workflow being executed (e.g. seasonal bulk procurement).
4. **Reported Problem or Incident:** The core breakdown or friction encountered.
5. **Triggering Event:** What precipitated the failure (e.g. 48-hour planting window).
6. **Consequences Explicitly Reported:** Direct operational fallout.
7. **Frequency:** Explicit frequency if stated; otherwise marked strictly `UNKNOWN`.
8. **Financial Impact:** Explicit monetary loss or cost overhead if stated; otherwise marked strictly `UNKNOWN`.
9. **Current Workaround:** Existing manual process, makeshift tool, or informal habit.
10. **Contextual Constraints:** Physical, trust, credit, or regulatory boundaries.
11. **Missing Information:** Critical unknowns that require follow-up research.
12. **Potential Research Questions:** Falsification angles for the next interview.
13. **Original Supporting Quotations:** Exact verbatim substrings supporting the claims.
14. **Possible Alternative Interpretations:** Counter-explanations for observed behaviors.

---

## 5. Deterministic Verification Layer

In `api/src/services/evidence.service.ts`, Gemini output is subjected to deterministic algorithmic verification before saving:

1. **Verbatim Substring Audit:**
   The validator normalizes whitespace and searches for every quote in `supportingQuotations` and individual fact `sourceQuote` fields inside the raw participant narrative. If any quote does not exist verbatim, the validation fails and flags the analysis with `Quotation mismatch`.
2. **Financial Hallucination Guard:**
   If `financialImpact` is marked `REPORTED`, the source text is checked for explicit currency symbols (`₹`, `Rs`, `INR`, `Rupees`) or cost indicators. If absent, the claim is rejected as an invalid hallucination.
3. **Frequency Hallucination Guard:**
   If `frequency` is marked `REPORTED`, the source text must contain explicit cadence indicators (e.g. `daily`, `weekly`, `seasonal`, `twice a year`).
4. **Immutable Provenance:**
   Every participant narrative is hashed with SHA-256 upon intake. The extraction record references this exact `sourceHash`.

---

## 6. Cross-Participant Causal Matching

When comparing multiple participant sessions within a mission:

- **`RELATED_SAME_MECHANISM`:** Both operators experience the exact same causal breakdown in the same workflow.
- **`RELATED_DIFFERENT_MECHANISM`:** Same industry, but root causes diverge (e.g. inventory lost to foot-traffic weather fluctuations vs client contract cancellation). **Never automatically merged!**
- **`INSUFFICIENT_EVIDENCE`:** Information gaps prevent robust comparison.
- **`UNRELATED`:** Different workflows and operational contexts.

### Anti-Representativeness Rule
Every synthesized cluster enforces `isRepresentative: false` to ensure small qualitative discovery cohorts (N=5) are never portrayed as statistically representative market prevalence.

---

## 7. Decision Intelligence Brief Generation

Briefs conclude with an executive recommendation:
1. **`REJECT_OR_REFRAME`:** The operational realities (credit lock-in, unwritten workarounds, return logistics) falsified the commercial hypothesis.
2. **`INVESTIGATE_FURTHER`:** Signal exists, but critical contradictions or unknown regulatory barriers require investigation.
3. **`CONSIDER_PILOT`:** Unambiguous severe pain with viable entry point identified.

Every newly generated brief is stamped:
`DRAFT — REQUIRES HUMAN REVIEW`
Client release requires explicit researcher sign-off recorded in the audit trail.
