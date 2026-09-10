#!/usr/bin/env node
/**
 * Thomson Reserve (thomson-reserve-direct-developer.com) — Automated Weekly Articles
 * Pulls latest news from t.me/PropNexPropertyNewsUpdate, generates a fresh
 * Thomson-tied article, updates the articles index, uploads via FTP.
 *
 * Usage: node scripts/thomson-weekly-articles.mjs [--force]
 * --force: generate even if the freshest news was already used (for testing)
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';

const WORKSPACE = '/home/ubuntu/.openclaw/workspace';
const STATE_FILE = join(WORKSPACE, 'thomson-articles/.last-news.json');
const TG_URL = 'https://t.me/s/PropNexPropertyNewsUpdate';
const FTP_HOST = '191.101.228.66';
const FTP_USER = 'u851958941.thomson-reserve-direct-developer.com';
const FTP_PASS = 'Thomson12345&';
const SITE_URL = 'https://thomson-reserve-direct-developer.com';
const GA_ID = 'G-S46Y1ZCYJH';
const FORCE = process.argv.includes('--force');

// Thomson facts for embedding (verified Aug 2026)
const THOMSON = {
  name: 'Thomson Reserve',
  units: '1,268',
  developer: 'UOL Group, CapitaLand & SingLand',
  tenure: '99-year leasehold',
  loc: 'Bright Hill Drive, Upper Thomson, District 20',
  mrt: 'Bright Hill MRT (Thomson-East Coast Line)',
  school: 'Ai Tong School (within 1km)',
  phone: '+65 8764 9315',
  cea: 'CEA Reg No. R007613B',
};

const ARTICLE_CSS = `
  body { font-family: Georgia, serif; max-width: 800px; margin: 0 auto; padding: 20px 24px; color: #1a1a1a; line-height: 1.75; background: #fff; }
  h1 { font-size: 2em; line-height: 1.25; margin-bottom: 0.25em; }
  h2 { font-size: 1.35em; margin-top: 2em; border-bottom: 1px solid #ddd; padding-bottom: 0.3em; }
  h3 { font-size: 1.1em; margin-top: 1.5em; color: #333; }
  .meta { color: #777; font-size: 0.9em; margin-bottom: 2em; }
  table { width: 100%; border-collapse: collapse; margin: 1.5em 0; font-size: 0.95em; }
  th { background: #1a1a1a; color: #fff; padding: 10px 12px; text-align: left; }
  td { padding: 9px 12px; border-bottom: 1px solid #e5e5e5; vertical-align: top; }
  tr:nth-child(even) td { background: #f9f9f9; }
  .highlight { background: #f5f0e8; border-left: 4px solid #b8860b; padding: 16px 20px; margin: 2em 0; border-radius: 2px; }
  .highlight strong { display: block; margin-bottom: 6px; }
  .back { color: #555; font-size: 0.9em; margin-bottom: 1.5em; display: block; }
  .cta { background: #1a1a1a; color: #fff; padding: 24px; margin: 2.5em 0; border-radius: 4px; text-align: center; }
  .cta a { color: #d4af37; font-weight: bold; text-decoration: none; }
  a { color: #1a1a1a; }
  ul, ol { margin: 1em 0; padding-left: 1.5em; }
  li { margin: 0.5em 0; }
  .source { font-size: 0.85rem; color: #888; margin-top: 2em; border-top: 1px solid #eee; padding-top: 1em; }

  /* SITE NAV */
  body{padding-top:60px;}
  .site-nav{position:fixed;top:0;left:0;right:0;z-index:200;display:flex;align-items:center;justify-content:space-between;padding:14px 32px;background:rgba(10,10,10,0.92);backdrop-filter:blur(12px);border-bottom:1px solid #333;}
  .site-nav-logo{font-family:Georgia,serif;font-size:1.05rem;letter-spacing:0.05em;color:#fff;text-decoration:none;text-transform:uppercase;}
  .site-nav-logo span{color:#d4af37;}
  .site-nav-links{display:flex;gap:1.6rem;list-style:none;margin:0;padding:0;}
  .site-nav-links a{color:#bbb;font-size:0.72rem;letter-spacing:0.1em;text-transform:uppercase;text-decoration:none;}
  .site-nav-links a:hover,.site-nav-links a.active{color:#d4af37;}
  .site-nav-cta{background:#d4af37;color:#0a0a0a;padding:0.5rem 1.2rem;font-size:0.68rem;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;text-decoration:none;white-space:nowrap;}
  .site-nav-burger{display:none;flex-direction:column;gap:5px;background:none;border:none;cursor:pointer;padding:4px;}
  .site-nav-burger span{width:22px;height:2px;background:#fff;display:block;}
  .site-nav-mobile{display:none;position:fixed;top:56px;left:0;right:0;z-index:199;background:rgba(10,10,10,0.98);border-bottom:1px solid #333;flex-direction:column;padding:0.5rem 1.5rem;}
  .site-nav-mobile.open{display:flex;}
  .site-nav-mobile a{color:#bbb;text-decoration:none;font-size:0.8rem;letter-spacing:0.05em;text-transform:uppercase;padding:0.9rem 0;border-bottom:1px solid #333;}
  @media (max-width:780px){.site-nav-links,.site-nav-cta.desktop-only{display:none;}.site-nav-burger{display:flex;}.site-nav{padding:12px 20px;}}
  /* Nav Articles link — blinking (only blink on navigator per client) */
  @keyframes navBlinkRed { 0%, 49% { opacity: 1; } 50%, 100% { opacity: 0.2; } }
  .site-nav-links a.active { animation: navBlinkRed 1s step-end infinite; }
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
      .replace(/<br\s*\/?>\s*<\/b>/gi, '.</b> ')
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
  const facts = `<div class="highlight">
<strong>Thomson Reserve at a glance</strong><br>
&bull; ${THOMSON.units} units &middot; ${THOMSON.developer} &middot; ${THOMSON.tenure}<br>
&bull; ${THOMSON.loc}<br>
&bull; Doorstep ${THOMSON.mrt}<br>
&bull; Within 1km of ${THOMSON.school}<br>
&bull; Direct developer pricing &mdash; no commission payable &middot; Call/WhatsApp ${THOMSON.phone}
</div>`;
  const faq = `<div class="highlight">
<strong>FAQ</strong><br>
<b>How does this news affect Thomson Reserve buyers?</b><br>Any shift in the wider property market has knock-on effects on new launch pricing, demand and rental appeal. ${title} is one of the market signals we track for buyers of Thomson Reserve &mdash; if you'd like to understand what it means for your purchase decision, reach out for a no-obligation chat.<br><br>
<b>What makes Thomson Reserve a strong consideration?</b><br>With ${THOMSON.units} units by ${THOMSON.developer} at ${THOMSON.loc}, doorstep access to ${THOMSON.mrt} and ${THOMSON.school} within 1km, it is positioned for both owner-occupiers and investors targeting the Upper Thomson corridor.<br><br>
<b>How do I get the latest prices and availability?</b><br>Contact Jet Lee directly at ${THOMSON.phone} for the current price list, e-brochure, floor plans and available balance units &mdash; direct developer price, no commission payable.
</div>`;
  const cta = `<div class="cta">
  <p><strong>Considering Thomson Reserve — or any new launch in 2026?</strong></p>
  <p>Let's talk through the location, the pricing and your family's options — no pressure, just honest analysis.</p>
  <a href="https://wa.me/6587649315?text=Hi%20Jet%20Lee%2C%20I%20read%20your%20article%20on%20Thomson%20Reserve">📱 WhatsApp Jet Lee</a>
</div>`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta name="msvalidate.01" content="423EB545A141D5069BA3ECA8D39B2AC8" />
<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=${GA_ID}"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', '${GA_ID}');
</script>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(title)} | Thomson Reserve</title>
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

<nav class="site-nav">
  <a class="site-nav-logo" href="${SITE_URL}/">Thomson <span>Reserve</span></a>
  <ul class="site-nav-links">
    <li><a href="${SITE_URL}/#details">Overview</a></li>
    <li><a href="${SITE_URL}/#floor-plans">Floorplans</a></li>
    <li><a href="${SITE_URL}/#site-plan">Location</a></li>
    <li><a href="${SITE_URL}/#faq">FAQ</a></li>
    <li><a href="${SITE_URL}/mortgage-calculator.html">Mortgage Calculator</a></li>
    <li><a class="active" href="${SITE_URL}/articles/">Articles</a></li>
  </ul>
  <a class="site-nav-cta desktop-only" href="${SITE_URL}/#contact">Register Interest</a>
  <button class="site-nav-burger" id="siteNavBurger" aria-label="Toggle menu"><span></span><span></span><span></span></button>
</nav>
<div class="site-nav-mobile" id="siteNavMobile">
  <a href="${SITE_URL}/#details">Overview</a>
  <a href="${SITE_URL}/#floor-plans">Floorplans</a>
  <a href="${SITE_URL}/#site-plan">Location</a>
  <a href="${SITE_URL}/#faq">FAQ</a>
  <a href="${SITE_URL}/mortgage-calculator.html">Mortgage Calculator</a>
  <a href="${SITE_URL}/articles/">Articles</a>
  <a href="${SITE_URL}/#contact">Register Interest</a>
</div>
<script>
document.getElementById('siteNavBurger').addEventListener('click',function(){document.getElementById('siteNavMobile').classList.toggle('open');});
</script>

<a class="back" href="${SITE_URL}/articles/">← Back to all articles</a>

<h1>${esc(title)}</h1>
<p class="meta">${dateLabel} · By Jet Lee · Market Analysis · Source: PropNex Property News Update</p>

${post.body}

${facts}

<h2>What This Means for Thomson Reserve Buyers</h2>
<p>News like this matters for property buyers because it shapes <strong>market sentiment, pricing and timing</strong>. For anyone considering Thomson Reserve &mdash; ${THOMSON.units} units by ${THOMSON.developer} at ${THOMSON.loc} &mdash; staying on top of the wider market helps you make a more informed decision on <em>when</em> to buy and <em>what</em> to expect.</p>

<h2>Frequently Asked Questions</h2>
${faq}

${cta}

<p class="source">Source: <a href="${post.url}" rel="nofollow noopener" target="_blank">PropNex Property News Update</a>. This article is a commentary on the news item and is for general information only.</p>

</body>
</html>`;
}

/** Insert the new article card at the top of the Latest Articles section (minimal change). */
function addCardToIndex(slug, meta) {
  const dir = join(WORKSPACE, 'thomson-articles');
  const idxFile = join(dir, 'index.html');
  let idx = readFileSync(idxFile, 'utf-8');
  if (idx.includes(`href="/articles/${slug}.html"`)) {
    console.log(`ℹ️ ${slug} already in index — skipping insert`);
    return true;
  }
  // Insert right after the "Latest Articles" category label
  const marker = '<div class="category-label">🔥 Latest Articles</div>';
  const s = idx.indexOf(marker);
  if (s === -1) {
    console.log('❌ Could not find Latest Articles section in thomson index — aborting');
    return false;
  }
  const label = meta.date || '2026';
  const card = `
<a href="/articles/${slug}.html" class="article-card">
  <span class="tag">New</span><h2>${esc(meta.title)}</h2>
  <p>${esc(meta.desc.slice(0, 160))}${meta.desc.length > 160 ? '…' : ''}</p>
  <span class="date">${label} · Market Update</span>
</a>
`;
  const newIdx = idx.slice(0, s + marker.length) + card + idx.slice(s + marker.length);
  writeFileSync(idxFile, newIdx, 'utf-8');
  console.log('✅ Thomson index updated with new card at top of Latest');
  return true;
}

function uploadFTP(local, remote) {
  const cmd = `curl -s -T "${local}" "ftp://${FTP_HOST}${remote}" --user "${FTP_USER}:${FTP_PASS}" --ftp-create-dirs -o /dev/null -w "%{http_code}" --connect-timeout 15 --max-time 90`;
  const code = execSync(cmd, { encoding: 'utf-8', maxBuffer: 1024 * 1024 }).trim();
  return code === '226';
}

function main() {
  console.log('📰 Thomson weekly article generator —', new Date().toISOString());
  const posts = fetchNews();
  console.log(`Fetched ${posts.length} posts from PropNex channel`);

  let state = { used: [] };
  if (existsSync(STATE_FILE)) state = JSON.parse(readFileSync(STATE_FILE, 'utf-8'));

  // Shared pool: posts consumed by ANY site
  let shared = { used: [] };
  const SHARED_POOL_FILE = join(WORKSPACE, 'loyang-articles/.shared-used.json');
  if (existsSync(SHARED_POOL_FILE)) {
    shared = JSON.parse(readFileSync(SHARED_POOL_FILE, 'utf-8'));
  } else {
    shared.used = [];
    writeFileSync(SHARED_POOL_FILE, JSON.stringify(shared, null, 2), 'utf-8');
  }
  for (const u of state.used) if (!shared.used.includes(u)) shared.used.push(u);

  const fresh = posts.filter(p => !state.used.includes(p.url) && !shared.used.includes(p.url));
  if (!fresh.length) {
    console.log('No fresh news to publish (all recent posts already used). Skipping.');
    return;
  }
  const post = fresh[0];

  // Split title / body (same logic as loyang generator)
  let normalized = post.text.replace(/([a-z0-9])([A-Z])/g, '$1. $2');
  const CONNECTORS = new Set(['of','in','on','the','at','for','and','to','with','by','as','a','an','is','are','was','were','or','from','than','its','their','his','her','our','your','vs','per','near','off','into','over','under']);
  // Common words that often START a second sentence in a run-on headline.
  const SENTENCE_STARTERS = new Set(['portion','rest','most','some','many','total','insufficient','but','while','including','with','amid','despite','after','before','under','over','near','plus','however','meanwhile','now','also','says','said','report','analysts','analyst','experts','experts']);
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
  // Run-on headline: split at a capitalized COMMON word (sentence starter)
  // preceded by a lowercase word — e.g. "...new private homes Portion of 13ha..."
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
  const articlePath = join(WORKSPACE, 'thomson-articles', `${slug}.html`);
  writeFileSync(articlePath, articleHtml, 'utf-8');
  console.log(`✅ Generated ${slug}.html`);

  // Insert card into index
  const okRebuild = addCardToIndex(slug, {
    title: postObj.title,
    desc: postObj.desc,
    date: dateLabel,
  });
  if (!okRebuild) process.exit(1);
  const indexPath = join(WORKSPACE, 'thomson-articles/index.html');
  console.log('✅ Index updated');

  // Upload
  const okArticle = uploadFTP(articlePath, `/articles/${slug}.html`);
  const okIndex = uploadFTP(indexPath, '/articles/index.html');
  console.log(`Upload article: ${okArticle ? '✅' : '❌'} | index: ${okIndex ? '✅' : '❌'}`);

  // Record state
  state.used.push(post.url);
  state.lastPublished = { slug, title: postObj.title, date: isoDate };
  writeFileSync(STATE_FILE, JSON.stringify(state, null, 2), 'utf-8');
  if (!shared.used.includes(post.url)) shared.used.push(post.url);
  writeFileSync(SHARED_POOL_FILE, JSON.stringify(shared, null, 2), 'utf-8');

  console.log(`\n🎉 Published: ${SITE_URL}/articles/${slug}.html`);

  // Telegram notification to Jetlee
  try {
    const TOKEN = '8124287935:AAHlC8ylOK8IEuSQRLjKGJKLYaMu77ndHsU';
    const CHAT_ID = '87383567';
    const msg = `📰 New article published on Thomson Reserve:\n\n${postObj.title}\n\n${SITE_URL}/articles/${slug}.html`;
    execSync(`curl -s "https://api.telegram.org/bot${TOKEN}/sendMessage?chat_id=${CHAT_ID}&text=${encodeURIComponent(msg)}" --max-time 20`, { encoding: 'utf-8', maxBuffer: 1024 * 1024 });
    console.log('📨 Telegram notification sent');
  } catch (e) {
    console.log('⚠️ Telegram notification failed:', e.message.slice(0, 80));
  }

  if (!okArticle || !okIndex) process.exit(1);
}

main();
