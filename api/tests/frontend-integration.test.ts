import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { buildApp } from '../src/app.js';
import { FastifyInstance } from 'fastify';

describe('F. Frontend Integration & End-to-End Workflow Contract', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = buildApp({ logger: false });
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it('Flow 1: Organization scopes a mission via POST /api/missions', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/missions',
      payload: {
        orgName: 'LogiCold Logistics Ltd',
        contactPerson: 'Sanjay Verma',
        contactEmail: 'sanjay@logicold.in',
        role: 'Director of Logistics',
        sector: 'logistics',
        decisionAtStake: 'Should we build an automated cold-van dispatch platform for small mango exporters in Ratnagiri?',
        hypothesis: 'Alphonso mango exporters will adopt a shared van booking app to cut transit spoilage by 25%.',
        falsificationCriteria: 'Falsified if exporters prefer existing personal relationships with tempo drivers who offer credit and help load crates.',
        problemToInvestigate: 'Transit temperature monitoring and export crate handling friction in coastal Konkan belt.',
        targetParticipantProfile: 'Commercial mango exporters shipping 500+ crates per season.',
        consentPrivacy: true
      }
    });

    expect(res.statusCode).toBe(201);
    const body = res.json();
    expect(body.success).toBe(true);
    expect(body.missionId).toBeDefined();
    expect(body.status).toBe('Requested');
  });

  it('Flow 2: Invited participant submits qualitative response via POST /api/research/invitations/:token/responses', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/research/invitations/INV-AGRI-081/responses',
      payload: {
        incidentNarrative: 'Aam ki peti mandi bhejte waqt tempo wala late aaya. AC nahi tha toh 15% aam dab gaya. Sharma ji ko bol kar dusra tempo mangwaya.',
        affectedWorkflow: 'Perishable produce dispatch',
        existingWorkaround: 'Calling local tempo broker via phone',
        role: 'Commercial Mango Grower',
        location: 'Ratnagiri, Maharashtra',
        consentStudyProcessing: true,
        consentSanitizedBriefSharing: true
      }
    });

    expect(res.statusCode).toBe(201);
    const body = res.json();
    expect(body.success).toBe(true);
    expect(body.sessionId).toBeDefined();
    expect(body.status).toBe('Recorded');
  });

  it('Flow 3: Research team triggers Gemini extraction via POST /api/research/responses/:id/analyze', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/research/responses/SES-401/analyze',
      headers: {
        'x-gripr-auth': 'gripr_dev_ops_secret_2026'
      }
    });

    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.success).toBe(true);
    expect(body.analysisId).toBeDefined();
    expect(body.validation.valid).toBe(true);
    expect(body.extraction.reportedProblem).toBeDefined();
  });

  it('Flow 4: Research team triggers cross-participant analysis via POST /api/research/missions/:id/cross-analysis', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/research/missions/MSN-2026-081/cross-analysis',
      headers: {
        'x-gripr-auth': 'gripr_dev_ops_secret_2026'
      }
    });

    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.success).toBe(true);
    expect(body.synthesis.observedClusters.length).toBeGreaterThan(0);
    expect(body.synthesis.identifiedContradictions.length).toBeGreaterThan(0);
  });

  it('Flow 5: Research team generates draft Decision Brief via POST /api/missions/:id/brief/generate', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/missions/MSN-2026-081/brief/generate',
      headers: {
        'x-gripr-auth': 'gripr_dev_ops_secret_2026'
      }
    });

    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.success).toBe(true);
    expect(body.brief.status).toBe('DRAFT — REQUIRES HUMAN REVIEW');
    expect(body.brief.recommendation).toBeDefined();
  });

  it('Flow 6: Error display — API never disguises backend failures as fake success', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/research/responses/NON-EXISTENT-SESSION/analysis',
      headers: {
        'x-gripr-auth': 'gripr_dev_ops_secret_2026'
      }
    });

    expect(res.statusCode).toBe(404);
    const body = res.json();
    expect(body.success).toBe(false);
    expect(body.error.code).toBe('ANALYSIS_NOT_FOUND');
  });
});
