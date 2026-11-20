import { z } from 'zod';

export const DecisionRecommendationSchema = z.enum([
  'REJECT_OR_REFRAME',
  'INVESTIGATE_FURTHER',
  'CONSIDER_PILOT'
]);

export type DecisionRecommendation = z.infer<typeof DecisionRecommendationSchema>;

export const BriefStatusSchema = z.enum([
  'DRAFT — REQUIRES HUMAN REVIEW',
  'APPROVED'
]);

export type BriefStatus = z.infer<typeof BriefStatusSchema>;

export const DecisionBriefSchema = z.object({
  id: z.string(),
  missionId: z.string(),
  organizationId: z.string().default('ORG-DEFAULT'),
  title: z.string(),
  status: BriefStatusSchema.default('DRAFT — REQUIRES HUMAN REVIEW'),
  recommendation: DecisionRecommendationSchema,
  recommendationRationale: z.string(),
  executiveSummary: z.string(),
  researchQuestion: z.string(),
  decisionAtStake: z.string(),
  hypothesis: z.string(),
  falsificationOutcome: z.string(),
  sampleContext: z.object({
    totalSessions: z.number(),
    participantRoles: z.array(z.string()),
    geographies: z.array(z.string()),
    limitationsDisclaimer: z.string().default('Small qualitative research sample (N=5). Does not establish statistical prevalence or market size.')
  }),
  observedWorkflows: z.array(z.string()),
  coreProblems: z.array(z.string()),
  supportingEvidence: z.array(z.object({
    claim: z.string(),
    sourceSessionId: z.string(),
    verbatimQuote: z.string(),
    operatorRole: z.string()
  })),
  contradictoryFindings: z.array(z.object({
    aspect: z.string(),
    observationA: z.string(),
    observationB: z.string(),
    implication: z.string()
  })),
  existingWorkarounds: z.array(z.object({
    workaround: z.string(),
    costOrFriction: z.string(),
    whyCurrentTechFails: z.string()
  })),
  knownImpacts: z.array(z.string()),
  unknownInformation: z.array(z.string()),
  researchLimitations: z.array(z.string()),
  hypothesesGenerated: z.array(z.string()),
  followUpQuestions: z.array(z.string()),
  decisionOptions: z.array(z.object({
    option: DecisionRecommendationSchema,
    headline: z.string(),
    description: z.string(),
    tradeOffs: z.string()
  })),
  createdAt: z.string().default(() => new Date().toISOString()),
  approvedAt: z.string().nullable().optional(),
  approvedBy: z.string().nullable().optional()
});

export type DecisionBrief = z.infer<typeof DecisionBriefSchema>;
