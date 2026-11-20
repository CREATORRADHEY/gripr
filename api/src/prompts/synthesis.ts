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
Return pure valid JSON strictly matching the schema.`;

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
