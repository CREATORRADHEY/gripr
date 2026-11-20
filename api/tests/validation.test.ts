import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { buildApp } from '../src/app.js';
import { FastifyInstance } from 'fastify';

describe('A. API Validation & Public Endpoints', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = buildApp({ logger: false });
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /api/health returns 200 and operational envelope', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/health'
    });

    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.status).toBe('ok');
    expect(body.service).toBe('gripr-problem-intelligence-api');
    expect(body.gemini).toBeDefined();
    expect(body.gemini.model).toBeDefined();
    expect(body.commercialNotice).toContain('Experimental pilot research model');
  });

  it('POST /api/missions validates required fields and rejects short strings', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/missions',
      payload: {
        orgName: 'A', // too short
        contactPerson: '',
        contactEmail: 'not-an-email',
        decisionAtStake: 'Short', // min 20
        problemToInvestigate: 'Short',
        targetParticipantProfile: '',
        consentPrivacy: false // must be true
      }
    });

    expect(res.statusCode).toBe(400);
    const body = res.json();
    expect(body.success).toBe(false);
    expect(body.error.code).toBe('VALIDATION_ERROR');
    expect(body.error.details.some((d: any) => d.field === 'contactEmail')).toBe(true);
    expect(body.error.details.some((d: any) => d.field === 'consentPrivacy')).toBe(true);
  });

  it('POST /api/missions creates a new mission with valid inputs and returns request ID', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/missions',
      payload: {
        orgName: 'AgroLogix Solutions Ltd',
        contactPerson: 'Meera Deshmukh',
        contactEmail: 'meera@agrologix-test.in',
        role: 'Head of Product',
        sector: 'agritech',
        decisionAtStake: 'Should we engineer an on-demand refrigerated cold-chain truck reservation app for peri-urban strawberry growers?',
        hypothesis: 'Strawberry growers will pay ₹800 per booking fee for guaranteed same-day refrigerated dispatch to urban wholesale markets.',
        falsificationCriteria: 'Falsified if farmers aggregate produce into uncooled shared tempos and accept spoilage losses as cheaper than fixed booking fees.',
        problemToInvestigate: 'Last-mile cold chain logistics and perishability loss management among Western Maharashtra smallholder horticulture clusters.',
        targetParticipantProfile: 'Strawberry / Grape growers cultivating 3-10 acres in Nashik / Mahabaleshwar clusters.',
        industry: 'Agricultural Cold Chain & Logistics',
        geography: 'Maharashtra (Nashik cluster)',
        urgency: 'Medium (6-8 weeks)',
        constraints: 'Must capture Marathi and Hinglish vernacular nuances.',
        deliverables: ['Decision Intelligence Brief', 'Workflow Friction Map'],
        consentPrivacy: true
      }
    });

    expect(res.statusCode).toBe(201);
    const body = res.json();
    expect(body.success).toBe(true);
    expect(body.missionId).toMatch(/^MSN-2026-\d+$/);
    expect(body.status).toBe('Requested');
    expect(body.pricingNotice).toBeDefined();
  });

  it('GET /api/research/invitations/:token returns 404 for invalid token', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/research/invitations/INVALID-NONEXISTENT-TOKEN'
    });

    expect(res.statusCode).toBe(404);
    const body = res.json();
    expect(body.success).toBe(false);
    expect(body.error.code).toBe('INVITATION_INVALID');
  });

  it('GET /api/research/invitations/:token returns minimum study description without leaking mission secrets', async () => {
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
    expect(body.invitation.honorarium).toBeDefined();
    // Verify internal mission hypothesis & org name are NOT leaked to participant endpoint
    expect(body.invitation.orgName).toBeUndefined();
    expect(body.invitation.hypothesis).toBeUndefined();
    expect(body.invitation.decisionAtStake).toBeUndefined();
  });

  it('POST /api/research/invitations/:token/responses strictly requires consentStudyProcessing', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/research/invitations/INV-AGRI-081/responses',
      payload: {
        incidentNarrative: 'Last week during harvest our tractor broke down and we had no way to move bags.',
        existingWorkaround: 'Called neighbor to borrow bullock cart.',
        consentStudyProcessing: false // PROHIBITED!
      }
    });

    expect(res.statusCode).toBe(400);
    const body = res.json();
    expect(body.success).toBe(false);
    expect(body.error.details.some((d: any) => d.field === 'consentStudyProcessing')).toBe(true);
  });

  it('POST /api/research/invitations/:token/responses records valid response with separate optional consents', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/research/invitations/INV-AGRI-081/responses',
      payload: {
        incidentNarrative: 'Sowing ke time par humne do dukan par check kiya. Sharma ji ne udhaar diya par bag ka ₹80 jyada liya. Agar turant cash hota toh mandi se sasta laate, par fasal bikne se pehle cash nahi hota.',
        affectedWorkflow: 'Peak sowing input financing and procurement',
        triggeringEvent: 'Monsoon onset requiring rapid 48-hour planting',
        operationalImpact: '₹80 extra per bag paid for credit',
        existingWorkaround: 'Village store credit ledger (khata book)',
        frequency: 'Seasonal (twice a year)',
        financialImpact: '₹80 premium per bag',
        role: 'Smallholder Farmer (3.5 Acres)',
        location: 'Bulandshahr, Uttar Pradesh',
        language: 'Hindi / Hinglish',
        consentStudyProcessing: true,
        consentSanitizedBriefSharing: true,
        consentFollowUpInterview: false
      }
    });

    expect(res.statusCode).toBe(201);
    const body = res.json();
    expect(body.success).toBe(true);
    expect(body.sessionId).toMatch(/^SES-\d+$/);
    expect(body.status).toBe('Recorded');
    expect(body.consentRecorded.studyProcessing).toBe(true);
    expect(body.consentRecorded.followUpInterview).toBe(false);
  });
});
