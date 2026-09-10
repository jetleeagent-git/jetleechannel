import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';

const WORKSPACE = '/home/ubuntu/.openclaw/workspace';
const DIR = join(WORKSPACE, 'articles');

const MONTH_MAP = {
  jan: 0, january: 0,
  feb: 1, february: 1,
  mar: 2, march: 2,
  apr: 3, april: 3,
  may: 4,
  jun: 5, june: 5,
  jul: 6, july: 6,
  aug: 7, august: 7,
  sep: 8, sept: 8, september: 8,
  oct: 9, october: 9,
  nov: 10, november: 10,
  dec: 11, december: 11
};

// Known explicit date overrides for accuracy
const DATE_OVERRIDES = {
  'article-bt-q4-launches-2026.html': { dateStr: '7 September 2026', time: new Date(2026, 8, 7).getTime() },
  'og-rejects-lawsuit-from-hao-mart-linked-company-as-an-abuse.html': { dateStr: '7 September 2026', time: new Date(2026, 8, 7).getTime() },
  'how-a-woman-tried-to-salvage-a-bad-investment-but-lost-1-6m.html': { dateStr: '4 September 2026', time: new Date(2026, 8, 4).getTime() },
  'kallang-distripark-to-be-redeveloped-for-thousands-of-new-pr.html': { dateStr: '25 August 2026', time: new Date(2026, 7, 25).getTime() },
  'article-ultra-rich-buy-property.html': { dateStr: '21 August 2026', time: new Date(2026, 7, 21).getTime() },
  'article-hdb-electronic-payment-2026.html': { dateStr: '19 August 2026', time: new Date(2026, 7, 19).getTime() },
  'article-propnex-2026-outlook.html': { dateStr: '14 August 2026', time: new Date(2026, 7, 14).getTime() },
  'article-hdb-private-decoupling-2026.html': { dateStr: '13 August 2026', time: new Date(2026, 7, 13).getTime() },
  'article-p1-phase-2c-ballots-2026.html': { dateStr: '6 August 2026', time: new Date(2026, 7, 6).getTime() },
  'article-en-bloc-thresholds-2026.html': { dateStr: '4 August 2026', time: new Date(2026, 7, 4).getTime() },
  'article-million-dollar-hdb-buyers.html': { dateStr: '3 August 2026', time: new Date(2026, 7, 3).getTime() },
  'article-crl-phase-3-stations.html': { dateStr: '31 July 2026', time: new Date(2026, 6, 31).getTime() },
  'article-omg-record-3290.html': { dateStr: '29 July 2026', time: new Date(2026, 6, 29).getTime() },
  'article-hdb-waitout-removed.html': { dateStr: '28 July 2026', time: new Date(2026, 6, 28).getTime() },
  'article-tan-boon-liat.html': { dateStr: '22 July 2026', time: new Date(2026, 6, 22).getTime() },
  'article-arcady-boon-keng.html': { dateStr: '16 July 2026', time: new Date(2026, 6, 16).getTime() },
  'article-elta-balance-units.html': { dateStr: '16 July 2026', time: new Date(2026, 6, 16).getTime() },
  'article-hougang-central-guide.html': { dateStr: '16 July 2026', time: new Date(2026, 6, 16).getTime() },
  'article-hudson-place-transport.html': { dateStr: '16 July 2026', time: new Date(2026, 6, 16).getTime() },
  'article-lentor-gardens-guide.html': { dateStr: '16 July 2026', time: new Date(2026, 6, 16).getTime() },
  'article-union-square-investment.html': { dateStr: '16 July 2026', time: new Date(2026, 6, 16).getTime() },
  'article-amberwood-gcb-enclave.html': { dateStr: '15 July 2026', time: new Date(2026, 6, 15).getTime() },
  'article-cdl-track-record-lucerne-grand.html': { dateStr: '15 July 2026', time: new Date(2026, 6, 15).getTime() },
  'article-d10-generational-wealth.html': { dateStr: '15 July 2026', time: new Date(2026, 6, 15).getTime() },
  'article-gcb-scarcity-value.html': { dateStr: '15 July 2026', time: new Date(2026, 6, 15).getTime() },
  'article-jld-lucerne-grand.html': { dateStr: '15 July 2026', time: new Date(2026, 6, 15).getTime() },
  'article-lucerne-grand-review.html': { dateStr: '15 July 2026', time: new Date(2026, 6, 15).getTime() },
  'article-quiet-luxury-trend.html': { dateStr: '15 July 2026', time: new Date(2026, 6, 15).getTime() },
  'article-wealthy-families-condo.html': { dateStr: '15 July 2026', time: new Date(2026, 6, 15).getTime() },
  'article-wealth-preservation.html': { dateStr: '10 July 2026', time: new Date(2026, 6, 10).getTime() },
  'article-dunearn-house-1km-school.html': { dateStr: '8 July 2026', time: new Date(2026, 6, 8).getTime() },
  'article-dunearn-house-4yr-exit.html': { dateStr: '8 July 2026', time: new Date(2026, 6, 8).getTime() },
  'article-dunearn-house-review.html': { dateStr: '8 July 2026', time: new Date(2026, 6, 8).getTime() },
  'article-dunearn-house-combined.html': { dateStr: '8 July 2026', time: new Date(2026, 6, 8).getTime() },
  'article-absd-timing-trap.html': { dateStr: '2 July 2026', time: new Date(2026, 6, 2).getTime() },
  'article-top-new-launches-2026.html': { dateStr: '2 July 2026', time: new Date(2026, 6, 2).getTime() },
  'article-absd-guide-2026.html': { dateStr: '2 July 2026', time: new Date(2026, 6, 2).getTime() },
  'cov-back-2026.html': { dateStr: '2 July 2026', time: new Date(2026, 6, 2).getTime() },
  'how-to-buy-balance-units.html': { dateStr: '12 June 2026', time: new Date(2026, 5, 12).getTime() }
};

