#!/usr/bin/env node
/**
 * Generate "Are HDB Resale & Private Property Markets Really Going Separate Ways?"
 * article for HQ + all project sites + standalone sites (thomson, loyang).
 *
 * Content sourced from: Straits Times commentary by Prof Sing Tien Foo (NUS),
 * "Talk of private and resale HDB markets decoupling could spark buyer frenzy",
 * published 12 August 2026. Data: HDB Resale Price Index 2026Q2 (202.8, -0.3% qoq,
 * 3rd consecutive quarterly decline) vs URA Private Property Price Index 2026Q2
 * (219.4, +0.5% qoq, 7th consecutive quarter of growth).
 *
 * Files generated:
 *   articles/article-hdb-private-decoupling-2026.html          (HQ)
 *   {project}_articles/article-hdb-private-decoupling-2026.html (dark projects)
 *   thomson-articles/  loyang-articles/  velabay-articles/  luxushill10-articles/
 *   thesen_articles/ (reuse dark) + thecontinuum/narraresidences custom
 */

import { writeFileSync, mkdirSync } from 'fs';

const ARTICLE = 'article-hdb-private-decoupling-2026.html';
const PUBLISHED = 'Published 13 August 2026';

/* ────────────────────────────────────────────────────────────
 * 1. THE CORE ARTICLE BODY (shared across all variants)
 *    placeholders: {NAME} {SCHOOL_BLURB} {DISTRICT_BLURB} {CTA_BODY} {CTA_TEXT}
 * ──────────────────────────────────────────────────────────── */
function tieInSection(p) {
  if (!p.tieIn) return '';
  return `
<h2>${p.name} &amp; the Two-Way Flow</h2>

<p>This is where the property angle gets interesting. ${p.tieIn}</p>

<div class="highlight">
  <strong>The takeaway for ${p.name} buyers:</strong>
  The HDB and private markets are not splitting apart — the same households keep moving between them. Understanding where your own journey sits on that path — and whether your next step is genuinely right for your family and finances — matters far more than any single quarter of index movement.
</div>
`;
}

