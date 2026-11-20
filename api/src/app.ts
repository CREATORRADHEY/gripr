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
  memoryBriefRepo,
  MemoryMissionInquiryRepository,
  MemoryConsentRepository,
  MemoryAuditLogRepository
} from './repositories/memory.repository.js';
import {
  FirestoreStorageEngine,
  FirestoreMissionInquiryRepository,
  FirestoreMissionRepository,
  FirestoreInvitationRepository,
  FirestoreResearchResponseRepository,
  FirestoreEvidenceRepository,
  FirestoreBriefRepository,
  FirestoreConsentRepository,
  FirestoreAuditLogRepository,
  FirestoreOperationsRepository
} from './repositories/firestore.repository.js';
import { geminiService } from './services/gemini.service.js';
import { ResearchService } from './services/research.service.js';
import { EvidenceService } from './services/evidence.service.js';
import { MatchingService } from './services/matching.service.js';
import { BriefService } from './services/brief.service.js';

import { healthRoutes } from './routes/health.js';
import { inquiryRoutes } from './routes/inquiries.js';
import { missionRoutes } from './routes/missions.js';
import { researchRoutes } from './routes/research.js';
import { evidenceRoutes } from './routes/evidence.js';
import { briefRoutes } from './routes/briefs.js';
import { operationsRoutes } from './routes/operations.js';

export interface AppOptions {
  logger?: boolean | object;
  useMemoryRepo?: boolean;
}

// Global persistent storage engine for persistent server runtime
export const globalFirestoreStorage = new FirestoreStorageEngine();

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

  // Repository selection: in-memory (for isolated transient unit tests) vs persistent firestore
  const useMemory = options.useMemoryRepo ?? (env.isTest ? true : false);

  const missionRepo = useMemory ? memoryMissionRepo : new FirestoreMissionRepository(globalFirestoreStorage);
  const inquiryRepo = useMemory ? new MemoryMissionInquiryRepository() : new FirestoreMissionInquiryRepository(globalFirestoreStorage);
  const invitationRepo = useMemory ? memoryInvitationRepo : new FirestoreInvitationRepository(globalFirestoreStorage);
  const sessionRepo = useMemory ? memorySessionRepo : new FirestoreResearchResponseRepository(globalFirestoreStorage);
  const evidenceRepo = useMemory ? memoryEvidenceRepo : new FirestoreEvidenceRepository(globalFirestoreStorage);
  const briefRepo = useMemory ? memoryBriefRepo : new FirestoreBriefRepository(globalFirestoreStorage);
  const consentRepo = useMemory ? new MemoryConsentRepository() : new FirestoreConsentRepository(globalFirestoreStorage);
  const auditRepo = useMemory ? new MemoryAuditLogRepository() : new FirestoreAuditLogRepository(globalFirestoreStorage);
  const opsRepo = useMemory ? memoryOpsRepo : new FirestoreOperationsRepository(globalFirestoreStorage);

  // Instantiate services with repositories
  const researchService = new ResearchService(
    missionRepo,
    inquiryRepo,
    invitationRepo,
    sessionRepo,
    consentRepo,
    auditRepo
  );
  const evidenceService = new EvidenceService(evidenceRepo, sessionRepo, geminiService);
  const matchingService = new MatchingService(sessionRepo, geminiService);
  const briefService = new BriefService(briefRepo, missionRepo, sessionRepo, evidenceRepo, geminiService, auditRepo);

  // Register API routes
  app.register(healthRoutes, { prefix: '/api' });
  app.register(async (api) => {
    await inquiryRoutes(api, { researchService });
    await missionRoutes(api, { researchService, briefService, missionRepo });
    await researchRoutes(api, { researchService, invitationRepo });
    await evidenceRoutes(api, { evidenceService, matchingService });
    await briefRoutes(api, { briefService, researchService, missionRepo, briefRepo });
    await operationsRoutes(api, {
      opsRepo,
      missionRepo,
      sessionRepo,
      evidenceService,
      auditRepo
    });
  }, { prefix: '/api' });

  return app;
}
