import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { buildApp } from '../src/app.js';
import { FastifyInstance } from 'fastify';
import { FirebaseAuthService } from '../src/services/auth.service.js';

describe('TEST GROUP D: Consent Architecture & Privacy Isolation', () => {
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

  it('rejects participant submission when mandatory studyProcessing consent is missing', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/research/invitations/INV-AGRI-081/responses',
      payload: {
        incidentNarrative: 'Valid incident narrative describing operational procurement difficulty in detail.',
        existingWorkaround: 'Using paper notebook',
        consentStudyProcessing: false // Missing required consent
      }
    });

    expect(res.statusCode).toBe(400);
    const body = res.json();
    expect(body.success).toBe(false);
    expect(JSON.stringify(body)).toContain('consent is required');
  });

  it('optional consents default to false if not explicitly selected', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/research/invitations/INV-AGRI-081/responses',
      payload: {
        incidentNarrative: 'Valid incident narrative describing operational procurement difficulty in detail.',
        existingWorkaround: 'Using paper notebook',
        consentStudyProcessing: true
        // Omitted optional consents
      }
    });

    expect(res.statusCode).toBe(201);
    const body = res.json();
    expect(body.success).toBe(true);
    expect(body.consentRecorded.studyProcessing).toBe(true);
    expect(body.consentRecorded.sanitizedBriefSharing).toBe(false);
    expect(body.consentRecorded.followUpInterview).toBe(false);
    expect(body.consentRecorded.futurePilotParticipation).toBe(false);
  });

  it('private participant contact info is segregated and never exposed in brief', async () => {
    const briefRes = await app.inject({
      method: 'GET',
      url: '/api/missions/MSN-2026-081/brief',
      headers: {
        authorization: `Bearer ${testToken}`
      }
    });

    expect(briefRes.statusCode).toBe(200);
    const briefBody = briefRes.json();
    const briefStr = JSON.stringify(briefBody);

    // Verify raw email or phone numbers are never embedded in the brief deliverable
    expect(briefStr).not.toContain('farmer.401@example.in');
    expect(briefStr).not.toContain('+91');
  });
});
