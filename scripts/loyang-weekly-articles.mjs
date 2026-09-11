#!/usr/bin/env node
/**
 * Loyang Valley Residences — Automated Weekly Articles (Mon & Fri 9am SGT)
 * Pulls latest news from t.me/PropNexPropertyNewsUpdate, generates a fresh
 * Loyang-tied article, updates the articles index, uploads via FTP.
 *
 * Usage: node scripts/loyang-weekly-articles.mjs [--force]
 * --force: generate even if the freshest news was already used (for testing)
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';

const WORKSPACE = '/home/ubuntu/.openclaw/workspace';
const STATE_FILE = join(WORKSPACE, 'loyang-articles/.last-news.json');
const TG_URL = 'https://t.me/s/PropNexPropertyNewsUpdate';
const FTP_HOST = '191.101.228.66';
const FTP_USER = 'u851958941.loyangvalleyresidences-official.com';
const FTP_PASS = 'Loyang12345&';
const SITE_URL = 'https://loyangvalleyresidences-official.com';
const FORCE = process.argv.includes('--force');

// Loyang facts for embedding (verified Aug 2026)
const LOYANG = {
  name: 'Loyang Valley Residences',
  units: '~1,249',
  developer: 'SingHaiyi Group',
  tenure: '99-year leasehold',
  site: '840,648 sqft',
  loc: 'Loyang Avenue, District 17',
  mrt: 'Loyang MRT (CR3) on the Cross Island Line',
  phone: '+65 8764 9315',
  cea: 'CEA Reg No. R007613B',
};

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

/** Fetch latest posts from the Telegram channel. Returns [{title, desc, url}] */
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
  const url = `${SITE_URL}/articles/${slug}.html`;
  const facts = `<div class="panel">
<strong>Loyang Valley Residences at a glance</strong><br>
&bull; ~1,249 units &middot; ${LOYANG.developer} &middot; ${LOYANG.tenure}<br>
&bull; ${LOYANG.site} site on ${LOYANG.loc}<br>
&bull; Doorstep ${LOYANG.mrt} (Phase 1, expected 2030)<br>
&bull; Near Changi Airport T5, Changi Business Park &amp; Pasir Ris town centre<br>
&bull; Direct developer pricing &mdash; no commission payable &middot; Call/WhatsApp ${LOYANG.phone}
</div>`;
  const faq = `<div class="faq-item"><div class="q">How does this news affect Loyang Valley Residences buyers?</div><p>Any shift in the wider property market has knock-on effects on new launch pricing, demand and rental appeal. ${title} is one of the market signals we track for buyers of Loyang Valley Residences &mdash; if you'd like to understand what it means for your purchase decision, reach out for a no-obligation chat.</p></div>
<div class="faq-item"><div class="q">What makes Loyang Valley Residences a strong investment?</div><p>With ${LOYANG.units} units on a ${LOYANG.site} site, ${LOYANG.tenure} by ${LOYANG.developer}, doorstep access to ${LOYANG.mrt} and proximity to Changi Airport T5 and Changi Business Park employment hubs, it is positioned for both owner-occupiers and investors targeting the Changi-Loyang corridor.</p></div>
<div class="faq-item"><div class="q">How do I get the latest prices and availability?</div><p>Contact Jet Lee directly at ${LOYANG.phone} for the current price list, e-brochure, floor plans and available balance units &mdash; direct developer price, no commission payable.</p></div>`;
  const cta = `<div class="cta">
<p style="font-size:1.1rem;margin:0 0 8px"><strong>Considering Loyang Valley Residences?</strong></p>
<p style="margin:0 0 16px;color:var(--text-dim)">Get the latest price list, e-brochure and balance units &mdash; direct developer price.</p>
<a class="btn" href="https://wa.me/6587649315?text=Hi%20Jet%20Lee%2C%20I%20read%20your%20article%20on%20Loyang%20Valley%20Residences">WhatsApp Jet Lee</a>
<a class="btn alt" href="${SITE_URL}/articles/">Browse All Articles</a>
</div>`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-MLD5XYQ2HK"></script>
<script>
 window.dataLayer = window.dataLayer || [];
 function gtag(){dataLayer.push(arguments);}
 gtag('js', new Date());
 gtag('config', 'G-MLD5XYQ2HK');
