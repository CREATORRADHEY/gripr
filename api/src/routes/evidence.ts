import { FastifyInstance } from 'fastify';
import { EvidenceService } from '../services/evidence.service.js';
import { MatchingService } from '../services/matching.service.js';
import { requireResearcherOrAdmin } from '../middleware/authorization.js';

export async function evidenceRoutes(
  fastify: FastifyInstance,
  options: { evidenceService: EvidenceService; matchingService: MatchingService }
) {
  const { evidenceService, matchingService } = options;

  // 1. TRIGGER GEMINI EXTRACTION FOR A PARTICIPANT RECORD
  fastify.post('/research/responses/:id/analyze', {
    preHandler: [requireResearcherOrAdmin]
  }, async (request, reply) => {
    const { id } = request.params as { id: string };

    const analysis = await evidenceService.analyzeSession(id, { allowMockFallback: true });

    return reply.status(200).send({
      success: true,
      analysisId: analysis.id,
      sessionId: analysis.sessionId,
      missionId: analysis.missionId,
      status: analysis.status,
      modelUsed: analysis.modelUsed,
      processingMode: analysis.processingMode,
      validation: analysis.validationOutcome,
      extraction: analysis.extraction
    });
  });

  // 2. GET EXTRACTION ANALYSIS FOR A PARTICIPANT RECORD
  fastify.get('/research/responses/:id/analysis', {
    preHandler: [requireResearcherOrAdmin]
  }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const analysis = await evidenceService.getAnalysisBySessionId(id);

    if (!analysis) {
      return reply.status(404).send({
        success: false,
        error: {
          code: 'ANALYSIS_NOT_FOUND',
          message: `No structured evidence analysis exists for session ${id}. Trigger extraction first.`
        }
      });
    }

    return reply.status(200).send({
      success: true,
      analysis
    });
  });

  // 3. CROSS-PARTICIPANT CAUSAL COMPARISON
  fastify.post('/research/missions/:id/cross-analysis', {
    preHandler: [requireResearcherOrAdmin]
  }, async (request, reply) => {
    const { id } = request.params as { id: string };

    const synthesis = await matchingService.analyzeMission(id);

    return reply.status(200).send({
      success: true,
      missionId: id,
      comparisonsCount: synthesis.comparisons.length,
      clustersCount: synthesis.observedClusters.length,
      contradictionsCount: synthesis.identifiedContradictions.length,
      synthesis
    });
  });
}
