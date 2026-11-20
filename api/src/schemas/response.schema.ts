import { z } from 'zod';

export const SubmitResearchResponseSchema = z.object({
  incidentNarrative: z.string().trim().min(20, 'Please provide details of your recent experience (minimum 20 characters).'),
  affectedWorkflow: z.string().trim().optional().default('Operational procurement workflow'),
  triggeringEvent: z.string().trim().optional().default('Firsthand incident reported during study session'),
  operationalImpact: z.string().trim().optional().default('Unquantified operational friction'),
  existingWorkaround: z.string().trim().min(5, 'Please describe what workaround you used instead.'),
  frequency: z.string().trim().nullable().optional(),
  financialImpact: z.string().trim().nullable().optional(),
  role: z.string().trim().optional().default('Screened Operator'),
  location: z.string().trim().optional().default('India (Regional)'),
  language: z.string().trim().optional().default('Hinglish / Vernacular'),
  // STRICT REQUIREMENT: mandatory processing consent
  consentStudyProcessing: z.literal(true, {
    errorMap: () => ({ message: 'Research study processing consent is required to participate.' })
  }),
  // SEPARATE OPTIONAL CONSENTS:
  consentSanitizedBriefSharing: z.boolean().optional().default(false),
  consentFollowUpInterview: z.boolean().optional().default(false),
  contactEmail: z.string().trim().email().nullable().optional()
});

export type SubmitResearchResponseInput = z.infer<typeof SubmitResearchResponseSchema>;

export const ResearchSessionSchema = z.object({
  id: z.string(),
  missionId: z.string(),
  invitationToken: z.string().optional(),
  participantPseudonym: z.string(),
  role: z.string(),
  location: z.string(),
  language: z.string(),
  sessionDate: z.string(),
  verbatim: z.string(),
  translation: z.string(),
  workflow: z.string(),
  trigger: z.string(),
  impact: z.string(),
  workaround: z.string(),
  frequency: z.string().nullable().optional(),
  financialImpact: z.string().nullable().optional(),
  sourceHash: z.string(),
  divergenceNotes: z.string().optional(),
  consent: z.object({
    studyProcessing: z.boolean(),
    sanitizedBriefSharing: z.boolean(),
    followUpInterview: z.boolean(),
    contactEmail: z.string().nullable().optional()
  }),
  createdAt: z.string()
});

export type ResearchSession = z.infer<typeof ResearchSessionSchema>;

export const ResearchInvitationSchema = z.object({
  token: z.string(),
  missionId: z.string(),
  studyTitle: z.string(),
  studyDescription: z.string(),
  targetRole: z.string(),
  permittedQuestions: z.array(z.string()),
  honorarium: z.string().default('₹1,500 direct bank transfer upon session completion'),
  expiresAt: z.string(),
  status: z.enum(['active', 'completed', 'expired']).default('active'),
  createdAt: z.string()
});

export type ResearchInvitation = z.infer<typeof ResearchInvitationSchema>;