</script>

<meta name="msvalidate.01" content="423EB545A141D5069BA3ECA8D39B2AC8" />
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(title)} | Loyang Valley Residences</title>
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
    <div class="brand">Loyang Valley <span style="color:var(--text)">Residences</span></div>
    <a class="back" href="${SITE_URL}/articles/">&larr; All Articles</a>
  </div>
</header>
<div class="wrap" style="padding-top:40px;">
<span class="hero-tag">Market News &amp; Analysis</span>
<h1>${esc(title)}</h1>
<p class="byline">Published ${dateLabel} &middot; ${LOYANG.loc} &middot; By Jet Lee, PropNex Realty (CEA Reg No. R007613B)</p>

${post.body}

${facts}

<h2>What This Means for Loyang Valley Residences Buyers</h2>
<p>News like this matters for property buyers because it shapes <strong>market sentiment, pricing and timing</strong>. For anyone considering ${LOYANG.name} &mdash; a ${LOYANG.tenure} new launch by ${LOYANG.developer} on ${LOYANG.loc} &mdash; staying on top of the wider market helps you make a more informed decision on <em>when</em> to buy and <em>what</em> to expect.</p>

<h2>Frequently Asked Questions</h2>
${faq}

${cta}

<p style="color:var(--text-dim);font-size:.85rem;margin-top:24px">Source: <a href="${post.url}" rel="nofollow noopener" target="_blank">PropNex Property News Update</a></p>

<footer>
  <p>Jet Lee &middot; ${LOYANG.phone} &middot; ${LOYANG.cea} &middot; PropNex Realty &middot; <a href="https://jetleechannel.sg">jetleechannel.sg</a></p>
