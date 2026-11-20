import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import crypto from 'node:crypto';
import { buildApp } from '../src/app.js';
import { FastifyInstance } from 'fastify';

describe('TEST GROUP C: Research Invitation Security & Replay Prevention', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = buildApp({ useMemoryRepo: true, logger: false });
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it('valid invitation token returns study details without internal mission secrets', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/research/invitations/INV-AGRI-081'
    });

    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.success).toBe(true);
    expect(body.invitation.token).toBe('INV-AGRI-081');
    expect(body.invitation.studyTitle).toBeDefined();
    expect(body.invitation.permittedQuestions.length).toBeGreaterThan(0);
    // Ensure sensitive fields are shielded
    expect(body.invitation.missionId).toBeUndefined();
    expect(body.invitation.orgName).toBeUndefined();
    expect(body.invitation.hypothesis).toBeUndefined();
  });

  it('invalid invitation token returns 404', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/research/invitations/INV-NONEXISTENT-999'
    });

    expect(res.statusCode).toBe(404);
    const body = res.json();
    expect(body.success).toBe(false);
    expect(body.error.code).toBe('INVITATION_INVALID');
  });

  it('malformed short token returns 400', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/research/invitations/INV-SHORT'
    });

    expect(res.statusCode).toBe(400);
    const body = res.json();
    expect(body.error.code).toBe('INVALID_TOKEN_FORMAT');
  });

  it('submitting response marks invitation completed and blocks replay attacks', async () => {
    // 1. Submit response with valid active invitation
    const submitRes = await app.inject({
      method: 'POST',
      url: '/api/research/invitations/INV-AGRI-081/responses',
      payload: {
        incidentNarrative: 'Fertilizer delivery was delayed by 5 days during critical sowing window. Local retailer Sharma ji provided temporary bags on credit.',
        existingWorkaround: 'Personal village retailer credit ledger (Khata book)',
        consentStudyProcessing: true,
        consentSanitizedBriefSharing: true,
        consentFollowUpInterview: false
      }
    });

    expect(submitRes.statusCode).toBe(201);
    const submitBody = submitRes.json();
    expect(submitBody.success).toBe(true);
    expect(submitBody.sessionId).toBeDefined();

    // 2. Attempt replay on the same invitation token
    const replayRes = await app.inject({
      method: 'POST',
      url: '/api/research/invitations/INV-AGRI-081/responses',
      payload: {
        incidentNarrative: 'Replay attempt text trying to submit a second response using same token.',
        existingWorkaround: 'Manual paper register workaround',
        consentStudyProcessing: true
      }
    });

    expect([400, 409]).toContain(replayRes.statusCode); // Blocks replay with client error
    const replayBody = replayRes.json();
    expect(replayBody.error.message).toContain('already been completed and cannot be replayed');

    // 3. GET on the completed invitation token returns 410 Gone
    const getRes = await app.inject({
      method: 'GET',
      url: '/api/research/invitations/INV-AGRI-081'
    });

    expect(getRes.statusCode).toBe(410);
    const getBody = getRes.json();
    expect(getBody.error.code).toBe('INVITATION_ALREADY_COMPLETED');
  });
});
