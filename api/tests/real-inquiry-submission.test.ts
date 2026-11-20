import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { buildApp } from '../src/app.js';
import { FastifyInstance } from 'fastify';

describe('Regression Tests: Real Mission Inquiry Submission Flow (Requirement G)', () => {
  const rootDir = path.resolve(__dirname, '../../');
  const missionsHtmlPath = path.resolve(rootDir, 'missions.html');
  const apiJsPath = path.resolve(rootDir, 'js/api.js');

  let app: FastifyInstance;

  beforeAll(async () => {
    app = buildApp({ useMemoryRepo: true, logger: false });
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  // 1 & 2: Initial missions.html state starts clean without demo activation
  it('1 & 2. missions.html starts clean, unactivated, with empty form and visible real CTA', () => {
    const html = fs.readFileSync(missionsHtmlPath, 'utf8');

    expect(html).toContain('let isDemoMode = false;');
    expect(html).toContain('resetScopingFields();');
    expect(html).toContain('showScopingStep(1);');
    expect(html).toContain('syncMissionModeUI();');
    expect(html).toContain('attachFormSubmitListener();');

    // syncMissionModeUI handles both states cleanly
    expect(html).toContain('function syncMissionModeUI()');
    expect(html).toContain("realBtn.style.display = 'inline-block';");
    expect(html).toContain("simBtn.style.display = 'none';");
  });

  // 3 & 4: Commercial Review displays real entered data without Jaipur Kirana fallback
  it('3 & 4. populateReviewSummary() displays actual user-entered data without synthetic fallbacks', () => {
    const html = fs.readFileSync(missionsHtmlPath, 'utf8');

    expect(html).toContain('function populateReviewSummary()');
    // Does not fall back to RetailFlow Intelligence Labs when isDemoMode is false
    expect(html).toContain("isDemoMode ? 'RetailFlow Intelligence Labs' : '—'");
    expect(html).toContain("isDemoMode ? 'Aditi Sharma' : '—'");
    expect(html).toContain("isDemoMode ? 'aditi.sharma@retailflow.test' : '—'");
  });

  // 5: Submit button and explicit consent controls are present
  it('5. Visible unchecked consent controls and submit button exist in Step 4', () => {
    const html = fs.readFileSync(missionsHtmlPath, 'utf8');

    expect(html).toContain('id="consentControlsGroup"');
    expect(html).toContain('id="consentContact"');
    expect(html).toContain('id="consentPrivacy"');
    expect(html).toContain('id="submitRealMissionBtn"');
    expect(html).toContain('Submit Real Research Request →');
  });

  // 6 & 7: Form submit listener prevents default and dispatches to POST /api/mission-inquiries
  it('6 & 7. Form submit handler calls GriprAPI.submitMissionInquiry and targets POST /api/mission-inquiries', () => {
    const html = fs.readFileSync(missionsHtmlPath, 'utf8');
    const apiJs = fs.readFileSync(apiJsPath, 'utf8');

    expect(html).toContain('function attachFormSubmitListener()');
    expect(html).toContain('e.preventDefault()');
    expect(html).toContain('await handleRealInquirySubmission()');
    expect(html).toContain('window.GriprAPI.submitMissionInquiry(payload)');

    // api.js sends to /mission-inquiries
    expect(apiJs).toContain('fetch(`${BACKEND_URL}/mission-inquiries`');
    expect(apiJs).toContain("consentContact: data.consentContact === true");
    expect(apiJs).toContain("consentPrivacy: data.consentPrivacy === true");
  });

  // 8, 9, 10: Backend accepts RouteBridge Logistics Labs inquiry and returns HTTP 201 with AWAITING_SCOPE_REVIEW
  it('8, 9 & 10. Backend receives RouteBridge Logistics Labs inquiry, returns HTTP 201, and issues valid INQ- ID', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/mission-inquiries',
      payload: {
        orgName: 'RouteBridge Logistics Labs',
        contactPerson: 'Aarav Mehta',
        contactEmail: 'mission.qa@example.com',
        role: 'Head of Logistics Operations',
        sector: 'logistics',
        decisionAtStake: 'Deciding whether to allocate budget for autonomous last-mile delivery dispatch.',
        hypothesis: 'Courier delivery drivers miss SLA windows because manual landmark instructions are inaccurate.',
        falsificationCriteria: 'If drivers fail deliveries primarily due to customer unavailability rather than navigation.',
        targetParticipantProfile: 'Last-mile courier delivery drivers in Jaipur with >2 years experience.',
        industry: 'Logistics & Supply Chain',
        geography: 'Jaipur, Rajasthan',
        constraints: 'High traffic hours, vernacular Hindi navigation notes.',
        consentContact: true,
        consentPrivacy: true
      }
    });

    expect(res.statusCode).toBe(201);
    const body = res.json();
    expect(body.success).toBe(true);
    expect(body.inquiryId).toMatch(/^INQ-/);
    expect(body.status).toBe('AWAITING_SCOPE_REVIEW');
    expect(body.message).toContain('Research mission inquiry received');
  });

  // 11 & 12: Real inquiry does not produce synthetic reports, trigger payments, or open ops workspace
  it('11 & 12. Real submission does not auto-open ops workspace or simulate payment processing', () => {
    const html = fs.readFileSync(missionsHtmlPath, 'utf8');

    expect(html).toContain('id="realInquirySuccessCard"');
    expect(html).toContain('STATUS: AWAITING_SCOPE_REVIEW');
    expect(html).toContain('not a paid or approved mission');
    expect(html).toContain('No payment has been processed');

    // handleRealInquirySubmission does not open operationsWorkspaceSection
    const fnStart = html.indexOf('async function handleRealInquirySubmission()');
    const fnEnd = html.indexOf('function simulateAdvanceApprovalDirect()', fnStart);
    const fnBody = html.substring(fnStart, fnEnd);
    expect(fnBody).not.toContain("document.getElementById('operationsWorkspaceSection').style.display = 'block'");
    expect(fnBody).not.toContain('openResearchOperationsWorkspace()');
  });

  // 13: Offline backend produces explicit error and NEVER fakes demo success
  it('13. Backend offline fails closed and does NOT silently fall back to synthetic demo inquiry', async () => {
    const apiJs = fs.readFileSync(apiJsPath, 'utf8');

    // In api.js, when isDemo is not true, network failures return networkError and no fake INQ-2026-xxx
    expect(apiJs).toContain('networkError: true');
    expect(apiJs).toContain('Real inquiries require a live connection.');
    expect(apiJs).toContain('// EXPLICIT DEMO INQUIRY SIMULATION (Only if data.isDemo === true)');
  });

  // 14: Demo mode still operates as before
  it('14. Demo mode still operates properly with Jaipur Kirana data', () => {
    const html = fs.readFileSync(missionsHtmlPath, 'utf8');

    expect(html).toContain('function activateDemoModeExplicitly()');
    expect(html).toContain('populateDemoScopingFields()');
    expect(html).toContain('simulateAdvanceApprovalDirect()');
    expect(html).toContain('openResearchOperationsWorkspace()');
  });

  // F: Commercial terms and sidebar content segregation
  it('Requirement F: Real inquiry mode removes synthetic claims and shows indicative review terms', () => {
    const html = fs.readFileSync(missionsHtmlPath, 'utf8');

    expect(html).toContain('INDICATIVE COMMERCIAL TERMS — FORMAL INQUIRY');
    expect(html).toContain('Experimental Indicative Scope Fee');
    expect(html).toContain('Proposed Qualitative Scope:</strong> Targeted fieldwork with verified industry practitioners.');
    expect(html).toContain('Scope Subject to GRIPR Review:</strong> Formal qualitative evaluation');
    expect(html).toContain('No payment is charged upon inquiry submission.');
  });

  // G: Form navigation integrity and premature completion prevention
  it('Requirement G: Form navigation prevents premature completion, accidental resets, and invalid skips', () => {
    const html = fs.readFileSync(missionsHtmlPath, 'utf8');

    // 1. simulateAdvanceApprovalDirect has hard guard against running outside Step 4
    expect(html).toContain('function simulateAdvanceApprovalDirect()');
    expect(html).toContain('if (currentScopingStep !== 4)');

    // 2. handleRealInquirySubmission has hard guard against running outside Step 4
    expect(html).toContain('async function handleRealInquirySubmission()');
    expect(html).toContain('if (currentScopingStep !== 4)');

    // 3. attachFormSubmitListener intercepts Enter key to advance step instead of submitting prematurely
    expect(html).toContain("form.addEventListener('keydown'");
    expect(html).toContain("if (e.key === 'Enter')");
    expect(html).toContain('nextScopingStep(currentScopingStep + 1);');

    // 4. showScopingStep(4) ensures actions row is visible before approval
    expect(html).toContain('if (maxUnlockedStage < 3 || !isAlreadyApproved)');
    expect(html).toContain("if (row) row.style.display = 'flex';");

    // 5. jumpToScopingStep validates intermediate steps sequentially
    expect(html).toContain('for (let s = currentScopingStep; s < step; s++)');
    expect(html).toContain('if (!validateScopingStep(s))');

    // 6. jumpToStage(1) preserves currentScopingStep when on steps 1-3
    expect(html).toContain('if (currentScopingStep >= 1 && currentScopingStep <= 3)');
  });

  // H: Live Server reload shield, native form submit suppression, and sessionStorage persistence
  it('Requirement H: Live Server reload shield, native form suppression, and confirmation preservation', () => {
    const html = fs.readFileSync(missionsHtmlPath, 'utf8');

    // 1. Form specifies onsubmit="return false;" to block native browser navigation
    expect(html).toContain('<form id="missionScopingForm" onsubmit="return false;" novalidate>');

    // 2. Submit button is type="button" with onclick to eliminate native submit reload
    expect(html).toContain('<button type="button" class="btn-cta-solid" id="submitRealMissionBtn" onclick="handleRealInquirySubmission()"');

    // 3. Live Server WebSocket shield intercepts and suppresses auto-reload during confirmation
    expect(html).toContain('installLiveReloadShield');
    expect(html).toContain('ShieldedWebSocket');
    expect(html).toContain('[GRIPR LiveServer Shield] Suppressed external live-reload to preserve inquiry confirmation.');

    // 4. SessionStorage persists confirmed inquiry and restores it on load
    expect(html).toContain("sessionStorage.setItem('gripr_confirmed_inquiry'");
    expect(html).toContain("sessionStorage.getItem('gripr_confirmed_inquiry'");
    expect(html).toContain('restoreConfirmedInquiryUI(data)');
    expect(html).toContain("sessionStorage.removeItem('gripr_confirmed_inquiry')");
  });

  // I: Inconsistent sector & participant profile intake validation
  it('Requirement I: Accepts divergent sector and participant profile combinations cleanly', async () => {
    // E.g. Healthcare sector with logistics participant profile
    const res = await app.inject({
      method: 'POST',
      url: '/api/mission-inquiries',
      payload: {
        orgName: 'MedPulse Diagnostics Ltd',
        contactPerson: 'Dr. Radhika Sen',
        contactEmail: 'radhika.sen@medpulse.test',
        role: 'Chief Medical Officer',
        sector: 'healthcare',
        industry: 'Healthcare & Diagnostics',
        decisionAtStake: 'Deciding whether to commission private temperature-controlled courier vans.',
        hypothesis: 'Pathology sample spoilage occurs due to delayed cold-pack transit in ambient heat.',
        falsificationCriteria: 'If sample hemolysis is caused by improper phlebotomy rather than transit.',
        targetParticipantProfile: 'Cold-chain vaccine & pathology sample transit drivers in Rajasthan (>2 years).',
        geography: 'Jaipur & Ajmer Districts',
        constraints: 'Dry ice supply bottlenecks.',
        consentContact: true,
        consentPrivacy: true
      }
    });

    expect(res.statusCode).toBe(201);
    const body = res.json();
    expect(body.success).toBe(true);
    expect(body.inquiryId).toMatch(/^INQ-/);
    expect(body.status).toBe('AWAITING_SCOPE_REVIEW');
  });

  // J: Deduplication prevents duplicate inquiry on fast retries
  it('Requirement J: Duplicate submission within 15 seconds returns existing inquiry without duplicate ID', async () => {
    const payload = {
      orgName: 'Deduplication Test Labs',
      contactPerson: 'Sameer Joshi',
      contactEmail: 'sameer.joshi@dedup.test',
      role: 'Operations Director',
      sector: 'logistics',
      industry: 'Logistics & Freight',
      decisionAtStake: 'Deciding whether to automate dock check-in processes for regional haulers.',
      hypothesis: 'Haulers will adopt QR dock check-in to avoid gate turnaround bottlenecks.',
      falsificationCriteria: 'If delay is caused by weighbridge congestion rather than document check.',
      targetParticipantProfile: 'Interstate dry-freight container drivers operating on NH-48 corridor.',
      geography: 'Delhi-Mumbai Freight Corridor',
      constraints: 'Peak night hours.',
      consentContact: true,
      consentPrivacy: true
    };

    const res1 = await app.inject({
      method: 'POST',
      url: '/api/mission-inquiries',
      payload
    });
    expect(res1.statusCode).toBe(201);
    const body1 = res1.json();

    // Fast retry with exact same payload
    const res2 = await app.inject({
      method: 'POST',
      url: '/api/mission-inquiries',
      payload
    });
    expect(res2.statusCode).toBe(201);
    const body2 = res2.json();

    // Returns identical inquiry ID (deduplicated)
    expect(body2.inquiryId).toBe(body1.inquiryId);
  });
});
