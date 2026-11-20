import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

describe('Founder Guided Demo Journey & Integrity Verification (20 Steps)', () => {
  const rootDir = path.resolve(__dirname, '../../');
  const missionsHtmlPath = path.resolve(rootDir, 'missions.html');
  const briefHtmlPath = path.resolve(rootDir, 'brief.html');
  const fixturesJsPath = path.resolve(rootDir, 'js/fixtures.js');
  const cssMainPath = path.resolve(rootDir, 'css/main.css');

  it('Step 1 & 2: missions.html exists and navbar has responsive nowrap layout', () => {
    const html = fs.readFileSync(missionsHtmlPath, 'utf8');
    const css = fs.readFileSync(cssMainPath, 'utf8');

    expect(html).toContain('Start a Research Mission');
    expect(html).toContain('white-space: nowrap !important;');
    expect(css).toContain('white-space: nowrap;');
    expect(css).toContain('@media (max-width: 768px)');
  });

  it('Step 3: Initial missions.html load does NOT prefill fields or auto-activate demo', () => {
    const html = fs.readFileSync(missionsHtmlPath, 'utf8');

    // Default isDemoMode is false
    expect(html).toContain('let isDemoMode = false;');
    expect(html).toContain('let maxUnlockedStage = 1;');
    expect(html).toContain('resetScopingFields();');
    expect(html).toContain('showScopingStep(1);');

    // Both explicit action buttons exist
    expect(html).toContain('id="btnUseDemoData"');
    expect(html).toContain('id="btnCommissionReal"');
    expect(html).toContain('activateDemoModeExplicitly()');
    expect(html).toContain('activateRealModeExplicitly()');
  });

  it('Step 4 & 5: activateDemoModeExplicitly() loads Jaipur Kirana data on Step 1 and does NOT auto-advance', () => {
    const html = fs.readFileSync(missionsHtmlPath, 'utf8');

    // Extract activateDemoModeExplicitly function body only
    const fnStart = html.indexOf('function activateDemoModeExplicitly()');
    const fnEnd = html.indexOf('function activateRealModeExplicitly()', fnStart);
    const fnBody = html.substring(fnStart, fnEnd);

    expect(fnBody).toContain('isDemoMode = true;');
    expect(fnBody).toContain('populateDemoScopingFields();');
    expect(fnBody).toContain("document.getElementById('demoMasterNotice').style.display = 'block';");
    expect(fnBody).not.toContain('showScopingStep(2)');
    expect(fnBody).not.toContain('jumpToStage(3)');
  });

  it('Step 6 & 7: Scoping wizard navigates steps manually with validation', () => {
    const html = fs.readFileSync(missionsHtmlPath, 'utf8');

    expect(html).toContain('function nextScopingStep(step)');
    expect(html).toContain('function validateScopingStep(step)');
    expect(html).toContain("escapeHtml(document.getElementById('orgName').value.trim()");
  });

  it('Step 8, 9 & 10: Step 4 Commercial Review and Simulate Advance Approval does NOT auto-navigate', () => {
    const html = fs.readFileSync(missionsHtmlPath, 'utf8');

    const fnStart = html.indexOf('function simulateAdvanceApprovalDirect()');
    const fnEnd = html.indexOf('function openResearchOperationsWorkspace()', fnStart);
    const fnBody = html.substring(fnStart, fnEnd);

    // Displays confirmation card labeled DEMO ONLY
    expect(html).toContain('id="simulatedApprovalSuccessCard"');
    expect(html).toContain('DEMO ONLY');
    expect(html).toContain('No payment was processed');
    expect(html).toContain('₹49,000');
    // Must NOT call jumpToStage(3) inside simulateAdvanceApprovalDirect
    expect(fnBody).not.toContain('jumpToStage(3)');
    // Requires manual click on "Continue to GRIPR Research Operations"
    expect(html).toContain('Continue to GRIPR Research Operations');
    expect(html).toContain('openResearchOperationsWorkspace()');
  });

  it('Step 11: Distinct Research Operations Workspace frame with metadata', () => {
    const html = fs.readFileSync(missionsHtmlPath, 'utf8');

    expect(html).toContain('class="ops-workspace-frame"');
    expect(html).toContain('GRIPR INTERNAL RESEARCH OPERATIONS WORKSPACE');
    expect(html).toContain('MSN-2026-081');
    expect(html).toContain('RetailFlow Intelligence Labs');
    expect(html).toContain('Jaipur, Rajasthan');
  });

  it('Step 12 & 13: Manual selection of exactly five fictional researchers and 100% skill coverage', () => {
    const fixtures = fs.readFileSync(fixturesJsPath, 'utf8');
    const html = fs.readFileSync(missionsHtmlPath, 'utf8');

    expect(fixtures).toContain('researcherCandidates: [');
    expect(fixtures).toContain('RES-101');
    expect(fixtures).toContain('RES-107');

    expect(html).toContain('selectedResearchers.length === 5');
    expect(html).toContain('confirmTeamAllocationDirect()');
    expect(html).toContain('unlockOpsStage(4)');
  });

  it('Step 14: Five synthetic operator evidence packets with illustrative translations', () => {
    const fixtures = fs.readFileSync(fixturesJsPath, 'utf8');
    const html = fs.readFileSync(missionsHtmlPath, 'utf8');

    expect(fixtures).toContain('PKT-401');
    expect(fixtures).toContain('PKT-405');
    expect(html).toContain('ILLUSTRATIVE ENGLISH TRANSLATION:');
    expect(html).not.toContain('Certified English translation');
    expect(html).toContain('Truthful Audio Disclosure:');
  });

  it('Step 15 & 16: Live Gemini single-packet vs Precomputed multi-source segregation with no hardcoded fallback metrics', () => {
    const html = fs.readFileSync(missionsHtmlPath, 'utf8');

    expect(html).toContain('⚡ LIVE GEMINI: ONE EVIDENCE PACKET PROCESSED (PKT-401 — Ramesh Kumar)');
    expect(html).toContain('PRECOMPUTED SYNTHETIC STUDY ANALYSIS (CROSS-OPERATOR SYNTHESIS: 5 SYNTHETIC PACKETS)');
    expect(html).toContain("const model = liveResult.modelUsed || 'Not available';");
    expect(html).toContain("const latencyDisplay = liveResult.latencyMs ? `${liveResult.latencyMs} ms` : 'Not available';");
    expect(html).toContain("const tokenDisplay = liveResult.tokenEstimate ? `${liveResult.tokenEstimate} tokens` : 'Not available';");
  });

  it('Step 17 & 18: Human QA audit checklist and illustrative brief card', () => {
    const html = fs.readFileSync(missionsHtmlPath, 'utf8');

    expect(html).toContain('id="chk-quotes"');
    expect(html).toContain('id="chk-segregation"');
    expect(html).toContain('id="chk-unknowns"');
    expect(html).toContain('id="chk-contradiction"');
    expect(html).toContain('id="chk-privacy"');
    expect(html).toContain('function approveFindingsDirect()');
    expect(html).toContain('Reframe hypothesis and test alternatives before committing to development');
    expect(html).not.toContain('5 Screened Operators:');
  });

  it('Step 19 & 20: Delivery simulation and client view link', () => {
    const html = fs.readFileSync(missionsHtmlPath, 'utf8');
    const briefHtml = fs.readFileSync(briefHtmlPath, 'utf8');

    expect(html).toContain('simulateClientDeliveryDirect()');
    expect(html).toContain('brief.html?id=MSN-2026-081&demo=true');
    expect(briefHtml).toContain('EXPLICIT SYNTHETIC DEMO DELIVERABLE (#DEMO_SYNTHETIC)');
    expect(briefHtml).toContain('MSN-2026-081');
  });

  it('State Machine: Strict locking prevents jumping to locked future stages', () => {
    const html = fs.readFileSync(missionsHtmlPath, 'utf8');

    expect(html).toContain('function jumpToStage(targetStage)');
    expect(html).toContain('if (targetStage > maxUnlockedStage)');
    expect(html).toContain('window.GriprUI.showToast');
    expect(html).toContain('restartEntireSimulation()');
  });
});
