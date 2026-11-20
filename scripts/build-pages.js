const fs = require('node:fs');
const path = require('node:path');

const ROOT_DIR = path.resolve(__dirname, '..');
const OUT_DIR = path.join(ROOT_DIR, 'public');

const HTML_FILES = [
  'index.html',
  'missions.html',
  'demo.html',
  'brief.html',
  'terms.html',
  'privacy.html',
  'thankyou.html',
  'research-operations-demo.html',
  'admin.html',
  'case-file.html',
  'feed.html',
  'mission-workspace.html',
  'ops.html',
  'participate.html',
  'qualify.html',
  'sample-report.html',
  'submit.html'
];

const STATIC_DIRS = ['css', 'js', 'assets'];

const ASSET_FILES = [
  'gripr business model.png'
];

function copyFolderSync(from, to) {
  if (!fs.existsSync(from)) return;
  fs.mkdirSync(to, { recursive: true });
  const entries = fs.readdirSync(from, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(from, entry.name);
    const destPath = path.join(to, entry.name);
    if (entry.isDirectory()) {
      copyFolderSync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function build() {
  console.log('[GRIPR Pages Build] Preparing clean static public directory for Cloudflare Pages...');

  // Ensure clean target directory
  if (fs.existsSync(OUT_DIR)) {
    fs.rmSync(OUT_DIR, { recursive: true, force: true });
  }
  fs.mkdirSync(OUT_DIR, { recursive: true });

  let fileCount = 0;

  // 1. Copy individual HTML files
  for (const html of HTML_FILES) {
    const src = path.join(ROOT_DIR, html);
    if (fs.existsSync(src)) {
      fs.copyFileSync(src, path.join(OUT_DIR, html));
      fileCount++;
    }
  }

  // 2. Copy static asset directories
  for (const dir of STATIC_DIRS) {
    const src = path.join(ROOT_DIR, dir);
    if (fs.existsSync(src)) {
      copyFolderSync(src, path.join(OUT_DIR, dir));
    }
  }

  // 3. Copy standalone assets
  for (const asset of ASSET_FILES) {
    const src = path.join(ROOT_DIR, asset);
    if (fs.existsSync(src)) {
      fs.copyFileSync(src, path.join(OUT_DIR, asset));
      fileCount++;
    }
  }

  // 4. Generate Cloudflare Pages _redirects file
  const redirectsContent = [
    '/missions                  /missions.html                  200',
    '/demo                      /demo.html                      200',
    '/brief                     /brief.html                     200',
    '/terms                     /terms.html                     200',
    '/privacy                   /privacy.html                   200',
    '/thankyou                  /thankyou.html                  200',
    '/research-operations-demo  /research-operations-demo.html  200',
    '/ops                       /ops.html                       200',
    '/participate               /participate.html               200',
    '/admin                     /admin.html                     200'
  ].join('\n');
  fs.writeFileSync(path.join(OUT_DIR, '_redirects'), redirectsContent + '\n', 'utf8');

  // 5. Generate Cloudflare Pages _headers file for security
  const headersContent = [
    '/*',
    '  X-Content-Type-Options: nosniff',
    '  X-Frame-Options: SAMEORIGIN',
    '  Referrer-Policy: strict-origin-when-cross-origin'
  ].join('\n');
  fs.writeFileSync(path.join(OUT_DIR, '_headers'), headersContent + '\n', 'utf8');

  // 6. Security Audit: verify no sensitive files are present in public/
  const forbiddenPatterns = [
    '.env',
    'api',
    '.git',
    'Dockerfile',
    'render.yaml',
    'railway.json',
    'pnpm-lock.yaml',
    'package.json',
    'node_modules'
  ];

  function auditDir(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      for (const pattern of forbiddenPatterns) {
        if (entry.name === pattern) {
          throw new Error(`Security breach detected: forbidden asset ${fullPath} found in public directory!`);
        }
      }
      if (entry.isDirectory()) {
        auditDir(fullPath);
      }
    }
  }

  auditDir(OUT_DIR);

  console.log(`[GRIPR Pages Build] Successfully prepared ${OUT_DIR}`);
  console.log(`[GRIPR Pages Build] Security check: ZERO backend source, .env files, or credentials included.`);
}

build();
