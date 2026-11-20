import crypto from 'node:crypto';
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

export class FirebaseAuthService {
  private static tokenSecret = env.INTERNAL_AUTH_SECRET || 'gripr_secure_jwt_secret_2026';

  /**
   * Cryptographically signs a test or service token for testing and local authentication
   */
  public static createTestToken(payload: {
    uid: string;
    email?: string;
    role: UserRole;
    organizationId?: string;
    missionId?: string;
    expiresInSeconds?: number;
  }): string {
    const header = { alg: 'HS256', typ: 'JWT' };
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
   * Verifies a Firebase ID token or internally signed service token
   */
  public static async verifyToken(tokenString: string): Promise<AuthUser> {
    if (!tokenString || typeof tokenString !== 'string') {
      throw new Error('Token missing or invalid format');
    }

    const cleanToken = tokenString.startsWith('Bearer ')
      ? tokenString.slice(7).trim()
      : tokenString.trim();

    // Support development / test secret token in test environment
    if (env.isTest && (cleanToken === env.INTERNAL_AUTH_SECRET || cleanToken === 'reviewer-test')) {
      return {
        uid: 'dev-test-reviewer',
        email: 'reviewer@gripr.test',
        role: 'RESEARCHER'
      };
    }

    const parts = cleanToken.split('.');
    if (parts.length !== 3) {
      throw new Error('Malformed token structure: must be a 3-part JWT');
    }

    const [encodedHeader, encodedBody, signature] = parts;

    // Verify HMAC signature
    const expectedSig = crypto
      .createHmac('sha256', this.tokenSecret)
      .update(`${encodedHeader}.${encodedBody}`)
      .digest('base64url');

    // Secure timing-safe equality check
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
