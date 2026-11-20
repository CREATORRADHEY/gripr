/**
 * Live Gemini Smoke Test.
 * 
 * Only executes real network requests to Google Gemini when GEMINI_API_KEY is configured.
 * Clearly reports whether live test ran or was skipped.
 */

import { GeminiService } from '../src/services/gemini.service.js';
import { env } from '../src/config/env.js';

async function runLiveSmokeTest() {
  console.log('\n======================================================');
  console.log('  GRIPR.STUDIO — LIVE GEMINI AI SMOKE TEST');
  console.log('======================================================\n');

  if (!env.GEMINI_API_KEY || env.GEMINI_API_KEY === 'YOUR_GEMINI_API_KEY_HERE') {
    console.log('ℹ️  STATUS: SKIPPED (No valid GEMINI_API_KEY configured in environment)');
    console.log('   To run live Gemini smoke tests:');
    console.log('   1. Obtain an API key from Google AI Studio (https://aistudio.google.com/)');
    console.log('   2. Set GEMINI_API_KEY in api/.env');
    console.log('   3. Run: npm run test:smoke\n');
    console.log('   Automated test suite (npm test) executes against verified deterministic mocks.\n');
    process.exit(0);
  }

  console.log(`📡 Connecting to Google Gen AI with model: ${env.GEMINI_MODEL}...`);
  const service = new GeminiService();

  try {
    const startTime = Date.now();
    const result = await service.extractEvidence(
      'Sowing ke time par urea lene gaye toh dukan wale Sharma ji ne bola 2 din baad aao. Humne ₹80 extra dekar dusre gaon se emergency bag mangaaya.',
      'Emergency telephone order to neighboring village retailer',
      'Smallholder Farmer (Sugarcane)',
      'Peak Sowing Input Procurement'
    );
    const elapsed = Date.now() - startTime;

    console.log('✅ LIVE GEMINI TEST: PASS');
    console.log(`   Model Used: ${result.modelUsed}`);
    console.log(`   Latency: ${elapsed}ms`);
    console.log(`   Estimated Tokens: ${result.tokenEstimate || 'N/A'}`);
    console.log(`   Extracted Problem: "${result.extraction.reportedProblem.content}"`);
    console.log(`   Workaround: "${result.extraction.currentWorkaround.content}"`);
    console.log(`   Supporting Quotations: ${JSON.stringify(result.extraction.supportingQuotations)}\n`);
    process.exit(0);
  } catch (err: any) {
    console.error('❌ LIVE GEMINI TEST: FAIL');
    console.error(`   Error: ${err.message}\n`);
    process.exit(1);
  }
}

runLiveSmokeTest();
