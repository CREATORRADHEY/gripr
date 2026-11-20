import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { buildApp } from '../src/app.js';
import { FastifyInstance } from 'fastify';
import { GeminiService, GeminiUnavailableError } from '../src/services/gemini.service.js';
import { FirebaseAuthService } from '../src/services/auth.service.js';
import * as fs from 'fs';
import * as path from 'path';

describe('Security Regression & Fail-Closed Tests: Live Gemini Demo Hotfix', () => {
  let app: FastifyInstance;
  let mockGemini: GeminiService;

  beforeAll(async () => {
    mockGemini = new GeminiService();
    mockGemini.extractEvidence = async () => ({
      extraction: mockGemini.generateDeterministicMockExtraction(
        'Main Jaipur mein ek kirana store chalata hoon. Har hafte mujhe customer udhaar track karne mein problem hoti hai. Main notebook use karta hoon.',
        'Main notebook use karta hoon.'
      ),
      modelUsed: 'gemini-3.5-flash-lite',
      processingMode: 'LIVE_GEMINI'
    });

    app = buildApp({ logger: false, geminiService: mockGemini });
    await app.ready();
  });

  afterAll(async () => {
    delete process.env.TEST_ENV_OVERRIDE;
    await app.close();
  });

  // --------------------------------------------------------------------------
  // REQUIREMENT 8: SECURITY REGRESSION TESTS
  // --------------------------------------------------------------------------

  it('1. Public caller with spoofed Host: localhost is blocked with 401 Unauthorized', async () => {
    process.env.TEST_ENV_OVERRIDE = 'development';
    const res = await app.inject({
      method: 'POST',
      url: '/api/demo/live-gemini-analysis',
      remoteAddress: '203.0.113.195', // Non-loopback peer
      headers: {
        host: 'localhost',
        'x-test-note': 'spoofed-host'
      },
      payload: { packetId: 'PKT-401' }
    });

    expect(res.statusCode).toBe(401);
    const body = res.json();
    expect(body.success).toBe(false);
    expect(body.error.code).toBe('UNAUTHORIZED');
  });

  it('2. Public caller with spoofed x-forwarded-for is blocked with 401 Unauthorized', async () => {
    process.env.TEST_ENV_OVERRIDE = 'development';
    const res = await app.inject({
      method: 'POST',
      url: '/api/demo/live-gemini-analysis',
      remoteAddress: '203.0.113.195', // Non-loopback peer
      headers: {
        'x-forwarded-for': '127.0.0.1'
      },
      payload: { packetId: 'PKT-401' }
    });

    expect(res.statusCode).toBe(401);
    const body = res.json();
    expect(body.success).toBe(false);
    expect(body.error.code).toBe('UNAUTHORIZED');
  });

  it('3. Public caller using previously hardcoded static key (x-gripr-auth) is strictly rejected', async () => {
    process.env.TEST_ENV_OVERRIDE = 'development';
    const res = await app.inject({
      method: 'POST',
      url: '/api/demo/live-gemini-analysis',
      remoteAddress: '203.0.113.195',
      headers: {
        'x-gripr-auth': 'gripr_dev_ops_secret_2026',
        'x-gripr-presenter-key': 'gripr_dev_ops_secret_2026'
      },
      payload: { packetId: 'PKT-401' }
    });

    expect(res.statusCode).toBe(401);
    const body = res.json();
    expect(body.success).toBe(false);
    expect(body.error.code).toBe('UNAUTHORIZED');
  });

  it('4. Missing Firebase token outside isolated local mode returns 401 Unauthorized', async () => {
    process.env.TEST_ENV_OVERRIDE = 'development';
    // Presence of proxy header negates isolated local development loopback status
    const res = await app.inject({
      method: 'POST',
      url: '/api/demo/live-gemini-analysis',
      remoteAddress: '127.0.0.1',
      headers: {
        'x-forwarded-for': '198.51.100.55'
      },
      payload: { packetId: 'PKT-401' }
    });

    expect(res.statusCode).toBe(401);
    const body = res.json();
    expect(body.success).toBe(false);
    expect(body.error.code).toBe('UNAUTHORIZED');
    expect(body.error.message).toContain('Authentication required');
  });

  it('5. Invalid or malformed Firebase token returns 401 Unauthorized', async () => {
    process.env.TEST_ENV_OVERRIDE = 'development';
    const res = await app.inject({
      method: 'POST',
      url: '/api/demo/live-gemini-analysis',
      remoteAddress: '203.0.113.195',
      headers: {
        authorization: 'Bearer malformed.invalid.token'
      },
      payload: { packetId: 'PKT-401' }
    });

    expect(res.statusCode).toBe(401);
    const body = res.json();
    expect(body.success).toBe(false);
    expect(body.error.code).toBe('UNAUTHORIZED');
    expect(body.error.message).toContain('Firebase token verification failed');
  });

  it('6. Authorized Firebase researcher is granted access outside local mode', async () => {
    process.env.TEST_ENV_OVERRIDE = 'development';
    const testToken = FirebaseAuthService.createTestToken({
      uid: 'researcher-presenter-1',
      role: 'RESEARCHER'
    });

    const res = await app.inject({
      method: 'POST',
      url: '/api/demo/live-gemini-analysis',
      remoteAddress: '203.0.113.195', // External peer with valid Firebase token
      headers: {
        authorization: `Bearer ${testToken}`
      },
      payload: { packetId: 'PKT-401' }
    });

    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.success).toBe(true);
    expect(body.mode).toBe('LIVE_GEMINI');
  });

  it('7. Genuine loopback development call succeeds without token', async () => {
    process.env.TEST_ENV_OVERRIDE = 'development';
    const res = await app.inject({
      method: 'POST',
      url: '/api/demo/live-gemini-analysis',
      remoteAddress: '127.0.0.1', // Genuine loopback peer
      // No proxy headers and no auth header
      payload: { packetId: 'PKT-401' }
    });

    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.success).toBe(true);
    expect(body.mode).toBe('LIVE_GEMINI');
  });

  it('8. Production with NODE_ENV misconfiguration enforces strict token verification even on loopback', async () => {
    process.env.TEST_ENV_OVERRIDE = 'production';
    const res = await app.inject({
      method: 'POST',
      url: '/api/demo/live-gemini-analysis',
      remoteAddress: '127.0.0.1', // Loopback peer, but in production mode
      payload: { packetId: 'PKT-401' }
    });

    expect(res.statusCode).toBe(401);
    const body = res.json();
    expect(body.success).toBe(false);
    expect(body.error.code).toBe('UNAUTHORIZED');
  });

  // --------------------------------------------------------------------------
  // FAIL-CLOSED & DEMO ENGINE TESTS
  // --------------------------------------------------------------------------

  it('9. Gemini unavailable returns explicit non-2xx error (502 or 503) and NOT HTTP 200 (Requirement 1, 3 & 8)', async () => {
    process.env.TEST_ENV_OVERRIDE = 'development';
    const failingGemini = new GeminiService();
    failingGemini.extractEvidence = async () => {
      throw new GeminiUnavailableError('Gemini API quota exhausted or key invalid');
    };

    const testApp = buildApp({ logger: false, geminiService: failingGemini });
    await testApp.ready();

    const res = await testApp.inject({
      method: 'POST',
      url: '/api/demo/live-gemini-analysis',
      remoteAddress: '127.0.0.1',
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

  it('10. Mock output cannot be labelled LIVE_GEMINI (Requirement 1, 2 & 8)', async () => {
    process.env.TEST_ENV_OVERRIDE = 'development';
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
      remoteAddress: '127.0.0.1',
      payload: { packetId: 'PKT-401' }
    });

    expect(res.statusCode).toBe(502);
    const body = res.json();
    expect(body.success).toBe(false);
    expect(body.mode).toBe('ERROR_OR_FALLBACK');
    expect(body.error.message).toContain('Extraction cannot be labelled LIVE_GEMINI');

    await mockApp.close();
  });

  it('11. Frontend fails closed: failed response stops processing immediately and cannot unlock AI state (Requirement 4, 5 & 8)', () => {
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

  it('12. Precomputed demo remains fully operational (Requirement 5 & 8)', () => {
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
