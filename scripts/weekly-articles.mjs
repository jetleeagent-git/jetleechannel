#!/usr/bin/env node
/**
 * Multi-site automated weekly articles (Mon & Fri 9am SGT)
 * Pulls latest news from t.me/PropNexPropertyNewsUpdate, generates a fresh
 * project-tied article for the target site, updates the articles index,
 * uploads via FTP, notifies Jetlee on Telegram.
 *
 * Usage: node scripts/weekly-articles.mjs <site> [--force]
 *   <site>: loyang | thecontinuum | narraresidences | aurea
 *   --force: generate even if the freshest news was already used (for testing)
 */
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';

const WORKSPACE = '/home/ubuntu/.openclaw/workspace';
const TG_URL = 'https://t.me/s/PropNexPropertyNewsUpdate';
const FTP_HOST = '191.101.228.66';
const FORCE = process.argv.includes('--force');
const siteArg = process.argv.find(a => ['loyang'].includes(a));

if (!siteArg) {
  console.log('Usage: node scripts/weekly-articles.mjs <site> [--force]');
  console.log('Sites: loyang (use hq-weekly-articles.mjs for HQ, thomson-weekly-articles.mjs for thomson)');
  process.exit(1);
}

// ---------------- Site configs ----------------
const SITES = {
  loyang: {
    name: 'Loyang Valley Residences',
    short: 'Loyang Valley Residences',
    ftpUser: 'u851958941.loyangvalleyresidences-official.com',
    ftpPass: 'Loyang12345&',
    siteUrl: 'https://loyangvalleyresidences-official.com',
    gaId: 'G-MLD5XYQ2HK',
    localDir: 'loyang-articles',
    remoteDir: '/articles',
    rebuild: 'rebuild-loyang-index.mjs',
    facts: [
      '~1,249 units · SingHaiyi Group · 99-year leasehold',
      '840,648 sqft site on Loyang Avenue, District 17',
      'Doorstep Loyang MRT (CR3) on the Cross Island Line (Phase 1, expected 2030)',
      'Near Changi Airport T5, Changi Business Park & Pasir Ris town centre',
    ],
    waText: 'Hi%20Jet%20Lee%2C%20I%20read%20your%20article%20on%20Loyang%20Valley%20Residences',
  },
};

const SITE = SITES[siteArg];
const STATE_FILE = join(WORKSPACE, SITE.localDir, '.last-news.json');
// Shared pool of posts already consumed by ANY site — prevents the same news
// being published on multiple sites. Seed with posts already used by loyang + test runs.
const SHARED_POOL_FILE = join(WORKSPACE, 'loyang-articles/.shared-used.json');
const SHARED_POOL_INITIAL = [
  'https://t.me/PropNexPropertyNewsUpdate/9530',
  'https://t.me/PropNexPropertyNewsUpdate/9532',
  'https://t.me/PropNexPropertyNewsUpdate/9533',
];

