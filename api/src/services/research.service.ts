import crypto from 'node:crypto';
import {
  IMissionRepository,
  IMissionInquiryRepository,
  IInvitationRepository,
  IResearchResponseRepository,
  IConsentRepository,
  IAuditLogRepository
} from '../repositories/interfaces.js';
import { CreateMissionInput, Mission } from '../schemas/mission.schema.js';
import { CreateMissionInquiryInput, MissionInquiry } from '../schemas/inquiry.schema.js';
import { SubmitResearchResponseInput, ResearchSession, ResearchInvitation } from '../schemas/response.schema.js';

export class ResearchService {
  constructor(
    private missionRepo: IMissionRepository,
    private inquiryRepo: IMissionInquiryRepository,
    private invitationRepo: IInvitationRepository,
    private sessionRepo: IResearchResponseRepository,
    private consentRepo: IConsentRepository,
    private auditRepo: IAuditLogRepository
  ) {}

  // --- MISSION INQUIRIES (PUBLIC INTAKE) ---
  async createInquiry(input: CreateMissionInquiryInput, ipAddress?: string): Promise<MissionInquiry> {
    const inquiry = await this.inquiryRepo.create(input);

    await this.auditRepo.log(
      'INQUIRY_CREATED',
      inquiry.contactEmail,
      'PUBLIC_PROSPECT',
      inquiry.id,
      'mission_inquiry',
      { orgName: inquiry.orgName, sector: inquiry.sector },
      ipAddress
    );

    return inquiry;
  }

  async getInquiry(id: string): Promise<MissionInquiry | null> {
    return this.inquiryRepo.findById(id);
  }

  async listInquiries(): Promise<MissionInquiry[]> {
    return this.inquiryRepo.findAll();
  }

  async convertInquiryToMission(inquiryId: string, reviewerUid: string): Promise<{ mission: Mission; inquiry: MissionInquiry }> {
    const inquiry = await this.inquiryRepo.findById(inquiryId);
    if (!inquiry) {
      throw new Error(`Mission inquiry "${inquiryId}" not found.`);
    }

    if (inquiry.status === 'CONVERTED_TO_MISSION' && inquiry.convertedMissionId) {
      const existing = await this.missionRepo.findById(inquiry.convertedMissionId);
      if (existing) return { mission: existing, inquiry };
    }

    const missionInput: CreateMissionInput = {
      orgName: inquiry.orgName,
      organizationId: `ORG-${crypto.createHash('md5').update(inquiry.orgName.toLowerCase()).digest('hex').slice(0, 8).toUpperCase()}`,
      inquiryId: inquiry.id,
      contactPerson: inquiry.contactPerson,
      contactEmail: inquiry.contactEmail,
      role: inquiry.role,
      sector: inquiry.sector,
      decisionAtStake: inquiry.decisionAtStake,
      hypothesis: inquiry.hypothesis,
      falsificationCriteria: inquiry.falsificationCriteria,
      problemToInvestigate: inquiry.decisionAtStake,
      targetParticipantProfile: inquiry.targetParticipantProfile,
      industry: inquiry.industry,
      geography: inquiry.geography,
      urgency: 'Standard (4-6 weeks)',
      constraints: inquiry.constraints,
      deliverables: ['Decision Intelligence Brief', 'Workflow Friction Map'],
      consentPrivacy: true
    };

    const mission = await this.createMission(missionInput);

    await this.inquiryRepo.updateStatus(
      inquiryId,
      'CONVERTED_TO_MISSION',
      reviewerUid,
      `Converted to active mission ${mission.id}`,
      mission.id
    );

    await this.auditRepo.log(
      'INQUIRY_CONVERTED',
      reviewerUid,
      'RESEARCHER',
      mission.id,
      'mission',
      { inquiryId, orgName: mission.orgName }
    );

    return { mission, inquiry };
  }

