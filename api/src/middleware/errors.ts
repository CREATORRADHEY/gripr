import { FastifyError, FastifyReply, FastifyRequest } from 'fastify';
import { ZodError } from 'zod';

export function errorHandler(error: FastifyError | Error, request: FastifyRequest, reply: FastifyReply) {
  // 1. Zod Validation Errors
  if (error instanceof ZodError) {
    const formattedErrors = error.errors.map(err => ({
      field: err.path.join('.'),
      message: err.message
    }));

    return reply.status(400).send({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Request payload validation failed',
        details: formattedErrors
      }
    });
  }

  // 2. Fastify Validation Errors (Schema validation)
  if ('validation' in error && error.validation) {
    return reply.status(400).send({
      success: false,
      error: {
        code: 'BAD_REQUEST',
        message: error.message,
        details: error.validation
      }
    });
  }

  // 3. Fastify Rate Limit
  if ('statusCode' in error && error.statusCode === 429) {
    return reply.status(429).send({
      success: false,
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many requests. Please slow down.'
      }
    });
  }

  // 4. Custom Business Errors (Not Found, Forbidden, Unauthorized)
  if (error.message.includes('not found')) {
    return reply.status(404).send({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: error.message
      }
    });
  }

  if (error.message.includes('Unauthorized') || error.message.includes('unauthorized')) {
    return reply.status(401).send({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: error.message
      }
    });
  }

  if (error.message.includes('Forbidden') || error.message.includes('forbidden')) {
    return reply.status(403).send({
      success: false,
      error: {
        code: 'FORBIDDEN',
        message: error.message
      }
    });
  }

  // 5. Internal Server Error (never leak stack traces in responses)
  request.log.error(error);
  const statusCode = (error as any).statusCode || 500;
  return reply.status(statusCode).send({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: (error as any).message || 'An unexpected internal error occurred.'
    }
  });
}
