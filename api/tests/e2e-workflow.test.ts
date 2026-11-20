import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { buildApp } from '../src/app.js';
import { FirebaseAuthService } from '../src/services/auth.service.js';
import { FastifyInstance } from 'fastify';

describe('TEST GROUP F: Comprehensive 14-Step B2B Workflow Contract', () => {
  let app: FastifyInstance;

  // State carried across the 14-step workflow
  let inquiryId: string;
  let missionId: string;
  let invitationToken: string;
  let sessionId: string;
  let analysisId: string;
  let briefId: string;
  let orgId: string;

  let researcherToken: string;
  let orgUserToken: string;
  let unrelatedOrgToken: string;

  beforeAll(async () => {
    app = buildApp({ useMemoryRepo: true, logger: false });
    await app.ready();

    // Set up tokens
    researcherToken = FirebaseAuthService.createTestToken({
      uid: 'lead-researcher',
      email: 'lead.researcher@gripr.studio',
      role: 'RESEARCHER'
    });

    orgId = 'ORG-SOLARCOLD-NASHIK';
    orgUserToken = FirebaseAuthService.createTestToken({
      uid: 'rohan-solarcold',
      email: 'rohan@solarcold.test',
      role: 'ORGANIZATION_USER',
      organizationId: orgId
    });

    unrelatedOrgToken = FirebaseAuthService.createTestToken({
      uid: 'competitor-user',
      email: 'competitor@unrelated.test',
      role: 'ORGANIZATION_USER',
      organizationId: 'ORG-UNRELATED-COMPETITOR'
    });
  });

  afterAll(async () => {
    await app.close();
  });

  // Step 1: Health check (Homepage API connectivity check)
  it('Step 1: System health verification', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/health' });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.status).toBe('ok');
    expect(body.service).toBe('gripr-problem-intelligence-api');
  });

  // Step 2 & 3: Start and submit public research mission inquiry
  it('Step 2 & 3: Submit research mission inquiry via POST /api/mission-inquiries', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/mission-inquiries',
      payload: {
        orgName: 'SolarCold Logistics Ltd',
        contactPerson: 'Rohan Mehra',
        contactEmail: 'rohan@solarcold.test',
        role: 'Head of Rural Strategy',
        sector: 'cold-chain',
        decisionAtStake: 'Should we allocate $240,000 to construct micro-hub cold rooms in Nashik onion mandis?',
        hypothesis: 'Smallholder onion farmers will pay a ₹15/crate daily fee to avoid distress selling during price crashes.',
        falsificationCriteria: 'Falsified if mandi commission agents control transport vehicles and mandate immediate distress sales.',
        targetParticipantProfile: 'Nashik onion cultivators (3-8 acres) selling at Lasalgaon mandi',
        industry: 'Perishable Agri-Logistics',
        geography: 'Maharashtra (Nashik cluster)',
        constraints: 'Interviews must be conducted in Marathi / Hindi',
        consentContact: true,
        consentPrivacy: true
      }
    });

    expect(res.statusCode).toBe(201);
    const body = res.json();
    expect(body.success).toBe(true);
    expect(body.inquiryId).toBeDefined();
    expect(body.status).toBe('AWAITING_SCOPE_REVIEW');

    inquiryId = body.inquiryId;
  });

  // Step 4: Confirm actual backend persistence
  it('Step 4: Confirm inquiry persistence in repository', async () => {
    const res = await app.inject({
      method: 'GET',
      url: `/api/mission-inquiries/${inquiryId}`,
      headers: { authorization: `Bearer ${researcherToken}` }
    });

    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.success).toBe(true);
    expect(body.inquiry.id).toBe(inquiryId);
    expect(body.inquiry.orgName).toBe('SolarCold Logistics Ltd');
  });

  // Step 5 & 6: Authenticated researcher reviews mission inquiry queue
  it('Step 5 & 6: Researcher reviews incoming inquiries', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/mission-inquiries',
      headers: { authorization: `Bearer ${researcherToken}` }
    });

    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.success).toBe(true);
    expect(body.inquiries.some((inq: any) => inq.id === inquiryId)).toBe(true);
  });

  // Step 7: Convert inquiry to formal research mission
  it('Step 7: Researcher approves inquiry and converts to scoped mission', async () => {
    const res = await app.inject({
      method: 'POST',
      url: `/api/mission-inquiries/${inquiryId}/convert`,
      headers: { authorization: `Bearer ${researcherToken}` }
    });

    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.success).toBe(true);
    expect(body.missionId).toBeDefined();
    expect(body.missionId).toMatch(/^MSN-2026-\d+$/);

    missionId = body.missionId;
    invitationToken = body.invitationToken;

    // Fetch the newly created mission to retrieve the generated invitation token
    const missionRes = await app.inject({
      method: 'GET',
      url: `/api/missions/${missionId}`,
      headers: { authorization: `Bearer ${researcherToken}` }
    });
    expect(missionRes.statusCode).toBe(200);
    const missionBody = missionRes.json();
    // Update orgId to match generated mission organizationId
    orgId = missionBody.mission.organizationId;
    orgUserToken = FirebaseAuthService.createTestToken({
      uid: 'rohan-solarcold',
      email: 'rohan@solarcold.test',
      role: 'ORGANIZATION_USER',
      organizationId: orgId
    });
  });

  // Step 8: Submit consented participant evidence
  it('Step 8: Screened participant submits firsthand operational evidence', async () => {
    expect(invitationToken).toBeDefined();

    const res = await app.inject({
      method: 'POST',
      url: `/api/research/invitations/${invitationToken}/responses`,
      payload: {
        incidentNarrative: 'Mandi ke commission agent gadi bhejte hain khet par. Unka advance loan hota hai 50 hazar ka, isliye hum unhi ko bechte hain. Cold room me rakh bhi liya toh transport ka kharcha badh jayega.',
        existingWorkaround: 'Selling immediately to money-lender commission agent at Lasalgaon gate',
        role: 'Onion Cultivator (5 Acres)',
        location: 'Lasalgaon, Nashik',
        language: 'Marathi / Hindi',
        consentStudyProcessing: true,
        consentSanitizedBriefSharing: true,
        consentFollowUpInterview: false
      }
    });

    expect(res.statusCode).toBe(201);
    const body = res.json();
    expect(body.success).toBe(true);
    expect(body.sessionId).toBeDefined();

    sessionId = body.sessionId;
  });

  // Step 9: Trigger Gemini extraction
  it('Step 9: Trigger Gemini evidence extraction for recorded session', async () => {
    const res = await app.inject({
      method: 'POST',
      url: `/api/research/responses/${sessionId}/analyze`,
      headers: { authorization: `Bearer ${researcherToken}` }
    });

    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.success).toBe(true);
    expect(body.analysisId).toBeDefined();
    expect(body.extraction).toBeDefined();
    expect(body.extraction.currentWorkaround).toBeDefined();

    analysisId = body.analysisId;
  });

  // Step 10: Review extracted evidence
  it('Step 10: Researcher moderates and reviews extracted evidence', async () => {
    const res = await app.inject({
      method: 'POST',
      url: `/api/operations/evidence/${analysisId}/review`,
      headers: { authorization: `Bearer ${researcherToken}` },
      payload: {
        decision: 'approve',
        notes: 'Verbatim quotes verified against Marathi narrative. Distress credit mechanism confirmed.'
      }
    });

    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.success).toBe(true);
    expect(body.decision).toBe('approve');
  });

  // Step 11: Generate draft Decision Brief
  it('Step 11: Generate draft Decision Intelligence Brief', async () => {
    const res = await app.inject({
      method: 'POST',
      url: `/api/missions/${missionId}/brief/generate`,
      headers: { authorization: `Bearer ${researcherToken}` }
    });

    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.success).toBe(true);
    expect(body.status).toBe('DRAFT — REQUIRES HUMAN REVIEW');
    expect(body.brief.recommendation).toBeDefined();

    briefId = body.briefId;
  });

  // Guard: Organization cannot access unapproved draft brief
  it('Step 11b: Organization user is blocked from viewing unapproved draft brief (403)', async () => {
    const res = await app.inject({
      method: 'GET',
      url: `/api/missions/${missionId}/brief`,
      headers: { authorization: `Bearer ${orgUserToken}` }
    });

    expect(res.statusCode).toBe(403);
    const body = res.json();
    expect(body.error.code).toBe('BRIEF_UNAPPROVED');
  });

  // Step 12: Human researcher approves the brief
  it('Step 12: Lead researcher authorizes and approves the brief', async () => {
    const res = await app.inject({
      method: 'POST',
      url: `/api/missions/${missionId}/brief/approve`,
      headers: { authorization: `Bearer ${researcherToken}` },
      payload: {
        approvedBy: 'Senior Research Architect'
      }
    });

    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.success).toBe(true);
    expect(body.status).toBe('APPROVED');
    expect(body.approvedBy).toBe('Senior Research Architect');
  });

  // Step 13: Authorized organization opens the approved brief
  it('Step 13: Authorized organization opens published Decision Intelligence Brief', async () => {
    const res = await app.inject({
      method: 'GET',
      url: `/api/missions/${missionId}/brief`,
      headers: { authorization: `Bearer ${orgUserToken}` }
    });

    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.success).toBe(true);
    expect(body.brief.status).toBe('APPROVED');
    expect(body.brief.recommendation).toBeDefined();
    expect(body.brief.executiveSummary).toBeDefined();
  });

  // Step 14: Unrelated organization user is blocked from viewing it (Tenant Isolation)
  it('Step 14: Unrelated organization is blocked from accessing the brief (403)', async () => {
    const res = await app.inject({
      method: 'GET',
      url: `/api/missions/${missionId}/brief`,
      headers: { authorization: `Bearer ${unrelatedOrgToken}` }
    });

    expect(res.statusCode).toBe(403);
    const body = res.json();
    expect(body.error.code).toBe('FORBIDDEN_CROSS_ORG');
  });
});
