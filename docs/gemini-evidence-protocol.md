# GRIPR.STUDIO — Gemini Evidence Extraction & Verification Protocol

## 1. Core Operating Principle
> **"Don't start with ideas. Start with reality."**  
> Qualitative problem discovery requires unwavering truthfulness. Model speculation or statistical extrapolation must never be masqueraded as empirical user evidence.

---

## 2. Model Selection & Integration

- **SDK:** Official Google Gen AI SDK (`@google/genai` v3.6.1).
- **Production Model:** `gemini-3.5-flash-lite` (configurable via `GEMINI_MODEL` environment variable).
- **Output Mode:** Native Structured JSON generation configured with strict Zod schema validation.
- **Fail-Closed Resilience:** Exponential backoff retry logic (3 attempts with 1s, 2s, 4s delays for transient 429/503 errors).
- **Zero Mock Degradation in Live Mode:** When live inference is requested on `/api/demo/live-gemini-analysis`, mock fallback is prohibited (`forceLive: true, allowMockFallback: false`). If the Gemini API is unreachable, the system fails closed with HTTP 502/503. Mock outputs are never labeled as `LIVE_GEMINI`.

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

In `api/src/services/evidence.service.ts`, Gemini output is subjected to deterministic algorithmic verification before saving or rendering:

1. **Verbatim Substring Audit:**
   The validator normalizes whitespace and searches for every quote in `supportingQuotations` and individual fact `sourceQuote` fields inside the raw participant narrative. If any quote does not exist verbatim, the validation flags the analysis with `Quotation mismatch`.
2. **Financial Hallucination Guard:**
   If `financialImpact` is marked `REPORTED`, the source text is checked for explicit currency symbols (`₹`, `Rs`, `INR`, `Rupees`) or cost indicators. If absent, the claim is rejected as an invalid hallucination.
3. **Frequency Hallucination Guard:**
   If `frequency` is marked `REPORTED`, the source text must contain explicit cadence indicators (e.g. `daily`, `weekly`, `seasonal`, `twice a year`).
4. **Immutable Provenance:**
   Every participant narrative is hashed with SHA-256 upon intake. The extraction record references this exact `sourceHash`.

---

## 6. Canonical Synthetic Demonstration Packets

For public evaluations, demonstrations, and hackathon judging, the platform provides 5 canonical synthetic demonstration packets (`PKT-401` to `PKT-405`) covering neighborhood kirana store operators in Jaipur, Rajasthan:

- **`PKT-401` (Ramesh Kumar):** Kirana store owner for 18 years in Raja Park; weekly customer udhaar tracking in physical notebook.
- **`PKT-402` (Sita Devi Sharma):** Provision store owner in Malviya Nagar; customer credit verification with SMS banking delays.
- **`PKT-403` (Abdul Kareem):** Grain & pulse merchant in Sanganer; seasonal credit settlement during agricultural harvest.
- **`PKT-404` (Vikram Singh Shekhawat):** Milk & grocery booth in Mansarovar; domestic errand runners and carbon-copy paper slips.
- **`PKT-405` (Mukesh Choudhary):** Corner general store owner in Vaishali Nagar; digital khata app uninstalled due to customer cash flow liquidity mismatch.
