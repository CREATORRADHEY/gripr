import { z } from 'zod';

export const FactCategorySchema = z.enum(['REPORTED', 'INFERRED', 'UNKNOWN']);
export type FactCategory = z.infer<typeof FactCategorySchema>;

export const EvidenceFactSchema = z.object({
  content: z.string().describe('The extracted or inferred fact summary'),
  category: FactCategorySchema.describe('REPORTED: directly stated by participant. INFERRED: AI interpretation. UNKNOWN: not provided.'),
  sourceQuote: z.string().nullable().describe('Exact verbatim quotation from original participant narrative supporting this fact. Must be null if UNKNOWN or INFERRED.'),
  confidenceNotes: z.string().optional().describe('Researcher notes explaining interpretation or flagging ambiguity')
});

export type EvidenceFact = z.infer<typeof EvidenceFactSchema>;

export const GeminiExtractionSchema = z.object({
  affectedParticipant: EvidenceFactSchema,
  industryOrDomain: EvidenceFactSchema,
  operationalWorkflow: EvidenceFactSchema,
  reportedProblem: EvidenceFactSchema,
  triggeringEvent: EvidenceFactSchema,
  consequencesReported: z.array(EvidenceFactSchema),
  frequency: EvidenceFactSchema.describe('Explicit frequency if stated by participant, otherwise category must be UNKNOWN and content null/unknown'),
  financialImpact: EvidenceFactSchema.describe('Explicit financial loss if stated by participant, otherwise category must be UNKNOWN and content null/unknown'),
  currentWorkaround: EvidenceFactSchema,
  contextualConstraints: z.array(EvidenceFactSchema),
  missingInformation: z.array(z.string()).describe('List of critical gaps in the narrative needed for complete problem understanding'),
  potentialResearchQuestions: z.array(z.string()).describe('Follow-up questions to clarify in next research session'),
  supportingQuotations: z.array(z.string()).describe('Exact substrings from the participant text cited in the facts'),
  alternativeInterpretations: z.array(z.string()).describe('Plausible alternative explanations for the reported behavior')
});

export type GeminiExtraction = z.infer<typeof GeminiExtractionSchema>;

export const AnalysisStatusSchema = z.enum([
  'pending_analysis',
  'analysis_in_progress',
  'analysis_failed',
  'awaiting_review',
  'reviewed',
  'flagged',
  'rejected'
]);

export type AnalysisStatus = z.infer<typeof AnalysisStatusSchema>;

export const ValidatedAnalysisSchema = z.object({
  id: z.string(),
  sessionId: z.string(),
  missionId: z.string(),
  sourceHash: z.string(),
  modelUsed: z.string(),
  promptVersion: z.string(),
  timestamp: z.string(),
  status: AnalysisStatusSchema,
  validationOutcome: z.object({
    valid: z.boolean(),
    quotationVerificationErrors: z.array(z.string()),
    missingFields: z.array(z.string()),
    flags: z.array(z.string())
  }),
  extraction: GeminiExtractionSchema,
  reviewerNotes: z.string().optional(),
  reviewedAt: z.string().optional(),
  reviewedBy: z.string().optional()
});

export type ValidatedAnalysis = z.infer<typeof ValidatedAnalysisSchema>;
