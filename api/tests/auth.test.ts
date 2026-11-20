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

    // Try to access KisanDirect mission (MSN-2026-081 belonging to ORG-KISANDIRECT-081)
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
    // Create token for KisanDirect organization user
    const kisanToken = FirebaseAuthService.createTestToken({
      uid: 'arunav-kisan',
      email: 'a.sengupta@kisandirect-example.in',
      role: 'ORGANIZATION_USER',
      organizationId: 'ORG-KISANDIRECT-081'
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
      organizationId: 'ORG-KISANDIRECT-081'
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
});
