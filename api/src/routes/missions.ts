import { FastifyInstance } from 'fastify';
import { CreateMissionSchema, MissionStatusSchema } from '../schemas/mission.schema.js';
import { ResearchService } from '../services/research.service.js';
import { BriefService } from '../services/brief.service.js';
import { authenticate, requireResearcherOrAdmin, createMissionAccessGuard } from '../middleware/authorization.js';
import { IMissionRepository } from '../repositories/interfaces.js';
import { z } from 'zod';

export async function missionRoutes(
  fastify: FastifyInstance,
  options: {
    researchService: ResearchService;
    briefService: BriefService;
    missionRepo: IMissionRepository;
  }
) {
  const { researchService, briefService, missionRepo } = options;

  // 1. MISSION INTAKE / CREATION
  fastify.post('/missions', {
    config: {
      rateLimit: {
        max: 30,
        timeWindow: '1 minute'
      }
    }
  }, async (request, reply) => {
    const validatedInput = CreateMissionSchema.parse(request.body);
    const mission = await researchService.createMission(validatedInput);

    return reply.status(201).send({
      success: true,
      missionId: mission.id,
      inquiryId: mission.inquiryId,
      status: mission.status,
      message: 'Research mission scoping request recorded. Our research team will review scoping parameters.',
      pricingNotice: mission.pricingDisclaimer
    });
  });

  // 2. MISSION LIST (Tenant Isolated: returns only authorized missions)
  fastify.get('/missions', async (request, reply) => {
    const user = await authenticate(request, reply);
    if (!user) return;

    let missions = [];
    if (user.role === 'RESEARCHER' || user.role === 'ADMIN') {
      missions = await researchService.listMissions();
    } else if (user.role === 'ORGANIZATION_USER') {
      missions = await researchService.listMissions(user.organizationId);
    } else {
      return reply.status(403).send({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Participants cannot access mission directories.' }
      });
    }

    return reply.status(200).send({
      success: true,
      count: missions.length,
      missions
    });
  });

  // 3. MISSION WORKSPACE DETAIL (Tenant Isolated: enforces mission ownership)
  fastify.get('/missions/:id', {
    preHandler: [createMissionAccessGuard(missionRepo)]
  }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const mission = await researchService.getMission(id);

    if (!mission) {
      return reply.status(404).send({
        success: false,
        error: {
          code: 'MISSION_NOT_FOUND',
          message: `Mission ${id} was not found.`
        }
      });
    }

    const sessions = await researchService.getSessionsByMission(mission.id);
    const brief = await briefService.getBrief(mission.id);

    return reply.status(200).send({
      success: true,
      mission,
      briefAvailable: !!brief,
      briefStatus: brief ? brief.status : null,
      sessionsCount: sessions.length,
      sessions
    });
  });

  // 4. LIFECYCLE STATE SWITCHER (Internal Researcher / Admin Only)
  fastify.patch('/missions/:id/status', {
    preHandler: [requireResearcherOrAdmin]
  }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const bodySchema = z.object({
      status: MissionStatusSchema
    });
    const { status } = bodySchema.parse(request.body);

    const mission = await researchService.getMission(id);
    if (!mission) {
      return reply.status(404).send({
        success: false,
        error: { code: 'NOT_FOUND', message: `Mission ${id} not found.` }
      });
    }

    const updated = await missionRepo.updateStatus(id, status);

    return reply.status(200).send({
      success: true,
      missionId: id,
      newStatus: status,
      message: `Mission lifecycle state transitioned to "${status}".`
    });
  });
}
