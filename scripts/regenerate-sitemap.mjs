#!/usr/bin/env node
/**
 * Regenerate jetleechannel.sg/sitemap.xml — comprehensive & correct.
 * Fixes:
 *  - Removes dead subdomain URLs (eltasingapore.jetleechannel.sg = 525)
 *  - Removes duplicate /articles/ entry
 *  - Uses correct paths (/elta/ not /eltasingapore/)
 *  - Adds ALL project pages (25) + all articles (30) + new-launch
 * Uploads via main FTP.
 */

import { execSync } from 'child_process';

const FTP_HOST = '191.101.228.66';
const FTP_USER = 'u851958941.jetleechannel.sg';
const FTP_PASS = 'Jetleechannel12345&';

const BASE = 'https://jetleechannel.sg';

// All project pages (live, verified 200)
const PROJECTS = [
  'elta', 'dunearnhouse', 'amberwood', 'arcady', 'hudsonplace',
  'hougangcentral', 'lentor-gardens', 'lucernegrand', 'OneMarinaGardens',
  'unionsquare', 'generations-tannery', 'TheSerra', 'TheOrie', 'SophiaMeadow',
  'bagnallhous', 'zyongrand', 'promenadepeak', 'rivergreen', 'newportresidences',
  'granddunman', 'narraresidences', 'velabay', 'thesen', 'thecontinuum', 'upperhouse', 'BelgraviaAce',
];

// All articles (verified via FTP listing)
const ARTICLES = [
  'article-1km-school-2026.html',
  'article-absd-guide-2026.html',
  'article-absd-timing-trap.html',
  'article-amberwood-gcb-enclave.html',
  'article-arcady-boon-keng.html',
  'article-cdl-track-record-lucerne-grand.html',
  'article-crl-phase-3-stations.html',
  'article-d10-generational-wealth.html',
  'article-elta-balance-units.html',
  'article-en-bloc-thresholds-2026.html',
  'article-gcb-scarcity-value.html',
  'article-hdb-upgrade-guide.html',
  'article-hdb-vs-condo-2026.html',
  'article-hdb-waitout-removed.html',
  'article-home-loan-guide-2026.html',
  'article-hougang-central-guide.html',
  'article-hudson-place-transport.html',
  'article-jld-lucerne-grand.html',
  'article-lentor-gardens-guide.html',
  'article-lucerne-grand-review.html',
  'article-million-dollar-hdb-buyers.html',
  'article-p1-phase-2c-ballots-2026.html',
  'article-quiet-luxury-trend.html',
  'article-selling-hdb-2026.html',
  'article-tan-boon-liat.html',
  'article-top-new-launches-2026.html',
  'article-union-square-investment.html',
  'article-wealth-preservation.html',
  'article-wealthy-families-condo.html',
  'cov-back-2026.html',
];

const today = new Date().toISOString().slice(0, 10); // 2026-08-05

function url(loc, lastmod, changefreq, priority) {
  return `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`;
}

const lines = [];
lines.push('<?xml version="1.0" encoding="UTF-8"?>');
lines.push('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');
lines.push(url(`${BASE}/`, today, 'weekly', '1.0'));
lines.push(url(`${BASE}/articles/`, today, 'weekly', '0.9'));
lines.push(url(`${BASE}/new-launch/`, today, 'weekly', '0.9'));
lines.push(url(`${BASE}/projects/`, today, 'monthly', '0.8'));

lines.push('\n  <!-- Project Pages -->');
for (const p of PROJECTS) {
  lines.push(url(`${BASE}/${p}/`, today, 'weekly', '0.9'));
}

// Special sub-pages (balance units, articles) for projects that have them
lines.push(url(`${BASE}/BelgraviaAce/balance/`, today, 'daily', '0.8'));
lines.push(url(`${BASE}/BelgraviaAce/articles/`, today, 'monthly', '0.7'));

lines.push('\n  <!-- Articles -->');
for (const a of ARTICLES) {
  lines.push(url(`${BASE}/articles/${a}`, today, 'monthly', '0.8'));
}

lines.push('</urlset>');

const sitemap = lines.join('\n') + '\n';

// Write locally
const fs = await import('fs');
fs.writeFileSync('/tmp/jet-sitemap-new.xml', sitemap);

// Upload
const cmd = `curl -s -T /tmp/jet-sitemap-new.xml "ftp://${FTP_HOST}/sitemap.xml" --user "${FTP_USER}:${FTP_PASS}" -o /dev/null -w "%{http_code}" --connect-timeout 15 --max-time 90`;
try {
  const code = execSync(cmd, { encoding: 'utf-8', maxBuffer: 1024 * 1024 }).trim();
  console.log(`Upload: ${code}`);
} catch (e) {
  console.error('Upload failed:', e.message);
}

console.log(`\nSitemap generated: ${PROJECTS.length} projects + ${ARTICLES.length} articles + 4 core = ${PROJECTS.length + ARTICLES.length + 4} URLs`);
console.log('First 5 lines:');
console.log(sitemap.split('\n').slice(0, 12).join('\n'));
