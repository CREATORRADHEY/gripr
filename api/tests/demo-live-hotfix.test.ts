import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { buildApp } from '../src/app.js';
import { FastifyInstance } from 'fastify';
import { GeminiService, GeminiUnavailableError } from '../src/services/gemini.service.js';
import * as fs from 'fs';
import * as path from 'path';

describe('Regression Tests: Final Live Gemini Demo Hotfix', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = buildApp({ logger: false });
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it('1. Unauthorized public execution is blocked (Requirement 6 & 8)', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/demo/live-gemini-analysis',
      headers: {
        'x-simulated-public-client': 'true',
        'x-forwarded-for': '198.51.100.23'
      },
      payload: { packetId: 'PKT-401' }
    });

    expect(res.statusCode).toBe(403);
    const body = res.json();
    expect(body.success).toBe(false);
    expect(body.error.code).toBe('FORBIDDEN');
    expect(body.error.message).toContain('restricted to genuinely local development');
  });

  it('2. Authenticated presenter can access demo endpoint even in non-local scenarios (Requirement 6 & 8)', async () => {
    const mockGemini = new GeminiService();
    mockGemini.extractEvidence = async () => ({
      extraction: mockGemini.generateDeterministicMockExtraction(
        'Main Jaipur mein ek kirana store chalata hoon. Har hafte mujhe customer udhaar track karne mein problem hoti hai. Main notebook use karta hoon.',
        'Main notebook use karta hoon.'
      ),
      modelUsed: 'gemini-3.5-flash-lite',
      processingMode: 'LIVE_GEMINI'
    });

    const presenterApp = buildApp({ logger: false, geminiService: mockGemini });
    await presenterApp.ready();

    const res = await presenterApp.inject({
      method: 'POST',
      url: '/api/demo/live-gemini-analysis',
      headers: {
        'x-simulated-public-client': 'true',
        'x-gripr-auth': 'gripr_dev_ops_secret_2026'
      },
      payload: { packetId: 'PKT-401' }
    });

    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.success).toBe(true);
    expect(body.mode).toBe('LIVE_GEMINI');

    await presenterApp.close();
  });

  it('3. Gemini unavailable returns explicit non-2xx error (502 or 503) and NOT HTTP 200 (Requirement 1, 3 & 8)', async () => {
    // Build an app with an unconfigured/failing GeminiService
    const failingGemini = new GeminiService();
    // Stub extractEvidence to simulate Gemini API failure/unavailability
    failingGemini.extractEvidence = async () => {
      throw new GeminiUnavailableError('Gemini API quota exhausted or key invalid');
    };

    const testApp = buildApp({ logger: false, geminiService: failingGemini });
    await testApp.ready();

    const res = await testApp.inject({
      method: 'POST',
      url: '/api/demo/live-gemini-analysis',
      payload: { packetId: 'PKT-401' }
    });

    expect(res.statusCode).toBe(503);
    const body = res.json();
    expect(body.success).toBe(false);
    expect(body.mode).toBe('ERROR_OR_FALLBACK');
    expect(body.error.code).toBe('GeminiUnavailableError');
    expect(body.error.message).toContain('Gemini API quota exhausted');
    expect(body.suggestion).toContain('Precomputed Demo Analysis');

    await testApp.close();
  });

  it('4. Mock output cannot be labelled LIVE_GEMINI (Requirement 1, 2 & 8)', async () => {
    const service = new GeminiService();

    // Verify extractEvidence with allowMockFallback: false refuses mock extraction
    await expect(
      service.extractEvidence(
        'Some test narrative',
        'Some workaround',
        'Kirana Store Owner',
        'Customer credit',
        { forceLive: false, allowMockFallback: false }
      )
    ).rejects.toThrow(GeminiUnavailableError);

    // Verify that if a service somehow returned DEMO_SYNTHETIC, demo route strictly rejects it with 502
    const syntheticReturningService = new GeminiService();
    syntheticReturningService.extractEvidence = async () => ({
      extraction: syntheticReturningService.generateDeterministicMockExtraction('narrative', 'workaround'),
      modelUsed: 'mock-model',
      processingMode: 'DEMO_SYNTHETIC' as any
    });

    const mockApp = buildApp({ logger: false, geminiService: syntheticReturningService });
    await mockApp.ready();

    const res = await mockApp.inject({
      method: 'POST',
      url: '/api/demo/live-gemini-analysis',
      payload: { packetId: 'PKT-401' }
    });

    expect(res.statusCode).toBe(502);
    const body = res.json();
    expect(body.success).toBe(false);
    expect(body.mode).toBe('ERROR_OR_FALLBACK');
    expect(body.error.message).toContain('Extraction cannot be labelled LIVE_GEMINI');

    await mockApp.close();
  });

  it('5. Frontend fails closed: failed response stops processing immediately and cannot unlock AI state (Requirement 4, 5 & 8)', () => {
    const htmlPath = path.resolve(__dirname, '../../missions.html');
    const html = fs.readFileSync(htmlPath, 'utf8');

    // Verify visible error container exists in DOM
    expect(html).toContain('id="geminiErrorContainer"');
    expect(html).toContain('id="geminiErrorHeadline"');
    expect(html).toContain('id="geminiErrorDetails"');
    expect(html).toContain('LIVE GEMINI EXTRACTION FAILED');

    // Verify analyzeDemoLive() failure check in runGeminiAnalysisDirect
    expect(html).toContain('if (!liveResult || !liveResult.success)');
    expect(html).toContain('resultsContainer.style.display = \'none\';');
    expect(html).toContain('actionRow.style.display = \'none\';');
    expect(html).toContain('return; // STOP PROCESSING IMMEDIATELY');

    // Verify precomputed demo option remains separately available in error box
    expect(html).toContain('switchToPrecomputedAndRun()');
    expect(html).toContain('Switch to Precomputed Demo Intelligence');
  });

  it('6. Precomputed demo remains fully operational (Requirement 5 & 8)', () => {
    const htmlPath = path.resolve(__dirname, '../../missions.html');
    const fixturesPath = path.resolve(__dirname, '../../js/fixtures.js');
    const html = fs.readFileSync(htmlPath, 'utf8');
    const fixtures = fs.readFileSync(fixturesPath, 'utf8');

    // Offline fixtures contain validated precomputed analysis
    expect(fixtures).toContain('geminiPrecomputedAnalysis: {');
    expect(fixtures).toContain('contradictionDetection: {');

    // Precomputed engine selector exists
    expect(html).toContain('id="enginePrecomputed"');
    expect(html).toContain('Executing precomputed offline structured extraction...');
    expect(html).toContain('PRECOMPUTED SYNTHETIC STUDY ANALYSIS (OFFLINE)');
  });
});
