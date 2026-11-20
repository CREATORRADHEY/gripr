import { z } from 'zod';

export const RelationshipTypeSchema = z.enum([
  'RELATED_SAME_MECHANISM',
  'RELATED_DIFFERENT_MECHANISM',
  'INSUFFICIENT_EVIDENCE',
  'UNRELATED'
]);

export type RelationshipType = z.infer<typeof RelationshipTypeSchema>;

export const CrossParticipantComparisonSchema = z.object({
  sessionIds: z.tuple([z.string(), z.string()]),
  relationship: RelationshipTypeSchema,
  sharedWorkflow: z.boolean(),
  sharedImpact: z.boolean(),
  mechanismComparison: z.string().describe('Detailed explanation of why the causal mechanisms are the same, different, or unrelated'),
  divergencePoints: z.array(z.string()),
  contradictionDetected: z.boolean(),
  contradictionDetails: z.string().optional(),
  similarityScore: z.number().min(0).max(1)
});

export type CrossParticipantComparison = z.infer<typeof CrossParticipantComparisonSchema>;

export const MissionSynthesisSchema = z.object({
  missionId: z.string(),
  comparisons: z.array(CrossParticipantComparisonSchema),
  observedClusters: z.array(z.object({
    clusterName: z.string(),
    mechanism: z.string(),
    sessionIds: z.array(z.string()),
    isRepresentative: z.literal(false).describe('Always false: small qualitative sample cannot claim statistical market representativeness')
  })),
  identifiedContradictions: z.array(z.object({
    issue: z.string(),
    sessionA: z.string(),
    sessionB: z.string(),
    summary: z.string()
  }))
});

export type MissionSynthesis = z.infer<typeof MissionSynthesisSchema>;
