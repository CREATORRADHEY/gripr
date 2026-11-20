import { FastifyInstance } from 'fastify';
import { CreateMissionInquirySchema } from '../schemas/inquiry.schema.js';
import { ResearchService } from '../services/research.service.js';
import { authenticate, requireResearcherOrAdmin } from '../middleware/authorization.js';

export async function inquiryRoutes(
  fastify: FastifyInstance,
  options: { researchService: ResearchService }
) {
  const { researchService } = options;

  // 1. PUBLIC MISSION INQUIRY INTAKE (Rate limited, abuse protected)
  fastify.post('/mission-inquiries', {
    config: {
      rateLimit: {
        max: 30,
        timeWindow: '1 minute'
      }
    }
  }, async (request, reply) => {
    const validatedInput = CreateMissionInquirySchema.parse(request.body);
    const inquiry = await researchService.createInquiry(validatedInput, request.ip);

    return reply.status(201).send({
      success: true,
      inquiryId: inquiry.id,
      status: inquiry.status,
      message: 'Research mission inquiry received. Our qualitative research team will review scoping parameters and participant feasibility.',
      pricingNotice: inquiry.pricingNotice,
      disclaimer: 'Submitting an inquiry does not constitute a confirmed contract or guaranteed delivery commitment. Formal scoping review is required.'
    });
  });

  // 2. LIST INQUIRIES (Researcher / Admin Only)
  fastify.get('/mission-inquiries', {
    preHandler: [requireResearcherOrAdmin]
  }, async (request, reply) => {
    const inquiries = await researchService.listInquiries();
    return reply.status(200).send({
      success: true,
      count: inquiries.length,
      inquiries
    });
  });

  // 3. GET SINGLE INQUIRY (Researcher / Admin Only)
  fastify.get('/mission-inquiries/:id', {
    preHandler: [requireResearcherOrAdmin]
  }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const inquiry = await researchService.getInquiry(id);

    if (!inquiry) {
      return reply.status(404).send({
        success: false,
        error: { code: 'NOT_FOUND', message: `Mission inquiry ${id} not found.` }
      });
    }

    return reply.status(200).send({
      success: true,
      inquiry
    });
  });

  // 4. CONVERT INQUIRY TO FORMAL MISSION (Researcher / Admin Only)
  fastify.post('/mission-inquiries/:id/convert', {
    preHandler: [requireResearcherOrAdmin]
  }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const reviewerUid = request.user?.uid || 'LEAD_RESEARCHER';

    const { mission, inquiry } = await researchService.convertInquiryToMission(id, reviewerUid);

    return reply.status(200).send({
      success: true,
      inquiryId: id,
      missionId: mission.id,
      invitationToken: mission.invitationToken,
      status: mission.status,
      message: `Inquiry ${id} approved and converted to active mission ${mission.id}. Initial research invitation generated.`
    });
  });
}
