import { FastifyReply, FastifyRequest } from 'fastify';
import { FirebaseAuthService, AuthUser, UserRole } from '../services/auth.service.js';
import { IMissionRepository, IBriefRepository } from '../repositories/interfaces.js';

declare module 'fastify' {
  interface FastifyRequest {
    user?: AuthUser;
  }
}

/**
 * Validates the Authorization Bearer ID Token on protected routes.
 * Never trusts client headers or unverified query params.
 */
export async function authenticate(request: FastifyRequest, reply: FastifyReply): Promise<AuthUser | undefined> {
  const authHeader = request.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    reply.status(401).send({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Authentication required. Bearer ID token is missing.'
      }
    });
    return undefined;
  }

  try {
    const user = await FirebaseAuthService.verifyToken(authHeader);
    request.user = user;
    return user;
  } catch (err: any) {
    reply.status(401).send({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: `Authentication failed: ${err.message || 'Invalid or expired credentials'}`
      }
    });
    return undefined;
  }
}

/**
 * Enforces one or more specific user access roles.
 */
export function requireRoles(roles: UserRole[]) {
  return async function (request: FastifyRequest, reply: FastifyReply) {
    const user = await authenticate(request, reply);
    if (!user) return; // Response already sent by authenticate

    if (!roles.includes(user.role)) {
      return reply.status(403).send({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: `Access denied. Role "${user.role}" does not have required permissions [${roles.join(', ')}].`
        }
      });
    }
  };
}

/**
 * Enforces Researcher or Administrator access for internal operations.
 */
export const requireResearcherOrAdmin = requireRoles(['RESEARCHER', 'ADMIN']);

/**
 * Enforces organization boundary isolation on mission retrieval.
 */
export function createMissionAccessGuard(missionRepo: IMissionRepository) {
  return async function (request: FastifyRequest, reply: FastifyReply) {
    const user = await authenticate(request, reply);
    if (!user) return;

    // Researchers and Admins can access all missions for scoping and review
    if (user.role === 'RESEARCHER' || user.role === 'ADMIN') {
      return;
    }

    const { id } = request.params as { id: string };
    const mission = await missionRepo.findById(id);

    if (!mission) {
      return reply.status(404).send({
        success: false,
        error: {
          code: 'MISSION_NOT_FOUND',
          message: `Mission ${id} not found.`
        }
      });
    }

    // Organization users can ONLY access missions belonging to their organization
    if (user.role === 'ORGANIZATION_USER') {
      if (!user.organizationId || mission.organizationId !== user.organizationId) {
        return reply.status(403).send({
          success: false,
          error: {
            code: 'FORBIDDEN_CROSS_ORG',
            message: 'Cross-organization data access violation. You do not own this mission workspace.'
          }
        });
      }
      return;
    }

    return reply.status(403).send({
      success: false,
      error: {
        code: 'FORBIDDEN',
        message: 'Access restricted for current user role.'
      }
    });
  };
}

/**
 * Enforces that organization users can ONLY access approved briefs.
 */
export function createBriefAccessGuard(missionRepo: IMissionRepository, briefRepo: IBriefRepository) {
  return async function (request: FastifyRequest, reply: FastifyReply) {
    const user = await authenticate(request, reply);
    if (!user) return;

    const { id } = request.params as { id: string };
    const brief = await briefRepo.findByMissionId(id) || await briefRepo.findById(id);

    if (!brief) {
      return reply.status(404).send({
        success: false,
        error: {
          code: 'BRIEF_NOT_READY',
          message: `Decision Intelligence Brief for mission ${id} is not yet available.`
        }
      });
    }

    const mission = await missionRepo.findById(brief.missionId);

    // Researchers & Admins can access both DRAFT and APPROVED briefs
    if (user.role === 'RESEARCHER' || user.role === 'ADMIN') {
      return;
    }

    // Organization Users
    if (user.role === 'ORGANIZATION_USER') {
      // 1. Ownership check
      if (!user.organizationId || (mission && mission.organizationId !== user.organizationId)) {
        return reply.status(403).send({
          success: false,
          error: {
            code: 'FORBIDDEN_CROSS_ORG',
            message: 'Cross-organization data access violation.'
          }
        });
      }

      // 2. Human approval check
      if (brief.status !== 'APPROVED') {
        return reply.status(403).send({
          success: false,
          error: {
            code: 'BRIEF_UNAPPROVED',
            message: 'This Decision Intelligence Brief is currently in internal human researcher review and has not yet been approved for client access.'
          }
        });
      }

      return;
    }

    return reply.status(403).send({
      success: false,
      error: { code: 'FORBIDDEN', message: 'Unauthorized role for brief access.' }
    });
  };
}
