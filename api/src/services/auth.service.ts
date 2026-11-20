import crypto from 'node:crypto';
import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { env } from '../config/env.js';

export type UserRole = 'RESEARCHER' | 'ADMIN' | 'ORGANIZATION_USER' | 'RESEARCH_PARTICIPANT';

export interface AuthUser {
  uid: string;
  email: string;
  role: UserRole;
  organizationId?: string;
  missionId?: string;
}

export interface DecodedTokenPayload {
  uid: string;
  email?: string;
  role?: UserRole;
  organizationId?: string;
  missionId?: string;
  iss?: string;
  aud?: string;
  exp?: number;
  iat?: number;
}

// Track initialization of the official Firebase Admin App
let firebaseAdminApp: App | null = null;

export function getFirebaseAdminApp(): App {
  if (firebaseAdminApp) return firebaseAdminApp;
  const existingApps = getApps();
  if (existingApps.length > 0 && existingApps[0]) {
    firebaseAdminApp = existingApps[0];
    return firebaseAdminApp;
  }

  const projectId = process.env.FIREBASE_PROJECT_ID || process.env.GOOGLE_CLOUD_PROJECT || 'gripr-studio';

  // Check for explicit service account credentials in env
  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY || process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (serviceAccount) {
    try {
      if (typeof serviceAccount === 'string' && serviceAccount.trim().startsWith('{')) {
        const parsed = JSON.parse(serviceAccount);
        firebaseAdminApp = initializeApp({
          credential: cert(parsed),
          projectId: parsed.project_id || projectId
        });
        return firebaseAdminApp;
      }
    } catch {
      // Fall through to default app initialization
    }
  }

  firebaseAdminApp = initializeApp({
    projectId
  });
  return firebaseAdminApp;
}

export class FirebaseAuthService {
  private static tokenSecret = env.INTERNAL_AUTH_SECRET || '';

  /**
   * UNIT TEST ONLY FIXTURE
   * Cryptographically signs an HS256 token strictly for offline unit-test assertions.
   * This method is explicitly forbidden from being used as a valid authentication path in live/production.
   */
  public static createTestToken(payload: {
    uid: string;
    email?: string;
    role: UserRole;
    organizationId?: string;
    missionId?: string;
    expiresInSeconds?: number;
  }): string {
    const header = { alg: 'HS256', typ: 'JWT', testFixture: true };
    const now = Math.floor(Date.now() / 1000);
    const exp = now + (payload.expiresInSeconds ?? 3600);

    const body: DecodedTokenPayload = {
      uid: payload.uid,
      email: payload.email || `${payload.uid}@gripr.local`,
      role: payload.role,
      organizationId: payload.organizationId,
      missionId: payload.missionId,
      iss: `https://securetoken.google.com/gripr-studio-auth`,
      aud: 'gripr-studio-auth',
      iat: now,
      exp
    };

    const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url');
    const encodedBody = Buffer.from(JSON.stringify(body)).toString('base64url');
    const signature = crypto
      .createHmac('sha256', this.tokenSecret)
      .update(`${encodedHeader}.${encodedBody}`)
      .digest('base64url');

    return `${encodedHeader}.${encodedBody}.${signature}`;
  }

  /**
   * Verifies an ID token.
   * In all non-test environments, this strictly delegates to the official Firebase Admin SDK verifyIdToken()
   * which validates RS256 signature against Google certs, issuer, audience, expiration, and project identity.
   * Custom HS256 tokens are NEVER accepted as equivalent to real Firebase ID tokens.
   */
  public static async verifyToken(tokenString: string, options?: { forceRejectHS256?: boolean }): Promise<AuthUser> {
    if (!tokenString || typeof tokenString !== 'string') {
      throw new Error('Token missing or invalid format');
    }

    const cleanToken = tokenString.startsWith('Bearer ')
      ? tokenString.slice(7).trim()
      : tokenString.trim();

    const parts = cleanToken.split('.');
    if (parts.length !== 3) {
      throw new Error('Malformed token structure: must be a 3-part JWT');
    }

    let header: { alg?: string; typ?: string; testFixture?: boolean } = {};
    try {
      header = JSON.parse(Buffer.from(parts[0], 'base64url').toString('utf8'));
    } catch {
      throw new Error('Invalid token header: cannot parse JSON');
    }

    // STRICT SECURITY CHECK:
    // Custom HS256 tokens are NEVER accepted in non-test environments or when forceRejectHS256 is enabled.
    if (header.alg === 'HS256') {
      if (!env.isTest || options?.forceRejectHS256) {
        throw new Error('Unauthorized token algorithm. Custom HS256 tokens are strictly forbidden in non-test environments. Real Firebase ID tokens verified by Firebase Admin SDK are required.');
      }
      // ONLY inside env.isTest: verify isolated unit-test fixture
      return this.verifyTestTokenIsolated(cleanToken, parts);
    }

    // OFFICIAL FIREBASE ADMIN SDK VERIFICATION FOR REAL FIREBASE ID TOKENS
    const app = getFirebaseAdminApp();
    try {
      const decoded = await getAuth(app).verifyIdToken(cleanToken, true);
      const role: UserRole = (decoded.role as UserRole) || (decoded['gripr_role'] as UserRole) || 'ORGANIZATION_USER';
      return {
        uid: decoded.uid,
        email: decoded.email || '',
        role,
        organizationId: (decoded.organizationId as string) || (decoded['gripr_org'] as string) || undefined,
        missionId: (decoded.missionId as string) || undefined
      };
    } catch (err: any) {
      throw new Error(`Firebase ID token verification failed via Admin SDK: ${err.message || 'Invalid token'}`);
    }
  }

  /**
   * Private isolated unit-test verification helper.
   * Strictly accessible only when env.isTest is true.
   */
  private static verifyTestTokenIsolated(token: string, parts: string[]): AuthUser {
    const [encodedHeader, encodedBody, signature] = parts;

    // Verify HMAC signature
    const expectedSig = crypto
      .createHmac('sha256', this.tokenSecret)
      .update(`${encodedHeader}.${encodedBody}`)
      .digest('base64url');

    let validSignature = false;
    try {
      const a = Buffer.from(signature);
      const b = Buffer.from(expectedSig);
      if (a.length === b.length && crypto.timingSafeEqual(a, b)) {
        validSignature = true;
      }
    } catch {
      validSignature = false;
    }

    if (!validSignature) {
      throw new Error('Token signature verification failed: invalid or tampered signature');
    }

    let payload: DecodedTokenPayload;
    try {
      payload = JSON.parse(Buffer.from(encodedBody, 'base64url').toString('utf8'));
    } catch {
      throw new Error('Invalid token payload: cannot parse JSON');
    }

    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      throw new Error(`Token expired at ${new Date(payload.exp * 1000).toISOString()}`);
    }

    if (!payload.uid) {
      throw new Error('Token payload missing mandatory user identifier (uid)');
    }

    const role: UserRole = payload.role || 'ORGANIZATION_USER';

    return {
      uid: payload.uid,
      email: payload.email || '',
      role,
      organizationId: payload.organizationId,
      missionId: payload.missionId
    };
  }
}
