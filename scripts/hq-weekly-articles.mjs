#!/usr/bin/env node
/**
 * JetleeChannel.sg (HQ) — Automated Weekly Articles
 * Pulls latest news from t.me/PropNexPropertyNewsUpdate, generates a fresh
 * market article for jetleechannel.sg/articles/, updates the articles index,
 * uploads via FTP.
 *
 * Every article ends with the Thomson Reserve promo box (user rule).
 *
 * Usage: node scripts/hq-weekly-articles.mjs [--force]
 * --force: generate even if the freshest news was already used (for testing)
 */
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';

const WORKSPACE = '/home/ubuntu/.openclaw/workspace';
const STATE_FILE = join(WORKSPACE, 'articles/.last-news.json');
const TG_URL = 'https://t.me/s/PropNexPropertyNewsUpdate';
const FTP_HOST = '191.101.228.66';
const FTP_USER = 'u851958941.jetleechannel.sg';
const FTP_PASS = 'Jetleechannel12345&';
const SITE_URL = 'https://jetleechannel.sg';
const GA_ID = 'G-6LFG5HCYKP';
const FORCE = process.argv.includes('--force');

const HQ = {
  name: 'Jet Lee Channel',
  phone: '+65 8764 9315',
  cea: 'CEA Reg No. R007613B',
};

const ARTICLE_CSS = `
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;background:#0d1a12;color:#e8eae6;line-height:1.8;max-width:800px;margin:0 auto;padding:2rem}
h1{font-family:'Playfair Display',Georgia,serif;color:#e4c97e;font-size:1.9rem;line-height:1.3;margin-bottom:.8rem;font-weight:400;border-bottom:1px solid rgba(201,168,76,.3);padding-bottom:1rem}
h2{font-family:'Playfair Display',Georgia,serif;color:#e4c97e;font-size:1.3rem;font-weight:400;margin:2rem 0 .8rem}
p{color:rgba(232,234,230,.85);font-size:.95rem;margin:1rem 0}
li{color:rgba(232,234,230,.85);font-size:.95rem;margin-bottom:.6rem}
ul,ol{padding-left:1.3rem;margin:1rem 0}
.meta{color:rgba(232,234,230,.4);font-size:.8rem;margin-bottom:2rem}
.back{color:rgba(232,234,230,.4);font-size:.78rem;display:block;margin-bottom:1rem;text-decoration:none}
.back:hover{color:#c9a84c}
a{color:#c9a84c}
.highlight{background:#14281e;border-left:4px solid #c9a84c;padding:1.2rem 1.5rem;border-radius:4px;margin:1.5rem 0}
.highlight strong{color:#e4c97e}
.cta{background:#c9a84c;color:#0d1a12;padding:1.8rem;border-radius:8px;text-align:center;margin:2rem 0}
.cta p{color:#0d1a12;margin:.3rem 0}
.cta a{display:inline-block;margin-top:.8rem;padding:.7rem 2rem;background:#0d1a12;color:#e4c97e;text-decoration:none;font-size:.8rem;letter-spacing:.1em;text-transform:uppercase;font-weight:600;border-radius:4px}
.footer{border-top:1px solid rgba(255,255,255,.06);padding-top:1.5rem;margin-top:2rem;text-align:center;font-size:.75rem;color:rgba(232,234,230,.4)}
.source{font-size:.78rem;color:rgba(232,234,230,.4);margin-top:1.5rem;border-top:1px solid rgba(255,255,255,.06);padding-top:1rem}
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

/** Build the article HTML from a news item. Ends with the Thomson Reserve promo box (user rule). */
function buildArticle(post, slug, dateLabel, isoDate) {
  const title = post.title;
  const desc = post.desc;
  const url = `${SITE_URL}/articles/${slug}.html`;
  const thomsonPromo = `<div class="thomson-promo" style="margin-top:2rem;background:#14281e;border:1px solid rgba(201,168,76,.35);border-left:4px solid #c9a84c;border-radius:8px;padding:1.5rem 1.8rem;">
  <p style="margin:0 0 .4rem;color:#e4c97e;font-size:.78rem;letter-spacing:.14em;text-transform:uppercase;font-weight:600;">🏗️ New Launch · District 20 · Upper Thomson</p>
  <p style="margin:0;color:#e8eae6;font-size:1.02rem;line-height:1.7;"><strong>Thinking about buying a new launch in 2026?</strong> Thomson Reserve — 1,268 units at Bright Hill Drive, Upper Thomson — is one of the most anticipated launches of the year, jointly developed by UOL Group, CapitaLand and SingLand.</p>
  <p style="margin:.8rem 0 0;color:rgba(232,234,230,.75);font-size:.9rem;">Get the <strong>direct developer price</strong> and first access to the preview before public launch.</p>
  <a href="https://thomson-reserve-direct-developer.com/" target="_blank" rel="noopener" style="display:inline-block;margin-top:1rem;padding:.7rem 2rem;background:#c9a84c;color:#0d1a12;text-decoration:none;font-size:.78rem;letter-spacing:.12em;text-transform:uppercase;font-weight:600;border-radius:4px;">👉 Visit Thomson Reserve Official Site</a>
