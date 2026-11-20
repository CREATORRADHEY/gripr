import { FastifyInstance } from 'fastify';
import {
  IOperationsRepository,
  IMissionRepository,
  IResearchResponseRepository,
  IAuditLogRepository
} from '../repositories/interfaces.js';
import { EvidenceService } from '../services/evidence.service.js';
import { requireResearcherOrAdmin } from '../middleware/authorization.js';
import { z } from 'zod';

export async function operationsRoutes(
  fastify: FastifyInstance,
  options: {
    opsRepo: IOperationsRepository;
    missionRepo: IMissionRepository;
    sessionRepo: IResearchResponseRepository;
    evidenceService: EvidenceService;
    auditRepo?: IAuditLogRepository;
  }
) {
  const { opsRepo, missionRepo, sessionRepo, evidenceService, auditRepo } = options;

  // 1. GET RESEARCH OPERATIONS QUEUE (Protected internal workbench)
  fastify.get('/operations/queue', {
    preHandler: [requireResearcherOrAdmin]
  }, async (request, reply) => {
    const queue = await opsRepo.getQueue();
    const missions = await missionRepo.findAll();

    const pendingReviews = queue.filter(q => q.status === 'pending').length;
    const activeMissions = missions.filter(m => m.status !== 'Closed').length;
    const completedBriefs = missions.filter(m => m.status === 'Brief Ready').length;

    return reply.status(200).send({
      success: true,
      opsQueue: queue,
      missions,
      metrics: {
        activeMissions,
        pendingReviews,
        completedBriefs,
        totalOperationsLogged: queue.length
      }
    });
  });

  // 2. MODERATE / REVIEW EVIDENCE OR OPS TASK
  fastify.post('/operations/evidence/:id/review', {
    preHandler: [requireResearcherOrAdmin]
  }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const schema = z.object({
      decision: z.enum(['approve', 'flag', 'reject']),
      notes: z.string().optional()
    });
    const { decision, notes } = schema.parse(request.body || {});

    // Update ops queue item
    const queueStatus = decision === 'approve' ? 'reviewed' : (decision === 'flag' ? 'flagged' : 'rejected');
    const updated = await opsRepo.updateItem(id, queueStatus, notes || `Moderated as ${decision}`);

    if (auditRepo) {
      await auditRepo.log(
        'EVIDENCE_REVIEWED',
        request.user?.uid || 'RESEARCHER',
        'RESEARCHER',
        id,
        'evidence_task',
        { decision, notes }
      );
    }

    return reply.status(200).send({
      success: true,
      taskId: id,
      decision,
      status: queueStatus,
      message: `Operations task ${id} status updated to ${queueStatus}.`
    });
  });

  // 3. AUDIT LOGS RETRIEVAL (Auditor / Admin Only)
  fastify.get('/operations/audit-logs', {
    preHandler: [requireResearcherOrAdmin]
  }, async (request, reply) => {
    if (!auditRepo) {
      return reply.status(200).send({ success: true, logs: [] });
    }

    const logs = await auditRepo.getLogs(150);
    return reply.status(200).send({
      success: true,
      count: logs.length,
      logs
    });
  });
}
