#!/usr/bin/env node
/**
 * Generate "Singapore Property Market Outlook 2026" article (ST/PropNex source).
 * - HQ version: article-propnex-2026-outlook.html at jetleechannel.sg/articles/
 * - 21 project-local versions: {dir}_articles/propnex-2026-outlook.html
 * Each project version ends with a Thomson Reserve promotion block
 * (thomson-reserve-direct-developer.com) — per user instruction:
 * "each time i send u an article to add to my website, can u end with promoting thomson-reserve-direct-developer.com".
 */

import { writeFileSync, mkdirSync, existsSync } from 'fs';

const ARTICLE = 'propnex-2026-outlook.html';
const HQ_ARTICLE = 'article-propnex-2026-outlook.html';

const THOMSON_PROMO = `<div class="thomson-promo" style="margin-top:2rem;background:#14281e;border:1px solid rgba(201,168,76,.35);border-left:4px solid #c9a84c;border-radius:8px;padding:1.5rem 1.8rem;">
  <p style="margin:0 0 .4rem;color:#e4c97e;font-size:.78rem;letter-spacing:.14em;text-transform:uppercase;font-weight:600;">🏗️ New Launch · District 20 · Upper Thomson</p>
  <p style="margin:0;color:#e8eae6;font-size:1.02rem;line-height:1.7;"><strong>Thinking about buying a new launch in 2026?</strong> Thomson Reserve — 1,268 units at Bright Hill Drive, Upper Thomson — is one of the most anticipated launches of the year, jointly developed by UOL Group, CapitaLand and SingLand.</p>
  <p style="margin:.8rem 0 0;color:rgba(232,234,230,.75);font-size:.9rem;">Get the <strong>direct developer price</strong> and first access to the preview before public launch.</p>
  <a href="https://thomson-reserve-direct-developer.com/" target="_blank" rel="noopener" style="display:inline-block;margin-top:1rem;padding:.7rem 2rem;background:#c9a84c;color:#0d1a12;text-decoration:none;font-size:.78rem;letter-spacing:.12em;text-transform:uppercase;font-weight:600;border-radius:4px;">👉 Visit Thomson Reserve Official Site</a>
</div>`;

const THOMSON_FOOTER = `<div style="margin-top:1.2rem;padding-top:1rem;border-top:1px solid rgba(255,255,255,.08);text-align:center;">
  <p style="margin:0;color:rgba(232,234,230,.45);font-size:.82rem;">🏗️ <a href="https://thomson-reserve-direct-developer.com/" target="_blank" rel="noopener" style="color:#c9a84c;text-decoration:none;font-weight:600;">Thomson Reserve</a> — New Launch D20 · Preview Oct 2026 · Direct Developer Price</p>
</div>`;

