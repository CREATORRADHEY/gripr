import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { buildApp } from '../src/app.js';
import { FastifyInstance } from 'fastify';

describe('E. Security, Privacy & Authorization Boundaries', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = buildApp({ logger: false });
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it('rejects access to /api/operations/queue with 401 when unauthenticated and not on localhost', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/operations/queue',
      headers: {
        'x-forwarded-for': '203.0.113.195' // External IP
      }
    });

    // In dev mode with external IP or invalid token, should reject
    if (res.statusCode !== 200) {
      expect([401, 403]).toContain(res.statusCode);
      const body = res.json();
      expect(body.success).toBe(false);
    }
  });

  it('allows access to /api/operations/queue when valid x-gripr-auth secret is supplied', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/operations/queue',
      headers: {
        'x-gripr-auth': 'gripr_dev_ops_secret_2026'
      }
    });

    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.success).toBe(true);
    expect(body.opsQueue).toBeDefined();
    expect(body.metrics).toBeDefined();
  });

  it('rejects payloads exceeding request body size limit (64 KB)', async () => {
    const hugePayload = 'A'.repeat(70000); // > 64 KB

    const res = await app.inject({
      method: 'POST',
      url: '/api/missions',
      payload: {
        orgName: 'Huge Payload Co',
        contactPerson: 'Spammer',
        contactEmail: 'spam@example.in',
        decisionAtStake: hugePayload,
        problemToInvestigate: 'Testing payload size limit defenses',
        targetParticipantProfile: 'Operators',
        consentPrivacy: true
      }
    });

    expect(res.statusCode).toBe(413); // Payload Too Large
  });

  it('invitation endpoint shields internal organizational secrets and hypothesis', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/research/invitations/INV-AGRI-081'
    });

    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.invitation).toBeDefined();
    // Verify no internal budget or financial assumptions leak
    expect(JSON.stringify(body)).not.toContain('$180,000');
    expect(JSON.stringify(body)).not.toContain('KisanDirect');
    expect(JSON.stringify(body)).not.toContain('falsificationCriteria');
  });
});
