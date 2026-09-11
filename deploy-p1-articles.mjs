#!/usr/bin/env node
/**
 * Build/update articles index for all 19 project sites + upload article + index via FTP.
 * - For projects with existing real index: insert new card at top.
 * - For projects without real index (HQ fallback): create fresh generic index.
 * Uploads to jetleechannel.sg FTP: /{slug}/articles/{article} + /{slug}/articles/index.html
 */

import { execSync } from 'child_process';
import { writeFileSync, readFileSync, existsSync } from 'fs';

const FTP_HOST = '191.101.228.66';
const FTP_USER = 'u851958941.jetleechannel.sg';
const FTP_PASS = 'Jetleechannel12345&';
const ARTICLE = 'p1-phase-2c-ballots-2026.html';

const PROJECTS = [
  { slug: 'elta', name: 'ELTA' },
  { slug: 'dunearnhouse', name: 'Dunearn House' },
  { slug: 'amberwood', name: 'Amberwood' },
  { slug: 'arcady', name: 'The Arcady' },
  { slug: 'hudsonplace', name: 'Hudson Place' },
  { slug: 'hougangcentral', name: 'Hougang Central' },
  { slug: 'lentor-gardens', name: 'Lentor Gardens' },
  { slug: 'lucernegrand', name: 'Lucerne Grand' },
  { slug: 'OneMarinaGardens', name: 'One Marina Gardens' },
  { slug: 'unionsquare', name: 'Union Square' },
  { slug: 'generations-tannery', name: 'Generations @ Tannery' },
  { slug: 'TheSierra', name: 'The Serra Residences' },
  { slug: 'TheOrie', name: 'The Orie' },
  { slug: 'SophiaMeadow', name: 'Sophia Meadow' },
  { slug: 'bagnallhous', name: 'Bagnall Haus' },
  { slug: 'zyongrand', name: 'ZYON Grand' },
  { slug: 'promenadepeak', name: 'Promenade Peak' },
  { slug: 'rivergreen', name: 'River Green' },
  { slug: 'newportresidences', name: 'Newport Residences' },
];

const CARD = `  <div class="card">
  <h2>P1 Registration Phase 2C: Nearly Half of Primary Schools Oversubscribed — What It Means for Buyers</h2>
  <div class="date">Published 6 August 2026</div>
  <p>79 of 179 primary schools oversubscribed in Phase 2C — 73 going to ballot. Why the 1km rule matters more than ever, and what this means for property values near popular schools.</p>
  <a href="${ARTICLE}">Read More →</a>
</div>
`;

