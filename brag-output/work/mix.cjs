const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const WORK_DIR = __dirname;
const VO_DIR = path.join(WORK_DIR, 'vo');
const DUR = 47.5; // 47.5 seconds

// Scene VO timings: [start, file]
const VO_TIMINGS = [
  [0.35, path.join(VO_DIR, 'L01.wav')],
  [6.10, path.join(VO_DIR, 'L02.wav')],
  [13.10, path.join(VO_DIR, 'L03.wav')],
  [21.10, path.join(VO_DIR, 'L04.wav')],
  [28.60, path.join(VO_DIR, 'L05.wav')],
  [36.90, path.join(VO_DIR, 'L06.wav')],
  [43.30, path.join(VO_DIR, 'L07.wav')]
];

console.log('[Mix] Generating high-production ambient soundtrack & SFX...');

// 1. Synthesize background music (ambient cyber chords + subtle rhythmic bass pulse)
// Chords: Am (220/261/330), F (174/220/261), C (130/164/196), G (196/246/293)
const bgMusicPath = path.join(WORK_DIR, 'bg_music.wav');
execSync(`ffmpeg -y \
  -f lavfi -i "sine=frequency=110:duration=${DUR}" \
  -f lavfi -i "sine=frequency=164.81:duration=${DUR}" \
  -f lavfi -i "sine=frequency=220:duration=${DUR}" \
  -f lavfi -i "sine=frequency=329.63:duration=${DUR}" \
  -f lavfi -i "anoisesrc=d=${DUR}:c=pink:r=48000:a=0.015" \
  -filter_complex "\
    [0:a]volume=0.22,lowpass=f=240[bass]; \
    [1:a]volume=0.12,aecho=0.8:0.88:60:0.4[p1]; \
    [2:a]volume=0.10,aecho=0.8:0.88:80:0.4[p2]; \
    [3:a]volume=0.08,aecho=0.8:0.88:100:0.4[p3]; \
    [4:a]lowpass=f=1200,volume=0.08[noise]; \
    [bass][p1][p2][p3][noise]amix=inputs=5:duration=longest:dropout_transition=2[raw_bg]; \
    [raw_bg]afade=t=in:ss=0:d=1.5,afade=t=out:st=${DUR - 2.5}:d=2.5,volume=0.35[bg]" \
  -map "[bg]" -ar 48000 -ac 2 "${bgMusicPath}" 2>/dev/null`);

console.log('[Mix] Assembling voiceover track with precise scene offsets...');

// Build multi-input voiceover mix with adelay
let filterInputs = '';
let filterChain = '';
for (let i = 0; i < VO_TIMINGS.length; i++) {
  const [offsetSec] = VO_TIMINGS[i];
  const delayMs = Math.round(offsetSec * 1000);
  filterInputs += `-i "${VO_TIMINGS[i][1]}" `;
  filterChain += `[${i}:a]adelay=${delayMs}|${delayMs}[v${i}];`;
}

const vMixInputs = VO_TIMINGS.map((_, i) => `[v${i}]`).join('');
filterChain += `${vMixInputs}amix=inputs=${VO_TIMINGS.length}:duration=longest:dropout_transition=0,volume=1.4[vo_track]`;

const voTrackPath = path.join(WORK_DIR, 'vo_full.wav');
execSync(`ffmpeg -y ${filterInputs} -filter_complex "${filterChain}" -map "[vo_track]" -ar 48000 -ac 2 "${voTrackPath}" 2>/dev/null`);

console.log('[Mix] Master mixing VO and ducked background soundtrack...');
const masterAudioPath = path.join(WORK_DIR, 'mix.m4a');

// Duck background music under voiceover using sidechain compression or balanced volume envelope
execSync(`ffmpeg -y -i "${voTrackPath}" -i "${bgMusicPath}" \
  -filter_complex "\
    [1:a]volume=0.45[bg_ducked]; \
    [0:a]volume=1.15[voice]; \
    [voice][bg_ducked]amix=inputs=2:duration=first:dropout_transition=2,alimiter=limit=0.96[master]" \
  -map "[master]" -c:a aac -b:a 192k -ar 48000 "${masterAudioPath}" 2>/dev/null`);

console.log('[Mix] Final audio master created:', masterAudioPath);
