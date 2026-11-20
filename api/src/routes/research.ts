import { FastifyInstance } from 'fastify';
import { SubmitResearchResponseSchema } from '../schemas/response.schema.js';
import { ResearchService } from '../services/research.service.js';
import { requireResearcherOrAdmin } from '../middleware/authorization.js';
import { IInvitationRepository } from '../repositories/interfaces.js';

export async function researchRoutes(
  fastify: FastifyInstance,
  options: {
    researchService: ResearchService;
    invitationRepo: IInvitationRepository;
  }
) {
  const { researchService, invitationRepo } = options;

  // 1. PUBLIC INVITATION VERIFICATION (Minimum study details only; enumeration protected)
  fastify.get('/research/invitations/:token', {
    config: {
      rateLimit: {
        max: 20,
        timeWindow: '1 minute'
      }
    }
  }, async (request, reply) => {
    const { token } = request.params as { token: string };

    if (!token || token.trim().length < 10) {
      return reply.status(400).send({
        success: false,
        error: { code: 'INVALID_TOKEN_FORMAT', message: 'Invitation token is malformed.' }
      });
    }

    const invitation = await researchService.getInvitation(token);

    if (!invitation) {
      await invitationRepo.recordFailedAttempt(token);
      return reply.status(404).send({
        success: false,
        error: {
          code: 'INVITATION_INVALID',
          message: 'Research invitation token is invalid or does not exist.'
        }
      });
    }

    if (invitation.status === 'completed') {
      return reply.status(410).send({
        success: false,
        error: {
          code: 'INVITATION_ALREADY_COMPLETED',
          message: 'This research study invitation has already been completed and cannot be replayed.'
        }
      });
    }

    if (invitation.status === 'expired' || new Date(invitation.expiresAt) < new Date()) {
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

  // 2. PUBLIC PARTICIPANT RESPONSE SUBMISSION (Single-use token enforcement & consent recording)
  fastify.post('/research/invitations/:token/responses', {
    config: {
      rateLimit: {
        max: 10,
        timeWindow: '1 minute'
      }
    }
  }, async (request, reply) => {
    const { token } = request.params as { token: string };
    const validatedInput = SubmitResearchResponseSchema.parse(request.body);

    try {
      const { session } = await researchService.submitResponse(token, validatedInput, request.ip);

      return reply.status(201).send({
        success: true,
        sessionId: session.id,
        status: 'Recorded',
        message: 'Participant research session recorded. Thank you for providing your firsthand operational experience.',
        consentRecorded: {
          studyProcessing: session.consent.studyProcessing,
          sanitizedBriefSharing: session.consent.sanitizedBriefSharing,
          followUpInterview: session.consent.followUpInterview,
          futurePilotParticipation: session.consent.futurePilotParticipation
        }
      });
    } catch (err: any) {
      if (err.message && (err.message.includes('completed') || err.message.includes('replayed'))) {
        return reply.status(409).send({
          success: false,
          error: {
            code: 'INVITATION_ALREADY_COMPLETED',
            message: err.message
          }
        });
      }
      throw err;
    }
  });

  // 3. PROTECTED RESPONSE DETAIL (Internal research ops)
  fastify.get('/research/responses/:id', {
    preHandler: [requireResearcherOrAdmin]
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
