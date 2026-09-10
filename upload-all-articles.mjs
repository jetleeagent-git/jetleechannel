#!/usr/bin/env node
/**
 * Upload ALL article files (with Thomson Reserve promo injected) to
 * jetleechannel.sg FTP.
 *
 * Mapping:
 * - {project}_articles/{file}.html  → /{slug}/articles/{file}.html
 * - article-*.html (root)           → /articles/{file}.html  (HQ)
 * - articles/{file}.html            → /articles/{file}.html  (HQ special)
 */

import { execSync } from 'child_process';
import { readdirSync, existsSync, readFileSync } from 'fs';

const FTP_HOST = '191.101.228.66';
const FTP_USER = 'u851958941.jetleechannel.sg';
const FTP_PASS = 'Jetleechannel12345&';

// Map project dir → slug (covers all 23 with _articles dirs)
const SLUGS = {
  amberwood: 'amberwood', arcady: 'arcady', bagnallhous: 'bagnallhous',
  BelgraviaAce: 'BelgraviaAce', dunearnhouse: 'dunearnhouse', elta: 'elta',
  'generations-tannery': 'generations-tannery', hougangcentral: 'hougangcentral',
  hudsonplace: 'hudsonplace', 'lentor-gardens': 'lentor-gardens',
  lucernegrand: 'lucernegrand', luxushill10: 'luxushill10',
  newportresidences: 'newportresidences', OneMarinaGardens: 'OneMarinaGardens',
  promenadepeak: 'promenadepeak', rivergreen: 'rivergreen',
  SophiaMeadow: 'SophiaMeadow', TheOrie: 'TheOrie', thesen: 'thesen',
  TheSierra: 'TheSierra', unionsquare: 'unionsquare', upperhouse: 'upperhouse',
  zyongrand: 'zyongrand',
};

function ftpUpload(localPath, remotePath) {
  const cmd = `curl -s -T "${localPath}" "ftp://${FTP_HOST}/${remotePath}" --user "${FTP_USER}:${FTP_PASS}" -o /dev/null -w "%{http_code}" --max-time 60 2>/dev/null`;
  try { return execSync(cmd, { encoding: 'utf-8', maxBuffer: 1024 * 1024 }).trim(); }
  catch (e) { return 'ERR'; }
}

const uploads = [];
const errors = [];

// 1. Project articles
for (const [dir, slug] of Object.entries(SLUGS)) {
  const localDir = `${dir}_articles`;
  if (!existsSync(localDir)) continue;
  for (const f of readdirSync(localDir)) {
    if (!f.endsWith('.html') || f === 'index.html') continue;
    const local = `${localDir}/${f}`;
    const remote = `${slug}/articles/${f}`;
    uploads.push({ local, remote, label: `/${slug}/articles/${f}` });
  }
}

// 2. HQ root articles → /articles/
for (const f of readdirSync('.')) {
  if (f.startsWith('article-') && f.endsWith('.html')) {
    const local = f;
    const remote = `articles/${f}`;
    uploads.push({ local, remote, label: `/articles/${f}` });
  }
}

// 3. HQ special articles/ files
for (const f of readdirSync('articles')) {
  if (!f.endsWith('.html') || f === 'index.html') continue;
  const local = `articles/${f}`;
  const remote = `articles/${f}`;
  uploads.push({ local, remote, label: `/articles/${f}` });
}

console.log(`Total files to upload: ${uploads.length}`);
let ok = 0;
for (const u of uploads) {
  const code = ftpUpload(u.local, u.remote);
  if (code === '226' || code === '200') { ok++; }
  else { errors.push(`${u.label} => ${code}`); }
  if (ok % 25 === 0 || ok === uploads.length) console.log(`  ${ok}/${uploads.length} done`);
}

console.log(`\n✅ Uploaded ${ok}/${uploads.length}`);
if (errors.length) {
  console.log(`\n❌ ERRORS (${errors.length}):`);
  for (const e of errors) console.log(`  ${e}`);
}
