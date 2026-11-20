import { FastifyInstance } from 'fastify';
import { CreateMissionSchema, MissionStatusSchema } from '../schemas/mission.schema.js';
import { ResearchService } from '../services/research.service.js';
import { BriefService } from '../services/brief.service.js';
import { requireMissionAccess, requireInternalAuth } from '../middleware/authorization.js';
import { z } from 'zod';

export async function missionRoutes(
  fastify: FastifyInstance,
  options: { researchService: ResearchService; briefService: BriefService }
) {
  const { researchService, briefService } = options;

  // 1. PUBLIC MISSION INTAKE
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
      status: mission.status,
      message: 'Research mission scoping request recorded. Our research team will review scoping parameters.',
      pricingNotice: mission.pricingDisclaimer
    });
  });

  // 2. MISSION LIST (Protected in production / dev adapter)
  fastify.get('/missions', {
    preHandler: [requireMissionAccess]
  }, async (request, reply) => {
    const missions = await researchService.listMissions();
    return reply.status(200).send({
      success: true,
      count: missions.length,
      missions
    });
  });

  // 3. MISSION WORKSPACE DETAIL (Protected)
  fastify.get('/missions/:id', {
    preHandler: [requireMissionAccess]
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

  // 4. DEV LIFECYCLE STATE SWITCHER (Internal/dev only)
  fastify.patch('/missions/:id/status', {
    preHandler: [requireInternalAuth]
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

    mission.status = status;
    return reply.status(200).send({
      success: true,
      missionId: id,
      newStatus: status,
      message: `Mission lifecycle state transitioned to "${status}".`
    });
  });
}
