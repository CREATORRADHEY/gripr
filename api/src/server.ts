import { buildApp } from './app.js';
import { env } from './config/env.js';

async function start() {
  const app = buildApp();

  try {
    const address = await app.listen({
      port: env.PORT,
      host: env.HOST
    });

    console.log(`\n======================================================`);
    console.log(`  GRIPR.STUDIO — AI-Powered Problem Intelligence Platform`);
    console.log(`  Phase 2 Backend listening at: ${address}`);
    console.log(`  Health Check: ${address}/api/health`);
    console.log(`  Environment: ${env.NODE_ENV} | Gemini Model: ${env.GEMINI_MODEL}`);
    console.log(`  Commercial Model: Experimental Pilot (₹49,000 / 5 participants)`);
    console.log(`======================================================\n`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }

  // Graceful shutdown
  const signals: NodeJS.Signals[] = ['SIGINT', 'SIGTERM'];
  for (const signal of signals) {
    process.on(signal, async () => {
      console.log(`\nGracefully shutting down GRIPR backend (${signal})...`);
      await app.close();
      process.exit(0);
    });
  }
}

start();
