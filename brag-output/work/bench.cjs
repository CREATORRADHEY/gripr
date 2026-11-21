const { chromium } = require('playwright-core');
const path = require('path');

const CHROME_PATH = '/Users/divyanshdusad/Library/Caches/ms-playwright/chromium-1243/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing';
const COMP_HTML = path.join(__dirname, 'comp.html');

async function bench() {
  const browser = await chromium.launch({
    executablePath: CHROME_PATH,
    headless: true
  });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  await page.goto(`file://${COMP_HTML}`, { waitUntil: 'load' });
  await page.waitForFunction(() => window.ready === true);

  console.time('30_frames_jpeg');
  for (let i = 0; i < 30; i++) {
    await page.evaluate(t => window.render(t), i / 30);
    await page.screenshot({ type: 'jpeg', quality: 95 });
  }
  console.timeEnd('30_frames_jpeg');

  await browser.close();
}

bench().catch(console.error);
