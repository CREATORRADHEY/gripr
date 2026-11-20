import { z } from 'zod';

export const ConsentSchema = z.object({
  participantRef: z.string().min(1, 'Participant reference required'),
  studyProcessing: z.boolean().refine(v => v === true, 'Study data processing consent is required.'),
  sanitizedBriefSharing: z.boolean().default(false),
  followUpInterview: z.boolean().default(false),
  futurePilotParticipation: z.boolean().default(false),
  consentVersion: z.string().default('2026.1'),
  timestamp: z.string().default(() => new Date().toISOString()),
  purpose: z.string().default('B2B qualitative problem intelligence research'),
  ipHash: z.string().optional()
});

export type ConsentRecord = z.infer<typeof ConsentSchema> & { id: string };
