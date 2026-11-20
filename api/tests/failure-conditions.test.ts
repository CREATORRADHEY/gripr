import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { buildApp } from '../src/app.js';
import { FastifyInstance } from 'fastify';
import { FirebaseAuthService } from '../src/services/auth.service.js';

describe('TEST GROUP G: Failure Conditions, Edge Cases & Boundary Auditing', () => {
  let app: FastifyInstance;
  let testToken: string;

  beforeAll(async () => {
    app = buildApp({ useMemoryRepo: true, logger: false });
    await app.ready();
    testToken = FirebaseAuthService.createTestToken({
      uid: 'reviewer-test-user',
      role: 'RESEARCHER'
    });
  });

  afterAll(async () => {
    await app.close();
  });

  it('rejects oversized payload exceeding 64KB with 413 Payload Too Large', async () => {
    const hugeNarrative = 'A'.repeat(70000);
    const res = await app.inject({
      method: 'POST',
      url: '/api/mission-inquiries',
      payload: {
        orgName: 'Huge Corp',
        contactPerson: 'Tester',
        contactEmail: 'test@huge.test',
        decisionAtStake: hugeNarrative,
        hypothesis: 'Test hypothesis',
        falsificationCriteria: 'Test falsification',
        targetParticipantProfile: 'Operators',
        consentContact: true,
        consentPrivacy: true
      }
    });

    expect(res.statusCode).toBe(413);
  });

  it('rejects mission inquiry missing contact consent with 400 validation error', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/mission-inquiries',
      payload: {
        orgName: 'Valid Corp',
        contactPerson: 'Valid Person',
        contactEmail: 'person@valid.test',
        decisionAtStake: 'Valid decision at stake with at least twenty characters.',
        hypothesis: 'Valid hypothesis text',
        falsificationCriteria: 'Valid falsification text',
        targetParticipantProfile: 'Valid operator profile',
        consentContact: false, // Refused consent
        consentPrivacy: true
      }
    });

    expect(res.statusCode).toBe(400);
    const body = res.json();
    expect(body.success).toBe(false);
    expect(JSON.stringify(body)).toContain('consent');
  });

  it('blocks brief generation for a mission with zero recorded sessions', async () => {
    // 1. Create a fresh mission with no participant sessions
    const missionRes = await app.inject({
      method: 'POST',
      url: '/api/missions',
      payload: {
        orgName: 'Empty Mission Inc',
        contactPerson: 'Jane Doe',
        contactEmail: 'jane@empty.test',
        decisionAtStake: 'Should we build an internal ticketing platform for field techs?',
        problemToInvestigate: 'Field technician communication latency during peak periods.',
        targetParticipantProfile: 'Field service technicians',
        consentPrivacy: true
      }
    });
    const { missionId } = missionRes.json();

    // 2. Attempt to generate brief immediately
    const res = await app.inject({
      method: 'POST',
      url: `/api/missions/${missionId}/brief/generate`,
      headers: {
        authorization: `Bearer ${testToken}`
      }
    });

    expect(res.statusCode).toBe(500); // Throws domain error
    const body = res.json();
    expect(body.error.message).toContain('No participant research sessions recorded yet');
  });

  it('rejects non-existent session analysis with 404', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/research/responses/SES-NONEXISTENT-999/analysis',
      headers: {
        authorization: `Bearer ${testToken}`
      }
    });

    expect(res.statusCode).toBe(404);
    const body = res.json();
    expect(body.error.code).toBe('ANALYSIS_NOT_FOUND');
  });
});