  // --- MISSIONS ---
  async createMission(input: CreateMissionInput): Promise<Mission> {
    const mission = await this.missionRepo.create(input);

    // Generate a cryptographically secure random invitation token
    const randomToken = `INV-${crypto.randomBytes(16).toString('hex').toUpperCase()}`;
    const tokenHash = crypto.createHash('sha256').update(randomToken).digest('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 45);

    mission.invitationToken = randomToken;

    await this.invitationRepo.create({
      token: randomToken,
      tokenHash,
      missionId: mission.id,
      studyTitle: `${mission.orgName}: Operational Workflow Research Study`,
      studyDescription: `Qualitative research session investigating ${mission.problemToInvestigate}. Target participant profile: ${mission.targetParticipantProfile}.`,
      targetRole: mission.targetParticipantProfile,
      permittedQuestions: [
        'Describe a recent incident where this operational problem occurred.',
        'What workaround or manual process did you use to manage it?',
        'What was the direct impact on your operations, time, or costs?'
      ],
      honorarium: '₹1,500 direct bank transfer upon session completion',
      expiresAt: expiresAt.toISOString(),
      status: 'active',
      failedAttempts: 0,
      createdAt: new Date().toISOString()
    });

    await this.auditRepo.log(
      'MISSION_CREATED',
      input.contactEmail,
      'ORGANIZATION_USER',
      mission.id,
      'mission',
      { orgName: mission.orgName, sector: mission.sector }
    );

    return mission;
  }

  async getMission(id: string): Promise<Mission | null> {
    return this.missionRepo.findById(id);
  }

  async listMissions(organizationId?: string): Promise<Mission[]> {
    if (organizationId) {
      return this.missionRepo.findByOrganizationId(organizationId);
    }
    return this.missionRepo.findAll();
  }

  // --- INVITATIONS ---
  async getInvitation(token: string): Promise<ResearchInvitation | null> {
    return this.invitationRepo.findByToken(token);
  }

  // --- RESPONSES ---
  async submitResponse(
    invitationToken: string,
    input: SubmitResearchResponseInput,
    ipAddress?: string
  ): Promise<{ session: ResearchSession; mission: Mission }> {
    const invitation = await this.invitationRepo.findByToken(invitationToken);
    if (!invitation) {
      throw new Error(`Invitation token is invalid.`);
    }

    if (invitation.status === 'completed') {
      throw new Error('This research invitation has already been completed and cannot be replayed.');
    }

    if (invitation.status === 'expired') {
      throw new Error('This research invitation has expired.');
    }

    const mission = await this.missionRepo.findById(invitation.missionId);
    if (!mission) {
      throw new Error(`Associated mission "${invitation.missionId}" could not be found.`);
    }

    // Mandatory processing consent check
    if (!input.consentStudyProcessing) {
      throw new Error('Research processing consent is strictly required to participate.');
    }

    // Create session record
    const session = await this.sessionRepo.create(invitation.missionId, input, invitation.token);

    // Atomic completion: mark invitation as completed to prevent replays
    await this.invitationRepo.markCompleted(invitation.token, session.id);

    // Increment completed session count on mission
    await this.missionRepo.incrementSessionCount(mission.id);

    // Save versioned consent record separately
    await this.consentRepo.recordConsent({
      participantRef: session.id,
      studyProcessing: input.consentStudyProcessing,
      sanitizedBriefSharing: input.consentSanitizedBriefSharing || false,
      followUpInterview: input.consentFollowUpInterview || false,
      futurePilotParticipation: input.consentFuturePilotParticipation || false,
      consentVersion: '2026.1',
      timestamp: new Date().toISOString(),
      purpose: `Qualitative research mission ${mission.id}`,
      ipHash: ipAddress ? crypto.createHash('sha256').update(ipAddress).digest('hex').slice(0, 16) : undefined
    });

    await this.auditRepo.log(
      'INVITATION_USED',
      session.participantPseudonym,
      'RESEARCH_PARTICIPANT',
      session.id,
      'research_response',
      { missionId: mission.id, role: session.role },
      ipAddress
    );

    return { session, mission };
  }

  async getSessionsByMission(missionId: string): Promise<ResearchSession[]> {
    return this.sessionRepo.findByMissionId(missionId);
  }

  async getSessionById(id: string): Promise<ResearchSession | null> {
    return this.sessionRepo.findById(id);
  }
}
