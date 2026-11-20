import { IResearchResponseRepository } from '../repositories/interfaces.js';
import { GeminiService } from './gemini.service.js';
import { CrossParticipantComparison, MissionSynthesis } from '../schemas/comparison.schema.js';

export class MatchingService {
  constructor(
    private sessionRepo: IResearchResponseRepository,
    private geminiService: GeminiService
  ) {}

  /**
   * Compare two specific research sessions for causal alignment and contradictions
   */
  async comparePair(sessionIdA: string, sessionIdB: string): Promise<CrossParticipantComparison> {
    const sessionA = await this.sessionRepo.findById(sessionIdA);
    const sessionB = await this.sessionRepo.findById(sessionIdB);

    if (!sessionA || !sessionB) {
      throw new Error(`One or both sessions (${sessionIdA}, ${sessionIdB}) could not be found.`);
    }

    return this.geminiService.compareSessions(sessionA, sessionB);
  }

  /**
   * Perform cross-participant comparison across all sessions in a mission
   */
  async analyzeMission(missionId: string): Promise<MissionSynthesis> {
    const sessions = await this.sessionRepo.findByMissionId(missionId);

    if (sessions.length < 2) {
      return {
        missionId,
        comparisons: [],
        observedClusters: sessions.length === 1 ? [{
          clusterName: `${sessions[0].role} Individual Workflow`,
          mechanism: sessions[0].workflow,
          sessionIds: [sessions[0].id],
          isRepresentative: false
        }] : [],
        identifiedContradictions: []
      };
    }

    const comparisons: CrossParticipantComparison[] = [];
    const contradictions: Array<{ issue: string; sessionA: string; sessionB: string; summary: string }> = [];

    // Compare consecutive pairs to avoid N^2 explosion while discovering key differences
    for (let i = 0; i < sessions.length - 1; i++) {
      const comp = await this.geminiService.compareSessions(sessions[i], sessions[i + 1]);
      comparisons.push(comp);

      if (comp.contradictionDetected) {
        contradictions.push({
          issue: comp.mechanismComparison,
          sessionA: sessions[i].id,
          sessionB: sessions[i + 1].id,
          summary: comp.contradictionDetails || 'Divergent trade-offs observed between operators'
        });
      }
    }

    // Cluster based on relationship
    const sameMechanismIds = new Set<string>();
    const diffMechanismIds = new Set<string>();

    for (const comp of comparisons) {
      if (comp.relationship === 'RELATED_SAME_MECHANISM') {
        sameMechanismIds.add(comp.sessionIds[0]);
        sameMechanismIds.add(comp.sessionIds[1]);
      } else {
        diffMechanismIds.add(comp.sessionIds[0]);
        diffMechanismIds.add(comp.sessionIds[1]);
      }
    }

    const clusters = [];
    if (sameMechanismIds.size > 0) {
      clusters.push({
        clusterName: 'Core Mechanism Alignment',
        mechanism: 'Shared causal root-cause in operational workflow',
        sessionIds: Array.from(sameMechanismIds),
        isRepresentative: false as const
      });
    }
    if (diffMechanismIds.size > 0) {
      clusters.push({
        clusterName: 'Divergent Mechanism Cohort',
        mechanism: 'Divergent operational trade-offs or alternate constraints',
        sessionIds: Array.from(diffMechanismIds),
        isRepresentative: false as const
      });
    }

    return {
      missionId,
      comparisons,
      observedClusters: clusters,
      identifiedContradictions: contradictions
    };
  }
}
