import { z } from 'zod';

export const MissionStatusSchema = z.enum([
  'Requested',
  'Scoping Alignment',
  'Recruiting',
  'Fieldwork Active',
  'Synthesis',
  'Brief Ready',
  'Closed'
]);

export type MissionStatus = z.infer<typeof MissionStatusSchema>;

export const CreateMissionSchema = z.object({
  orgName: z.string().trim().min(2, 'Organization / Company name is required.'),
  contactPerson: z.string().trim().min(2, 'Contact person name is required.'),
  contactEmail: z.string().trim().email('A valid business email address is required.'),
  role: z.string().trim().optional().default('Product Lead'),
  sector: z.string().trim().optional().default('general'),
  decisionAtStake: z.string().trim().min(20, 'Please describe the decision at stake in at least 20 characters.'),
  hypothesis: z.string().trim().optional().default('Preliminary hypothesis under evaluation'),
  falsificationCriteria: z.string().trim().optional().default('To be refined during scoping alignment'),
  problemToInvestigate: z.string().trim().min(20, 'Please describe the problem or workflow to investigate in at least 20 characters.'),
  targetParticipantProfile: z.string().trim().min(5, 'Target operator or participant profile is required.'),
  industry: z.string().trim().optional().default('B2B Workflow'),
  geography: z.string().trim().optional().default('India (Regional clusters)'),
  urgency: z.string().trim().optional().default('Standard (4-6 weeks)'),
  constraints: z.string().trim().optional().default('None specified'),
  deliverables: z.array(z.string()).optional().default(['Decision Intelligence Brief', 'Workflow Friction Map']),
  consentPrivacy: z.literal(true, {
    errorMap: () => ({ message: 'Contact & research privacy consent is required.' })
  })
});

export type CreateMissionInput = z.infer<typeof CreateMissionSchema>;

export const MissionSchema = z.object({
  id: z.string(),
  orgName: z.string(),
  contactPerson: z.string(),
  contactEmail: z.string(),
  role: z.string(),
  sector: z.string(),
  decisionAtStake: z.string(),
  hypothesis: z.string(),
  falsificationCriteria: z.string(),
  problemToInvestigate: z.string(),
  targetParticipantProfile: z.string(),
  industry: z.string(),
  geography: z.string(),
  urgency: z.string(),
  constraints: z.string(),
  deliverables: z.array(z.string()),
  status: MissionStatusSchema,
  pricing: z.string().default('₹49,000 (Experimental Pilot Scope)'),
  pricingDisclaimer: z.string().default('Experimental pilot pricing. Unvalidated research model.'),
  participantTargetCount: z.number().default(5),
  completedSessionCount: z.number().default(0),
  createdAt: z.string(),
  updatedAt: z.string().optional()
});

export type Mission = z.infer<typeof MissionSchema>;
