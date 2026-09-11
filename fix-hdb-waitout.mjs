#!/usr/bin/env node
/**
 * Fix article-hdb-waitout-removed.html project copies: inject "← Back to {Project}" link.
 */
import { readFileSync, writeFileSync } from 'fs';
import { execSync } from 'child_process';

const WORKSPACE = '/home/ubuntu/.openclaw/workspace';
const FTP_HOST = '191.101.228.66';
const FTP_USER = 'u851958941.jetleechannel.sg';
const FTP_PASS = 'Jetleechannel12345&';

const NAMES = {
  elta: 'ELTA',
  dunearnhouse: 'Dunearn House',
  amberwood: 'Amberwood',
  arcady: 'The Arcady',
  hudsonplace: 'Hudson Place',
  hougangcentral: 'Hougang Central',
  'lentor-gardens': 'Lentor Gardens',
  lucernegrand: 'Lucerne Grand',
  OneMarinaGardens: 'One Marina Gardens',
  unionsquare: 'Union Square',
  'generations-tannery': 'Generations @ Tannery',
};

for (const [slug, name] of Object.entries(NAMES)) {
  const f = `${WORKSPACE}/tmp-hdb-fix/${slug}.html`;
  let html = readFileSync(f, 'utf-8');
  const orig = html;
  const back = `<a href="https://jetleechannel.sg/${slug}/" class="back">← Back to ${name}</a>`;
  // Inject right after <body> if no back link exists
  if (!html.includes('class="back') && !html.includes('class="back-link') && !html.includes('nav-top')) {
    html = html.replace('<body>', `<body>\n\n${back}`);
  }
  writeFileSync(f, html);
  // Upload
  const code = execSync(
    `curl -s -T "${f}" "ftp://${FTP_HOST}/${slug}/articles/article-hdb-waitout-removed.html" --user "${FTP_USER}:${FTP_PASS}" -o /dev/null -w "%{http_code}" --max-time 60 2>/dev/null`,
    { encoding: 'utf-8', maxBuffer: 1024 * 1024 }
  ).trim();
  console.log(`  ${slug}: ${code}`);
}
console.log('Done.');