function body(p) {
  const proj = p ? p.name : null;
  const canon = p
    ? `https://jetleechannel.sg/${p.slug}/articles/${ARTICLE}`
    : `https://jetleechannel.sg/articles/${HQ_ARTICLE}`;
  const title = proj
    ? `Singapore Property Market Outlook 2026: Lower Rates Support Growth | ${proj}`
    : `Singapore Property Market Outlook 2026: Lower Rates Support Growth | Jet Lee Channel`;
  const desc = p
    ? `PropNex forecasts 3-4% private home price growth in 2026 with ~9,000 new launches sold. Lower mortgage rates, ABSD changes and the HDB wait-out removal are supporting demand — what this means for ${proj} buyers.`
    : `PropNex forecasts 3-4% private home price growth in 2026 with ~9,000 new private homes sold. Lower mortgage rates, population growth and policy changes are supporting the market — a full breakdown.`;

  const projSection = p ? `
<h2>What This Means for ${p.name} Buyers</h2>
<p>For anyone considering ${p.name}, the 2026 outlook is supportive: interest rates are down sharply from their 2023 peaks (fixed two-year rates now ~1.4%-1.7%), prices are still rising — just more steadily — and Singaporeans made up <strong>98.3% of new non-landed private home purchases</strong> in the first half of 2026. That is a fundamentally owner-occupier-led market.</p>
<p>With developers projected to sell around <strong>9,000 new private homes</strong> this year and buyers prioritising well-located projects, the projects that stand out are the ones with genuine location advantages — which is exactly what ${p.name} offers. ${p.tieIn}</p>
<div class="highlight">
  <strong>The practical takeaway:</strong> slower price growth doesn't mean waiting is free. It means the window to buy at reasonable levels is open — and when rates fall further and buyer confidence firms up, the well-located projects tend to move first.
</div>` : ``;

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="description" content="${desc}">
<link rel="canonical" href="${canon}">
<title>${title}</title>
<style>
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
</style>
</head>
<body>

<a href="${p ? `https://jetleechannel.sg/${p.slug}/` : 'https://jetleechannel.sg/'}" class="back">← Back to ${p ? p.back : 'Home'}</a>
<h1>Singapore Property Market Outlook 2026: Lower Rates Support Growth</h1>
<p class="meta">Published 14 August 2026 · Market Outlook · Source: The Straits Times</p>

<p><strong>Singapore's residential property market is set for a stable, supported 2026</strong> — with private home prices expected to rise 3% to 4% for the year, and developers projected to sell around 9,000 new private homes (excluding executive condos), according to PropNex's first-half results released on Aug 13.</p>

<div class="highlight">
  <strong>The headline numbers:</strong>
  Private home prices +3% to 4% in 2026 · ~9,000 new private homes projected to be sold · 14,000-15,000 private resale transactions expected · HDB resale prices up to +1% · 26,000-27,000 HDB resale transactions forecast.
</div>

<h2>The 2026 Story: Lower Rates, Steady Demand</h2>
<p>Three forces are supporting the market in the second half of 2026:</p>
<ul>
  <li><strong>Substantially lower mortgage rates.</strong> Fixed two-year housing loan rates now range from about <strong>1.4% to 1.7%</strong> a year — a major drop from their 2023 peaks. Cheaper borrowing directly widens the pool of qualified buyers.</li>
  <li><strong>Population growth and rising household wealth.</strong> Singapore's growing population and stronger household balance sheets continue to underpin housing demand.</li>
  <li><strong>Policy changes.</strong> The removal of the 15-month wait-out period (from July 28) for private property owners buying non-subsidised HDB resale flats — plus extended ABSD remission timelines for large collective-sale sites — are expected to improve movement across the private and public housing markets.</li>
</ul>

<h2>Prices Still Rising — Just More Slowly</h2>
<p>PropNex chief executive Kelvin Fong noted that private home prices are still increasing, albeit at a slower rate than the year before, with the market supported by owner-occupiers and buyers' continued confidence in <strong>well-located projects</strong>.</p>
<p>The buyer profile supports this: <strong>Singapore citizens and permanent residents accounted for 98.3% of new non-landed private home purchases</strong> in the first half of 2026, and sub-sale transactions (a proxy for speculation) remain low relative to historical levels.</p>
<p>"The latest trends indicate that home purchases are mainly led by locals with genuine housing needs rather than speculation," said Fong.</p>

<h2>The HDB Market: More Stable, Still Strong at the Top</h2>
<ul>
  <li>PropNex forecasts <strong>26,000-27,000 HDB resale transactions</strong> in 2026, with prices rising up to 1%.</li>
  <li>First-half resale transactions fell 7.4% year-on-year to 12,681 units, while resale prices dipped 0.4%.</li>
  <li>But demand for pricier, well-located flats stayed resilient — <strong>491 flats sold for at least $1 million in Q2</strong>, up from 411 in Q1.</li>
  <li>The removal of the 15-month wait-out period could help older owners and empty nesters right-size into larger HDB flats, releasing more private resale homes into the market while lifting demand for five-room and executive units.</li>
</ul>

<h2>ABSD Changes: Bigger Sites, Longer Timelines</h2>
<p>Changes to ABSD remission rules may revive interest in large collective-sale sites:</p>
<ul>
  <li>Large sites (700 to fewer than 1,400 residential units upon redevelopment) now get a <strong>six-year</strong> completion and sale timeline (up from 5.5 years) before ABSD remission is clawed back.</li>
  <li>Mega sites (1,400+ units) get a <strong>seven-year</strong> timeline.</li>
  <li>Developers pay 40% ABSD upfront but get 35% back if they meet the timelines — the extended runway makes bigger en bloc deals more viable.</li>
</ul>
<p>This matters for buyers because it points to <strong>more large-scale new launches</strong> coming down the pipeline in the years ahead — and more choice across districts.</p>

<h2>The Developer Side: PropNex's Numbers</h2>
<p>PropNex's revenue edged up 0.7% to <strong>$603 million</strong> in the first half, with net profit of $40.9 million. Its share of property transactions rose to <strong>64.3%</strong> (from 60.6% for all of 2025), and its sales force stood at 14,574 agents on Aug 3. In 2025, developers sold 10,815 new private residential units excluding ECs, according to URA.</p>

${projSection || `<h2>What This Means for Buyers</h2>
<p>For buyers, the 2026 outlook is a genuinely supportive environment: mortgage rates are near multi-year lows, prices are rising at a sustainable 3-4% pace, and the market is dominated by genuine owner-occupiers rather than speculation.</p>
<p>The projects that will do best are the <strong>well-located ones</strong> — exactly what PropNex's own CEO pointed to. If you're looking at new launches this year, the strongest picks are those with real location advantages: MRT connectivity, school belts, and district scarcity.</p>`}

<h2>My Take — 18 Years in the Market</h2>
<div class="highlight">
  <strong>This is a "steady as she goes" market — and that's a good thing.</strong> Prices rising 3-4% with genuine, local-driven demand is about as healthy as a property market gets. The low-rate environment widens affordability, policy changes are freeing up movement between HDB and private, and speculation is largely absent. For buyers with a long-term horizon, this is a constructive window — not a peak to fear, but a market with real momentum behind it.
</div>

<p>If you're weighing a new launch or a resale purchase, the numbers say well-located projects are where demand concentrates. That's where I come in — I help buyers across Singapore compare projects, understand pricing, and move with confidence.</p>

<div class="cta">
  <p><strong>Looking to buy in 2026? Let's find the right project for you.</strong></p>
  <p>No pressure — just honest analysis of what fits your goals and budget.</p>
  <a href="https://wa.me/6587649315?text=Hi%20Jet%20Lee%2C%20I%20read%20your%20PropNex%202026%20outlook%20article">📱 WhatsApp Jet Lee</a>
</div>

${THOMSON_PROMO}

<a href="${p ? `https://jetleechannel.sg/${p.slug}/articles/` : 'https://jetleechannel.sg/articles/'}" class="back" style="text-align:center;display:block;">← Back to all articles</a>

<p class="source">Source: <a href="https://www.straitstimes.com/business/lower-mortgage-rates-policy-changes-to-support-singapore-property-market-in-2026-propnex" rel="nofollow noopener">The Straits Times — Singapore property market outlook 2026: lower rates support growth (PropNex H1 2026 results, Aug 13 2026)</a></p>

${THOMSON_FOOTER}

<div class="footer">
  <p>Jet Lee @ 8764 9315 · CEA Reg No. R007613B · PropNex Realty</p>
  <p><a href="https://jetleechannel.sg">jetleechannel.sg</a></p>
</div>

</body>
</html>
`;
}

// ── Project list (dir, slug, name, back-link label, project tie-in) ──
const PROJECTS = [
  { dir: 'elta', slug: 'elta', name: 'ELTA', back: 'ELTA', tieIn: 'ELTA\'s Clementi location, dual-line MRT potential and MCL Land quality make it a project where well-located demand naturally concentrates.' },
  { dir: 'dunearnhouse', slug: 'dunearnhouse', name: 'Dunearn House', back: 'Dunearn House', tieIn: 'Dunearn House\'s freehold status in the Bukit Timah belt is exactly the kind of scarce, well-located proposition buyers favour in a steady market.' },
  { dir: 'amberwood', slug: 'amberwood', name: 'Amberwood', back: 'Amberwood', tieIn: 'Amberwood\'s rare freehold status near Holland Plain puts it in the "pricier, well-located" segment that is proving most resilient.' },
  { dir: 'arcady', slug: 'arcady', name: 'The Arcady at Boon Keng', back: 'The Arcady', tieIn: 'The Arcady\'s freehold tenure and Boon Keng convenience tick both boxes buyers are prioritising — scarce tenure and real location value.' },
  { dir: 'hudsonplace', slug: 'hudsonplace', name: 'Hudson Place', back: 'Hudson Place', tieIn: 'Hudson Place\'s heritage-district position near Outram Park keeps it in the well-located bracket that is drawing the strongest demand.' },
  { dir: 'hougangcentral', slug: 'hougangcentral', name: 'Hougang Central', back: 'Hougang Central', tieIn: 'Hougang Central\'s MRT-linked location in a mature HDB heartland positions it well as upgraders return to the market.' },
  { dir: 'lentor-gardens', slug: 'lentor-gardens', name: 'Lentor Gardens', back: 'Lentor Gardens', tieIn: 'Lentor Gardens\' spot in the fast-growing Lentor precinct gives buyers the kind of fresh, well-planned location that attracts steady demand.' },
  { dir: 'lucernegrand', slug: 'lucernegrand', name: 'Lucerne Grand', back: 'Lucerne Grand', tieIn: 'Lucerne Grand\'s Lakeside address and Jurong Lake District upside make it a standout in the value-for-location segment.' },
  { dir: 'OneMarinaGardens', slug: 'OneMarinaGardens', name: 'One Marina Gardens', back: 'One Marina Gardens', tieIn: 'One Marina Gardens\' Marina South location and record $3,290 psf benchmark show exactly where buyer confidence is concentrating.' },
  { dir: 'unionsquare', slug: 'unionsquare', name: 'Union Square', back: 'Union Square', tieIn: 'Union Square\'s central Orchard-side address is the definition of a well-located project — the segment PropNex says is holding up best.' },
  { dir: 'generations-tannery', slug: 'generations-tannery', name: 'Generations @ Tannery', back: 'Generations @ Tannery', tieIn: 'Generations @ Tannery\'s Kovan heritage location offers the kind of scarce, character-rich address that stands out to genuine home buyers.' },
  { dir: 'TheSierra', slug: 'TheSierra', name: 'The Serra Residences', back: 'The Serra Residences', tieIn: 'The Serra Residences\' freehold tenure in the Novena belt is precisely the scarce, well-located profile that stays in demand.' },
  { dir: 'TheOrie', slug: 'TheOrie', name: 'The Orie', back: 'The Orie', tieIn: 'The Orie\'s 777-unit Toa Payoh address with mature-town convenience gives buyers a rare fresh launch in a location everyone knows.' },
  { dir: 'SophiaMeadow', slug: 'SophiaMeadow', name: 'Sophia Meadow', back: 'Sophia Meadow', tieIn: 'Sophia Meadow\'s District 9 freehold address on Sophia Road is the scarce, central profile that holds value in any rate environment.' },
  { dir: 'bagnallhous', slug: 'bagnallhous', name: 'Bagnall Haus', back: 'Bagnall Haus', tieIn: 'Bagnall Haus\'s freehold strata-landed offering in D16 is a rare product type — and scarcity is what performs in steady markets.' },
  { dir: 'zyongrand', slug: 'zyongrand', name: 'ZYON Grand', back: 'ZYON Grand', tieIn: 'ZYON Grand\'s Havelock Road riverfront towers with direct MRT access put it firmly in the "well-located" camp.' },
  { dir: 'promenadepeak', slug: 'promenadepeak', name: 'Promenade Peak', back: 'Promenade Peak', tieIn: 'Promenade Peak\'s Zion Road luxury high-rise with Havelock MRT steps away is exactly the central location buyers are gravitating to.' },
  { dir: 'rivergreen', slug: 'rivergreen', name: 'River Green', back: 'River Green', tieIn: 'River Green\'s River Valley address near Great World MRT offers the kind of central convenience that keeps demand steady.' },
  { dir: 'newportresidences', slug: 'newportresidences', name: 'Newport Residences', back: 'Newport Residences', tieIn: 'Newport Residences\' Anson Road CBD address with 41-storey towers is a scarcity play in a location with limited new supply.' },
  { dir: 'BelgraviaAce', slug: 'BelgraviaAce', name: 'Belgravia Ace', back: 'Belgravia Ace', tieIn: 'Belgravia Ace\'s freehold strata landed homes in D28 are a scarce product type — exactly what buyers favour when markets steady.' },
  { dir: 'thesen', slug: 'thesen', name: 'The Sen', back: 'The Sen', tieIn: 'The Sen\'s central location keeps it in the well-located bracket where demand is concentrating in 2026.' },
  { dir: 'luxushill10', slug: 'luxushill10', name: 'Luxus Hill 10', back: 'Luxus Hill 10', tieIn: 'Luxus Hill 10\'s 999-year landed homes in Seletar Hills are a scarce, well-located product — resilient in exactly the way PropNex describes.' },
];

// ── 1. HQ article ──
mkdirSync('articles', { recursive: true });
writeFileSync(`articles/${HQ_ARTICLE}`, body(null));
console.log(`✅ articles/${HQ_ARTICLE} (${(body(null).length/1024).toFixed(1)} KB)`);

// ── 2. Project articles ──
for (const p of PROJECTS) {
  mkdirSync(`${p.dir}_articles`, { recursive: true });
  const html = body(p);
  writeFileSync(`${p.dir}_articles/${ARTICLE}`, html);
  console.log(`✅ ${p.dir}_articles/${ARTICLE} (${(html.length/1024).toFixed(1)} KB)`);
}

console.log(`\nDone — HQ + ${PROJECTS.length} project versions generated.`);