function genericIndex(p) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="description" content="Property market insights and guides for buyers — P1 registration, market updates and more.">
<link rel="canonical" href="https://jetleechannel.sg/${p.slug}/articles/">
<title>Articles & Market Insights | ${p.name} | Jet Lee</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;background:#0d1a12;color:#e8eae6;line-height:1.8;padding:2rem}
h1{font-family:'Playfair Display',Georgia,serif;color:#c9a84c;font-size:1.8rem;margin-bottom:1.5rem;font-weight:400}
a{color:#c9a84c;text-decoration:underline}
.back{color:rgba(232,234,230,.4);font-size:.78rem;display:block;margin-bottom:1rem}
.card{background:#14281e;border-radius:8px;padding:1.5rem;margin-bottom:1rem;border:1px solid rgba(255,255,255,.05)}
.card h2{font-family:'Playfair Display',Georgia,serif;color:#e4c97e;font-size:1.1rem;font-weight:400;margin-bottom:.3rem}
.card .date{color:rgba(232,234,230,.3);font-size:.72rem;margin-bottom:.6rem}
.card p{color:rgba(232,234,230,.6);font-size:.85rem;margin-bottom:.5rem}
.card a{color:#c9a84c;font-size:.82rem}
.footer{border-top:1px solid rgba(255,255,255,.06);padding-top:1.5rem;margin-top:2rem;text-align:center;font-size:.75rem;color:rgba(232,234,230,.4)}
</style>
</head>
<body>

<a href="https://jetleechannel.sg/${p.slug}/" class="back">← Back to ${p.name}</a>
<h1>${p.name} — Articles & Market Insights</h1>

${CARD}
<a href="https://jetleechannel.sg/${p.slug}/" style="display:inline-block;margin-top:1rem;padding:.7rem 2rem;background:#c9a84c;color:#0d1a12;text-decoration:none;font-size:.75rem;letter-spacing:.15em;text-transform:uppercase;font-weight:600;border-radius:4px">← Back to ${p.name}</a>

<div class="footer">
  <p>Jet Lee @ 8764 9315 · CEA Reg No. R007613B · PropNex Realty</p>
  <p><a href="https://jetleechannel.sg">jetleechannel.sg</a></p>
</div>

</body>
</html>
`;
}

function ftpUpload(localPath, remotePath) {
  const cmd = `curl -s -T "${localPath}" "ftp://${FTP_HOST}/${remotePath}" --user "${FTP_USER}:${FTP_PASS}" -o /dev/null -w "%{http_code}" --max-time 60 2>/dev/null`;
  const out = execSync(cmd, { encoding: 'utf-8', maxBuffer: 1024 * 1024 }).trim();
  return out;
}

// Build indexes
const results = [];
for (const p of PROJECTS) {
  const localArticle = `${p.slug}_articles/${ARTICLE}`;
  if (!existsSync(localArticle)) {
    console.log(`⚠️ Missing article file: ${localArticle}`);
    continue;
  }

  // Fetch live index
  let live = '';
  try {
    live = execSync(`curl -s "https://jetleechannel.sg/${p.slug}/articles/" --max-time 30`, { encoding: 'utf-8', maxBuffer: 2 * 1024 * 1024 });
  } catch (e) { live = ''; }

  const hasRealIndex = live.includes('<div class="card">') || live.includes('article-card');
  let indexHtml;

  if (hasRealIndex) {
    // Insert new card after <h1>...</h1> line
    const h1Match = live.match(/<h1>[^<]*<\/h1>/);
    if (h1Match) {
      const pos = live.indexOf(h1Match[0]) + h1Match[0].length;
      indexHtml = live.slice(0, pos) + '\n' + CARD + '\n' + live.slice(pos);
      // Remove duplicate card if it already exists
      if (indexHtml.includes('p1-phase-2c-ballots-2026.html')) {
        // check for dup
        const count = (indexHtml.match(/p1-phase-2c-ballots-2026\.html/g) || []).length;
        if (count > 1) {
          // remove the first occurrence block
          const firstCard = indexHtml.indexOf(CARD);
          if (firstCard !== -1) {
            indexHtml = indexHtml.slice(0, firstCard) + indexHtml.slice(firstCard + CARD.length);
          }
        }
      }
    } else {
      // fallback: insert before <div class="footer">
      indexHtml = live.replace('<div class="footer">', CARD + '\n<div class="footer">');
    }
    results.push({ slug: p.slug, type: 'existing-index' });
  } else {
    indexHtml = genericIndex(p);
    results.push({ slug: p.slug, type: 'created-index' });
  }

  writeFileSync(`${p.slug}_articles/index.html`, indexHtml);
}

console.log('Indexes built:');
for (const r of results) console.log(`  ${r.slug}: ${r.type}`);

// Upload everything
console.log('\n=== UPLOADING ===');
for (const p of PROJECTS) {
  const localArticle = `${p.slug}_articles/${ARTICLE}`;
  const localIndex = `${p.slug}_articles/index.html`;

  // Ensure remote dir exists
  execSync(`curl -s --user "${FTP_USER}:${FTP_PASS}" "ftp://${FTP_HOST}/${p.slug}/articles/" -Q "MKD ${p.slug}" -Q "MKD ${p.slug}/articles" 2>/dev/null || true`, { encoding: 'utf-8', maxBuffer: 1024 * 1024 });

  const c1 = ftpUpload(localArticle, `${p.slug}/articles/${ARTICLE}`);
  const c2 = ftpUpload(localIndex, `${p.slug}/articles/index.html`);
  console.log(`  ${p.slug}: article=${c1} index=${c2}`);
}
console.log('\nDone.');
