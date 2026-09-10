#!/usr/bin/env node
/**
 * Rebuild the Loyang articles index from the actual article files on the server.
 * Fetches each article's <h1>/<title>, builds cards, uploads the clean index.
 */
import { writeFileSync } from 'fs';
import { execSync } from 'child_process';

const FTP_HOST = '191.101.228.66';
const FTP_USER = 'u851958941.loyangvalleyresidences-official.com';
const FTP_PASS = 'Loyang12345&';
const BASE = 'https://loyangvalleyresidences-official.com';

// Articles discovered live from the FTP directory (newest last in listing → reverse).
// Dynamic scan: any .html file in /articles/ except index/indexold gets a card.
function listArticles() {
  const listing = execSync(`curl -s "ftp://${FTP_HOST}/articles/" --user "${FTP_USER}:${FTP_PASS}" --connect-timeout 15 --max-time 30`, { encoding: 'utf-8', maxBuffer: 2 * 1024 * 1024 });
  const names = listing.split('\n')
    .map(l => {
      // Format: -rw-r--r-- 1 owner group size Mon DD HH:MM name
      const m = l.match(/^[-dl]\S*\s+\d+\s+\S+\s+\S+\s+\d+\s+\S+\s+\d+\s+\d+:\d+\s+(\S+\.html)\s*$/);
      return m ? m[1] : null;
    })
    .filter(Boolean)
    .filter(n => !['index.html', 'indexold.html'].includes(n));
  // FTP lists newest last; we want newest first → reverse, then stable-sort by mtime desc
  return names.reverse();
}

function fetchArticle(name) {
  const url = `${BASE}/articles/${name}`;
  const html = execSync(`curl -s "${url}" -H "User-Agent: Mozilla/5.0" --max-time 30`, { encoding: 'utf-8', maxBuffer: 2 * 1024 * 1024 });
  const h1 = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/);
  const title = html.match(/<title>([\s\S]*?)<\/title>/);
  const desc = html.match(/<meta name="description" content="([^"]+)"/);
  const datePub = html.match(/"datePublished":\s*"([^"]+)"/);
  return {
    title: (h1 ? h1[1] : (title ? title[1] : name)).replace(/<[^>]+>/g, '').trim(),
    desc: desc ? desc[1] : '',
    date: datePub ? datePub[1] : '',
  };
}

function esc(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

let cards = '';
const ARTICLES = listArticles();
console.log(`Found ${ARTICLES.length} articles on server`);
for (const name of ARTICLES) {
  try {
    const a = fetchArticle(name);
    const d = a.date ? new Date(a.date + 'T00:00:00') : null;
    const label = d ? d.toLocaleDateString('en-SG', { day: 'numeric', month: 'long', year: 'numeric' }) : '';
    cards += `<div class="card">
  <h2>${esc(a.title)}</h2>
  ${label ? `<div class="date">Published ${label}</div>` : ''}
  <p>${esc(a.desc.slice(0, 160))}${a.desc.length > 160 ? '…' : ''}</p>
  <a href="${name}">Read More →</a>
</div>

`;
    console.log(`✅ ${name} — ${a.title.slice(0, 50)}`);
  } catch (e) {
    console.log(`❌ ${name} — ${e.message.slice(0, 60)}`);
  }
}

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="description" content="Loyang Valley Residences — articles and market insights for this D17 new launch.">
<link rel="canonical" href="${BASE}/articles/">
<title>Loyang Valley Residences — Articles & Market Insights</title>
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

<a href="${BASE}/" class="back">← Back to Loyang Valley Residences</a>
<h1>Loyang Valley Residences — Market Insights</h1>

${cards}
<a href="${BASE}/" style="display:inline-block;margin-top:1rem;padding:.7rem 2rem;background:#c9a84c;color:#0d1a12;text-decoration:none;font-size:.75rem;letter-spacing:.15em;text-transform:uppercase;font-weight:600;border-radius:4px">← Back to Loyang Valley Residences</a>

<div style="text-align:center;margin:1.8rem 0 0;font-size:.82rem;color:rgba(232,234,230,.55);">
  📰 Latest market news: <a href="https://t.me/PropNexPropertyNewsUpdate/9541" target="_blank" rel="noopener" style="color:#c9a84c;text-decoration:none;font-weight:600;">Orchard Road facelift — Istana Park, Dhoby Ghaut Green &amp; Penang Rd to form new park</a>
</div>

<div class="footer">
  <p>Jet Lee @ 8764 9315 · CEA Reg No. R007613B · PropNex Realty</p>
  <p><a href="https://jetleechannel.sg">jetleechannel.sg</a></p>
</div>

</body>
</html>
`;

writeFileSync('/home/ubuntu/.openclaw/workspace/loyang-articles/index.html', html, 'utf-8');
console.log('\n✅ Index rebuilt with', cards.split('<div class="card">').length - 1, 'cards');
