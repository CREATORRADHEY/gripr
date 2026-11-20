import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { buildApp } from '../src/app.js';
import { FirebaseAuthService } from '../src/services/auth.service.js';
import { FastifyInstance } from 'fastify';

describe('TEST GROUP B: Authentication, Roles & Tenant Isolation', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = buildApp({ useMemoryRepo: true, logger: false });
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it('rejects unauthenticated request to /api/missions with 401', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/missions'
    });

    expect(res.statusCode).toBe(401);
    const body = res.json();
    expect(body.success).toBe(false);
    expect(body.error.code).toBe('UNAUTHORIZED');
  });

  it('rejects malformed token with 401', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/missions',
      headers: {
        authorization: 'Bearer not-a-valid-jwt-token'
      }
    });

    expect(res.statusCode).toBe(401);
    const body = res.json();
    expect(body.error.message).toContain('Authentication failed');
  });

  it('rejects expired token with 401', async () => {
    // Generate an expired token (expiresInSeconds: -10)
    const expiredToken = FirebaseAuthService.createTestToken({
      uid: 'user-expired',
      email: 'expired@test.com',
      role: 'RESEARCHER',
      expiresInSeconds: -10
    });

    const res = await app.inject({
      method: 'GET',
      url: '/api/missions',
      headers: {
        authorization: `Bearer ${expiredToken}`
      }
    });

    expect(res.statusCode).toBe(401);
    const body = res.json();
    expect(body.error.message).toContain('Token expired');
  });

  it('Organization A cannot access Organization B mission workspace (Tenant Isolation)', async () => {
    // Create token for Organization B user
    const orgBToken = FirebaseAuthService.createTestToken({
      uid: 'user-org-b',
      email: 'user@competing-agro.in',
      role: 'ORGANIZATION_USER',
      organizationId: 'ORG-COMPETING-AGRO'
    });

    // Try to access RetailFlow mission (MSN-2026-081 belonging to ORG-RETAILFLOW-081)
    const res = await app.inject({
      method: 'GET',
      url: '/api/missions/MSN-2026-081',
      headers: {
        authorization: `Bearer ${orgBToken}`
      }
    });

    expect(res.statusCode).toBe(403);
    const body = res.json();
    expect(body.success).toBe(false);
    expect(body.error.code).toBe('FORBIDDEN_CROSS_ORG');
  });

  it('Organization user can access their own mission workspace', async () => {
    // Create token for RetailFlow organization user
    const kisanToken = FirebaseAuthService.createTestToken({
      uid: 'aditi-retailflow',
      email: 'aditi@retailflow.test',
      role: 'ORGANIZATION_USER',
      organizationId: 'ORG-RETAILFLOW-081'
    });

    const res = await app.inject({
      method: 'GET',
      url: '/api/missions/MSN-2026-081',
      headers: {
        authorization: `Bearer ${kisanToken}`
      }
    });

    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.success).toBe(true);
    expect(body.mission.id).toBe('MSN-2026-081');
  });

  it('researcher can access all missions and internal operations queue', async () => {
    const researcherToken = FirebaseAuthService.createTestToken({
      uid: 'lead-researcher-01',
      email: 'lead@gripr.studio',
      role: 'RESEARCHER'
    });

    const resMissions = await app.inject({
      method: 'GET',
      url: '/api/missions',
      headers: {
        authorization: `Bearer ${researcherToken}`
      }
    });
    expect(resMissions.statusCode).toBe(200);

    const resOps = await app.inject({
      method: 'GET',
      url: '/api/operations/queue',
      headers: {
        authorization: `Bearer ${researcherToken}`
      }
    });
    expect(resOps.statusCode).toBe(200);
    const bodyOps = resOps.json();
    expect(bodyOps.success).toBe(true);
    expect(bodyOps.opsQueue).toBeDefined();
  });

  it('organization user cannot access internal operations workbench (Role Enforcement)', async () => {
    const orgToken = FirebaseAuthService.createTestToken({
      uid: 'user-org',
      role: 'ORGANIZATION_USER',
      organizationId: 'ORG-RETAILFLOW-081'
    });

    const res = await app.inject({
      method: 'GET',
      url: '/api/operations/queue',
      headers: {
        authorization: `Bearer ${orgToken}`
      }
    });

    expect(res.statusCode).toBe(403);
    const body = res.json();
    expect(body.error.code).toBe('FORBIDDEN');
  });

  it('strictly rejects custom HS256 tokens when forceRejectHS256 is active (Task 1: No HS256 in prod)', async () => {
    const hs256Token = FirebaseAuthService.createTestToken({
      uid: 'adversary-hs256',
      email: 'attacker@test.in',
      role: 'ADMIN'
    });

    await expect(FirebaseAuthService.verifyToken(hs256Token, { forceRejectHS256: true }))
      .rejects.toThrow('Unauthorized token algorithm. Custom HS256 tokens are strictly forbidden in non-test environments');
  });

  it('rejects fake/unregistered Firebase tokens with signature verification failure', async () => {
    // Generate an RS256-like 3-part token that was not signed by Google certs
    const fakeHeader = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url');
    const fakePayload = Buffer.from(JSON.stringify({ uid: 'fake-user', iss: 'https://securetoken.google.com/gripr-studio' })).toString('base64url');
    const fakeSig = Buffer.from('invalid-signature-bytes').toString('base64url');
    const fakeToken = `${fakeHeader}.${fakePayload}.${fakeSig}`;

    await expect(FirebaseAuthService.verifyToken(fakeToken))
      .rejects.toThrow('Firebase ID token verification failed via Admin SDK');
  });
});
