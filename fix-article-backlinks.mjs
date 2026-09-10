#!/usr/bin/env node
/**
 * FIX ARTICLE BACK LINKS — Aug 9 2026
 * Problem: Article pages opened from project sites either
 *   1) link back to HQ blog ("← Back to Blog" → jetleechannel.sg) instead of the project, or
 *   2) have wrong back labels ("← Back to ELTA" on amberwood/OMG/generations), or
 *   3) have no back link at all (article-hdb-waitout-removed copies).
 *
 * Fix strategy:
 *   A. Project homepages: article cards + nav "Articles" → point to project-local /{slug}/articles/
 *   B. Project-local article copies: rewrite "Back to Blog"/"Back to ELTA"/missing → "Back to {Project}"
 *   C. Copy HQ articles that projects reference (amberwood 3x, hudson 3x, hougang 2x, lucerne 3x,
 *      union 2x, OMG omg-record, dunearnhouse/arcady/lentor/etc nav) into project /articles/ dirs
 *   D. Create thesen /articles/ (currently 404)
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { execSync } from 'child_process';
import { join } from 'path';

const WORKSPACE = '/home/ubuntu/.openclaw/workspace';
const FTP_HOST = '191.101.228.66';
const FTP_USER = 'u851958941.jetleechannel.sg';
const FTP_PASS = 'Jetleechannel12345&';

const PROJECTS = {
  elta:               { name: 'ELTA',               file: 'site-elta.html' },
  dunearnhouse:       { name: 'Dunearn House',      file: 'site-dunearnhouse.html' },
  amberwood:          { name: 'Amberwood',          file: 'site-amberwood.html' },
  arcady:             { name: 'The Arcady',         file: 'site-arcady.html' },
  hudsonplace:        { name: 'Hudson Place',       file: 'site-hudsonplace.html' },
  hougangcentral:     { name: 'Hougang Central',    file: 'site-hougangcentral.html' },
  'lentor-gardens':   { name: 'Lentor Gardens',     file: 'site-lentorgardens.html' },
  lucernegrand:       { name: 'Lucerne Grand',      file: 'site-lucernegrand.html' },
  OneMarinaGardens:   { name: 'One Marina Gardens', file: 'site-onemarinagarden.html' },
  unionsquare:        { name: 'Union Square',       file: 'site-unionsquare.html' },
  'generations-tannery': { name: 'Generations @ Tannery', file: 'site-generations-tannery.html' },
  TheSierra:          { name: 'The Serra Residences', file: 'thesierra/index.html' },
  TheOrie:            { name: 'The Orie',           file: 'theorie/index.html' },
  SophiaMeadow:       { name: 'Sophia Meadow',      file: 'sophiameadow/index.html' },
  bagnallhous:        { name: 'Bagnall Haus',       file: 'bagnallhous/index.html' },
  zyongrand:          { name: 'ZYON Grand',         file: 'zyongrand/index.html' },
  promenadepeak:      { name: 'Promenade Peak',     file: 'promenadepeak/index.html' },
  rivergreen:         { name: 'River Green',        file: 'rivergreen/index.html' },
  newportresidences:  { name: 'Newport Residences', file: 'newportresidences/index.html' },
  BelgraviaAce:       { name: 'Belgravia Ace',      file: 'BelgraviaAce/index.html' },
  thesen:             { name: 'The Sen @ Upper Bukit Timah', file: 'thesen/index.html' },
};

// HQ article files (local) that projects link to
const HQ_ARTICLES = {
  'article-amberwood-gcb-enclave.html':     'article-amberwood-gcb-enclave.html',
  'article-quiet-luxury-trend.html':        'article-quiet-luxury-trend.html',
  'article-d10-generational-wealth.html':   'article-d10-generational-wealth.html',
  'article-absd-guide-2026.html':           'article-absd-guide-2026.html',
  'article-absd-timing-trap.html':          'article-absd-timing-trap.html',
  'article-top-new-launches-2026.html':     'article-top-new-launches-2026.html',
  'article-lucerne-grand-review.html':      'article-lucerne-grand-review.html',
  'article-jld-lucerne-grand.html':         'article-jld-lucerne-grand.html',
  'article-cdl-track-record-lucerne-grand.html': 'article-cdl-track-record-lucerne-grand.html',
  'article-omg-record-3290.html':           'article-omg-record-3290.html',
};

// Per-project: which HQ articles should be copied into /{slug}/articles/
const PROJECT_HQ_COPIES = {
  amberwood: ['article-amberwood-gcb-enclave.html', 'article-quiet-luxury-trend.html', 'article-d10-generational-wealth.html'],
  hudsonplace: ['article-absd-guide-2026.html', 'article-absd-timing-trap.html', 'article-top-new-launches-2026.html'],
  hougangcentral: ['article-absd-guide-2026.html', 'article-top-new-launches-2026.html'],
  lucernegrand: ['article-lucerne-grand-review.html', 'article-jld-lucerne-grand.html', 'article-cdl-track-record-lucerne-grand.html'],
  unionsquare: ['article-absd-guide-2026.html', 'article-top-new-launches-2026.html'],
  OneMarinaGardens: ['article-omg-record-3290.html'],
};

function ftpUpload(localPath, remotePath) {
  const cmd = `curl -s -T "${localPath}" "ftp://${FTP_HOST}/${remotePath}" --user "${FTP_USER}:${FTP_PASS}" -o /dev/null -w "%{http_code}" --max-time 60 2>/dev/null`;
  try {
    const out = execSync(cmd, { encoding: 'utf-8', maxBuffer: 1024 * 1024 }).trim();
    return out;
  } catch (e) { return 'ERR'; }
}

function mkdirRemote(path) {
  execSync(`curl -s --user "${FTP_USER}:${FTP_PASS}" "ftp://${FTP_HOST}/" -Q "MKD ${path}" 2>/dev/null || true`, { encoding: 'utf-8', maxBuffer: 1024 * 1024 });
}

// ============ B: Fix back links inside project-local article copies ============
console.log('=== B: Fix back links in project-local article copies ===');
for (const [slug, cfg] of Object.entries(PROJECTS)) {
  const dir = join(WORKSPACE, `${slug}_articles`);
  if (!existsSync(dir)) continue;
  const files = execSync(`ls ${dir}/*.html 2>/dev/null`, { encoding: 'utf-8' }).trim().split('\n').filter(Boolean);
  for (const f of files) {
    if (f.endsWith('/index.html')) continue;
    let html = readFileSync(f, 'utf-8');
    const orig = html;
    const projectUrl = `https://jetleechannel.sg/${slug}/`;
    const backLabel = `← Back to ${cfg.name}`;
    const homeUrl = projectUrl;
    // Fix wrong "Back to ELTA" / "Back to {wrong}" labels → correct project
    html = html.replace(
      /<a href="https:\/\/jetleechannel\.sg\/[^"]*\/" class="back">← Back to [^<]*<\/a>/,
      `<a href="${homeUrl}" class="back">${backLabel}</a>`
    );
    // Fix "← Back to Blog" (HQ) → project
    html = html.replace(
      /<a href="https:\/\/jetleechannel\.sg\/blog\.html" class="back-link">[^<]*<\/a>|<a href="\/blog\.html" class="back-link">[^<]*<\/a>|<a href="https:\/\/jetleechannel\.sg\/blog\.html" class="back-link">&larr; Back to Property Blog<\/a>/g,
      `<a href="${homeUrl}" class="back-link">${backLabel}</a>`
    );
    // If still no back link at start of body (article-hdb-waitout copies), inject one
    if (!html.includes('class="back') && !html.includes('class="back-link')) {
      html = html.replace('<body>', `<body>\n\n<a href="${homeUrl}" class="back">${backLabel}</a>`);
    }
    if (html !== orig) {
      writeFileSync(f, html);
      console.log(`  ✅ ${slug}/${f.split('/').pop()}`);
    }
  }
}

// ============ C: Copy HQ articles into project dirs with rewritten back links ============
console.log('\n=== C: Copy HQ articles into project /articles/ dirs ===');
for (const [slug, articles] of Object.entries(PROJECT_HQ_COPIES)) {
  const cfg = PROJECTS[slug];
  const dir = join(WORKSPACE, `${slug}_articles`);
  mkdirSync(dir, { recursive: true });
  for (const art of articles) {
    const src = join(WORKSPACE, HQ_ARTICLES[art]);
    if (!existsSync(src)) { console.log(`  ⚠ missing HQ src: ${art}`); continue; }
    let html = readFileSync(src, 'utf-8');
    const projectUrl = `https://jetleechannel.sg/${slug}/`;
    const backLabel = `← Back to ${cfg.name}`;
    // Rewrite canonical + og:url to project-local URL
    const canon = `https://jetleechannel.sg/${slug}/articles/${art}`;
    html = html.replace(/<link rel="canonical" href="[^"]*">/, `<link rel="canonical" href="${canon}">`);
    html = html.replace(/<meta property="og:url" content="[^"]*">/, `<meta property="og:url" content="${canon}">`);
    // Rewrite back link
    html = html.replace(
      /<a href="https:\/\/jetleechannel\.sg\/blog\.html" class="back-link">[^<]*<\/a>|<a href="\/blog\.html" class="back-link">[^<]*<\/a>/g,
      `<a href="${projectUrl}" class="back-link">${backLabel}</a>`
    );
    html = html.replace(
      /<a href="https:\/\/jetleechannel\.sg\/blog\.html" class="nav-top">[^<]*<\/a>/g,
      `<a href="${projectUrl}" class="nav-top">${backLabel}</a>`
    );
    // If no back-link present, inject
    if (!html.includes('class="back-link') && !html.includes('class="nav-top"')) {
      html = html.replace('<body>', `<body>\n\n<a href="${projectUrl}" class="back-link">${backLabel}</a>`);
    }
    writeFileSync(join(dir, art), html);
    console.log(`  ✅ ${slug}/articles/${art}`);
  }
}

// ============ D: thesen /articles/ — create from HQ with thesen links ============
console.log('\n=== D: Create thesen /articles/ ===');
{
  const slug = 'thesen';
  const cfg = PROJECTS[slug];
  const dir = join(WORKSPACE, 'thesen_articles');
  mkdirSync(dir, { recursive: true });
  const art = 'article-hdb-waitout-removed.html';
  const src = join(WORKSPACE, art);
  if (existsSync(src)) {
    let html = readFileSync(src, 'utf-8');
    const projectUrl = `https://jetleechannel.sg/${slug}/`;
    const backLabel = `← Back to ${cfg.name}`;
    html = html.replace(/<link rel="canonical" href="[^"]*">/, `<link rel="canonical" href="https://jetleechannel.sg/${slug}/articles/${art}">`);
    html = html.replace('<body>', `<body>\n\n<a href="${projectUrl}" class="back">${backLabel}</a>`);
    writeFileSync(join(dir, art), html);
    console.log(`  ✅ ${slug}/articles/${art} (created)`);
  }
}

// ============ A: Fix project homepage nav + article cards ============
console.log('\n=== A: Fix project homepage links → project-local articles ===');
for (const [slug, cfg] of Object.entries(PROJECTS)) {
  const f = join(WORKSPACE, cfg.file);
  if (!existsSync(f)) { console.log(`  ⚠ missing homepage: ${cfg.file}`); continue; }
  let html = readFileSync(f, 'utf-8');
  const orig = html;
  // 1. Nav "Articles" link → project-local
  html = html.replace(
    /<a href="https:\/\/jetleechannel\.sg\/articles\/"[^>]*>Articles<\/a>/g,
    `<a href="https://jetleechannel.sg/${slug}/articles/" target="_blank" rel="noopener">Articles</a>`
  );
  // 2. "View All Articles" → project-local
  html = html.replace(
    /href="https:\/\/jetleechannel\.sg\/articles\/"/g,
    `href="https://jetleechannel.sg/${slug}/articles/"`
  );
  // 3. Article cards → project-local copies (map exact HQ article names)
  const copyMap = PROJECT_HQ_COPIES[slug] || [];
  for (const art of copyMap) {
    html = html.replace(
      new RegExp(`href="https://jetleechannel\\.sg/articles/${art.replace(/\./g, '\\.')}"`, 'g'),
      `href="https://jetleechannel.sg/${slug}/articles/${art}"`
    );
  }
  if (html !== orig) {
    writeFileSync(f, html);
    console.log(`  ✅ ${cfg.file} (${(orig.match(/jetleechannel\.sg\/articles\//g) || []).length} HQ refs → local)`);
  } else {
    console.log(`  – ${cfg.file} (no HQ refs to fix)`);
  }
}

console.log('\nLocal fixes complete. Now uploading…');
