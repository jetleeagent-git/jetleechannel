#!/usr/bin/env node
/**
 * Add article cards for newly-copied HQ articles into each project's articles index.html.
 * Extracts title/date/description from the article file itself.
 */
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

const WORKSPACE = '/home/ubuntu/.openclaw/workspace';

const PROJECT_HQ_COPIES = {
  amberwood: ['article-amberwood-gcb-enclave.html', 'article-quiet-luxury-trend.html', 'article-d10-generational-wealth.html'],
  hudsonplace: ['article-absd-guide-2026.html', 'article-absd-timing-trap.html', 'article-top-new-launches-2026.html'],
  hougangcentral: ['article-absd-guide-2026.html', 'article-top-new-launches-2026.html'],
  lucernegrand: ['article-lucerne-grand-review.html', 'article-jld-lucerne-grand.html', 'article-cdl-track-record-lucerne-grand.html'],
  unionsquare: ['article-absd-guide-2026.html', 'article-top-new-launches-2026.html'],
  OneMarinaGardens: ['article-omg-record-3290.html'],
};

function extractMeta(html, art) {
  const title = (html.match(/<title>([^<]*)<\/title>/) || [])[1]?.replace(/\s*\|\s*[^|]*$/, '').trim() || art;
  const desc = (html.match(/<meta name="description" content="([^"]*)"/) || [])[1] || '';
  const published = (html.match(/Published (\d{1,2} \w+ 2026)/) || [])[1] ||
                    (html.match(/"datePublished":\s*"([^"]*)"/) || [])[1] || '';
  return { title, desc, published };
}

function fmtDate(d) {
  if (!d) return '';
  const m = d.match(/(\d{1,2}) (\w+) (\d{4})/);
  if (m) return `Published ${m[1]} ${m[2]} ${m[3]}`;
  const iso = d.match(/(\d{4}-\d{2}-\d{2})/);
  if (iso) {
    const [y, mo, da] = iso[1].split('-').map(Number);
    const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    return `Published ${da} ${months[mo-1]} ${y}`;
  }
  return `Published 2026`;
}

for (const [slug, articles] of Object.entries(PROJECT_HQ_COPIES)) {
  const dir = join(WORKSPACE, `${slug}_articles`);
  const idxFile = join(dir, 'index.html');
  if (!existsSync(idxFile)) { console.log(`⚠ no index for ${slug}`); continue; }
  let idx = readFileSync(idxFile, 'utf-8');
  const orig = idx;

  // Build cards for articles not already in the index
  let added = 0;
  for (const art of articles) {
    if (idx.includes(`href="${art}"`)) { continue; }
    const af = join(dir, art);
    if (!existsSync(af)) continue;
    const meta = extractMeta(readFileSync(af, 'utf-8'), art);
    const card = `
<div class="card">
  <h2>${meta.title.replace(/&/g, '&amp;')}</h2>
  <div class="date">${fmtDate(meta.published)}</div>
  <p>${meta.desc}</p>
  <a href="${art}">Read More →</a>
</div>
`;
    // Insert after <h1> line
    const h1Match = idx.match(/<h1>[^<]*<\/h1>/);
    if (h1Match) {
      const pos = idx.indexOf(h1Match[0]) + h1Match[0].length;
      idx = idx.slice(0, pos) + card + idx.slice(pos);
    } else {
      idx = idx.replace('<div class="footer">', card + '<div class="footer">');
    }
    added++;
  }
  if (idx !== orig) {
    writeFileSync(idxFile, idx);
    console.log(`  ✅ ${slug}: added ${added} card(s)`);
  } else {
    console.log(`  – ${slug}: no changes`);
  }
}
console.log('Done.');
