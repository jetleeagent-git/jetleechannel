#!/usr/bin/env node
/**
 * Create articles pages + starter articles for projects missing them:
 *   thecontinuum, narraresidences, aurea
 * Each gets:
 *   - /articles/index.html (list page, dark theme with gold accents)
 *   - 2 starter articles (Loyang-style template, GA, schema, FAQ, CTA, Telegram link)
 * Uploads via main jetleechannel.sg FTP.
 */
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';

const WORKSPACE = '/home/ubuntu/.openclaw/workspace';
const FTP_HOST = '191.101.228.66';
const FTP_USER = 'u851958941.jetleechannel.sg';
const FTP_PASS = 'Jetleechannel12345&';
const BASE = 'https://jetleechannel.sg';

// Site configs
const SITES = {
  thecontinuum: {
    name: 'The Continuum',
    tagline: 'Freehold Condo at Thiam Siew Avenue, District 15',
    facts: '816 freehold units · Hoi Hup Realty & Sunway · 1–8 Thiam Siew Avenue D15 · near Dakota MRT (Circle Line) & Mountbatten',
    backUrl: `${BASE}/thecontinuum/`,
    titleTag: 'The Continuum | Jet Lee',
  },
  narraresidences: {
    name: 'Narra Residences',
    tagline: 'New Launch at Dairy Farm Walk, District 23',
    facts: '540 units · Santarli Realty & Apex Asia · 99-year leasehold · Dairy Farm Walk D23 · near Hillview MRT (Downtown Line)',
    backUrl: `${BASE}/narraresidences/`,
    titleTag: 'Narra Residences | Jet Lee',
  },
  aurea: {
    name: 'Aurea',
    tagline: 'New Launch at Beach Road, District 07',
    facts: '188 units · Far East Organization & Perennial Real Estate · 99-year leasehold mixed dev · 802 Beach Road D07 · near Nicoll Highway MRT (Circle Line)',
    backUrl: `${BASE}/aurea/`,
    titleTag: 'Aurea | Jet Lee',
  },
};

const CSS = `
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
`;

