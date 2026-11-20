import {
  IBriefRepository,
  IMissionRepository,
  IResearchResponseRepository,
  IEvidenceRepository,
  IAuditLogRepository
} from '../repositories/interfaces.js';
import { GeminiService } from './gemini.service.js';
import { DecisionBrief } from '../schemas/brief.schema.js';

export class BriefService {
  constructor(
    private briefRepo: IBriefRepository,
    private missionRepo: IMissionRepository,
    private sessionRepo: IResearchResponseRepository,
    private evidenceRepo: IEvidenceRepository,
    private geminiService: GeminiService,
    private auditRepo?: IAuditLogRepository
  ) {}

  /**
   * Get an existing brief for a mission
   */
  async getBrief(missionId: string): Promise<DecisionBrief | null> {
    return this.briefRepo.findByMissionId(missionId);
  }

  /**
   * Synthesize or generate a Decision Intelligence Brief for a mission
   */
  async generateBrief(missionId: string, options?: { allowMockFallback?: boolean }): Promise<DecisionBrief> {
    const mission = await this.missionRepo.findById(missionId);
    if (!mission) {
      throw new Error(`Mission ${missionId} not found.`);
    }

    const sessions = await this.sessionRepo.findByMissionId(missionId);
    if (sessions.length === 0) {
      throw new Error(`Cannot synthesize a Decision Brief for mission ${missionId}: No participant research sessions recorded yet.`);
    }

    const analyses = await this.evidenceRepo.findByMissionId(missionId);

    // Guard: Fail-closed if any analysis failed or if analyses are missing
    if (analyses.some(a => a.status === 'analysis_failed')) {
      throw new Error(`Cannot synthesize Decision Brief: One or more participant analyses failed. AI extraction must succeed or be reviewed before brief synthesis.`);
    }

    // Call Gemini to synthesize brief
    const draftBrief = await this.geminiService.synthesizeBrief(mission, sessions, analyses, options);

    // Ensure status is strictly DRAFT — REQUIRES HUMAN REVIEW
    draftBrief.organizationId = mission.organizationId;
    draftBrief.status = 'DRAFT — REQUIRES HUMAN REVIEW';
    draftBrief.approvedAt = null;
    draftBrief.approvedBy = null;

    // Save in repository
    await this.briefRepo.saveBrief(draftBrief);

    // Update mission status
    await this.missionRepo.updateStatus(missionId, 'Synthesis');

    if (this.auditRepo) {
      await this.auditRepo.log(
        'BRIEF_GENERATED',
        'SYSTEM_AI',
        'SYSTEM',
        draftBrief.id,
        'decision_brief',
        { missionId, recommendation: draftBrief.recommendation }
      );
    }

    return draftBrief;
  }

  /**
   * Human reviewer sign-off to approve a brief for client release
   */
  async approveBrief(missionId: string, reviewerName: string, reviewerUid?: string): Promise<DecisionBrief> {
    const brief = await this.briefRepo.findByMissionId(missionId);
    if (!brief) {
      throw new Error(`Brief for mission ${missionId} not found.`);
    }

    const updated = await this.briefRepo.updateStatus(missionId, 'APPROVED', reviewerName);
    if (!updated) {
      throw new Error(`Failed to update brief status for mission ${missionId}.`);
    }

    // Advance mission status to Brief Ready
    await this.missionRepo.updateStatus(missionId, 'Brief Ready');

    if (this.auditRepo) {
      await this.auditRepo.log(
        'BRIEF_APPROVED',
        reviewerUid || reviewerName,
        'RESEARCHER',
        updated.id,
        'decision_brief',
        { missionId, approvedBy: reviewerName, approvedAt: updated.approvedAt }
      );
    }

    return updated;
  }
}