</footer>
</div>
</body>
</html>`;
}

/** Update the articles index: after writing the new article, rebuild the whole
 *  index from the live article files (via rebuild-loyang-index.mjs) — this is
 *  robust against duplicates and ordering issues. */
function updateIndex() {
  execSync(`node ${join(WORKSPACE, 'scripts/rebuild-loyang-index.mjs')}`, { encoding: 'utf-8', maxBuffer: 5 * 1024 * 1024 });
}

function uploadFTP(local, remote) {
  const cmd = `curl -s -T "${local}" "ftp://${FTP_HOST}${remote}" --user "${FTP_USER}:${FTP_PASS}" --ftp-create-dirs -o /dev/null -w "%{http_code}" --connect-timeout 15 --max-time 90`;
  const code = execSync(cmd, { encoding: 'utf-8', maxBuffer: 1024 * 1024 }).trim();
  return code === '226';
}

function main() {
  console.log('📰 Loyang weekly article generator —', new Date().toISOString());
  const posts = fetchNews();
  console.log(`Fetched ${posts.length} posts from PropNex channel`);

  // Load previous state
  let state = { used: [] };
  if (existsSync(STATE_FILE)) state = JSON.parse(readFileSync(STATE_FILE, 'utf-8'));

  // Shared pool: posts consumed by ANY site (loyang / thomson / HQ)
  const SHARED_POOL_FILE = join(WORKSPACE, 'loyang-articles/.shared-used.json');
  let shared = { used: [] };
  if (existsSync(SHARED_POOL_FILE)) {
    try { shared = JSON.parse(readFileSync(SHARED_POOL_FILE, 'utf-8')); } catch (e) { shared = { used: [] }; }
  }
  for (const u of state.used) if (!shared.used.includes(u)) shared.used.push(u);
  if (shared.used.length > 60) shared.used = shared.used.slice(-60);

  // Pick the freshest post not already used by this site OR any site in the pool
  const fresh = posts.filter(p => !state.used.includes(p.url) && !shared.used.includes(p.url));
  if (!fresh.length) {
    console.log('No fresh news to publish (all recent posts already used). Skipping.');
    return;
  }
  const post = fresh[0];
  // Split title / body: first sentence(s) become the title, rest is body.
  // Telegram posts often join sentences without punctuation ("boom Economy grew",
  // "since 2023 Analysts") — normalize the camelCase boundary only; the digit
  // boundary is handled in the fallback below.
  let normalized = post.text
    .replace(/([a-z0-9])([A-Z])/g, '$1. $2');  // boomEconomy → boom. Economy; 2023Analysts → 2023. Analysts
  const CONNECTORS = new Set(['of','in','on','the','at','for','and','to','with','by','as','a','an','is','are','was','were','or','from','than','its','their','his','her','our','your','vs','per','near','off','into','over','under']);
  // Common words that often START a second sentence in a run-on headline.
  const SENTENCE_STARTERS = new Set(['portion','rest','most','some','many','total','insufficient','but','while','including','with','amid','despite','after','before','under','over','near','plus','however','meanwhile','now','also','says','said','report','analysts','analyst','experts','experts']);
  // First: split on real punctuation + camelCase boundaries
  let sentences = normalized
    .split(/(?<=[.!?])\s+(?=[A-Z])|(?<=[.!?])(?=[A-Z])/)
    .map(s => s.trim()).filter(Boolean);
  // Fallback 1: split where a capital follows a word ending in a digit ("since 2023 Analysts")
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
  // Fallback 2: still run-on (e.g. "boom Economy grew") — split at the first
  // lowercase→Capital boundary where the next word is a real sentence starter
  // (≥5 chars) and a substantial tail follows (≥25 chars).
  if (sentences.length === 1) {
    const parts = normalized.split(/\s+/);
    for (let i = 2; i < parts.length; i++) {
      const prev = parts[i-1].replace(/[^a-z0-9]/gi, '').toLowerCase();
      const cur = parts[i].replace(/[^a-z0-9]/gi, '').toLowerCase();
      const titleSoFar = parts.slice(0, i).join(' ').length;
      if (/^[A-Z][a-z]/.test(parts[i]) && prev && /^[a-z]/.test(parts[i-1]) && !CONNECTORS.has(prev) && !CONNECTORS.has(cur) && titleSoFar >= 30 && (SENTENCE_STARTERS.has(cur) || (cur.length >= 5 && parts[i-1].length >= 4 && !/^(kallang|distripark|sembawang|thomson|loyang|sentosa|singapore|s'pore)$/.test(cur)))) {
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
    // use first 110 chars, cut at word boundary
    title = title.slice(0, 110).replace(/\s+\S*$/, '') + '…';
  } else if (title.length < 40 && sentences[1]) {
    // title too short — add second sentence
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
  const articlePath = join(WORKSPACE, `loyang-articles/${slug}.html`);
  writeFileSync(articlePath, articleHtml, 'utf-8');
  console.log(`✅ Generated ${slug}.html`);

  // Update index (rebuild from live article files — dedupes automatically)
  updateIndex();
  const indexPath = join(WORKSPACE, 'loyang-articles/index.html');
  console.log('✅ Index updated');

  // Upload both
  const okArticle = uploadFTP(articlePath, `/articles/${slug}.html`);
  const okIndex = uploadFTP(indexPath, '/articles/index.html');
  console.log(`Upload article: ${okArticle ? '✅' : '❌'} | index: ${okIndex ? '✅' : '❌'}`);

  // Record state
  state.used.push(post.url);
  state.lastPublished = { slug, title: postObj.title, date: isoDate };
  writeFileSync(STATE_FILE, JSON.stringify(state, null, 2), 'utf-8');
  if (!shared.used.includes(post.url)) shared.used.push(post.url);
  if (shared.used.length > 60) shared.used = shared.used.slice(-60);
  writeFileSync(SHARED_POOL_FILE, JSON.stringify(shared, null, 2), 'utf-8');

  console.log(`\n🎉 Published: ${SITE_URL}/articles/${slug}.html`);

  // Telegram notification to Jetlee
  try {
    const TOKEN = process.env.TELEGRAM_BOT_TOKEN || "";
    const CHAT_ID = '87383567';
    const msg = `📰 New article published on Loyang Valley Residences:\n\n${postObj.title}\n\n${SITE_URL}/articles/${slug}.html`;
    execSync(`curl -s "https://api.telegram.org/bot${TOKEN}/sendMessage?chat_id=${CHAT_ID}&text=${encodeURIComponent(msg)}" --max-time 20`, { encoding: 'utf-8', maxBuffer: 1024 * 1024 });
    console.log('📨 Telegram notification sent');
  } catch (e) {
    console.log('⚠️ Telegram notification failed:', e.message.slice(0, 80));
  }

  if (!okArticle || !okIndex) process.exit(1);
}

main();