function esc(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function uploadFTP(local, remote) {
  const cmd = `curl -s -T "${local}" "ftp://${FTP_HOST}${remote}" --user "${FTP_USER}:${FTP_PASS}" --ftp-create-dirs -o /dev/null -w "%{http_code}" --connect-timeout 15 --max-time 90`;
  const code = execSync(cmd, { encoding: 'utf-8', maxBuffer: 1024 * 1024 }).trim();
  return code === '226';
}

/** Build the index page with the given cards (each: {slug, title, date, desc}) */
function buildIndex(site, cards) {
  const s = SITES[site];
  const cardHtml = cards.map(c => `<div class="card">
  <h2>${esc(c.title)}</h2>
  <div class="date">Published ${c.date}</div>
  <p>${esc(c.desc)}</p>
  <a href="${c.slug}.html">Read More →</a>
</div>
`).join('\n');
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="description" content="${esc(s.name)} — property market insights and guides. ${s.tagline}.">
<link rel="canonical" href="${BASE}/${site}/articles/">
<title>Articles & Market Insights | ${esc(s.name)} | Jet Lee</title>
<style>${CSS}</style>
</head>
<body>

<a href="${s.backUrl}" class="back">← Back to ${esc(s.name)}</a>
<h1>${esc(s.name)} — Articles & Market Insights</h1>

${cardHtml}
<a href="${s.backUrl}" style="display:inline-block;margin-top:1rem;padding:.7rem 2rem;background:#c9a84c;color:#0d1a12;text-decoration:none;font-size:.75rem;letter-spacing:.15em;text-transform:uppercase;font-weight:600;border-radius:4px">← Back to ${esc(s.name)}</a>

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
}

/** Build an article page (dark/gold theme, GA, schema, FAQ, CTA, source) */
function buildArticle(site, slug, title, desc, bodyHtml, dateLabel, isoDate, sourceUrl) {
  const s = SITES[site];
  const url = `${BASE}/${site}/articles/${slug}.html`;
  return `<!DOCTYPE html>
<html lang="en">
<head>
<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-6LFG5HCYKP"></script>
<script>
 window.dataLayer = window.dataLayer || [];
 function gtag(){dataLayer.push(arguments);}
 gtag('js', new Date());
 gtag('config', 'G-6LFG5HCYKP');
</script>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(title)} | ${esc(s.name)} | Jet Lee</title>
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
<style>${CSS.replace(/body\{[^}]*\}/, 'body{font-family:-apple-system,BlinkMacSystemFont,\'Segoe UI\',Roboto,Helvetica,Arial,sans-serif;background:#0d1a12;color:#e8eae6;line-height:1.8;max-width:800px;margin:0 auto;padding:2rem}')}
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
</style>
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

<a href="${BASE}/${site}/articles/" class="back">← All Articles</a>
<h1>${esc(title)}</h1>
<p class="meta">Published ${dateLabel} · ${esc(s.tagline)} · By Jet Lee, PropNex Realty (CEA Reg No. R007613B)</p>

${bodyHtml}

<div class="highlight">
<strong>${esc(s.name)} at a glance</strong><br>
&bull; ${esc(s.facts)}<br>
&bull; Direct developer pricing — no commission payable · Call/WhatsApp +65 8764 9315
</div>

<h2>What This Means for ${esc(s.name)} Buyers</h2>
<p>News like this matters for property buyers because it shapes <strong>market sentiment, pricing and timing</strong>. For anyone considering ${esc(s.name)} — ${esc(s.tagline)} — staying on top of the wider market helps you make a more informed decision on <em>when</em> to buy and <em>what</em> to expect.</p>

<h2>Frequently Asked Questions</h2>
<div class="highlight">
<strong>How does this news affect ${esc(s.name)} buyers?</strong><br>
Any shift in the wider property market has knock-on effects on new launch pricing, demand and rental appeal. If you'd like to understand what it means for your purchase decision, reach out for a no-obligation chat.
</div>
<div class="highlight">
<strong>How do I get the latest prices and availability?</strong><br>
Contact Jet Lee directly at +65 8764 9315 for the current price list, e-brochure, floor plans and available balance units — direct developer price, no commission payable.
</div>

<div class="cta">
<p><strong>Considering ${esc(s.name)}?</strong></p>
<p>Get the latest price list, e-brochure and balance units — direct developer price.</p>
<a href="https://wa.me/6587649315?text=Hi%20Jet%20Lee%2C%20I%20read%20your%20article%20on%20${encodeURIComponent(s.name)}">WhatsApp Jet Lee</a>
</div>

${sourceUrl ? `<p class="source">Source: <a href="${sourceUrl}" rel="nofollow noopener" target="_blank">PropNex Property News Update</a></p>` : ''}

<div class="footer">
  <p>Jet Lee · +65 8764 9315 · CEA Reg No. R007613B · PropNex Realty · <a href="https://jetleechannel.sg">jetleechannel.sg</a></p>
</div>

</body>
</html>
`;
}

// ---------- Starter article content per site ----------
const STARTERS = {
  thecontinuum: [
    {
      slug: 'thiam-siew-avenue-d15-freehold-guide',
      title: 'Thiam Siew Avenue, District 15: A Freehold Address in Singapore\u2019s Heartland',
      date: '16 August 2026', iso: '2026-08-16',
      desc: 'The Continuum brings 816 freehold units to Thiam Siew Avenue D15 — a short walk from Dakota MRT. Why freehold tenure and mature-estate convenience keep D15 on buyers\u2019 radars.',
      body: `<p>District 15 has long been one of Singapore's most sought-after postal districts — minutes from the city, the East Coast and a well-established food-and-transport network. The Continuum at 1–8 Thiam Siew Avenue adds <strong>816 freehold units</strong> to this mature estate, developed by Hoi Hup Realty and Sunway.</p>
<p>Dakota MRT (Circle Line) is roughly a five-minute walk, putting you one stop from Paya Lebar interchange and a short ride to Marina Bay. Around it, the neighbourhood delivers what buyers in D15 have always valued: schools, shops and a slower pace of life, close enough to the action.</p>
<p>Freehold tenure is the headline — for buyers who intend to hold long-term or pass property down, the absence of a lease countdown is a genuine advantage. In a market where most new launches are 99-year, freehold projects in mature districts hold a distinct position.</p>
<p>Whether you are upgrading from a nearby HDB or relocating from another district, The Continuum sits in a catchment with stable demand — and that is exactly the kind of profile investors look at twice.</p>`,
    },
    {
      slug: 'freehold-vs-99-year-leasehold-new-launch',
      title: 'Freehold vs 99-Year Leasehold: Which New Launch Should You Choose?',
      date: '16 August 2026', iso: '2026-08-16',
      desc: 'Freehold, 99-year, 999-year — the tenure decision can shape your returns for decades. A practical guide for buyers weighing The Continuum (freehold) against leasehold new launches.',
      body: `<p>Ask ten property investors which tenure they prefer and most will say freehold — but the premium you pay for it needs to earn its keep. Here is a practical way to think about it.</p>
<p><strong>Freehold</strong> (like The Continuum at Thiam Siew Avenue) has no lease expiry, so land value is preserved indefinitely. It tends to appeal to buyers who plan to hold for the very long term or keep the property in the family. The trade-off: a higher entry price per square foot.</p>
<p><strong>99-year leasehold</strong> is the default for most new launches — cheaper to enter, and the land lease is factored into price. With good location and strong rental demand, many leasehold projects still appreciate well, especially in the first two decades of their lease.</p>
<p><strong>999-year</strong> is rare and usually priced close to freehold.</p>
<p>Our rule of thumb: if your horizon is 10–20 years, both tenures can work — the deciding factors are location, price gap and exit liquidity. If your horizon is 30+ years or you want multi-generational ownership, the freehold premium is easier to justify.</p>
<p>For buyers comparing The Continuum with leasehold alternatives nearby, the freehold premium is the key number to crunch — get in touch and we can run the comparison together.</p>`,
    },
  ],
  narraresidences: [
    {
      slug: 'dairy-farm-walk-d23-living-guide',
      title: 'Dairy Farm Walk, District 23: Green Living Minutes from Hillview MRT',
      date: '16 August 2026', iso: '2026-08-16',
      desc: 'Narra Residences brings 540 units to Dairy Farm Walk D23 by Santarli Realty & Apex Asia — 99-year leasehold beside Bukit Timah Nature Reserve. Why D23 is a sleeper hit for nature-loving buyers.',
      body: `<p>District 23 has quietly become one of the most liveable addresses in Singapore — and Dairy Farm Walk is its greenest pocket. Narra Residences, a 540-unit 99-year leasehold launch by Santarli Realty and Apex Asia, sits within walking distance of Hillview MRT (Downtown Line) and at the foot of Bukit Timah Nature Reserve.</p>
<p>The lifestyle pitch writes itself: hiking trails, the Rail Corridor, and the calm of the Bukit Timah forest, all while staying connected to the city via the Downtown Line and major expressways. Schools in the vicinity — including well-regarded primary options — make it a family favourite.</p>
<p>For investors, D23\u2019s rental pool is supported by nearby institutions and business parks, and supply in the immediate Dairy Farm–Hillview pocket has remained controlled. That combination — limited supply, strong lifestyle demand — is exactly what supports price stability.</p>
<p>If you have been priced out of D9–D11 but still want greenery and space, Dairy Farm Walk deserves a serious look.</p>`,
    },
    {
      slug: 'rail-corridor-bukit-timah-property-value',
      title: 'The Rail Corridor Effect: Why Green Spaces Lift Property Values',
      date: '16 August 2026', iso: '2026-08-16',
      desc: 'From the Rail Corridor to Bukit Timah Nature Reserve, greenery near home has a measurable impact on property values and rental appeal. How Narra Residences fits the trend.',
      body: `<p>Homes near parks and green corridors consistently command a premium — and in land-scarce Singapore, that premium is only widening. The Rail Corridor, stretching from Woodlands to the south, has turned a former railway line into one of the island's most beloved recreational spines.</p>
<p>Narra Residences at Dairy Farm Walk sits within reach of the Rail Corridor and Bukit Timah Nature Reserve, giving residents a daily connection to open space that most new launches simply cannot offer. For families, that means weekend adventures without leaving the neighbourhood; for investors, it means a lifestyle story that rents well.</p>
<p>Urban greenery is not just aesthetic — it supports well-being, and increasingly, buyers pay for it. Data across Singapore's mature estates shows park-adjacent homes retain value better in downturns and capture more upside in upswings.</p>
<p>For buyers weighing a D23 purchase, the green dividend is a quiet but powerful tailwind.</p>`,
    },
  ],
  aurea: [
    {
      slug: 'beach-road-d07-bugis-living-guide',
      title: 'Beach Road, District 07: Bugis, Culture and the New Beach Road',
      date: '16 August 2026', iso: '2026-08-16',
      desc: 'Aurea brings 188 units to 802 Beach Road D07 by Far East Organization & Perennial — 99-year mixed development steps from Nicoll Highway MRT and the Bugis cultural belt.',
      body: `<p>Beach Road connects some of Singapore's most vibrant quarters — Bugis, Kampong Glam, the Bras Basah arts district — and Aurea puts 188 units right in the middle of it. The 99-year mixed development at 802 Beach Road is by Far East Organization and Perennial Real Estate, two names with deep track records in city-fringe living.</p>
<p>Nicoll Highway MRT (Circle Line) is at your doorstep, and the Downtown Line's Bugis station is a short stroll — putting Raffles Place, Marina Bay and the financial district minutes away. For young professionals and investors alike, D07 offers city access at a fraction of D9–D10 prices.</p>
<p>The cultural pull is real: Kampong Glam's shophouses, the National Library, Suntec City and the Singapore Sports Hub are all close. It is a district in transition — exactly where early buyers tend to find value.</p>
<p>With a boutique scale of 188 units, Aurea offers the intimacy of a small development with the convenience of a central location.</p>`,
    },
    {
      slug: 'city-fringe-living-d07-vs-d9-d10',
      title: 'City-Fringe vs Core Central: Where Should Your Next Dollar Go?',
      date: '16 August 2026', iso: '2026-08-16',
      desc: 'D9 and D10 command a premium, but city-fringe districts like D07 deliver similar convenience at a lower entry price. A candid comparison for buyers eyeing Aurea at Beach Road.',
      body: `<p>The Core Central Region — D9, D10 and D11 — is the default answer for buyers who want to be in the city. But the price gap between CCR and the city fringe has widened, and for many buyers, the fringe now offers the smarter entry.</p>
<p>Take D07's Beach Road: you are within walking distance of Nicoll Highway MRT, one stop to City Hall, and minutes from Marina Bay — yet entry prices sit well below comparable D9 new launches. Aurea's 188 units at 802 Beach Road capture that value proposition precisely.</p>
<p>What you give up is brand prestige and the D9 postal code. What you gain is a lower entry point, strong rental potential (city workers will always rent nearby), and a district on the upswing.</p>
<p>The numbers matter more than the postal code. For buyers who want city convenience without the CCR premium, D07 deserves a place on the shortlist.</p>`,
    },
  ],
};

// ---------- Main ----------
const sites = process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(SITES);

for (const site of sites) {
  if (!SITES[site]) { console.log(`❌ Unknown site: ${site}`); continue; }
  const s = SITES[site];
  const dir = join(WORKSPACE, `${site}-articles`);
  mkdirSync(dir, { recursive: true });
  console.log(`\n=== ${s.name} ===`);

  // Write starter articles
  const cards = [];
  for (const a of STARTERS[site] || []) {
    const html = buildArticle(site, a.slug, a.title, a.desc, a.body, a.date, a.iso, null);
    const local = join(dir, `${a.slug}.html`);
    writeFileSync(local, html, 'utf-8');
    cards.push({ slug: a.slug, title: a.title, date: a.date, desc: a.desc });
    console.log(`✅ ${a.slug}.html`);
  }

  // Index
  const index = buildIndex(site, cards);
  writeFileSync(join(dir, 'index.html'), index, 'utf-8');
  console.log('✅ index.html');

  // Upload
  const remoteBase = `/${site}/articles/`;
  for (const a of cards) {
    const ok = uploadFTP(join(dir, `${a.slug}.html`), `${remoteBase}${a.slug}.html`);
    console.log(`Upload ${a.slug}.html: ${ok ? '✅' : '❌'}`);
  }
  const okIdx = uploadFTP(join(dir, 'index.html'), `${remoteBase}index.html`);
  console.log(`Upload index.html: ${okIdx ? '✅' : '❌'}`);
}
console.log('\nDone.');
