import { z } from 'zod';
import dotenv from 'dotenv';
import path from 'path';

// Load .env if present
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), 'api/.env') });

const EnvSchema = z.object({
  PORT: z.coerce.number().default(3000),
  HOST: z.string().default('127.0.0.1'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  GEMINI_API_KEY: z.string().optional().default(''),
  GEMINI_MODEL: z.string().default('gemini-3.5-flash-lite'),
  FRONTEND_ORIGIN: z.string().default('http://127.0.0.1:5500,http://localhost:5500,http://127.0.0.1:8080,http://localhost:8080'),
  INTERNAL_AUTH_SECRET: z.string().default('gripr_dev_ops_secret_2026'),
  FIREBASE_PROJECT_ID: z.string().default('gripr-studio'),
  DEMO_MODE: z.enum(['true', 'false']).transform(v => v === 'true').default('false'),
  RATE_LIMIT_MAX: z.coerce.number().default(120),
});

const parsed = EnvSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment configuration:', parsed.error.format());
  throw new Error('Environment configuration validation failed');
}

export const env = {
  ...parsed.data,
  ALLOWED_ORIGINS: parsed.data.FRONTEND_ORIGIN.split(',').map(s => s.trim()).filter(Boolean),
  isDev: parsed.data.NODE_ENV === 'development',
  isTest: parsed.data.NODE_ENV === 'test',
  isProd: parsed.data.NODE_ENV === 'production',
};