function esc(s) {
  if (!s) return '';
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function parseArticle(file) {
  const content = readFileSync(join(DIR, file), 'utf-8');

  // Title
  let title = '';
  const tMatch = content.match(/<title>(.*?)<\/title>/i) || content.match(/<h1>(.*?)<\/h1>/i);
  if (tMatch) {
    title = tMatch[1].replace(/\s*\|.*/, '').replace(/&amp;/g, '&').replace(/&quot;/g, '"').trim();
  } else {
    title = file.replace(/\.html$/, '').replace(/[-_]/g, ' ');
  }

  // Description
  let desc = '';
  const dMatch = content.match(/<meta\s+name="description"\s+content="([^"]+)"/i);
  if (dMatch) {
    desc = dMatch[1].trim();
  } else {
    const pMatch = content.match(/<p>([\s\S]*?)<\/p>/i);
    if (pMatch) desc = pMatch[1].replace(/<[^>]+>/g, '').trim();
  }

  // Date
  let dateObj = DATE_OVERRIDES[file];
  if (!dateObj) {
    const p = /(?:Published|Updated)\s+([0-9]{1,2})\s+([A-Za-z]+)\s+([0-9]{4})/i;
    const m = content.match(p);
    if (m) {
      const day = parseInt(m[1], 10);
      const mon = MONTH_MAP[m[2].toLowerCase()] !== undefined ? MONTH_MAP[m[2].toLowerCase()] : 7;
      const year = parseInt(m[3], 10);
      dateObj = { dateStr: `${day} ${m[2]} ${year}`, time: new Date(year, mon, day).getTime() };
    } else {
      dateObj = { dateStr: 'July 2026', time: new Date(2026, 6, 1).getTime() };
    }
  }

  return { file, title, desc, dateStr: dateObj.dateStr, time: dateObj.time };
}

