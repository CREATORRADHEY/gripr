import Fastify, { FastifyInstance } from 'fastify';
import fs from 'node:fs';
import path from 'node:path';
import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import sensible from '@fastify/sensible';
import fastifyStatic from '@fastify/static';
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
  CloudFirestoreMissionInquiryRepository,
  DemoOnlyMissionInquiryRepository,
  FirestoreMissionRepository,
  FirestoreInvitationRepository,
  FirestoreResearchResponseRepository,
  FirestoreEvidenceRepository,
  FirestoreBriefRepository,
  FirestoreConsentRepository,
  FirestoreAuditLogRepository,
  FirestoreOperationsRepository
} from './repositories/firestore.repository.js';
import { GeminiService, geminiService } from './services/gemini.service.js';
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
import { demoRoutes } from './routes/demo.js';

export interface AppOptions {
  logger?: boolean | object;
  useMemoryRepo?: boolean;
  geminiService?: GeminiService;
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

  // CORS (Support split hosting across Cloudflare Pages, Railway, Render, and Local Dev)
  app.register(cors, {
    origin: (origin, cb) => {
      if (!origin) return cb(null, true);
      // Loopback origins for development / testing
      if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
        return cb(null, true);
      }
      // Explicitly allowed origins from environment
      if (env.ALLOWED_ORIGINS.includes(origin) || env.ALLOWED_ORIGINS.includes('*')) {
        return cb(null, true);
      }
      // Cloudflare Pages deployments (*.pages.dev / custom domain patterns)
      if (/^https:\/\/[a-z0-9_-]+\.pages\.dev$/i.test(origin)) {
        return cb(null, true);
      }
      // Railway service domains (*.railway.app / *.up.railway.app)
      if (/^https:\/\/[a-z0-9_.-]+\.railway\.app$/i.test(origin)) {
        return cb(null, true);
      }
      // Render service domains (*.onrender.com)
      if (/^https:\/\/[a-z0-9_.-]+\.onrender\.com$/i.test(origin)) {
        return cb(null, true);
      }
      return cb(new Error('CORS origin not allowed by policy'), false);
    },
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
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
  
  let inquiryRepo: any;
  if (useMemory) {
    inquiryRepo = new MemoryMissionInquiryRepository();
  } else if (env.PERSISTENCE_MODE === 'demo_only') {
    inquiryRepo = new DemoOnlyMissionInquiryRepository();
  } else if (env.PERSISTENCE_MODE === 'cloud_firestore') {
    try {
      inquiryRepo = new CloudFirestoreMissionInquiryRepository();
    } catch (err) {
      console.warn('⚠️ Cloud Firestore could not be initialized, falling back to DEMO_ONLY mode:', err);
      inquiryRepo = new DemoOnlyMissionInquiryRepository();
    }
  } else {
    inquiryRepo = new FirestoreMissionInquiryRepository(globalFirestoreStorage);
  }

  const invitationRepo = useMemory ? memoryInvitationRepo : new FirestoreInvitationRepository(globalFirestoreStorage);
  const sessionRepo = useMemory ? memorySessionRepo : new FirestoreResearchResponseRepository(globalFirestoreStorage);
  const evidenceRepo = useMemory ? memoryEvidenceRepo : new FirestoreEvidenceRepository(globalFirestoreStorage);
  const briefRepo = useMemory ? memoryBriefRepo : new FirestoreBriefRepository(globalFirestoreStorage);
  const consentRepo = useMemory ? new MemoryConsentRepository() : new FirestoreConsentRepository(globalFirestoreStorage);
  const auditRepo = useMemory ? new MemoryAuditLogRepository() : new FirestoreAuditLogRepository(globalFirestoreStorage);
  const opsRepo = useMemory ? memoryOpsRepo : new FirestoreOperationsRepository(globalFirestoreStorage);

  const activeGeminiService = options.geminiService ?? geminiService;

  // Instantiate services with repositories
  const researchService = new ResearchService(
    missionRepo,
    inquiryRepo,
    invitationRepo,
    sessionRepo,
    consentRepo,
    auditRepo
  );
  const evidenceService = new EvidenceService(evidenceRepo, sessionRepo, activeGeminiService);
  const matchingService = new MatchingService(sessionRepo, activeGeminiService);
  const briefService = new BriefService(briefRepo, missionRepo, sessionRepo, evidenceRepo, activeGeminiService, auditRepo);

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
    await demoRoutes(api, { geminiService: activeGeminiService });
  }, { prefix: '/api' });

  // Serve public frontend through restrictive static-file allowlist (Section 2)
  const candidatePublicDirs = [
    path.resolve(process.cwd(), '../public'),
    path.resolve(process.cwd(), 'public'),
    path.resolve(process.cwd(), '..'),
    process.cwd()
  ];
  const staticRoot = candidatePublicDirs.find(d => fs.existsSync(path.join(d, 'index.html')));

  if (staticRoot && env.SERVE_STATIC) {
    app.register(fastifyStatic, {
      root: staticRoot,
      prefix: '/',
      index: ['index.html'],
      wildcard: false,
      allowedPath(pathname) {
        const normalized = path.normalize(pathname).replace(/\\/g, '/');

        // Disallow hidden files or dotfiles (.env, .git, .vscode, etc.)
        if (/(^|\/)\.[^\/]/.test(normalized)) return false;

        // Disallow internal and sensitive directories/files
        const forbiddenPatterns = [
          'api/',
          '/api/',
          'data/',
          '/data/',
          'dist/',
          'src/',
          'tests/',
          'node_modules',
          'package.json',
          'package-lock.json',
          'pnpm-lock.yaml',
          'tsconfig.json',
          '.env',
          'Dockerfile'
        ];
        for (const pattern of forbiddenPatterns) {
          if (normalized.includes(pattern)) return false;
        }

        const allowedExtensions = [
          '.html', '.css', '.js', '.png', '.jpg', '.jpeg', '.gif',
          '.svg', '.ico', '.woff', '.woff2', '.ttf', '.txt'
        ];
        const ext = path.extname(normalized).toLowerCase();
        return !ext || allowedExtensions.includes(ext);
      }
    });

    // Semantic HTML shortcuts
    app.get('/missions', async (_, reply) => reply.sendFile('missions.html'));
    app.get('/demo', async (_, reply) => reply.sendFile('demo.html'));
    app.get('/brief', async (_, reply) => reply.sendFile('brief.html'));
    app.get('/terms', async (_, reply) => reply.sendFile('terms.html'));
    app.get('/privacy', async (_, reply) => reply.sendFile('privacy.html'));
    app.get('/thankyou', async (_, reply) => reply.sendFile('thankyou.html'));
    app.get('/research-operations-demo', async (_, reply) => reply.sendFile('research-operations-demo.html'));
  }

  return app;
}
