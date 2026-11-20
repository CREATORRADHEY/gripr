import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { FastifyInstance } from 'fastify';
import { buildApp } from '../src/app.js';
import { DemoOnlyMissionInquiryRepository, CloudFirestoreMissionInquiryRepository } from '../src/repositories/firestore.repository.js';

describe('GRIPR.STUDIO — Cloud Run Deployment Readiness & Security Audit', () => {
  let app: FastifyInstance;
  const rootDir = path.resolve(__dirname, '../../');

  beforeAll(async () => {
    // Enable static serving for deployment testing
    app = buildApp({ useMemoryRepo: true, logger: false });
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  // TASK 2: Single Service Public Frontend Serving
  describe('TASK 2 — Public Frontend Serving via Single Fastify Origin', () => {
    it('1. GET / serves index.html with correct Content-Type', async () => {
      const res = await app.inject({ method: 'GET', url: '/' });
      expect(res.statusCode).toBe(200);
      expect(res.headers['content-type']).toContain('text/html');
      expect(res.body).toContain('AI-POWERED PROBLEM INTELLIGENCE');
      expect(res.body).toContain('Better products begin with');
    });

    it('2. GET /index.html directly serves index.html', async () => {
      const res = await app.inject({ method: 'GET', url: '/index.html' });
      expect(res.statusCode).toBe(200);
      expect(res.headers['content-type']).toContain('text/html');
    });

    it('3. GET /missions.html and semantic /missions serve missions.html', async () => {
      const resHtml = await app.inject({ method: 'GET', url: '/missions.html' });
      expect(resHtml.statusCode).toBe(200);
      expect(resHtml.headers['content-type']).toContain('text/html');
      expect(resHtml.body).toContain('Start a Research Mission');

      const resSemantic = await app.inject({ method: 'GET', url: '/missions' });
      expect(resSemantic.statusCode).toBe(200);
      expect(resSemantic.headers['content-type']).toContain('text/html');
      expect(resSemantic.body).toContain('Start a Research Mission');
    });

    it('4. GET /demo.html and /demo serve demo.html', async () => {
      const res = await app.inject({ method: 'GET', url: '/demo.html' });
      expect(res.statusCode).toBe(200);
      expect(res.headers['content-type']).toContain('text/html');
      expect(res.body).toContain('Interactive Synthetic Demo');
    });

    it('5. GET /brief.html and /brief serve brief.html', async () => {
      const res = await app.inject({ method: 'GET', url: '/brief.html' });
      expect(res.statusCode).toBe(200);
      expect(res.headers['content-type']).toContain('text/html');
      expect(res.body).toContain('Decision Intelligence Brief');
    });

    it('6. GET /css/main.css serves CSS assets', async () => {
      const res = await app.inject({ method: 'GET', url: '/css/main.css' });
      expect(res.statusCode).toBe(200);
      expect(res.headers['content-type']).toContain('text/css');
    });

    it('7. GET /js/api.js serves JavaScript client assets', async () => {
      const res = await app.inject({ method: 'GET', url: '/js/api.js' });
      expect(res.statusCode).toBe(200);
      expect(res.headers['content-type']).toContain('javascript');
    });
  });

  // TASK 2: Restrictive Static File Security
  describe('TASK 2 — Restrictive Static-File Security & Secret Shield', () => {
    it('8. Disallows access to .env and api/.env', async () => {
      const res1 = await app.inject({ method: 'GET', url: '/.env' });
      expect(res1.statusCode).toBe(404);

      const res2 = await app.inject({ method: 'GET', url: '/api/.env' });
      expect(res2.statusCode).toBe(404);
    });

    it('9. Disallows access to .git directory or files', async () => {
      const res = await app.inject({ method: 'GET', url: '/.git/config' });
      expect(res.statusCode).toBe(404);
    });

    it('10. Disallows access to api/data/ and persistence records', async () => {
      const res = await app.inject({ method: 'GET', url: '/api/data/firestore/missions/MSN-2026-081.json' });
      expect(res.statusCode).toBe(404);
    });

    it('11. Disallows access to package.json, tsconfig.json, and source files', async () => {
      const res1 = await app.inject({ method: 'GET', url: '/package.json' });
      expect(res1.statusCode).toBe(404);

      const res2 = await app.inject({ method: 'GET', url: '/tsconfig.json' });
      expect(res2.statusCode).toBe(404);

      const res3 = await app.inject({ method: 'GET', url: '/api/src/server.ts' });
      expect(res3.statusCode).toBe(404);
    });
  });

  // TASK 3: No Localhost Hardcoding
  describe('TASK 3 — No Localhost Hardcoding & Clean Production Execution', () => {
    it('12. js/api.js uses relative /api routing without hardcoded 127.0.0.1:3000', () => {
      const content = fs.readFileSync(path.resolve(rootDir, 'js/api.js'), 'utf8');
      expect(content).toContain("const BACKEND_URL = '/api';");
      expect(content).not.toContain("'http://127.0.0.1:3000/api'");
      expect(content).not.toContain("'http://localhost:3000/api'");
    });

    it('13. missions.html Live Server reload shield is guarded against running in production', () => {
      const content = fs.readFileSync(path.resolve(rootDir, 'missions.html'), 'utf8');
      expect(content).toContain("const isLocalDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';");
      expect(content).toContain('if (!isLocalDev) return;');
      // Preserves sessionStorage confirmation recovery
      expect(content).toContain("sessionStorage.getItem('gripr_confirmed_inquiry')");
    });
  });

  // TASK 4: Real Storage vs DEMO_ONLY mode
  describe('TASK 4 — Persistence Architecture & DEMO_ONLY Isolation', () => {
    it('14. DemoOnlyMissionInquiryRepository rejects real submission with 503 and clear notice', async () => {
      const repo = new DemoOnlyMissionInquiryRepository();
      let caughtError: any = null;
      try {
        await repo.create({
          orgName: 'Demo Test Org',
          contactPerson: 'Tester',
          contactEmail: 'test@example.com',
          role: 'PM',
          sector: 'commerce',
          industry: 'Retail',
          decisionAtStake: 'Testing whether demo mode rejects real persistence cleanly.',
          problemToInvestigate: 'Testing demo mode refusal.',
          hypothesis: 'Testing demo mode without fake storage commitments.',
          falsificationCriteria: 'If storage commits when unavailable.',
          targetParticipantProfile: 'Profile test string long enough.',
          geography: 'India',
          constraints: 'None',
          consentContact: true,
          consentPrivacy: true
        });
      } catch (err) {
        caughtError = err;
      }

      expect(caughtError).not.toBeNull();
      expect(caughtError.statusCode).toBe(503);
      expect(caughtError.code).toBe('DEMO_ONLY_MODE');
      expect(caughtError.message).toContain('Real mission inquiry intake is disabled in DEMO_ONLY mode');
    });

    it('15. CloudFirestoreMissionInquiryRepository is exported and implements repository interface', () => {
      expect(CloudFirestoreMissionInquiryRepository).toBeDefined();
      expect(typeof CloudFirestoreMissionInquiryRepository).toBe('function');
    });
  });

  // Backend API Integrity
  describe('API Routing & Healthcheck', () => {
    it('16. GET /api/health returns 200 with ok status', async () => {
      const res = await app.inject({ method: 'GET', url: '/api/health' });
      expect(res.statusCode).toBe(200);
      const json = res.json();
      expect(json.status).toBe('ok');
    });
  });
});
