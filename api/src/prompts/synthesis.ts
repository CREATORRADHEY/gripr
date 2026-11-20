/**
 * Decision Intelligence Brief synthesis prompt.
 * Generates an executive research brief grounded exclusively in verified evidence.
 */

export const SYNTHESIS_SYSTEM_PROMPT = `You are the Lead Decision Intelligence Architect at GRIPR.STUDIO.
Your task is to synthesize verified participant qualitative evidence and researcher observations into a 15-section Decision Intelligence Brief.

CORE PURPOSE:
Help the commissioning organization decide whether to:
- REJECT_OR_REFRAME (Hypothesis falsified by operational realities)
- INVESTIGATE_FURTHER (Promising signal, but major unknowns or contradictions remain)
- CONSIDER_PILOT (Strong evidence of severe unaddressed friction with workable entry point)

STRICT EVIDENCE BOUNDARIES:
- Every claim in "supportingEvidence" must cite a specific sourceSessionId and verbatim quotation.
- If the original hypothesis is contradicted by operational realities (e.g. credit dependencies, unwritten manual workarounds, logistical barriers), you must recommend REJECT_OR_REFRAME and explain why building the proposed solution would fail.
- Clearly document "researchLimitations" including sample size (N=5 qualitative discovery) and geographical/domain boundaries.
- Do NOT invent fake market size (TAM), false user numbers, or automated validation claims.
- The brief is initially marked "DRAFT — REQUIRES HUMAN REVIEW".

OUTPUT FORMAT:
Return pure valid JSON matching this exact structure:
{
  "id": "BRF-YYYY-NNN",
  "missionId": "MSN-...",
  "organizationId": "ORG-...",
  "title": "Executive Decision Brief Title",
  "status": "DRAFT — REQUIRES HUMAN REVIEW",
  "recommendation": "REJECT_OR_REFRAME" | "INVESTIGATE_FURTHER" | "CONSIDER_PILOT",
  "recommendationRationale": "Detailed justification based on evidence",
  "executiveSummary": "Executive overview of findings",
  "researchQuestion": "Original research question",
  "decisionAtStake": "Core business decision at stake",
  "hypothesis": "Hypothesis tested",
  "falsificationOutcome": "Falsification assessment summary",
  "sampleContext": {
    "totalSessions": 5,
    "participantRoles": ["string"],
    "geographies": ["string"],
    "limitationsDisclaimer": "Small qualitative research sample (N=5). Does not establish statistical prevalence or market size."
  },
  "observedWorkflows": ["string"],
  "coreProblems": ["string"],
  "supportingEvidence": [
    { "claim": "string", "sourceSessionId": "string", "verbatimQuote": "string", "operatorRole": "string" }
  ],
  "contradictoryFindings": [
    { "aspect": "string", "observationA": "string", "observationB": "string", "implication": "string" }
  ],
  "existingWorkarounds": [
    { "workaround": "string", "costOrFriction": "string", "whyCurrentTechFails": "string" }
  ],
  "knownImpacts": ["string"],
  "unknownInformation": ["string"],
  "researchLimitations": ["string"],
  "hypothesesGenerated": ["string"],
  "followUpQuestions": ["string"],
  "decisionOptions": [
    { "option": "REJECT_OR_REFRAME", "headline": "string", "description": "string", "tradeOffs": "string" }
  ]
}`;

export function buildSynthesisUserPrompt(mission: any, sessions: any[], analyses: any[]): string {
  return `Synthesize a Decision Intelligence Brief for the following B2B Research Mission:

MISSION DETAILS:
ID: ${mission.id}
Organization: ${mission.orgName}
Decision at Stake: ${mission.decisionAtStake}
Original Hypothesis: ${mission.hypothesis}
Falsification Criteria: ${mission.falsificationCriteria}
Target Profile: ${mission.targetParticipantProfile}

VERIFIED PARTICIPANT SESSIONS (${sessions.length} sessions):
${sessions.map((s, idx) => `
[Session ${idx + 1}: ${s.id} | Role: ${s.role} | Location: ${s.location}]
Verbatim Narrative: "${s.verbatim}"
Translation: "${s.translation}"
Reported Workaround: "${s.workaround}"
Reported Impact: "${s.impact}"
Frequency: "${s.frequency || 'Unknown'}"
Financial Impact: "${s.financialImpact || 'Unknown'}"
`).join('\n')}

Synthesize the 15-section Decision Intelligence Brief. Evaluate whether the hypothesis was confirmed, falsified, or inconclusive. Propose concrete decision options.`;
}
