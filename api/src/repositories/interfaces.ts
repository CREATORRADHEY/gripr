import { Mission, CreateMissionInput, MissionStatus } from '../schemas/mission.schema.js';
import { MissionInquiry, CreateMissionInquiryInput, MissionInquiryStatus } from '../schemas/inquiry.schema.js';
import { ResearchSession, ResearchInvitation, SubmitResearchResponseInput } from '../schemas/response.schema.js';
import { ValidatedAnalysis, AnalysisStatus } from '../schemas/extraction.schema.js';
import { CrossParticipantComparison, MissionSynthesis } from '../schemas/comparison.schema.js';
import { DecisionBrief, BriefStatus } from '../schemas/brief.schema.js';
import { ConsentRecord } from '../schemas/consent.schema.js';
import { AuditLogEntry, AuditAction } from '../schemas/audit.schema.js';

export interface IMissionInquiryRepository {
  create(input: CreateMissionInquiryInput): Promise<MissionInquiry>;
  findById(id: string): Promise<MissionInquiry | null>;
  findAll(): Promise<MissionInquiry[]>;
  updateStatus(id: string, status: MissionInquiryStatus, reviewer?: string, notes?: string, convertedMissionId?: string): Promise<MissionInquiry | null>;
}

export interface IMissionRepository {
  create(input: CreateMissionInput): Promise<Mission>;
  findById(id: string): Promise<Mission | null>;
  findAll(): Promise<Mission[]>;
  findByOrganizationId(organizationId: string): Promise<Mission[]>;
  updateStatus(id: string, status: MissionStatus): Promise<Mission | null>;
  incrementSessionCount(id: string): Promise<void>;
}

export interface IInvitationRepository {
  create(invitation: ResearchInvitation): Promise<ResearchInvitation>;
  findByToken(token: string): Promise<ResearchInvitation | null>;
  findByTokenHash(tokenHash: string): Promise<ResearchInvitation | null>;
  markCompleted(tokenOrHash: string, sessionId?: string): Promise<void>;
  recordFailedAttempt(tokenOrHash: string): Promise<number>;
}

export interface IResearchResponseRepository {
  create(missionId: string, input: SubmitResearchResponseInput, invitationToken?: string): Promise<ResearchSession>;
  findById(id: string): Promise<ResearchSession | null>;
  findByMissionId(missionId: string): Promise<ResearchSession[]>;
  countByMissionId(missionId: string): Promise<number>;
}

export interface IEvidenceRepository {
  saveAnalysis(analysis: ValidatedAnalysis): Promise<ValidatedAnalysis>;
  findBySessionId(sessionId: string): Promise<ValidatedAnalysis | null>;
  findByMissionId(missionId: string): Promise<ValidatedAnalysis[]>;
  updateStatus(id: string, status: AnalysisStatus, reviewerNotes?: string, reviewer?: string): Promise<ValidatedAnalysis | null>;
}

export interface IBriefRepository {
  saveBrief(brief: DecisionBrief): Promise<DecisionBrief>;
  findByMissionId(missionId: string): Promise<DecisionBrief | null>;
  findById(id: string): Promise<DecisionBrief | null>;
  updateStatus(id: string, status: BriefStatus, approvedBy?: string): Promise<DecisionBrief | null>;
}

export interface IConsentRepository {
  recordConsent(record: Omit<ConsentRecord, 'id'>): Promise<ConsentRecord>;
  findByParticipantRef(participantRef: string): Promise<ConsentRecord | null>;
  findAll(): Promise<ConsentRecord[]>;
}

export interface IAuditLogRepository {
  log(action: AuditAction, actorId: string, actorRole: string, targetId: string, targetType: string, details?: Record<string, unknown>, ipAddress?: string): Promise<AuditLogEntry>;
  getLogs(limit?: number): Promise<AuditLogEntry[]>;
}

export interface OperationsQueueItem {
  id: string;
  missionId: string;
  type: 'scope_review' | 'session_review' | 'evidence_moderation' | 'brief_approval';
  title: string;
  status: 'pending' | 'reviewed' | 'flagged' | 'rejected';
  actionTaken: string;
  createdAt: string;
  updatedAt?: string;
}

export interface IOperationsRepository {
  getQueue(): Promise<OperationsQueueItem[]>;
  enqueue(item: Omit<OperationsQueueItem, 'id' | 'createdAt'>): Promise<OperationsQueueItem>;
  updateItem(id: string, status: OperationsQueueItem['status'], notes?: string): Promise<OperationsQueueItem | null>;
}
