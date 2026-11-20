import Fastify, { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import sensible from '@fastify/sensible';
import { env } from './config/env.js';
import { errorHandler } from './middleware/errors.js';
import {
  memoryOpsRepo,
  memoryMissionRepo,
  memoryInvitationRepo,
  memorySessionRepo,
  memoryEvidenceRepo,
  memoryBriefRepo
} from './repositories/memory.repository.js';
import { geminiService } from './services/gemini.service.js';
import { ResearchService } from './services/research.service.js';
import { EvidenceService } from './services/evidence.service.js';
import { MatchingService } from './services/matching.service.js';
import { BriefService } from './services/brief.service.js';

import { healthRoutes } from './routes/health.js';
import { missionRoutes } from './routes/missions.js';
import { researchRoutes } from './routes/research.js';
import { evidenceRoutes } from './routes/evidence.js';
import { briefRoutes } from './routes/briefs.js';
import { operationsRoutes } from './routes/operations.js';

export interface AppOptions {
  logger?: boolean | object;
}

export function buildApp(options: AppOptions = {}): FastifyInstance {
  const app = Fastify({
    logger: options.logger ?? (env.isTest ? false : {
      level: env.isDev ? 'info' : 'warn',
      serializers: {
        req(req) {
          return {
            method: req.method,
            url: req.url,
            hostname: req.hostname,
            remoteAddress: req.ip
          };
        }
      }
    }),
    bodyLimit: 65536 // 64 KB max body size
  });

  // Central error handler
  app.setErrorHandler(errorHandler);

  // Security & utility plugins
  app.register(sensible);

  // CORS
  app.register(cors, {
    origin: (origin, cb) => {
      if (!origin) return cb(null, true);
      if (env.isDev && (origin.includes('localhost') || origin.includes('127.0.0.1'))) {
        return cb(null, true);
      }
      if (env.ALLOWED_ORIGINS.includes(origin)) {
        return cb(null, true);
      }
      return cb(new Error('CORS origin not allowed by policy'), false);
    },
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true
  });

  // Rate Limiting
  app.register(rateLimit, {
    max: env.RATE_LIMIT_MAX,
    timeWindow: '1 minute',
    allowList: ['127.0.0.1', '::1']
  });

  // Instantiate services with shared repository instances
  const researchService = new ResearchService(memoryMissionRepo, memoryInvitationRepo, memorySessionRepo);
  const evidenceService = new EvidenceService(memoryEvidenceRepo, memorySessionRepo, geminiService);
  const matchingService = new MatchingService(memorySessionRepo, geminiService);
  const briefService = new BriefService(memoryBriefRepo, memoryMissionRepo, memorySessionRepo, memoryEvidenceRepo, geminiService);

  // Register API routes
  app.register(healthRoutes, { prefix: '/api' });
  app.register(async (api) => {
    await missionRoutes(api, { researchService, briefService });
    await researchRoutes(api, { researchService });
    await evidenceRoutes(api, { evidenceService, matchingService });
    await briefRoutes(api, { briefService, researchService });
    await operationsRoutes(api, {
      opsRepo: memoryOpsRepo,
      missionRepo: memoryMissionRepo,
      sessionRepo: memorySessionRepo,
      evidenceService
    });
  }, { prefix: '/api' });

  return app;
}