</div>`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
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
<title>${esc(title)} | Jet Lee Channel</title>
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
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600&display=swap" rel="stylesheet">
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

<a href="${SITE_URL}/" class="back">← Back to Home</a>
<h1>${esc(title)}</h1>
<p class="meta">Published ${dateLabel} · By Jet Lee · Market Analysis · Source: PropNex Property News Update</p>

${post.body}

<div class="highlight">
  <strong>Why this matters for Singapore property buyers:</strong>
  ${title} — the full picture, what it means for prices, and how buyers and sellers should be thinking about it in the current market.
</div>

<h2>My Take — 18 Years in the Market</h2>
<p>Market news moves fast, but the fundamentals don't: <strong>location, scarcity and timing</strong> still drive value in Singapore property. Whatever the headline says, the discipline is the same — compare relentlessly, understand what you're paying for, and never let emotion set the price.</p>
<p>If you're weighing a new launch, a resale, or even a landed home, this kind of market signal is worth paying attention to — it shapes sentiment, pricing and timing.</p>

<div class="cta">
  <p><strong>Looking to buy — whether a condo, a landed home, or your first property?</strong></p>
  <p>No pressure — just honest analysis of what fits your goals and budget.</p>
  <a href="https://wa.me/6587649315?text=Hi%20Jet%20Lee%2C%20I%20read%20your%20article%20on%20jetleechannel.sg">📱 WhatsApp Jet Lee</a>
</div>

${thomsonPromo}

<a href="${SITE_URL}/articles/" class="back" style="text-align:center;display:block;">← Back to all articles</a>

<p class="source">Source: <a href="${post.url}" rel="nofollow noopener" target="_blank">PropNex Property News Update</a>. This article is a commentary on the news item and is for general information only.</p>

<div style="margin-top:1.2rem;padding-top:1rem;border-top:1px solid rgba(255,255,255,.08);text-align:center;">
  <p style="margin:0;color:rgba(232,234,230,.45);font-size:.82rem;">🏗️ <a href="https://thomson-reserve-direct-developer.com/" target="_blank" rel="noopener" style="color:#c9a84c;text-decoration:none;font-weight:600;">Thomson Reserve</a> — New Launch D20 · Preview Oct 2026 · Direct Developer Price</p>
</div>

<div class="footer">
  <p>Jet Lee @ ${HQ.phone} · ${HQ.cea} · PropNex Realty</p>
  <p><a href="${SITE_URL}">${SITE_URL.replace('https://', '')}</a></p>
</div>

</body>
</html>`;
}

/** Insert the new article card at the top of the HQ article-list (minimal change). */
function addCardToIndex(articlePath, meta) {
  const dir = join(WORKSPACE, 'articles');
  const idxFile = join(dir, 'index.html');
  let idx = readFileSync(idxFile, 'utf-8');
  const slug = meta.slug;
  if (idx.includes(`href="${slug}.html"`)) {
    console.log(`ℹ️ ${slug} already in index — skipping insert`);
    return true;
  }
  const marker = '<div class="article-list">';
  const s = idx.indexOf(marker);
  if (s === -1) {
    console.log('❌ Could not find article-list in HQ index — aborting');
    return false;
  }
  const label = meta.label ? `Updated ${meta.label}` : 'Updated 2026';
  const card = `
    <div class="article-card">
      <a href="${slug}.html">
        <h2>${esc(meta.title)}</h2>
        <p class="meta">${label}</p>
        <p>${esc(meta.desc.slice(0, 160))}${meta.desc.length > 160 ? '…' : ''}</p>
        <span class="read-more">Read More →</span>
      </a>
    </div>
`;
  const newIdx = idx.slice(0, s + marker.length) + card + idx.slice(s + marker.length);
  writeFileSync(idxFile, newIdx, 'utf-8');
  console.log('✅ HQ index updated with new card at top of list');
  return true;
}

function uploadFTP(local, remote) {
  const cmd = `curl -s -T "${local}" "ftp://${FTP_HOST}${remote}" --user "${FTP_USER}:${FTP_PASS}" --ftp-create-dirs -o /dev/null -w "%{http_code}" --connect-timeout 15 --max-time 90`;
  const code = execSync(cmd, { encoding: 'utf-8', maxBuffer: 1024 * 1024 }).trim();
  return code === '226';
}

function main() {
  console.log('📰 HQ (jetleechannel.sg) weekly article generator —', new Date().toISOString());
  const posts = fetchNews();
  console.log(`Fetched ${posts.length} posts from PropNex channel`);

  let state = { used: [] };
  if (existsSync(STATE_FILE)) state = JSON.parse(readFileSync(STATE_FILE, 'utf-8'));

  // Shared pool: posts consumed by ANY site
  const SHARED_POOL_FILE = join(WORKSPACE, 'loyang-articles/.shared-used.json');
  let shared = { used: [] };
  if (existsSync(SHARED_POOL_FILE)) {
    try { shared = JSON.parse(readFileSync(SHARED_POOL_FILE, 'utf-8')); } catch (e) { shared = { used: [] }; }
  }
  for (const u of state.used) if (!shared.used.includes(u)) shared.used.push(u);
  if (shared.used.length > 60) shared.used = shared.used.slice(-60);

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
  const articlePath = join(WORKSPACE, 'articles', `${slug}.html`);
  writeFileSync(articlePath, articleHtml, 'utf-8');
  console.log(`✅ Generated ${slug}.html`);

  // Insert card into index
  const okRebuild = addCardToIndex(articlePath, {
    slug,
    title: postObj.title,
    desc: postObj.desc,
    label: dateLabel,
  });
  if (!okRebuild) process.exit(1);
  const indexPath = join(WORKSPACE, 'articles/index.html');

  // Upload
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
    const msg = `📰 New article published on JetleeChannel.sg:\n\n${postObj.title}\n\n${SITE_URL}/articles/${slug}.html`;
    execSync(`curl -s "https://api.telegram.org/bot${TOKEN}/sendMessage?chat_id=${CHAT_ID}&text=${encodeURIComponent(msg)}" --max-time 20`, { encoding: 'utf-8', maxBuffer: 1024 * 1024 });
    console.log('📨 Telegram notification sent');
  } catch (e) {
    console.log('⚠️ Telegram notification failed:', e.message.slice(0, 80));
  }

  if (!okArticle || !okIndex) process.exit(1);
}

main();
