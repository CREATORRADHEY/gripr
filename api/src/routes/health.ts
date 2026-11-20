import { FastifyInstance } from 'fastify';
import { geminiService } from '../services/gemini.service.js';
import { env } from '../config/env.js';

export async function healthRoutes(fastify: FastifyInstance) {
  fastify.get('/health', async (request, reply) => {
    let persistenceInfo;
    if (env.isCloudFirestore) {
      persistenceInfo = {
        engine: 'CLOUD_FIRESTORE',
        description: `Google Cloud Firestore Native Mode (${env.FIREBASE_PROJECT_ID})`,
        isCloudFirestore: true,
        isEmulator: false,
        durabilityNotice: 'Production persistence: inquiries and research entities persist directly to Google Cloud Firestore.'
      };
    } else if (env.isDemoOnly) {
      persistenceInfo = {
        engine: 'DEMO_ONLY',
        description: 'Safe container demo-only mode. Precomputed walkthrough runs fully; live database mutations return 503.',
        isCloudFirestore: false,
        isEmulator: false,
        durabilityNotice: 'Zero persistent storage overhead. Safe for free trial / ephemeral container hosting.'
      };
    } else if (env.PERSISTENCE_MODE === 'memory') {
      persistenceInfo = {
        engine: 'IN_MEMORY',
        description: 'In-memory ephemeral storage for isolated automated testing.',
        isCloudFirestore: false,
        isEmulator: false,
        durabilityNotice: 'Ephemeral test storage.'
      };
    } else {
      persistenceInfo = {
        engine: 'LOCAL_FILE_STORAGE',
        description: 'Local disk / file-backed JSON storage (simulating Firestore collection/document model)',
        isCloudFirestore: false,
        isEmulator: false,
        durabilityNotice: 'Durability operates via local atomic file writes in api/data/firestore. Not connected to production Google Cloud Firestore.'
      };
    }

    return reply.status(200).send({
      status: 'ok',
      service: 'gripr-problem-intelligence-api',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      environment: env.NODE_ENV,
      persistence: persistenceInfo,
      auth: {
        provider: 'Firebase Admin SDK',
        verification: 'Official Firebase Admin verifyIdToken()',
        hs256AllowedInProduction: false
      },
      gemini: {
        configured: geminiService.isAvailable(),
        model: geminiService.getModelName(),
        processingMode: geminiService.getProcessingMode()
      },
      commercialNotice: 'Phase 3 Persistent API. Experimental pilot research model.'
    });
  });
}
