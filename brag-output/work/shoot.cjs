const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');

const CHROME_PATH = '/Users/divyanshdusad/Library/Caches/ms-playwright/chromium-1243/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing';
const BASE_URL = 'https://gripr-studio.pages.dev';
const SHOTS_DIR = path.resolve(__dirname, 'shots');

if (!fs.existsSync(SHOTS_DIR)) {
  fs.mkdirSync(SHOTS_DIR, { recursive: true });
}

async function capture() {
  console.log('[Shoot] Launching browser...');
  const browser = await chromium.launch({
    executablePath: CHROME_PATH,
    headless: true
  });

  const ctx = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 1
  });

  const page = await ctx.newPage();

  // 1. Home Page Hero
  console.log('[Shoot] Capturing Homepage Hero...');
  await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(SHOTS_DIR, '01_home_hero.png') });

  // Scroll to methodology
  console.log('[Shoot] Capturing Homepage Methodology...');
  await page.evaluate(() => window.scrollBy(0, 900));
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(SHOTS_DIR, '02_home_methodology.png') });

  // Scroll to pilot pricing
  console.log('[Shoot] Capturing Homepage Pricing...');
  await page.evaluate(() => window.scrollBy(0, 1100));
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(SHOTS_DIR, '02b_home_pricing.png') });

  // 2. Missions Page (Step 1 Scoping)
  console.log('[Shoot] Capturing Missions Scoping...');
  await page.goto(`${BASE_URL}/missions`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(SHOTS_DIR, '03_missions_empty.png') });

  // Click "Use Demo Data" to populate Jaipur Kirana parameters
  console.log('[Shoot] Filling Demo Data on Missions...');
  try {
    const demoDataBtn = page.locator('#useDemoDataBtn, button:has-text("Use Demo Data")').first();
    if (await demoDataBtn.count() > 0) {
      await demoDataBtn.click();
      await page.waitForTimeout(600);
      await page.screenshot({ path: path.join(SHOTS_DIR, '04_missions_filled.png') });
    }
  } catch (e) {
    console.warn('[Shoot] Demo button click warning:', e.message);
  }

  // 3. Demo Page (Research Operations Workbench)
  console.log('[Shoot] Capturing Research Operations Demo...');
  await page.goto(`${BASE_URL}/demo`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);
  await page.screenshot({ path: path.join(SHOTS_DIR, '05_demo_workbench.png') });

  // Scroll to participants
  console.log('[Shoot] Capturing Research Participants...');
  await page.evaluate(() => window.scrollBy(0, 700));
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(SHOTS_DIR, '06_demo_participants.png') });

  // Scroll to Gemini extraction
  console.log('[Shoot] Capturing Gemini AI extraction...');
  await page.evaluate(() => window.scrollBy(0, 1300));
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(SHOTS_DIR, '07_demo_gemini.png') });

  // 4. Decision Intelligence Brief
  console.log('[Shoot] Capturing Decision Intelligence Brief...');
  await page.goto(`${BASE_URL}/brief`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);
  await page.screenshot({ path: path.join(SHOTS_DIR, '08_brief_exec.png') });

  await page.evaluate(() => window.scrollBy(0, 850));
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(SHOTS_DIR, '09_brief_findings.png') });

  // 5. Privacy & Evidence Governance
  console.log('[Shoot] Capturing Privacy Governance...');
  await page.goto(`${BASE_URL}/privacy`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(SHOTS_DIR, '10_privacy_governance.png') });

  console.log('[Shoot] All UI states captured successfully.');
  await browser.close();
}

capture().catch(err => {
  console.error('[Shoot Error]', err);
  process.exit(1);
});
