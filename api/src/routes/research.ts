import { FastifyInstance } from 'fastify';
import { SubmitResearchResponseSchema } from '../schemas/response.schema.js';
import { ResearchService } from '../services/research.service.js';
import { requireInternalAuth } from '../middleware/authorization.js';

export async function researchRoutes(
  fastify: FastifyInstance,
  options: { researchService: ResearchService }
) {
  const { researchService } = options;

  // 1. PUBLIC INVITATION VERIFICATION (Minimum study details only)
  fastify.get('/research/invitations/:token', async (request, reply) => {
    const { token } = request.params as { token: string };
    const invitation = await researchService.getInvitation(token);

    if (!invitation) {
      return reply.status(404).send({
        success: false,
        error: {
          code: 'INVITATION_INVALID',
          message: 'Research invitation token is invalid or does not exist.'
        }
      });
    }

    if (invitation.status === 'expired') {
      return reply.status(410).send({
        success: false,
        error: {
          code: 'INVITATION_EXPIRED',
          message: 'This research study invitation has expired.'
        }
      });
    }

    // Shield internal mission ID & organization name
    return reply.status(200).send({
      success: true,
      invitation: {
        token: invitation.token,
        studyTitle: invitation.studyTitle,
        studyDescription: invitation.studyDescription,
        targetRole: invitation.targetRole,
        permittedQuestions: invitation.permittedQuestions,
        honorarium: invitation.honorarium,
        expiresAt: invitation.expiresAt,
        status: invitation.status
      }
    });
  });

  // 2. PUBLIC PARTICIPANT RESPONSE SUBMISSION
  fastify.post('/research/invitations/:token/responses', {
    config: {
      rateLimit: {
        max: 20,
        timeWindow: '1 minute'
      }
    }
  }, async (request, reply) => {
    const { token } = request.params as { token: string };
    const validatedInput = SubmitResearchResponseSchema.parse(request.body);

    const { session } = await researchService.submitResponse(token, validatedInput);

    return reply.status(201).send({
      success: true,
      sessionId: session.id,
      status: 'Recorded',
      message: 'Participant research session recorded. Thank you for providing your firsthand operational experience.',
      consentRecorded: {
        studyProcessing: session.consent.studyProcessing,
        sanitizedBriefSharing: session.consent.sanitizedBriefSharing,
        followUpInterview: session.consent.followUpInterview
      }
    });
  });

  // 3. PROTECTED RESPONSE DETAIL (Internal research ops)
  fastify.get('/research/responses/:id', {
    preHandler: [requireInternalAuth]
  }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const session = await researchService.getSessionById(id);

    if (!session) {
      return reply.status(404).send({
        success: false,
        error: { code: 'SESSION_NOT_FOUND', message: `Research session ${id} was not found.` }
      });
    }

    return reply.status(200).send({
      success: true,
      session
    });
  });
}