const ARTICLE_CSS = `
    :root{
      --bg:#0a0a0a; --bg2:#121212; --panel:#161616; --border:#2a2a2a;
      --gold:#c9a961; --gold-light:#e0c98a; --text:#eae6df; --text-dim:#a8a49c;
    }
    *{box-sizing:border-box;}
    body{margin:0;background:var(--bg);color:var(--text);font-family:'DM Sans',sans-serif;line-height:1.7;}
    h1,h2,h3{font-family:'Cormorant Garamond',serif;color:var(--gold-light);font-weight:600;}
    h1{font-size:2.4rem;line-height:1.2;}
    h2{font-size:1.9rem;margin-top:2.5rem;border-bottom:1px solid var(--border);padding-bottom:.5rem;}
    h3{font-size:1.3rem;color:var(--gold);margin-top:1.6rem;}
    a{color:var(--gold);text-decoration:none;}
    a:hover{text-decoration:underline;}
    .wrap{max-width:820px;margin:0 auto;padding:0 20px 60px;}
    header.nav{background:var(--bg2);border-bottom:1px solid var(--border);padding:16px 0;}
    header.nav .wrap{display:flex;justify-content:space-between;align-items:center;max-width:1000px;}
    header.nav .brand{font-family:'Cormorant Garamond',serif;font-size:1.2rem;color:var(--gold-light);}
    header.nav .back{font-size:.9rem;color:var(--text-dim);}
    .byline{color:var(--text-dim);font-size:.9rem;margin-bottom:2rem;}
    .hero-tag{display:inline-block;background:rgba(201,169,97,.12);color:var(--gold);
      border:1px solid rgba(201,169,97,.35);border-radius:20px;padding:4px 14px;font-size:.78rem;
      letter-spacing:.06em;text-transform:uppercase;margin-bottom:16px;}
    table{width:100%;border-collapse:collapse;margin:1.2rem 0;font-size:.95rem;}
    th,td{border:1px solid var(--border);padding:10px 12px;text-align:left;}
    th{background:var(--panel);color:var(--gold-light);}
    .panel{background:var(--panel);border:1px solid var(--border);border-radius:10px;padding:20px 24px;margin:1.6rem 0;}
    .faq-item{border-bottom:1px solid var(--border);padding:18px 0;}
    .faq-item p{margin:.4rem 0 0;color:var(--text-dim);}
    .faq-item .q{font-weight:700;color:var(--text);font-size:1.05rem;}
    .cta{background:linear-gradient(135deg,var(--panel),var(--bg2));border:1px solid var(--gold);
      border-radius:12px;padding:28px;text-align:center;margin:2.5rem 0;}
    .cta a.btn{display:inline-block;background:var(--gold);color:#111;font-weight:700;padding:12px 26px;
      border-radius:6px;margin:8px;}
    .cta a.btn.alt{background:transparent;border:1px solid var(--gold);color:var(--gold);}
    footer{border-top:1px solid var(--border);margin-top:3rem;padding-top:24px;color:var(--text-dim);font-size:.85rem;}
    footer a{color:var(--text-dim);}
    ul{padding-left:1.2rem;}
    li{margin-bottom:.4rem;}
`;

/** Fetch latest posts from the Telegram channel. Returns [{text, url, date}] */
function fetchNews() {
  const html = execSync(`curl -s "${TG_URL}" -H "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64)" --max-time 30`, { encoding: 'utf-8', maxBuffer: 5 * 1024 * 1024 });
  const blocks = html.split('tgme_widget_message_wrap');
  const posts = [];
  for (const b of blocks) {
    const mText = b.match(/tgme_widget_message_text[^>]*>([\s\S]*?)<\/div>/);
    if (!mText) continue;
    const raw = mText[1]
      .replace(/<br\s*\/?>\s*<\/b>/gi, '.</b> ')          // bold segment break = sentence end
      .replace(/<br\s*\/?>/gi, ' ')
      .replace(/<\/p>|<\/div>|<\/li>|<\/h[1-6]>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ').replace(/&quot;/g, '"').replace(/&#39;/g, "'")
      .replace(/&#036;/g, '$').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
      .replace(/\s+/g, ' ').trim();
    if (!raw || raw.length < 40) continue;
    const mLink = b.match(/href="(https:\/\/t\.me\/PropNexPropertyNewsUpdate\/\d+)"/);
    const mDate = b.match(/datetime="([^"]+)"/);
    posts.push({ text: raw, url: mLink ? mLink[1] : '', date: mDate ? mDate[1] : '' });
  }
  return posts;
}

function slugify(s) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60).replace(/-+$/g, '');
}