function main() {
  const files = readdirSync(DIR).filter(f => f.endsWith('.html') && f !== 'index.html');
  const articles = files.map(parseArticle);

  // Sort descending (latest date first)
  articles.sort((a, b) => b.time - a.time);

  const cardsHtml = articles.map(item => `
    <div class="article-card">
      <a href="${item.file}">
        <h2>${esc(item.title)}</h2>
        <p class="meta">Updated ${item.dateStr}</p>
        <p>${esc(item.desc.slice(0, 180))}${item.desc.length > 180 ? '…' : ''}</p>
        <span class="read-more">Read More →</span>
      </a>
    </div>`).join('\n');

  const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Property Insights & Guides | Jet Lee | jetleechannel.sg</title>
<meta name="description" content="Expert Singapore property guides and insights by Jet Lee (CEA R007613B). HDB resale, ABSD, home loans, new launches, and investment strategies." />
<meta name="robots" content="index, follow" />
<link rel="canonical" href="https://jetleechannel.sg/articles/" />

<meta property="og:type" content="website" />
<meta property="og:title" content="Property Insights & Guides | Jet Lee" />
<meta property="og:description" content="Expert Singapore property guides and insights - HDB, condo, ABSD, home loans, and investment strategies." />
<meta property="og:url" content="https://jetleechannel.sg/articles/" />
<meta property="og:site_name" content="Jet Lee Property" />
<meta property="og:locale" content="en_SG" />

<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-6LFG5HCYKP"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-6LFG5HCYKP');
</script>

<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">

<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: 'Inter', sans-serif; color: #1a1a2e; background: #f8f9fa; line-height: 1.6; }
.container { max-width: 900px; margin: 0 auto; padding: 40px 24px; }

/* Header */
.header { text-align: center; margin-bottom: 40px; }
.header h1 { font-family: 'Playfair Display', serif; font-size: 2.5rem; font-weight: 600; color: #1a1a2e; margin-bottom: 12px; }
.header .subtitle { font-size: 1.05rem; color: #6b7280; max-width: 600px; margin: 0 auto 12px auto; }
.header .back-link { display: inline-block; color: #c0392b; text-decoration: none; font-size: 0.9rem; font-weight: 500; }
.header .back-link:hover { text-decoration: underline; }

/* Article List */
.article-list { display: flex; flex-direction: column; gap: 20px; }
.article-card { background: #fff; border-radius: 12px; padding: 28px 32px; box-shadow: 0 1px 3px rgba(0,0,0,0.06); transition: box-shadow 0.2s, transform 0.2s; border: 1px solid #e5e7eb; }
.article-card:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.08); transform: translateY(-1px); }
.article-card a { text-decoration: none; color: inherit; display: block; }
.article-card h2 { font-family: 'Playfair Display', serif; font-size: 1.25rem; font-weight: 600; color: #1a1a2e; line-height: 1.4; margin-bottom: 8px; }
.article-card .meta { font-size: 0.82rem; color: #9ca3af; margin-bottom: 6px; }
.article-card p { font-size: 0.92rem; color: #6b7280; line-height: 1.6; }
.article-card .read-more { display: inline-block; margin-top: 10px; color: #c0392b; font-size: 0.85rem; font-weight: 500; }

/* Footer */
.footer { text-align: center; margin-top: 64px; padding-top: 32px; border-top: 1px solid #e5e7eb; }
.footer p { font-size: 0.85rem; color: #9ca3af; }
.footer a { color: #c0392b; text-decoration: none; }
.footer a:hover { text-decoration: underline; }

@media (max-width: 640px) {
  .container { padding: 24px 16px; }
  .header h1 { font-size: 1.8rem; }
  .article-card { padding: 20px 24px; }
  .article-card h2 { font-size: 1.1rem; }
}

/* Nav Articles link — blinking */
@keyframes navBlinkRed {
  0%, 49% { opacity: 1; }
  50%, 100% { opacity: 0.2; }
}
.nav-articles-blink {
  color: #ff6b6b !important;
  font-weight: 700 !important;
  animation: navBlinkRed 1s step-end infinite;
}
</style>
</head>
<body>

<nav style="background:#1A3A5C;padding:14px 24px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px">
    <a href="https://jetleechannel.sg/" style="color:#fff;text-decoration:none;font-weight:700;font-size:.95rem">Jet Lee | @jetleechannel</a>
    <div style="display:flex;gap:20px;flex-wrap:wrap">
        <a href="https://jetleechannel.sg/" style="color:#fff;text-decoration:none;font-size:.88rem;opacity:.9">Home</a>
        <a href="https://jetleechannel.sg/#projects" style="color:#fff;text-decoration:none;font-size:.88rem;opacity:.9">Projects</a>
        <a href="https://jetleechannel.sg/articles/" class="nav-articles-blink" style="color:#fff;text-decoration:none;font-size:.88rem;font-weight:600">🔥 Articles 🔥</a>
        <a href="https://jetleechannel.sg/new-launch/" style="color:#fff;text-decoration:none;font-size:.88rem;font-weight:600">New Launch</a>
        <a href="https://jetleechannel.sg/#contact" style="color:#fff;text-decoration:none;font-size:.88rem;opacity:.9">Contact</a>
    </div>
</nav>

<div class="container">
  <div class="header">
    <h1>Property Insights & Guides</h1>
    <p class="subtitle">Expert knowledge and practical guides for Singapore home buyers, sellers, and investors.</p>
    <a href="https://jetleechannel.sg/" class="back-link">← Back to Home</a>
  </div>

  <div class="article-list">
${cardsHtml}
  </div>

  <div class="footer">
    <p>© 2026 <a href="https://jetleechannel.sg/">Jet Lee Property</a> | CEA R007613B</p>
  </div>
</div>

<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "name": "Property Insights & Guides",
  "description": "Expert Singapore property guides and insights by Jet Lee",
  "url": "https://jetleechannel.sg/articles/",
  "author": {
    "@type": "Person",
    "name": "Jet Lee",
    "url": "https://jetleechannel.sg"
  }
}
</script>

<div class="thomson-promo" style="text-align:center; padding:10px 0; margin-top:20px; border-top:1px solid #e5e7eb; font-size:0.85rem;">
  🏗️ <a href="https://thomson-reserve-direct-developer.com/" target="_blank" style="color:#c0392b; text-decoration:none; font-weight:600;">Thomson Reserve</a> — New Launch D20 · Preview Oct 2026 · Direct Developer Price
</div>
</body>
</html>`;

  const indexPath = join(DIR, 'index.html');
  writeFileSync(indexPath, fullHtml, 'utf-8');
  console.log(`✅ Successfully generated index.html with ${articles.length} articles sorted by date.`);
}

main();