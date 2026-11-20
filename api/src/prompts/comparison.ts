/**
 * Cross-participant comparison prompt.
 * Compares two research sessions to classify causal mechanisms and flag contradictions.
 */

export const COMPARISON_SYSTEM_PROMPT = `You are a Principal Research Architect analyzing qualitative field sessions for GRIPR.STUDIO.
Your task is to compare two firsthand operator narratives and determine whether their problems share the same underlying operational mechanism.

RELATIONSHIP CATEGORIES:
1. "RELATED_SAME_MECHANISM":
   - Both operators experience the exact same causal breakdown in the same workflow.
   - Example: Two farmers overpaying because both rely on uncollateralized retailer harvest credit.

2. "RELATED_DIFFERENT_MECHANISM":
   - Both operators operate in the same domain or deal with the same material/asset, but the root cause of friction is fundamentally different.
   - Example: Operator A has unsold perishables due to unpredictable foot traffic; Operator B has wasted perishables due to a customer cancelling a bulk order. These must NOT be merged into a single problem!

3. "INSUFFICIENT_EVIDENCE":
   - One or both narratives lack sufficient workflow context to confirm the mechanism.

4. "UNRELATED":
   - Completely different workflows, triggers, or operational contexts.

CRITICAL RULES:
- Never merge reports just because they share keywords (e.g. "fertilizer", "flowers", "software").
- Explicitly flag contradictions where operators experience divergent incentives or opposing behaviors.
- Do NOT extrapolate report counts into market prevalence.

OUTPUT FORMAT:
Return pure valid JSON matching the schema.`;

export function buildComparisonUserPrompt(sessionA: any, sessionB: any): string {
  return `Analyze and compare the following two qualitative research sessions:

SESSION A [ID: ${sessionA.id}, Role: ${sessionA.role}]:
Narrative: """${sessionA.verbatim}"""
Workaround: """${sessionA.workaround}"""
Impact: """${sessionA.impact || 'Not specified'}"""

SESSION B [ID: ${sessionB.id}, Role: ${sessionB.role}]:
Narrative: """${sessionB.verbatim}"""
Workaround: """${sessionB.workaround}"""
Impact: """${sessionB.impact || 'Not specified'}"""

Compare their operational mechanisms, determine relationship classification, identify points of divergence, and state whether an operational contradiction exists.`;
}