function esc(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/** Build the article HTML from a news item. */
function buildArticle(post, slug, dateLabel, isoDate) {
  const title = post.title;
  const desc = post.desc;
  const url = `${SITE.siteUrl}/articles/${slug}.html`;
  const facts = `<div class="panel">
<strong>${SITE.name} at a glance</strong><br>
${SITE.facts.map(f => `&bull; ${f}<br>`).join('')}
&bull; Direct developer pricing &mdash; no commission payable &middot; Call/WhatsApp +65 8764 9315
</div>`;
  const faq = `<div class="faq-item"><div class="q">How does this news affect ${SITE.short} buyers?</div><p>Any shift in the wider property market has knock-on effects on new launch pricing, demand and rental appeal. ${title} is one of the market signals we track for buyers of ${SITE.short} &mdash; if you'd like to understand what it means for your purchase decision, reach out for a no-obligation chat.</p></div>
<div class="faq-item"><div class="q">What makes ${SITE.short} a strong consideration right now?</div><p>${SITE.facts[0]}. ${SITE.facts[1] || ''} ${SITE.facts[2] || ''} &mdash; positioned for both owner-occupiers and investors.</p></div>
<div class="faq-item"><div class="q">How do I get the latest prices and availability?</div><p>Contact Jet Lee directly at +65 8764 9315 for the current price list, e-brochure, floor plans and available balance units &mdash; direct developer price, no commission payable.</p></div>`;
  const cta = `<div class="cta">
<p style="font-size:1.1rem;margin:0 0 8px"><strong>Considering ${SITE.short}?</strong></p>
<p style="margin:0 0 16px;color:var(--text-dim)">Get the latest price list, e-brochure and balance units &mdash; direct developer price.</p>
<a class="btn" href="https://wa.me/6587649315?text=${SITE.waText}">WhatsApp Jet Lee</a>
<a class="btn alt" href="${SITE.siteUrl}/articles/">Browse All Articles</a>
</div>`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=${SITE.gaId}"></script>
<script>
 window.dataLayer = window.dataLayer || [];
 function gtag(){dataLayer.push(arguments);}
 gtag('js', new Date());
 gtag('config', '${SITE.gaId}');
</script>

<meta name="msvalidate.01" content="423EB545A141D5069BA3ECA8D39B2AC8" />
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(title)} | ${esc(SITE.name)}</title>
<meta name="description" content="${esc(desc)}">
<meta name="author" content="Jet Lee, PropNex Realty (CEA Reg No. R007613B)">
<link rel="canonical" href="${url}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:type" content="article">
<meta property="og:url" content="${url}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:site" content="@jetleechannel">
<meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600;700&family=DM+Sans:wght@400;500;700&display=swap" rel="stylesheet">
<style>${ARTICLE_CSS}</style>
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "${esc(title)}",
  "description": "${esc(desc)}",
  "url": "${url}",
  "author": { "@type": "Person", "name": "Jet Lee" },
  "publisher": { "@type": "Organization", "name": "Jet Lee Property", "url": "https://jetleechannel.sg" },
  "datePublished": "${isoDate}",
  "dateModified": "${isoDate}",
  "mainEntityOfPage": "${url}"
}
</script>
</head>
<body>
<header class="nav">
  <div class="wrap">
    <div class="brand">${esc(SITE.name)}</div>
    <a class="back" href="${SITE.siteUrl}/articles/">&larr; All Articles</a>
  </div>
</header>
<div class="wrap" style="padding-top:40px;">
<span class="hero-tag">Market News &amp; Analysis</span>
<h1>${esc(title)}</h1>
<p class="byline">Published ${dateLabel} &middot; By Jet Lee, PropNex Realty (CEA Reg No. R007613B)</p>

${post.body}

${facts}

<h2>What This Means for ${esc(SITE.short)} Buyers</h2>
<p>News like this matters for property buyers because it shapes <strong>market sentiment, pricing and timing</strong>. For anyone considering ${esc(SITE.short)} &mdash; ${SITE.facts[0]} &mdash; staying on top of the wider market helps you make a more informed decision on <em>when</em> to buy and <em>what</em> to expect.</p>

<h2>Frequently Asked Questions</h2>
${faq}

${cta}

<p style="color:var(--text-dim);font-size:.85rem;margin-top:24px">Source: <a href="${post.url}" rel="nofollow noopener" target="_blank">PropNex Property News Update</a></p>

<footer>
  <p>Jet Lee &middot; +65 8764 9315 &middot; ${SITE.name} &middot; CEA Reg No. R007613B &middot; PropNex Realty &middot; <a href="https://jetleechannel.sg">jetleechannel.sg</a></p>
