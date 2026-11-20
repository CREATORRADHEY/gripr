import { z } from 'zod';

export const MissionInquiryStatusSchema = z.enum([
  'REQUESTED',
  'AWAITING_SCOPE_REVIEW',
  'SCOPING_ALIGNED',
  'CONVERTED_TO_MISSION',
  'REJECTED'
]);

export type MissionInquiryStatus = z.infer<typeof MissionInquiryStatusSchema>;

export const CreateMissionInquirySchema = z.object({
  orgName: z.string().trim().min(2, 'Organization name must be at least 2 characters.').max(120),
  contactPerson: z.string().trim().min(2, 'Contact person name is required.').max(80),
  contactEmail: z.string().trim().email('Valid organizational contact email is required.'),
  role: z.string().trim().min(2).max(80).default('Product Leader'),
  sector: z.string().trim().max(60).default('general'),
  decisionAtStake: z.string().trim().min(20, 'Please define the business decision at stake (minimum 20 characters).').max(600),
  hypothesis: z.string().trim().min(15, 'Hypothesis under test is required (minimum 15 characters).').max(600),
  falsificationCriteria: z.string().trim().min(15, 'Falsification criteria are required (minimum 15 characters).').max(600),
  targetParticipantProfile: z.string().trim().min(10, 'Target practitioner profile is required.').max(300),
  industry: z.string().trim().min(3).max(80).default('B2B Workflow'),
  geography: z.string().trim().max(100).default('India (Regional clusters)'),
  constraints: z.string().trim().max(400).optional().default('None specified'),
  consentContact: z.boolean().refine(val => val === true, 'Consent to be contacted regarding research scoping is required.'),
  consentPrivacy: z.boolean().refine(val => val === true, 'Privacy consent is required.')
});

export type CreateMissionInquiryInput = z.infer<typeof CreateMissionInquirySchema>;

export interface MissionInquiry extends CreateMissionInquiryInput {
  id: string;
  status: MissionInquiryStatus;
  pricingNotice: string;
  createdAt: string;
  updatedAt: string;
  reviewedBy?: string;
  reviewNotes?: string;
  convertedMissionId?: string;
}
