#!/usr/bin/env node
/**
 * Deploy "PropNex 2026 Outlook" article:
 * 1. HQ article → jetleechannel.sg/articles/article-propnex-2026-outlook.html
 * 2. HQ articles index → insert new card at top
 * 3. 22 project article files → /{slug}/articles/propnex-2026-outlook.html
 * 4. Project article indexes → insert new card at top (or create real index)
 * 5. luxushill10: create real articles index + add Articles nav link to homepage
 * 6. Sitemap + IndexNow ping
 */

import { execSync } from 'child_process';
import { writeFileSync, readFileSync, existsSync } from 'fs';

const FTP_HOST = '191.101.228.66';
const FTP_USER = 'u851958941.jetleechannel.sg';
const FTP_PASS = 'Jetleechannel12345&';
const ARTICLE = 'propnex-2026-outlook.html';
const HQ_ARTICLE = 'article-propnex-2026-outlook.html';

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
  { slug: 'BelgraviaAce', name: 'Belgravia Ace' },
  { slug: 'thesen', name: 'The Sen' },
  { slug: 'luxushill10', name: 'Luxus Hill 10' },
];

const CARD = `  <div class="card">
  <h2>Singapore Property Market Outlook 2026: Lower Rates Support Growth</h2>
  <div class="date">Published 14 August 2026</div>
  <p>PropNex forecasts 3-4% private home price growth in 2026 with ~9,000 new private homes sold. Lower mortgage rates, ABSD changes and the HDB wait-out removal are supporting demand — full breakdown inside.</p>
  <a href="${ARTICLE}">Read More →</a>
</div>
`;

const HQ_CARD = `    <div class="article-card">
      <a href="${HQ_ARTICLE}">
        <h2>Singapore Property Market Outlook 2026: Lower Rates Support Growth</h2>
        <p class="meta">Updated Aug 14, 2026</p>
        <p>PropNex forecasts 3-4% private home price growth in 2026 with ~9,000 new private homes sold. Lower mortgage rates, population growth and policy changes are supporting the market — a full breakdown.</p>
        <span class="read-more">Read More →</span>
      </a>
    </div>`;

function ftpUpload(localPath, remotePath) {
  const cmd = `curl -s -T "${localPath}" "ftp://${FTP_HOST}/${remotePath}" --user "${FTP_USER}:${FTP_PASS}" -o /dev/null -w "%{http_code}" --max-time 60 2>/dev/null`;
  try { return execSync(cmd, { encoding: 'utf-8', maxBuffer: 1024 * 1024 }).trim(); }
  catch (e) { return 'ERR'; }
}

function genericIndex(p) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="description" content="Property market insights and guides for buyers — market updates, outlook and more.">
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

// ── Build project indexes (insert card at top of live index, or create) ──
console.log('=== BUILD PROJECT INDEXES ===');
for (const p of PROJECTS) {
  const localArticle = `${p.slug}_articles/${ARTICLE}`;
  if (!existsSync(localArticle)) { console.log(`  ⚠ missing article: ${localArticle}`); continue; }

  let live = '';
  try { live = execSync(`curl -s "https://jetleechannel.sg/${p.slug}/articles/" --max-time 30`, { encoding: 'utf-8', maxBuffer: 2 * 1024 * 1024 }); }
  catch (e) { live = ''; }

  // Detect if it's a real project articles index (has .card or article-card and project h1) vs HQ fallback
  const isHqFallback = live.includes('Property Insights & Guides') || live.includes('Explore Property Guides') || live.includes('Let\'s Talk About Your Property Goals');
  const hasRealIndex = (live.includes('<div class="card">') || live.includes('article-card')) && !isHqFallback;
  let indexHtml;

  if (hasRealIndex) {
    // Insert card after <h1>...</h1>
    const h1Match = live.match(/<h1>[^<]*<\/h1>/);
    if (h1Match) {
      const pos = live.indexOf(h1Match[0]) + h1Match[0].length;
      indexHtml = live.slice(0, pos) + '\n' + CARD + '\n' + live.slice(pos);
      // Remove duplicate if already present
      const count = (indexHtml.match(new RegExp(ARTICLE.replace('.', '\\.'), 'g')) || []).length;
      if (count > 1) {
        const firstCard = indexHtml.indexOf(CARD);
        if (firstCard !== -1) indexHtml = indexHtml.slice(0, firstCard) + indexHtml.slice(firstCard + CARD.length);
      }
    } else {
      indexHtml = live.replace('<div class="footer">', CARD + '\n<div class="footer">');
    }
    writeFileSync(`${p.slug}_articles/index.html`, indexHtml);
    console.log(`  ${p.slug}: updated existing index`);
  } else {
    indexHtml = genericIndex(p);
    writeFileSync(`${p.slug}_articles/index.html`, indexHtml);
    console.log(`  ${p.slug}: ${isHqFallback ? 'created REAL index (was HQ fallback)' : 'created fresh index'}`);
  }
}

