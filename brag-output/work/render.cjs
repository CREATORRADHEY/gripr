const { chromium } = require('playwright-core');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const CHROME_PATH = '/Users/divyanshdusad/Library/Caches/ms-playwright/chromium-1243/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing';
const COMP_HTML = path.join(__dirname, 'comp.html');
const MIX_AUDIO = path.join(__dirname, 'mix.m4a');
const OUT_MP4 = path.resolve(__dirname, '..', 'gripr-demo.mp4');
const OUT_SHORT_MP4 = path.resolve(__dirname, '..', 'brag-short.mp4');
const OUT_POSTER = path.resolve(__dirname, '..', 'gripr-demo.jpg');
const OUT_SHORT_POSTER = path.resolve(__dirname, '..', 'brag-short.jpg');

const FPS = 30;
const DUR = 47.07; // exact match to audio mix duration
const TOTAL_FRAMES = Math.round(DUR * FPS);

async function main() {
  console.log(`[Render] Starting render: ${TOTAL_FRAMES} frames @ ${FPS}fps (${DUR}s)...`);
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

  // 1. Capture poster frame
  console.log('[Render] Capturing thumbnail poster frame at t=8.5s...');
  await page.evaluate(() => window.render(8.5));
  const posterBuffer = await page.screenshot({ type: 'jpeg', quality: 98 });
  fs.writeFileSync(OUT_POSTER, posterBuffer);
  fs.writeFileSync(OUT_SHORT_POSTER, posterBuffer);

  // 2. Spawn FFmpeg process
  console.log('[Render] Spawning FFmpeg video encoder...');
  const ffArgs = [
    '-y',
    '-loglevel', 'warning',
    '-f', 'image2pipe',
    '-vcodec', 'mjpeg',
    '-framerate', String(FPS),
    '-i', '-',
    '-i', MIX_AUDIO,
    '-c:v', 'libx264',
    '-pix_fmt', 'yuv420p',
    '-crf', '18',
    '-preset', 'fast',
    '-c:a', 'aac',
    '-b:a', '192k',
    '-shortest',
    OUT_MP4
  ];

  const ff = spawn('ffmpeg', ffArgs, { stdio: ['pipe', 'inherit', 'inherit'] });

  ff.on('error', err => {
    console.error('[FFmpeg Error]', err);
  });

  const startTime = Date.now();

  for (let i = 0; i < TOTAL_FRAMES; i++) {
    const t = i / FPS;
    await page.evaluate(t => window.render(t), t);
    const frameBuffer = await page.screenshot({ type: 'jpeg', quality: 96 });
    
    // Write frame to ffmpeg
    const ok = ff.stdin.write(frameBuffer);
    if (!ok) {
      await new Promise(resolve => ff.stdin.once('drain', resolve));
    }

    if (i % 90 === 0 || i === TOTAL_FRAMES - 1) {
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
      const percent = ((i / TOTAL_FRAMES) * 100).toFixed(1);
      console.log(`[Render] Frame ${i}/${TOTAL_FRAMES} (${percent}%) — ${elapsed}s elapsed`);
    }
  }

  ff.stdin.end();

  console.log('[Render] Waiting for FFmpeg to finalize encoding...');
  await new Promise((resolve, reject) => {
    ff.on('close', code => {
      if (code === 0) resolve();
      else reject(new Error(`FFmpeg exited with code ${code}`));
    });
  });

  // Duplicate for brag-short.mp4
  fs.copyFileSync(OUT_MP4, OUT_SHORT_MP4);

  await browser.close();

  const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`[Render] SUCCESS! Video rendered in ${totalTime}s.`);
  console.log(`[Render] Video: ${OUT_MP4}`);
  console.log(`[Render] Poster: ${OUT_POSTER}`);
}

main().catch(err => {
  console.error('[Render Error]', err);
  process.exit(1);
});