function coreBody(p) {
  return `
<h1>Are HDB Resale &amp; Private Property Markets Really Going Separate Ways?</h1>
<p class="meta">${PUBLISHED} · By Jet Lee · Market Analysis</p>

<p>There's been growing talk that Singapore's resale HDB and private residential markets are starting to "decouple".</p>

<p>It's easy to see why. In the latest quarter, the HDB Resale Price Index <strong>fell 0.3%</strong> — a third consecutive quarterly decline. Over the same period, URA's private residential property price index <strong>rose 0.5%</strong>, extending a seven-quarter run of growth. And nearly a third of property sector veterans surveyed by the Institute of Real Estate and Urban Studies (IREUS) at NUS believe the two markets are structurally decoupling.</p>

<p>But a recent Straits Times commentary by <strong>Prof Sing Tien Foo (Provost's Chair Professor, Department of Real Estate, NUS Business School)</strong> makes an important point: <strong>different short-term price movements don't necessarily mean the two markets have stopped influencing each other</strong>.</p>

<div class="highlight">
  <strong>The key argument:</strong>
  Markets are truly decoupled only when prices in one no longer influence the other. That is not what the data shows. The resale HDB and private residential markets remain closely linked through <strong>overlapping buyer pools, household upgrading and downgrading, and the shared expectation that homes preserve wealth over time</strong>.
</div>

<h2>The Same Households Move Between Both Markets</h2>

<p>In reality, the two markets stay connected through the same Singapore households moving through different stages of their property journey — <strong>BTO → resale HDB → private property</strong>, and sometimes back to HDB when circumstances or priorities change.</p>

<ul>
  <li><strong>The HDB upgrader is the largest single source of demand for suburban condos.</strong> The money for the condo often comes from selling the flat.</li>
  <li><strong>Downgraders move the other way.</strong> Empty-nesters and retirees who sell private homes to buy HDB flats keep the two markets tethered from the opposite direction.</li>
  <li><strong>Right-sizing is a two-way street.</strong> Households move up when they grow, and move down when priorities change — the flow never stops.</li>
</ul>

<p>That continuous flow is the mechanism that keeps the two markets tied together. A permanent decoupling would require the flow of people between them to stop. <strong>It has not.</strong></p>

<h2>What the Latest Numbers Actually Show</h2>

<p>Let's put the divergence in context. The HDB Resale Price Index stood at <strong>202.8 in 2026Q2</strong>, down 0.3% on the quarter — three consecutive declines from the 2025Q3 peak, but <strong>flat year-on-year (-0.0%)</strong>. The URA Private Property Price Index sat at <strong>219.4</strong>, up 0.5% on the quarter and 2.9% on the year.</p>

<p>Look closer and "private" is not one market either:</p>

<ul>
  <li><strong>Landed (islandwide): +7.0%</strong> year-on-year</li>
  <li><strong>OCR (Outside Central Region): +3.9%</strong></li>
  <li><strong>RCR (Rest of Central Region): +0.6%</strong></li>
  <li><strong>CCR (Core Central Region): +0.5%</strong></li>
  <li><strong>HDB resale: -0.0%</strong></li>
</ul>

<div class="highlight">
  <strong>The surprising part:</strong>
  The distance between landed at +7.0% and central-region condos at +0.5% is far larger than the gap between central condos and HDB resale. If anything, an RCR or CCR condo owner has had more in common with an HDB owner recently than with a landed owner.
</div>

<h2>Why "Decoupling" Talk Can Be Dangerous</h2>

<p>The commentary's warning is simple: <strong>fear of being permanently priced out is one of the most reliable ways to get people to buy in a hurry.</strong> If enough upgraders rush to "beat the split," they push suburban condo prices up and HDB resale supply up at the same time — <strong>widening exactly the gap they were rushing to get ahead of.</strong></p>

<p>The honest version of the trade is far less dramatic than the headline: selling into a softer HDB market to buy into a condo market that has risen modestly — and in the most recent quarter, barely at all in two of three regions.</p>

<h2>What This Means for Buyers</h2>

<p><strong>1. Don't buy out of FOMO.</strong> A few tenths of a percent of index divergence is not a reason to rush a purchase that carries stamp duties, transaction costs and a larger mortgage.</p>

<p><strong>2. Upgrade for the right reasons.</strong> Space, location, schools, lifestyle — these are durable reasons to move. "Before the door closes forever" is not one the data supports.</p>

<p><strong>3. Your home is not an index.</strong> A national index tells you what the aggregate did, not what your flat or your target project did. The useful question is what comparable homes in your town have actually transacted at — and how your remaining lease compares.</p>

<p><strong>4. The two markets stay connected.</strong> Whatever happens in HDB resale flows into private property and back. Understanding the journey — BTO → resale → private, and sometimes back — is how sensible decisions get made.</p>

${tieInSection(p)}

<div class="cta">
  <p><strong>${p.ctaBody}</strong></p>
  <p>Let's talk — no pressure, just honest analysis of what fits your family and your budget.</p>
  <a href="https://wa.me/6587649315?text=Hi%20Jet%20Lee%2C%20I%20read%20your%20article%20on%20HDB%20%26%20private%20market%20decoupling">📱 WhatsApp Jet Lee</a>
</div>

<p class="source">Source: <a href="https://www.straitstimes.com/opinion/talk-of-private-and-resale-hdb-markets-decoupling-could-spark-buyer-frenzy" rel="nofollow noopener">The Straits Times — Talk of private and resale HDB markets decoupling could spark buyer frenzy</a> (Prof Sing Tien Foo, NUS Business School, 12 Aug 2026) · HDB Resale Price Index &amp; URA Property Price Index, 2026Q2. This article is a commentary on the ST piece and is for general information only.</p>
`;
}

/* ────────────────────────────────────────────────
 * 2. DARK TEMPLATE (jetleechannel.sg project sites)
 * ──────────────────────────────────────────────── */