// ── Build HQ articles index (insert at top) ──
console.log('\n=== BUILD HQ INDEX ===');
{
  let hq = readFileSync('articles/index.html', 'utf-8');
  const h1Match = hq.match(/<h1>[^<]*<\/h1>/);
  const pos = hq.indexOf(h1Match[0]) + h1Match[0].length;
  let newHq = hq.slice(0, pos) + '\n' + HQ_CARD + '\n' + hq.slice(pos);
  if ((newHq.match(new RegExp(HQ_ARTICLE.replace('.', '\\.'), 'g')) || []).length > 1) {
    const firstCard = newHq.indexOf(HQ_CARD);
    if (firstCard !== -1) newHq = newHq.slice(0, firstCard) + newHq.slice(firstCard + HQ_CARD.length);
  }
  writeFileSync('articles/index.html', newHq);
  console.log('  HQ articles/index.html updated');
}

// ── luxushill10 homepage: add Articles nav link ──
console.log('\n=== LUXUSHILL10 NAV ===');
{
  const f = 'luxushill10/index.html';
  if (existsSync(f)) {
    let h = readFileSync(f, 'utf-8');
    if (!h.includes('/luxushill10/articles/')) {
      // Add nav item before the New Launch link
      const anchor = '<li><a href="https://jetleechannel.sg/new-launch/" rel="noopener">New Launch</a></li>';
      const add = '<li><a href="https://jetleechannel.sg/luxushill10/articles/">Articles</a></li>\n    ' + anchor;
      if (h.includes(anchor)) {
        h = h.replace(anchor, add);
        writeFileSync(f, h);
        console.log('  Articles nav link added to luxushill10/index.html');
      } else {
        console.log('  ⚠ nav anchor not found in luxushill10');
      }
    } else {
      console.log('  Articles nav link already present');
    }
  }
}

// ── Upload ──
console.log('\n=== UPLOAD HQ ===');
let c = ftpUpload(`articles/${HQ_ARTICLE}`, `articles/${HQ_ARTICLE}`);
console.log(`  articles/${HQ_ARTICLE}: ${c}`);
c = ftpUpload('articles/index.html', 'articles/index.html');
console.log(`  articles/index.html: ${c}`);

console.log('\n=== UPLOAD PROJECTS ===');
for (const p of PROJECTS) {
  const localArticle = `${p.slug}_articles/${ARTICLE}`;
  const localIndex = `${p.slug}_articles/index.html`;
  if (!existsSync(localArticle)) continue;
  // Ensure remote dir
  execSync(`curl -s --user "${FTP_USER}:${FTP_PASS}" "ftp://${FTP_HOST}/" -Q "MKD ${p.slug}" -Q "MKD ${p.slug}/articles" 2>/dev/null || true`, { encoding: 'utf-8', maxBuffer: 1024 * 1024 });
  const c1 = ftpUpload(localArticle, `${p.slug}/articles/${ARTICLE}`);
  const c2 = ftpUpload(localIndex, `${p.slug}/articles/index.html`);
  console.log(`  ${p.slug}: article=${c1} index=${c2}`);
}

// luxushill10 homepage
if (existsSync('luxushill10/index.html')) {
  c = ftpUpload('luxushill10/index.html', 'luxushill10/index.html');
  console.log(`  luxushill10/index.html: ${c}`);
}

console.log('\nAll uploads attempted.');
