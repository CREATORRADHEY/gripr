const { chromium } = require('playwright-core');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const CHROME_PATH = '/Users/divyanshdusad/Library/Caches/ms-playwright/chromium-1243/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing';
const COMP_HTML = path.join(__dirname, 'comp.html');
const STILLS_DIR = path.join(__dirname, 'stills');

if (!fs.existsSync(STILLS_DIR)) {
  fs.mkdirSync(STILLS_DIR, { recursive: true });
}

async function testStills() {
  console.log('[Render] Testing composition stills...');
  const browser = await chromium.launch({
    executablePath: CHROME_PATH,
    headless: true
  });

  const page = await browser.newPage({
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 1
  });

  await page.goto(`file://${COMP_HTML}`, { waitUntil: 'load' });
  await page.waitForFunction(() => window.ready === true);

  const testTimes = [2.0, 8.5, 16.0, 24.0, 32.0, 39.0, 45.0];
  for (const t of testTimes) {
    await page.evaluate(t => window.render(t), t);
    const outPath = path.join(STILLS_DIR, `still_${t.toFixed(1)}s.png`);
    await page.screenshot({ path: outPath });
    console.log(`[Render] Still captured at ${t}s -> ${outPath}`);
  }

  await browser.close();
  console.log('[Render] All stills captured successfully.');
}

testStills().catch(err => {
  console.error('[Render Error]', err);
  process.exit(1);
});