</footer>
</div>
</body>
</html>`;
}

/** Rebuild the articles index from local article files (no external fetch). */
function rebuildIndexLocal() {
  const dir = join(WORKSPACE, SITE.localDir);
  const names = execSync(`ls -t ${dir}/*.html 2>/dev/null | grep -v index.html | xargs -n1 basename`, { encoding: 'utf-8', maxBuffer: 1024 * 1024 })
    .split('\n').map(s => s.trim()).filter(Boolean);
  const cards = [];
  for (const name of names) {
    const html = readFileSync(join(dir, name), 'utf-8');
    const h1 = (html.match(/<h1>([\s\S]*?)<\/h1>/) || [])[1] || name;
    const desc = (html.match(/name="description" content="([^"]+)"/) || [])[1] || '';
    const datePub = (html.match(/"datePublished":\s*"([^"]+)"/) || [])[1] || '';
    const label = datePub ? new Date(datePub + 'T00:00:00').toLocaleDateString('en-SG', { day: 'numeric', month: 'long', year: 'numeric' }) : '';
    cards.push({ slug: name.replace(/\.html$/, ''), title: h1.replace(/<[^>]+>/g, '').trim(), desc, date: label });
  }
  const cardHtml = cards.map(c => `<div class="card">
  <h2>${esc(c.title)}</h2>
  ${c.date ? `<div class="date">Published ${c.date}</div>` : ''}
  <p>${esc(c.desc.slice(0, 160))}${c.desc.length > 160 ? '…' : ''}</p>
  <a href="${c.slug}.html">Read More →</a>
</div>
`).join('\n');
  const idx = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="description" content="${esc(SITE.name)} — property market insights and guides.">
<link rel="canonical" href="${SITE.siteUrl}/articles/">
<title>Articles & Market Insights | ${esc(SITE.name)} | Jet Lee</title>
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

<a href="${SITE.siteUrl}/" class="back">← Back to ${esc(SITE.name)}</a>
<h1>${esc(SITE.name)} — Articles & Market Insights</h1>

${cardHtml}
<a href="${SITE.siteUrl}/" style="display:inline-block;margin-top:1rem;padding:.7rem 2rem;background:#c9a84c;color:#0d1a12;text-decoration:none;font-size:.75rem;letter-spacing:.15em;text-transform:uppercase;font-weight:600;border-radius:4px">← Back to ${esc(SITE.name)}</a>

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
  writeFileSync(join(dir, 'index.html'), idx, 'utf-8');
}

function uploadFTP(local, remote) {
  const cmd = `curl -s -T "${local}" "ftp://${FTP_HOST}${remote}" --user "${SITE.ftpUser}:${SITE.ftpPass}" --ftp-create-dirs -o /dev/null -w "%{http_code}" --connect-timeout 15 --max-time 90`;
  const code = execSync(cmd, { encoding: 'utf-8', maxBuffer: 1024 * 1024 }).trim();
  return code === '226';
}

function main() {
  console.log(`📰 ${SITE.name} weekly article generator —`, new Date().toISOString());
  const posts = fetchNews();
  console.log(`Fetched ${posts.length} posts from PropNex channel`);

  let state = { used: [] };
  if (existsSync(STATE_FILE)) state = JSON.parse(readFileSync(STATE_FILE, 'utf-8'));

  // Shared pool: posts consumed by ANY site
  let shared = { used: [] };
  if (existsSync(SHARED_POOL_FILE)) {
    shared = JSON.parse(readFileSync(SHARED_POOL_FILE, 'utf-8'));
  } else {
    shared.used = [...SHARED_POOL_INITIAL];
    writeFileSync(SHARED_POOL_FILE, JSON.stringify(shared, null, 2), 'utf-8');
  }
  // Merge any posts already in this site's own state into the shared pool (legacy migration)
  for (const u of state.used) if (!shared.used.includes(u)) shared.used.push(u);

  // Fresh = not used by this site AND not consumed by any other site
  const fresh = posts.filter(p => !state.used.includes(p.url) && !shared.used.includes(p.url));
  if (!fresh.length) {
    console.log('No fresh news to publish (all recent posts already used). Skipping.');
    return;
  }
  const post = fresh[0];

  // Split title/body (same logic as loyang generator)
  let normalized = post.text.replace(/([a-z0-9])([A-Z])/g, '$1. $2');
  const CONNECTORS = new Set(['of','in','on','the','at','for','and','to','with','by','as','a','an','is','are','was','were','or','from','than','its','their','his','her','our','your','vs','per','near','off','into','over','under']);
  let sentences = normalized
    .split(/(?<=[.!?])\s+(?=[A-Z])|(?<=[.!?])(?=[A-Z])/)
    .map(s => s.trim()).filter(Boolean);
  if (sentences.length === 1) {
    const parts = normalized.split(/\s+/);
    for (let i = 1; i < parts.length; i++) {
      const prev = parts[i-1].replace(/[^a-z0-9]/gi, '').toLowerCase();
      const prevEndsDigit = /\d$/.test(parts[i-1]);
      if (/^[A-Z][a-z]/.test(parts[i]) && !CONNECTORS.has(prev) && prevEndsDigit) {
        sentences = [parts.slice(0, i).join(' '), parts.slice(i).join(' ')].filter(Boolean);
        break;
      }
    }
  }
  if (sentences.length === 1) {
    const parts = normalized.split(/\s+/);
    for (let i = 1; i < parts.length; i++) {
      const prev = parts[i-1].replace(/[^a-z0-9]/gi, '').toLowerCase();
      const tailLen = parts.slice(i).join(' ').length;
      if (/^[A-Z][a-z]/.test(parts[i]) && parts[i].length >= 5 && !CONNECTORS.has(prev) && tailLen >= 25) {
        sentences = [parts.slice(0, i).join(' '), parts.slice(i).join(' ')].filter(Boolean);
        break;
      }
    }
  }
  if (!sentences.length) sentences = [normalized];
  let title = sentences[0].trim();
  let bodyText = sentences.slice(1).join(' ').trim();
  if (title.length > 110) {
    title = title.slice(0, 110).replace(/\s+\S*$/, '') + '…';
  } else if (title.length < 40 && sentences[1]) {
    title = (title + ' ' + sentences[1]).trim();
    bodyText = sentences.slice(2).join(' ').trim();
  }
  const fullText = post.text;

  const now = new Date();
  const dateLabel = now.toLocaleDateString('en-SG', { day: 'numeric', month: 'long', year: 'numeric' });
  const isoDate = now.toISOString().slice(0, 10);
  const slug = slugify(title) || `market-update-${isoDate}`;

  const postObj = {
    title,
    desc: (bodyText || fullText).replace(/…$/, '').slice(0, 155),
    url: post.url,
    body: `<p>${esc(title)}</p>${bodyText ? `<p>${esc(bodyText)}</p>` : ''}`,
  };

  const articleHtml = buildArticle(postObj, slug, dateLabel, isoDate);
  const articlePath = join(WORKSPACE, SITE.localDir, `${slug}.html`);
  writeFileSync(articlePath, articleHtml, 'utf-8');
  console.log(`✅ Generated ${slug}.html`);

  // Rebuild index
  if (SITE.rebuild) {
    execSync(`node ${join(WORKSPACE, 'scripts', SITE.rebuild)}`, { encoding: 'utf-8', maxBuffer: 5 * 1024 * 1024 });
  } else {
    rebuildIndexLocal();
  }
  const indexPath = join(WORKSPACE, SITE.localDir, 'index.html');
  console.log('✅ Index updated');

  // Upload
  const okArticle = uploadFTP(articlePath, `${SITE.remoteDir}/${slug}.html`);
  const okIndex = uploadFTP(indexPath, `${SITE.remoteDir}/index.html`);
  console.log(`Upload article: ${okArticle ? '✅' : '❌'} | index: ${okIndex ? '✅' : '❌'}`);

  // Record state
  state.used.push(post.url);
  state.lastPublished = { slug, title: postObj.title, date: isoDate };
  writeFileSync(STATE_FILE, JSON.stringify(state, null, 2), 'utf-8');
  if (!shared.used.includes(post.url)) shared.used.push(post.url);
  writeFileSync(SHARED_POOL_FILE, JSON.stringify(shared, null, 2), 'utf-8');

  console.log(`\n🎉 Published: ${SITE.siteUrl}/articles/${slug}.html`);

  // Telegram notification
  try {
    const TOKEN = '8124287935:AAHlC8ylOK8IEuSQRLjKGJKLYaMu77ndHsU';
    const CHAT_ID = '87383567';
    const msg = `📰 New article published on ${SITE.name}:\n\n${postObj.title}\n\n${SITE.siteUrl}/articles/${slug}.html`;
    execSync(`curl -s "https://api.telegram.org/bot${TOKEN}/sendMessage?chat_id=${CHAT_ID}&text=${encodeURIComponent(msg)}" --max-time 20`, { encoding: 'utf-8', maxBuffer: 1024 * 1024 });
    console.log('📨 Telegram notification sent');
  } catch (e) {
    console.log('⚠️ Telegram notification failed:', e.message.slice(0, 80));
  }

  if (!okArticle || !okIndex) process.exit(1);
}

main();
