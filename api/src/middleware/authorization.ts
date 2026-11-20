import { FastifyReply, FastifyRequest } from 'fastify';
import { env } from '../config/env.js';

/**
 * Authorization middleware for Phase 2.
 * 
 * In Phase 2:
 * - Internal operations routes (/api/operations/*) require the 'x-gripr-auth' secret header.
 * - Mission workspace retrieval (/api/missions/:id) requires authorization to prevent public data exposure.
 * - In local development mode, a clearly isolated dev adapter allows testing requests
 *   with an explicit dev header (or auto-authorizes localhost requests if DEMO_MODE=true).
 * - Outside dev mode, unauthorized calls are strictly rejected with 401/403.
 */

export async function requireInternalAuth(request: FastifyRequest, reply: FastifyReply) {
  const authHeader = request.headers['x-gripr-auth'] as string | undefined;

  // In local test or development mode, allow explicitly configured dev secret
  if (authHeader && authHeader === env.INTERNAL_AUTH_SECRET) {
    return;
  }

  // Dev adapter: In development mode, allow if origin is localhost/127.0.0.1 and dev mode is explicitly active
  if (env.isDev && (request.ip === '127.0.0.1' || request.ip === '::1' || request.hostname.includes('localhost'))) {
    // In dev, if header is missing, log a warning but permit local developer workflow
    request.log.warn({ ip: request.ip, path: request.url }, 'Dev authorization adapter: permitted local unauthenticated access for development');
    return;
  }

  return reply.status(401).send({
    success: false,
    error: {
      code: 'UNAUTHORIZED',
      message: 'Access restricted: valid internal authorization credentials required.'
    }
  });
}

export async function requireMissionAccess(request: FastifyRequest, reply: FastifyReply) {
  const authHeader = request.headers['x-gripr-auth'] as string | undefined;

  // Permitted if valid internal secret provided
  if (authHeader && authHeader === env.INTERNAL_AUTH_SECRET) {
    return;
  }

  // In development mode, allow local browser testing
  if (env.isDev && (request.ip === '127.0.0.1' || request.ip === '::1' || request.hostname.includes('localhost'))) {
    return;
  }

  // Otherwise, private mission details are shielded until Phase 3 authentication
  return reply.status(403).send({
    success: false,
    error: {
      code: 'FORBIDDEN',
      message: 'Private mission workspace access is disabled in public environments until Phase 3 authentication.'
    }
  });
}
