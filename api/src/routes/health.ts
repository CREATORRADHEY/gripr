import { FastifyInstance } from 'fastify';
import { geminiService } from '../services/gemini.service.js';
import { env } from '../config/env.js';

export async function healthRoutes(fastify: FastifyInstance) {
  fastify.get('/health', async (request, reply) => {
    return reply.status(200).send({
      status: 'ok',
      service: 'gripr-problem-intelligence-api',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      environment: env.NODE_ENV,
      persistence: {
        engine: 'LOCAL_FILE_STORAGE',
        description: 'Local disk / file-backed JSON storage (simulating Firestore collection/document model)',
        isCloudFirestore: false,
        isEmulator: false,
        durabilityNotice: 'Durability operates via local atomic file writes in api/data/firestore. Not connected to production Google Cloud Firestore.'
      },
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
