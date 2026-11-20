import { z } from 'zod';

export const AuditActionSchema = z.enum([
  'INQUIRY_CREATED',
  'INQUIRY_REVIEWED',
  'INQUIRY_CONVERTED',
  'MISSION_CREATED',
  'MISSION_STATUS_UPDATED',
  'INVITATION_CREATED',
  'INVITATION_USED',
  'RESPONSE_RECORDED',
  'EVIDENCE_ANALYZED',
  'EVIDENCE_REVIEWED',
  'BRIEF_GENERATED',
  'BRIEF_APPROVED',
  'AUTH_FAILED',
  'UNAUTHORIZED_ATTEMPT'
]);

export type AuditAction = z.infer<typeof AuditActionSchema>;

export interface AuditLogEntry {
  id: string;
  action: AuditAction;
  actorId: string;
  actorRole: string;
  targetId: string;
  targetType: string;
  details?: Record<string, unknown>;
  timestamp: string;
  ipAddress?: string;
}
