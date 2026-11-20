import {
  IMissionRepository,
  IInvitationRepository,
  IResearchResponseRepository
} from '../repositories/interfaces.js';
import { CreateMissionInput, Mission } from '../schemas/mission.schema.js';
import { SubmitResearchResponseInput, ResearchSession, ResearchInvitation } from '../schemas/response.schema.js';

export class ResearchService {
  constructor(
    private missionRepo: IMissionRepository,
    private invitationRepo: IInvitationRepository,
    private sessionRepo: IResearchResponseRepository
  ) {}

  // --- MISSIONS ---
  async createMission(input: CreateMissionInput): Promise<Mission> {
    const mission = await this.missionRepo.create(input);

    // Generate an initial research invitation token for this mission
    const invToken = `INV-${mission.sector.toUpperCase().substring(0, 4)}-${mission.id.split('-')[2] || '081'}`;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 45);

    await this.invitationRepo.create({
      token: invToken,
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
      createdAt: new Date().toISOString()
    });

    return mission;
  }

  async getMission(id: string): Promise<Mission | null> {
    return this.missionRepo.findById(id);
  }

  async listMissions(): Promise<Mission[]> {
    return this.missionRepo.findAll();
  }

  // --- INVITATIONS ---
  async getInvitation(token: string): Promise<ResearchInvitation | null> {
    return this.invitationRepo.findByToken(token);
  }

  // --- RESPONSES ---
  async submitResponse(
    invitationToken: string,
    input: SubmitResearchResponseInput
  ): Promise<{ session: ResearchSession; mission: Mission }> {
    const invitation = await this.invitationRepo.findByToken(invitationToken);
    if (!invitation) {
      throw new Error(`Invitation token "${invitationToken}" is invalid or expired.`);
    }

    if (invitation.status === 'expired') {
      throw new Error(`Invitation token "${invitationToken}" has expired.`);
    }

    const mission = await this.missionRepo.findById(invitation.missionId);
    if (!mission) {
      throw new Error(`Associated mission "${invitation.missionId}" could not be found.`);
    }

    // Mandatory processing consent check (extra safety on top of Zod)
    if (!input.consentStudyProcessing) {
      throw new Error('Research processing consent is strictly required to participate.');
    }

    const session = await this.sessionRepo.create(invitation.missionId, input, invitation.token);

    return { session, mission };
  }

  async getSessionsByMission(missionId: string): Promise<ResearchSession[]> {
    return this.sessionRepo.findByMissionId(missionId);
  }

  async getSessionById(id: string): Promise<ResearchSession | null> {
    return this.sessionRepo.findById(id);
  }
}
