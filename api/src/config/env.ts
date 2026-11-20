import { z } from 'zod';
import dotenv from 'dotenv';
import path from 'path';

// Load .env if present
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), 'api/.env') });

const EnvSchema = z.object({
  PORT: z.coerce.number().default(3000),
  HOST: z.string().default(process.env.NODE_ENV === 'production' ? '0.0.0.0' : '127.0.0.1'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  GEMINI_API_KEY: z.string().optional().default(''),
  GEMINI_MODEL: z.string().default('gemini-3.5-flash-lite'),
  FRONTEND_ORIGIN: z.string().default('http://127.0.0.1:5500,http://localhost:5500,http://127.0.0.1:8080,http://localhost:8080'),
  INTERNAL_AUTH_SECRET: z.string().optional(),
  FIREBASE_PROJECT_ID: z.string().default(process.env.GCP_PROJECT || process.env.GOOGLE_CLOUD_PROJECT || 'people-priorities-ai-1a433'),
  DEMO_MODE: z.enum(['true', 'false']).transform(v => v === 'true').default('false'),
  RATE_LIMIT_MAX: z.coerce.number().default(120),
  PERSISTENCE_MODE: z.enum(['cloud_firestore', 'local_file', 'demo_only', 'memory']).default(
    process.env.NODE_ENV === 'production' ? 'cloud_firestore' : 'local_file'
  ),
  SERVE_STATIC: z.enum(['true', 'false']).transform(v => v === 'true').default('true'),
}).superRefine((data, ctx) => {
  if (data.NODE_ENV === 'production') {
    if (!data.INTERNAL_AUTH_SECRET || data.INTERNAL_AUTH_SECRET.trim() === '' || data.INTERNAL_AUTH_SECRET === 'gripr_dev_ops_secret_2026') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['INTERNAL_AUTH_SECRET'],
        message: 'INTERNAL_AUTH_SECRET is mandatory in production and must not use known development default secrets.'
      });
    }
  }
});

const parsed = EnvSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment configuration:', parsed.error.format());
  throw new Error('Environment configuration validation failed');
}

export const env = {
  ...parsed.data,
  INTERNAL_AUTH_SECRET: parsed.data.INTERNAL_AUTH_SECRET || (parsed.data.NODE_ENV === 'production' ? '' : 'dev_transient_auth_secret_local_only'),
  ALLOWED_ORIGINS: parsed.data.FRONTEND_ORIGIN.split(',').map(s => s.trim()).filter(Boolean),
  isDev: parsed.data.NODE_ENV === 'development',
  isTest: parsed.data.NODE_ENV === 'test',
  isProd: parsed.data.NODE_ENV === 'production',
  isCloudFirestore: parsed.data.PERSISTENCE_MODE === 'cloud_firestore',
  isDemoOnly: parsed.data.PERSISTENCE_MODE === 'demo_only',
};