function darkTemplate(p, opts = {}) {
  const canon = `https://jetleechannel.sg/${p.slug}/articles/${ARTICLE}`;
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="description" content="Are HDB resale and private property markets really decoupling? Prof Sing Tien Foo (NUS) on why short-term price divergence doesn't mean structural separation — and what it means for ${p.name} buyers.">
<link rel="canonical" href="${canon}">
<title>Are HDB Resale &amp; Private Property Markets Really Going Separate Ways? | ${p.name}</title>
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

<a href="https://jetleechannel.sg/${p.slug}/" class="back">← Back to ${p.back}</a>
${coreBody(p)}

<div class="footer">
  <p>Jet Lee @ 8764 9315 · CEA Reg No. R007613B · PropNex Realty</p>
  <p><a href="https://jetleechannel.sg">jetleechannel.sg</a></p>
</div>

</body>
</html>
`;
}

/* ────────────────────────────────────────────────
 * 3. HQ TEMPLATE (jetleechannel.sg/articles/)
 * ──────────────────────────────────────────────── */
function hqTemplate() {
  return `<!DOCTYPE html>
<html lang="en-SG">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Are HDB Resale &amp; Private Property Markets Really Going Separate Ways? | Jet Lee</title>
    <meta name="description" content="Singapore's HDB resale and private property markets are showing diverging price trends — but are they really decoupling? Prof Sing Tien Foo (NUS) on why overlapping buyer pools, upgrading and downgrading keep the two markets connected. By Jet Lee.">

    <script type="application/ld+json">
    {
        "@context": "https://schema.org",
        "@type": "NewsArticle",
        "headline": "Are HDB Resale & Private Property Markets Really Going Separate Ways?",
        "description": "HDB resale prices fell for a third straight quarter while private property kept rising. But a Straits Times commentary argues the two markets remain connected through overlapping buyer pools, upgrading and downgrading.",
        "author": { "@type": "Person", "name": "Jet Lee", "knowsAbout": "Singapore real estate" },
        "publisher": { "@type": "Organization", "name": "Jet Lee Channel" },
        "datePublished": "2026-08-13",
        "dateModified": "2026-08-13"
    }
    </script>

    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; line-height: 1.8; color: #333; }
        h1 { color: #1a1a2e; border-bottom: 3px solid #1A3A5C; padding-bottom: 10px; font-size: 1.8rem; }
        h2 { color: #16213e; margin-top: 35px; font-size: 1.3rem; }
        h3 { color: #16213e; margin-top: 25px; font-size: 1.1rem; }
        p { margin: 16px 0; }
        blockquote { border-left: 4px solid #1A3A5C; margin: 20px 0; padding: 10px 20px; background: #f0f4ff; border-radius: 4px; }
        blockquote strong { color: #1A3A5C; }
        .highlight { background: #f0f4ff; padding: 20px; border-left: 4px solid #1A3A5C; margin: 25px 0; border-radius: 4px; }
        .author-box { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 30px 0; border: 1px solid #e5e7eb; }
        .author-box strong { color: #1A3A5C; }
        .cta-box { background: #1A3A5C; color: white; padding: 25px; border-radius: 8px; text-align: center; margin: 30px 0; }
        .cta-box a { display: inline-block; margin-top: 12px; padding: 12px 28px; background: #c9a84c; color: #1A3A5C; text-decoration: none; font-weight: 600; border-radius: 50px; font-size: 0.9rem; }
        .cta-box a:hover { background: #e4c97e; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        table td, table th { padding: 10px 12px; border: 1px solid #ddd; text-align: left; font-size: 0.95rem; }
        table th { background: #f0f4ff; color: #16213e; }
        ul, ol { margin: 16px 0; padding-left: 24px; }
        li { margin: 8px 0; }
        .source { font-size: 0.85rem; color: #888; margin-top: 2em; border-top: 1px solid #eee; padding-top: 1em; }
        a { color: #1A3A5C; }
    </style>
</head>
<body>

<h1>Are HDB Resale &amp; Private Property Markets Really Going Separate Ways?</h1>

<p><strong>${PUBLISHED} · By Jet Lee</strong></p>

<p>There's been growing talk that Singapore's resale HDB and private residential markets are starting to "decouple".</p>

<p>It's easy to see why. In the latest quarter, the HDB Resale Price Index <strong>fell 0.3%</strong> — a third consecutive quarterly decline. Over the same period, URA's private residential property price index <strong>rose 0.5%</strong>, extending a seven-quarter run of growth. And nearly a third of property sector veterans surveyed by the Institute of Real Estate and Urban Studies (IREUS) at NUS believe the two markets are structurally decoupling.</p>

<p>But a recent Straits Times commentary by <strong>Prof Sing Tien Foo (Provost's Chair Professor, Department of Real Estate, NUS Business School)</strong> makes an important point: <strong>different short-term price movements don't necessarily mean the two markets have stopped influencing each other</strong>.</p>

<div class="highlight">
    <strong>The key argument:</strong>
    Markets are truly decoupled only when prices in one no longer influence the other. That is not what the data shows. The resale HDB and private residential markets remain closely linked through <strong>overlapping buyer pools, household upgrading and downgrading, and the shared expectation that homes preserve wealth over time</strong>.
</div>

<h2>The Same Households Move Between Both Markets</h2>

<p>In reality, the two markets stay connected through the same Singapore households moving through different stages of their property journey — <strong>BTO → resale HDB → private property</strong>, and sometimes back to HDB when circumstances or priorities change.</p>

<ul>
    <li><strong>The HDB upgrader is the largest single source of demand for suburban condos.</strong> The money for the condo often comes from selling the flat.</li>
    <li><strong>Downgraders move the other way.</strong> Empty-nesters and retirees who sell private homes to buy HDB flats keep the two markets tethered from the opposite direction.</li>
    <li><strong>Right-sizing is a two-way street.</strong> Households move up when they grow, and move down when priorities change — the flow never stops.</li>
</ul>

<p>That continuous flow is the mechanism that keeps the two markets tied together. A permanent decoupling would require the flow of people between them to stop. <strong>It has not.</strong></p>

<h2>What the Latest Numbers Actually Show</h2>

<p>Let's put the divergence in context. The HDB Resale Price Index stood at <strong>202.8 in 2026Q2</strong>, down 0.3% on the quarter — three consecutive declines from the 2025Q3 peak, but <strong>flat year-on-year (-0.0%)</strong>. The URA Private Property Price Index sat at <strong>219.4</strong>, up 0.5% on the quarter and 2.9% on the year.</p>

<p>Look closer and "private" is not one market either:</p>

<ul>
    <li><strong>Landed (islandwide): +7.0%</strong> year-on-year</li>
    <li><strong>OCR (Outside Central Region): +3.9%</strong></li>
    <li><strong>RCR (Rest of Central Region): +0.6%</strong></li>
    <li><strong>CCR (Core Central Region): +0.5%</strong></li>
    <li><strong>HDB resale: -0.0%</strong></li>
</ul>

<div class="highlight">
    <strong>The surprising part:</strong>
    The distance between landed at +7.0% and central-region condos at +0.5% is far larger than the gap between central condos and HDB resale. If anything, an RCR or CCR condo owner has had more in common with an HDB owner recently than with a landed owner.
</div>

<h2>Why "Decoupling" Talk Can Be Dangerous</h2>

<p>The commentary's warning is simple: <strong>fear of being permanently priced out is one of the most reliable ways to get people to buy in a hurry.</strong> If enough upgraders rush to "beat the split," they push suburban condo prices up and HDB resale supply up at the same time — <strong>widening exactly the gap they were rushing to get ahead of.</strong></p>

<p>The honest version of the trade is far less dramatic than the headline: selling into a softer HDB market to buy into a condo market that has risen modestly — and in the most recent quarter, barely at all in two of three regions.</p>

<h2>What This Means for Buyers</h2>

<p><strong>1. Don't buy out of FOMO.</strong> A few tenths of a percent of index divergence is not a reason to rush a purchase that carries stamp duties, transaction costs and a larger mortgage.</p>

<p><strong>2. Upgrade for the right reasons.</strong> Space, location, schools, lifestyle — these are durable reasons to move. "Before the door closes forever" is not one the data supports.</p>

<p><strong>3. Your home is not an index.</strong> A national index tells you what the aggregate did, not what your flat or your target project did. The useful question is what comparable homes in your town have actually transacted at — and how your remaining lease compares.</p>

<p><strong>4. The two markets stay connected.</strong> Whatever happens in HDB resale flows into private property and back. Understanding the journey — BTO → resale → private, and sometimes back — is how sensible decisions get made.</p>

<div class="cta-box">
    <p><strong>Thinking about upgrading — or right-sizing — in this market?</strong></p>
    <p>Let's talk through your numbers. Whether you're an HDB owner considering a condo, or a private homeowner looking at your options, I'll give you an honest read on whether it makes sense — not a sales pitch.</p>
    <a href="https://wa.me/6587649315?text=Hi%20Jet%20Lee%2C%20I%20read%20your%20article%20on%20HDB%20%26%20private%20market%20decoupling">WhatsApp Jet Lee →</a>
</div>

<p class="source">Source: <a href="https://www.straitstimes.com/opinion/talk-of-private-and-resale-hdb-markets-decoupling-could-spark-buyer-frenzy" rel="nofollow noopener">The Straits Times — Talk of private and resale HDB markets decoupling could spark buyer frenzy</a> (Prof Sing Tien Foo, NUS Business School, 12 Aug 2026) · HDB Resale Price Index &amp; URA Property Price Index, 2026Q2. This article is a commentary on the ST piece and is for general information only.</p>

</body>
</html>
`;
}

/* ────────────────────────────────────────────────
 * 4. PROJECT LIST
 * ──────────────────────────────────────────────── */
const DARK_PROJECTS = [
  { slug: 'elta', name: 'ELTA', back: 'ELTA', ctaBody: 'Considering ELTA — or wondering whether the time is right to upgrade from HDB to a Clementi condo?', tieIn: 'ELTA sits in the Outside Central Region (OCR) — the private segment that rose <strong>+3.9% year-on-year</strong>, the strongest condo growth outside landed. For HDB upgraders from Clementi, Jurong and the West, moving into a new OCR launch has historically been the most natural first step across the property journey.' },
  { slug: 'dunearnhouse', name: 'Dunearn House', back: 'Dunearn House', ctaBody: 'Considering Dunearn House — or wondering whether the time is right to upgrade to a Bukit Timah home?', tieIn: 'Dunearn House sits at the fringe of the Core Central Region — the segment that rose <strong>+1.8% in the latest quarter</strong>, the strongest of any condo region. For upgraders, Bukit Timah has long been a stable, enduring step on the property journey.' },
  { slug: 'amberwood', name: 'Amberwood', back: 'Amberwood', ctaBody: 'Considering Amberwood — or wondering whether the time is right to upgrade to a freehold District 10 home?', tieIn: 'Amberwood is a freehold District 10 address in the Core Central Region. In a market where upgraders worry about being priced out, freehold CCR land is scarce and holds its value through every phase of the property cycle — a durable step on the journey.' },
  { slug: 'arcady', name: 'The Arcady at Boon Keng', back: 'The Arcady', ctaBody: 'Considering The Arcady — or wondering whether the time is right to upgrade from HDB to a freehold home?', tieIn: 'The Arcady is a freehold development in the Rest of Central Region, minutes from the Boon Keng heartland where many upgraders currently live. For households moving from HDB to their first private home, that proximity makes the transition a natural next step — not a leap into the unknown.' },
  { slug: 'hudsonplace', name: 'Hudson Place', back: 'Hudson Place', ctaBody: 'Considering Hudson Place — or wondering whether the time is right to upgrade to a Pasir Panjang condo?', tieIn: 'Hudson Place sits in the Rest of Central Region near the Pasir Panjang heartland. With the HDB resale market flat and OCR/RCR condo growth modest, the upgrader story here is about lifestyle and location — not chasing a runaway market.' },
  { slug: 'hougangcentral', name: 'Hougang Central', back: 'Hougang Central', ctaBody: 'Considering Hougang Central — or wondering whether the time is right to upgrade from HDB to a new condo?', tieIn: 'Hougang Central is one of the most direct upgrader stories in the market — a new condo built in the middle of a mature HDB town. Upgraders from Hougang and Serangoon can move up without moving away, which is exactly the kind of two-way flow that keeps the HDB and private markets connected.' },
  { slug: 'lentor-gardens', name: 'Lentor Gardens', back: 'Lentor Gardens', ctaBody: 'Considering Lentor Gardens — or wondering whether the time is right to upgrade to a Lentor Hills home?', tieIn: 'Lentor Gardens is part of the new Lentor Hills estate in the Outside Central Region. OCR condos rose <strong>+3.9% year-on-year</strong> — the strongest condo segment — driven in large part by HDB upgraders from Ang Mo Kio, Yio Chu Kang and Bishan moving into the new estate.' },
  { slug: 'lucernegrand', name: 'Lucerne Grand', back: 'Lucerne Grand', ctaBody: 'Considering Lucerne Grand — or wondering whether the time is right to upgrade to a Jurong Lake District home?', tieIn: 'Lucerne Grand is part of the Jurong Lake District transformation — a government-planned regional centre where the upgrader pipeline from Jurong\'s HDB towns is enormous. That is the two-way flow between markets in action: HDB households upgrading in place as the district transforms.' },
  { slug: 'OneMarinaGardens', name: 'One Marina Gardens', back: 'One Marina Gardens', ctaBody: 'Considering One Marina Gardens — or wondering whether the time is right to buy into the Marina Bay growth story?', tieIn: 'One Marina Gardens is a Core Central Region launch at the heart of Marina Bay. CCR condos rose <strong>+1.8% in the latest quarter</strong>, the strongest quarterly move of any region — a reminder that the city core continues to attract wealth from upgraders and investors alike.' },
  { slug: 'unionsquare', name: 'Union Square', back: 'Union Square', ctaBody: 'Considering Union Square — or wondering whether the time is right to upgrade to a city-fringe home?', tieIn: 'Union Square sits in District 2, at the seam between the Core Central and Rest of Central regions. For upgraders, city-fringe locations offer the balance the data supports: central stability without chasing the most expensive segments of the market.' },
  { slug: 'generations-tannery', name: 'Generations @ Tannery', back: 'Generations @ Tannery', ctaBody: 'Considering Generations @ Tannery — or wondering whether the time is right to upgrade to a freehold home?', tieIn: 'Generations @ Tannery is a freehold Rest of Central Region development in the mature Geylang-Kallang area. Freehold tenure is one of the few features that behaves differently from the index — it holds scarcity value through every phase of the property journey.' },
  { slug: 'TheSierra', name: 'The Serra Residences', back: 'The Serra Residences', ctaBody: 'Considering The Serra Residences — or wondering whether the time is right to upgrade to a Novena home?', tieIn: 'The Serra Residences is a freehold development in District 11, at the junction of the Core Central and Rest of Central regions. Novena is a classic upgrader destination — close to the city, yet grounded in a mature residential neighbourhood.' },
  { slug: 'TheOrie', name: 'The Orie', back: 'The Orie', ctaBody: 'Considering The Orie — or wondering whether the time is right to upgrade to a Toa Payoh home?', tieIn: 'The Orie is built in the heart of Toa Payoh — one of Singapore\'s oldest HDB towns and the very definition of the BTO → resale → private journey. Upgraders who grew up in Toa Payoh can now move up without leaving the community they know.' },
  { slug: 'SophiaMeadow', name: 'Sophia Meadow', back: 'Sophia Meadow', ctaBody: 'Considering Sophia Meadow — or wondering whether the time is right to upgrade to a District 9 home?', tieIn: 'Sophia Meadow is a District 9 freehold address in the Core Central Region. For upgraders and investors, D9 land is among the most limited in Singapore — scarcity that underpins value regardless of what the national indices do in any single quarter.' },
  { slug: 'bagnallhous', name: 'Bagnall Haus', back: 'Bagnall Haus', ctaBody: 'Considering Bagnall Haus — or wondering whether the time is right to upgrade to a freehold East Coast home?', tieIn: 'Bagnall Haus is a freehold development in District 16, on the edge of the Outside Central Region. The East Coast has one of the deepest pools of HDB upgraders in Singapore — a steady, structural source of demand that keeps the private market anchored.' },
  { slug: 'zyongrand', name: 'ZYON Grand', back: 'ZYON Grand', ctaBody: 'Considering ZYON Grand — or wondering whether the time is right to upgrade to a river-valley home?', tieIn: 'ZYON Grand is a District 3 mega-development along the river valley, in the seam between CCR and RCR. With Havelock MRT at its doorstep, it is positioned for upgraders who want city access without paying a pure CCR premium.' },
  { slug: 'promenadepeak', name: 'Promenade Peak', back: 'Promenade Peak', ctaBody: 'Considering Promenade Peak — or wondering whether the time is right to upgrade to a city home?', tieIn: 'Promenade Peak is a Core Central Region launch on Zion Road near Havelock MRT. In the latest quarter, CCR was the strongest condo region at <strong>+1.8%</strong> — a reminder that central locations continue to command durable demand.' },
  { slug: 'rivergreen', name: 'River Green', back: 'River Green', ctaBody: 'Considering River Green — or wondering whether the time is right to upgrade to a Great World home?', tieIn: 'River Green sits in the Core Central Region along River Valley Green, 17m from Great World MRT. CCR stability — <strong>+1.8% in the latest quarter</strong> — matters for upgraders weighing whether central living is still within reach.' },
  { slug: 'newportresidences', name: 'Newport Residences', back: 'Newport Residences', ctaBody: 'Considering Newport Residences — or wondering whether the time is right to upgrade to a Tanjong Pagar home?', tieIn: 'Newport Residences is a freehold mixed development in the Core Central Region at 80 Anson Road. For professionals upgrading from HDB, Tanjong Pagar offers city living with a heritage heartland next door — both sides of the property journey in one location.' },
  { slug: 'BelgraviaAce', name: 'Belgravia Ace', back: 'Belgravia Ace', ctaBody: 'Considering Belgravia Ace — or wondering whether the time is right to upgrade to a landed home?', tieIn: 'Belgravia Ace is a freehold landed development in District 28 — and landed was the standout segment of the market at <strong>+7.0% year-on-year</strong>. For HDB upgraders making the jump to landed, the flow between markets has never been more visible.' },
  { slug: 'upperhouse', name: 'UPPERHOUSE at Orchard Boulevard', back: 'UPPERHOUSE', ctaBody: 'Considering UPPERHOUSE at Orchard Boulevard — or wondering whether the time is right to upgrade to Orchard Road?', tieIn: 'UPPERHOUSE sits on Orchard Boulevard in the Core Central Region — the segment that rose <strong>+1.8% in the latest quarter</strong>. It is the top of the property journey for many Singapore households, and the data shows central demand remains durable.' },
  { slug: 'thesen', name: 'The Sen @ Upper Bukit Timah', back: 'The Sen', ctaBody: 'Considering The Sen @ Upper Bukit Timah — or wondering whether the time is right to upgrade to a Bukit Timah home?', tieIn: 'The Sen sits in Upper Bukit Timah, on the edge of the Rest of Central Region. Bukit Timah is a perennial upgrader destination — mature neighbourhoods, established schools, and a steady pipeline of HDB households moving up in the same area.' },
];

// Generate dark project articles
for (const p of DARK_PROJECTS) {
  mkdirSync(`${p.slug}_articles`, { recursive: true });
  const html = darkTemplate(p);
  writeFileSync(`${p.slug}_articles/${ARTICLE}`, html);
  console.log(`✅ ${p.slug}_articles/${ARTICLE} (${(html.length/1024).toFixed(1)} KB)`);
}

// HQ
mkdirSync('articles', { recursive: true });
writeFileSync(`articles/${ARTICLE}`, hqTemplate());
console.log(`✅ articles/${ARTICLE} (${(hqTemplate().length/1024).toFixed(1)} KB)`);

console.log('Done — all article pages generated.');
