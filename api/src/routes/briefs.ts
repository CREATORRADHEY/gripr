import { FastifyInstance } from 'fastify';
import { BriefService } from '../services/brief.service.js';
import { ResearchService } from '../services/research.service.js';
import { requireResearcherOrAdmin, createBriefAccessGuard } from '../middleware/authorization.js';
import { IMissionRepository, IBriefRepository } from '../repositories/interfaces.js';
import { z } from 'zod';

export async function briefRoutes(
  fastify: FastifyInstance,
  options: {
    briefService: BriefService;
    researchService: ResearchService;
    missionRepo: IMissionRepository;
    briefRepo: IBriefRepository;
  }
) {
  const { briefService, researchService, missionRepo, briefRepo } = options;

  // 1. GET DECISION INTELLIGENCE BRIEF (Protected: enforces org ownership & human approval)
  fastify.get('/missions/:id/brief', {
    preHandler: [createBriefAccessGuard(missionRepo, briefRepo)]
  }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const brief = await briefService.getBrief(id);

    if (!brief) {
      return reply.status(404).send({
        success: false,
        error: {
          code: 'BRIEF_NOT_READY',
          message: `Decision Intelligence Brief for mission ${id} has not yet been generated.`
        }
      });
    }

    const mission = await researchService.getMission(id);
    const sessions = await researchService.getSessionsByMission(id);

    // Sanitize sessions: completely omit private contact info (emails, phones) from public/brief views
    const sanitizedSessions = sessions.map(s => {
      const { consent, ...rest } = s;
      return {
        ...rest,
        consent: {
          studyProcessing: consent.studyProcessing,
          sanitizedBriefSharing: consent.sanitizedBriefSharing,
          followUpInterview: consent.followUpInterview,
          futurePilotParticipation: consent.futurePilotParticipation
        }
      };
    });

    return reply.status(200).send({
      success: true,
      brief,
      mission,
      sessions: sanitizedSessions
    });
  });

  // 2. GENERATE DRAFT BRIEF (Internal research team only)
  fastify.post('/missions/:id/brief/generate', {
    preHandler: [requireResearcherOrAdmin]
  }, async (request, reply) => {
    const { id } = request.params as { id: string };

    const brief = await briefService.generateBrief(id, { allowMockFallback: true });

    return reply.status(200).send({
      success: true,
      briefId: brief.id,
      missionId: id,
      status: brief.status,
      recommendation: brief.recommendation,
      message: 'Decision Intelligence Brief generated in DRAFT mode. Requires authorized human researcher review.',
      brief
    });
  });

  // 3. APPROVE BRIEF FOR CLIENT RELEASE (Human Researcher Sign-off)
  fastify.post('/missions/:id/brief/approve', {
    preHandler: [requireResearcherOrAdmin]
  }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const schema = z.object({
      approvedBy: z.string().trim().min(2).default('Lead Problem Intelligence Researcher')
    });
    const { approvedBy } = schema.parse(request.body || {});

    const approvedBrief = await briefService.approveBrief(id, approvedBy, request.user?.uid);

    return reply.status(200).send({
      success: true,
      briefId: approvedBrief.id,
      status: approvedBrief.status,
      approvedBy: approvedBrief.approvedBy,
      approvedAt: approvedBrief.approvedAt,
      message: `Brief for mission ${id} approved and published to client workspace.`
    });
  });
}
