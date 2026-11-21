const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const VO_DIR = path.resolve(__dirname, 'vo');
if (!fs.existsSync(VO_DIR)) {
  fs.mkdirSync(VO_DIR, { recursive: true });
}

const lines = {
  L01: "Most startups don't fail from bad code. They fail from solving problems that don't exist.",
  L02: "GRIPR dot STUDIO is the first-party problem intelligence engine that verifies market demand before you build.",
  L03: "Frame your critical business hypothesis, target real operational participants, and set strict falsification criteria.",
  L04: "Five verified field participants undergo qualitative interviews under a strict three-tier consent framework with segregated PII.",
  L05: "Server-side Google Gemini models extract core operational friction with audited verbatim quotations and zero-hallucination verification.",
  L06: "Receive an audited Decision Intelligence Brief with actionable insights and clear Go, or No-Go conviction.",
  L07: "Know the ground truth before you build. Visit gripr dot studio."
};

const timing = {};

for (const [id, text] of Object.entries(lines)) {
  const aiffPath = path.join(VO_DIR, `${id}.aiff`);
  const wavPath = path.join(VO_DIR, `${id}.wav`);
  console.log(`[TTS] Generating ${id}...`);
  execSync(`say -v Samantha "${text.replace(/"/g, '\\"')}" -o "${aiffPath}"`);
  execSync(`ffmpeg -y -i "${aiffPath}" -ar 48000 -ac 2 "${wavPath}" 2>/dev/null`);
  fs.unlinkSync(aiffPath);

  const durationStr = execSync(`ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${wavPath}"`).toString().trim();
  timing[id] = parseFloat(durationStr);
  console.log(`[TTS] ${id} duration: ${timing[id]}s`);
}

fs.writeFileSync(path.join(__dirname, 'vo_timing.json'), JSON.stringify(timing, null, 2));
console.log('[TTS] All voiceover lines generated successfully.');
