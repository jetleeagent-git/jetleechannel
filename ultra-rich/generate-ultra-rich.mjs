#!/usr/bin/env node
// Generate "How the Ultra-Rich Buy Property" article for 4 sites:
// 1. jetleechannel.sg/articles/ (HQ, dark green theme)
// 2. thomson-reserve-direct-developer.com/articles/ (light serif + site-nav + GA)
// 3. jetleechannel.sg/upperhouse/articles/ (dark green theme)
// 4. jetleechannel.sg/amberwood/articles/ (light blue theme + wa-float)
import fs from 'fs';
import path from 'path';

const OUT = path.join(import.meta.dirname, '..');
const date = '21 August 2026';
const iso = '2026-08-21';

// ============ SHARED ARTICLE BODY (HTML fragments) ============
const bodySections = (site) => {
  const tieIn = site.tieIn;
  return `
<p>Some imagine that for those with very deep pockets, purchasing property looks like this: buyers fall in love with something they see, quickly — and coolly — place a deposit on it. Voila, the deal is done.</p>

<p>That, however, couldn't be further from the truth. In reality, how ultra-high-net-worth (UHNW) individuals buy property looks less like Hollywood and more like <strong>a very detailed Excel sheet comparing potential homes</strong>. From there, decision-making is driven by careful considerations such as structuring for tax efficiency, wealth transfer and risk management — with input from advisers and family members.</p>

<p>Privacy, security, off-market mansions and the refusal to overpay are just some of the hallmarks in the rarefied world of UHNW real estate deals, as brokers shared with The Business Times this week.</p>

<div class="highlight">
  <strong>The headline numbers:</strong>
  The Asia-Pacific is home to <strong>31% of UHNW individuals</strong> worldwide (net worth of US$30M+) — and that share is expected to rise 24.3% over the next five years. Singapore, the Philippines, Australia, Vietnam and Indonesia all rank in the global top 10 for the fastest-growing UHNW populations. UHNW property searches typically start from <strong>US$10 million</strong> and can go up to <strong>£270 million (S$465.3 million)</strong>.
</div>

<h2>Discretion and Off-Market Mansions</h2>

<p>Typically, intermediaries — whether the buyer's family office, banker or lawyer — approach a real estate broker, who first needs to understand the motivations behind the home search. Non-disclosure agreements are signed at the start, and the process is kept as discreet as possible.</p>

<p>"Usually, people are aware that an individual was looking for a home only after the transaction has taken place," says Otto Twist, South-east Asia director for international residential sales at Savills Singapore.</p>

<ul>
  <li><strong>Off-market sourcing.</strong> Beyond open listings, brokers approach owners of very unique properties directly — especially when buyers have very specific requirements about a street or resort.</li>
  <li><strong>Private introductions.</strong> Extremely special overseas properties can be privately introduced to a select group of 20-30 potential buyers — sometimes gathered on a yacht in Singapore because coordinating 20 wealthy buyers to fly to Phuket at once is near-impossible.</li>
  <li><strong>The "rich prince" myth.</strong> List Sotheby's International Realty's Felix Desjardins has fought the myth that "a Dubai prince or rich Chinese industrialist is going to come and fall in love with a property". That buyer "does not exist" — UHNW buyers are excellent negotiators, and he has never seen one overpay.</li>
</ul>

<p>One case in point: a deal was nearly sealed, but the buyer refused to pay an extra US$150,000 or so to keep the furniture he wanted. "He said: 'No, I'm not paying a dime more.'"</p>

<h2>What They're After</h2>

<p>The ultra-rich typically already own three or four properties around the world, spending a few months in each throughout the year. Within the two broad categories they buy — condominiums and villas — several patterns stand out:</p>

<ul>
  <li><strong>Branded residences.</strong> Some prefer ultra-luxury branded residences — the likes of Aman, Mandarin Oriental and Four Seasons — offering homes and privacy with all the benefits of a hotel. Others acquire residences from non-traditional names like Porsche and Bvlgari.</li>
  <li><strong>Exclusive landed enclaves in Singapore.</strong> "In more urban locations like Singapore, they often look for exclusive landed enclaves, especially GCBs, and low-density developments with excellent security, concierges and private lifts and entrances in prime but quiet neighbourhoods," says Nicholas Keong, head of residential and private office at Knight Frank Singapore. His team has brokered residences from a S$5 million holiday home in New Zealand to a GCB here for more than S$40 million.</li>
  <li><strong>Privacy engineered into the building.</strong> In super-prime condominiums, security can include biometric facial recognition, private basement car parks reachable only by the owner, exclusive direct lift access, and even buyers purchasing entire floors so only their family is on that level.</li>
  <li><strong>Architecture that ages well.</strong> Homes designed by renowned architects, perched on elevated positions hidden from public view and surrounded by dense landscaping, with good internal layouts offering separate staff quarters and entrance areas.</li>
</ul>

<h2>The Deal-Breakers</h2>

<p>Despite the objective factors that determine whether a property is right, purchase decisions still involve psycho-emotional factors. According to Keong, <strong>the most common deal-breaker is "fengshui"</strong> — followed closely by "the vibes buyers get when they enter a property".</p>

<ul>
  <li><strong>Move-in condition matters.</strong> Mansions past their prime, with owners wanting to exit without doing proper home improvements, are a red flag — the ultra-rich want move-in condition, not the risks and delays of a renovation project.</li>
  <li><strong>Home automation is a "massive headache".</strong> "People with money already went through home automation 20 years ago," says Desjardins. When the technology became obsolete, they were stuck with systems that no longer function. "People want something relatively analogue that works."</li>
  <li><strong>Security without a fortress look.</strong> Rather than armed personnel, buyers want private chauffeurs with defensive training — indistinguishable, driving a Toyota rather than a Range Rover.</li>
</ul>

${tieIn}

<h2>My Take — 18 Years in the Market</h2>
<div class="highlight">
  <strong>What ordinary buyers can learn from the ultra-rich:</strong>
  The UHNW playbook isn't about flash — it's about <strong>discipline</strong>. They compare relentlessly (the Excel sheet), never overpay, prioritise privacy and security, and treat property as long-term wealth preservation rather than impulse. The same discipline applies whether you're buying a S$1.5M condo or a S$40M GCB: do the comparison, understand the exit, don't let emotion set the price. And interestingly, the things that matter most to them — quiet, well-located enclaves, low density, good architecture, sensible security — are exactly the features that hold value best in Singapore's market.
</div>

<p>If you're weighing a new launch, a resale, or even a landed home, the ultra-rich buying patterns point to a simple truth: <strong>scarcity, privacy and location are what preserve value over time</strong>.</p>`;
};

// ============ SITE-SPECIFIC WRAPPERS ============

// ---- 1. HQ (jetleechannel.sg) - dark green template ----
const hqArticle = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="description" content="Brokers reveal how the ultra-rich really buy property — off-market mansions, NDAs, S$40M GCBs and the discipline behind every deal. Lessons every Singapore buyer can use.">
<link rel="canonical" href="https://jetleechannel.sg/articles/article-ultra-rich-buy-property.html">
<title>How the Ultra-Rich Buy Property: Lessons From S$40M GCB Deals | Jet Lee Channel</title>
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

<a href="https://jetleechannel.sg/" class="back">← Back to Home</a>
<h1>How the Ultra-Rich Buy Property: Lessons From S$40M GCB Deals</h1>
<p class="meta">Published ${date} · By Jet Lee · Market Analysis · Source: The Business Times</p>

${bodySections({
  tieIn: `<h2>What This Means for Singapore Buyers</h2>
<p>Singapore's position in the UHNW story is unusual. We're not just a market where the wealthy buy — we're one of the fastest-growing sources of UHNW individuals in the world, and the property market here reflects that at every level: from S$3,000+ psf new launches to GCBs transacting above S$40 million.</p>
<p>For local buyers, the practical read is this: <strong>the same scarcity factors the ultra-rich chase — landed enclaves, low density, prime quiet locations, good architecture — are what hold value best across the whole market</strong>. Whether you're buying a new launch condo or a landed home, the principles are identical: compare relentlessly, understand what you're paying for, and never let emotion set the price.</p>
<p>Looking at Singapore specifically, the segments drawing the most UHNW attention right now are exclusive landed enclaves (D10, D11, D28), super-prime freehold condos, and well-designed low-density developments. That's where demand concentration, and value preservation, are strongest.</p>`,
})}

<div class="cta">
  <p><strong>Looking to buy — whether a condo, a landed home, or your first property?</strong></p>
  <p>No pressure — just honest analysis of what fits your goals and budget.</p>
  <a href="https://wa.me/6587649315?text=Hi%20Jet%20Lee%2C%20I%20read%20your%20article%20on%20how%20the%20ultra-rich%20buy%20property">📱 WhatsApp Jet Lee</a>
</div>

<div class="thomson-promo" style="margin-top:2rem;background:#14281e;border:1px solid rgba(201,168,76,.35);border-left:4px solid #c9a84c;border-radius:8px;padding:1.5rem 1.8rem;">
  <p style="margin:0 0 .4rem;color:#e4c97e;font-size:.78rem;letter-spacing:.14em;text-transform:uppercase;font-weight:600;">🏗️ New Launch · District 20 · Upper Thomson</p>
  <p style="margin:0;color:#e8eae6;font-size:1.02rem;line-height:1.7;"><strong>Thinking about buying a new launch in 2026?</strong> Thomson Reserve — 1,268 units at Bright Hill Drive, Upper Thomson — is one of the most anticipated launches of the year, jointly developed by UOL Group, CapitaLand and SingLand.</p>
  <p style="margin:.8rem 0 0;color:rgba(232,234,230,.75);font-size:.9rem;">Get the <strong>direct developer price</strong> and first access to the preview before public launch.</p>
  <a href="https://thomson-reserve-direct-developer.com/" target="_blank" rel="noopener" style="display:inline-block;margin-top:1rem;padding:.7rem 2rem;background:#c9a84c;color:#0d1a12;text-decoration:none;font-size:.78rem;letter-spacing:.12em;text-transform:uppercase;font-weight:600;border-radius:4px;">👉 Visit Thomson Reserve Official Site</a>
</div>

<a href="https://jetleechannel.sg/articles/" class="back" style="text-align:center;display:block;">← Back to all articles</a>

<p class="source">Source: <a href="https://www.businesstimes.com.sg/lifestyle/style-society/how-ultra-rich-buy-property" rel="nofollow noopener">The Business Times — How the ultra-rich buy property</a> (brokers from Knight Frank, Savills and List Sotheby's International Realty, Aug 2026). This article is a commentary on the BT piece and is for general information only.</p>

<div style="margin-top:1.2rem;padding-top:1rem;border-top:1px solid rgba(255,255,255,.08);text-align:center;">
  <p style="margin:0;color:rgba(232,234,230,.45);font-size:.82rem;">🏗️ <a href="https://thomson-reserve-direct-developer.com/" target="_blank" rel="noopener" style="color:#c9a84c;text-decoration:none;font-weight:600;">Thomson Reserve</a> — New Launch D20 · Preview Oct 2026 · Direct Developer Price</p>
</div>

<div class="footer">
  <p>Jet Lee @ 8764 9315 · CEA Reg No. R007613B · PropNex Realty</p>
  <p><a href="https://jetleechannel.sg">jetleechannel.sg</a></p>
</div>

</body>
</html>`;

// ---- 2. Thomson Reserve - light serif + site-nav + GA ----
const thomsonArticle = `<!DOCTYPE html>
<html lang="en">
<head>
<meta name="msvalidate.01" content="423EB545A141D5069BA3ECA8D39B2AC8" />
<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-S46Y1ZCYJH"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-S46Y1ZCYJH');
</script>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>How the Ultra-Rich Buy Property: Lessons From S$40M GCB Deals | Thomson Reserve</title>
<meta name="description" content="Brokers reveal how the ultra-rich really buy property — off-market mansions, NDAs, S$40M GCBs and the discipline behind every deal. What it means for new launch buyers like Thomson Reserve.">
<link rel="canonical" href="https://thomson-reserve-direct-developer.com/articles/article-ultra-rich-buy-property.html">
<meta property="og:title" content="How the Ultra-Rich Buy Property: Lessons From S$40M GCB Deals">
<meta property="og:description" content="Off-market mansions, NDAs, S$40M GCBs — brokers share how the ultra-rich really buy property, and what every Singapore buyer can learn from the playbook.">
<meta property="og:type" content="article">
<meta property="og:url" content="https://thomson-reserve-direct-developer.com/articles/article-ultra-rich-buy-property.html">
<style>
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
</style>
</head>
<body>

<nav class="site-nav">
  <a class="site-nav-logo" href="https://thomson-reserve-direct-developer.com/">Thomson <span>Reserve</span></a>
  <ul class="site-nav-links">
    <li><a href="https://thomson-reserve-direct-developer.com/#details">Overview</a></li>
    <li><a href="https://thomson-reserve-direct-developer.com/#floor-plans">Floorplans</a></li>
    <li><a href="https://thomson-reserve-direct-developer.com/#site-plan">Location</a></li>
    <li><a href="https://thomson-reserve-direct-developer.com/#faq">FAQ</a></li>
    <li><a href="https://thomson-reserve-direct-developer.com/mortgage-calculator.html">Mortgage Calculator</a></li>
    <li><a class="active" href="https://thomson-reserve-direct-developer.com/articles/">Articles</a></li>
  </ul>
  <a class="site-nav-cta desktop-only" href="https://thomson-reserve-direct-developer.com/#contact">Register Interest</a>
  <button class="site-nav-burger" id="siteNavBurger" aria-label="Toggle menu"><span></span><span></span><span></span></button>
</nav>
<div class="site-nav-mobile" id="siteNavMobile">
  <a href="https://thomson-reserve-direct-developer.com/#details">Overview</a>
  <a href="https://thomson-reserve-direct-developer.com/#floor-plans">Floorplans</a>
  <a href="https://thomson-reserve-direct-developer.com/#site-plan">Location</a>
  <a href="https://thomson-reserve-direct-developer.com/#faq">FAQ</a>
  <a href="https://thomson-reserve-direct-developer.com/mortgage-calculator.html">Mortgage Calculator</a>
  <a href="https://thomson-reserve-direct-developer.com/articles/">Articles</a>
  <a href="https://thomson-reserve-direct-developer.com/#contact">Register Interest</a>
</div>
<script>
document.getElementById('siteNavBurger').addEventListener('click',function(){document.getElementById('siteNavMobile').classList.toggle('open');});
</script>

<a class="back" href="https://thomson-reserve-direct-developer.com/articles/">← Back to all articles</a>

<h1>How the Ultra-Rich Buy Property: Lessons From S$40M GCB Deals</h1>
<p class="meta">${date} · By Jet Lee · Market Analysis · Source: The Business Times</p>

${bodySections({
  tieIn: `<h2>What This Means for New Launch Buyers</h2>
<p>For most of us, a S$465 million search budget is not the reality — but the <strong>buying discipline</strong> behind it absolutely is. The ultra-rich compare relentlessly, they understand exactly what they're paying for, and they refuse to overpay. The same approach should apply to a new launch purchase.</p>
<p>Some of the features UHNW buyers insist on in super-prime towers — <strong>excellent security, private lift access, low density per floor, well-designed layouts, and prime but quiet neighbourhoods</strong> — are the very features that hold resale value best in any market. When you're evaluating a new launch like Thomson Reserve in Upper Thomson, those are the boxes worth checking: connectivity, school belts, surrounding greenery, and the quality of the development itself.</p>
<p>And on the fengshui point — the #1 deal-breaker among the ultra-rich — location and environment matter more than most buyers realise. A home that sits well in its surroundings, with good light, air and flow, is the same home that will always have buyers.</p>`,
})}

<div class="cta">
  <p><strong>Considering Thomson Reserve — or any new launch in 2026?</strong></p>
  <p>Let's talk through the location, the pricing and your family's options — no pressure, just honest analysis.</p>
  <a href="https://wa.me/6587649315?text=Hi%20Jet%20Lee%2C%20I%20read%20your%20article%20on%20how%20the%20ultra-rich%20buy%20property%20(Thomson%20Reserve)">📱 WhatsApp Jet Lee</a>
</div>

<p class="source">Source: <a href="https://www.businesstimes.com.sg/lifestyle/style-society/how-ultra-rich-buy-property" rel="nofollow noopener">The Business Times — How the ultra-rich buy property</a> (brokers from Knight Frank, Savills and List Sotheby's International Realty, Aug 2026). This article is a commentary on the BT piece and is for general information only.</p>

</body>
</html>`;

// ---- 3. UPPERHOUSE - dark green template ----
const upperhouseArticle = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="description" content="Brokers reveal how the ultra-rich really buy property — off-market mansions, NDAs, S$40M GCBs and the discipline behind every deal. What it means for buyers of UPPERHOUSE at Orchard Boulevard.">
<link rel="canonical" href="https://jetleechannel.sg/upperhouse/articles/article-ultra-rich-buy-property.html">
<title>How the Ultra-Rich Buy Property: Lessons From S$40M GCB Deals | UPPERHOUSE at Orchard Boulevard</title>
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

<a href="https://jetleechannel.sg/upperhouse/" class="back">← Back to UPPERHOUSE</a>

<h1>How the Ultra-Rich Buy Property: Lessons From S$40M GCB Deals</h1>
<p class="meta">Published ${date} · By Jet Lee · Market Analysis · Source: The Business Times</p>

${bodySections({
  tieIn: `<h2>What This Means for Orchard Road Buyers</h2>
<p>Orchard Boulevard has always been one of Singapore's most coveted addresses — and the UHNW buying patterns explain exactly why. The ultra-rich want <strong>prime but quiet neighbourhoods, low density, excellent security, private lifts and entrances, and architecture that ages well</strong>. That combination is rare in a city centre, and it's precisely what defines the most sought-after freehold addresses in the Orchard/Grange Road belt.</p>
<p>The fengshui point is worth dwelling on too — it's the #1 deal-breaker among UHNW buyers, and it's a proxy for something practical: <strong>a home that sits well in its environment, with good light, air and flow, is a home that will always have buyers</strong>. In a market where land is scarce and addresses are permanent, those qualities compound over decades.</p>
<p>Whether you're buying a freehold condo or a landed home, the same checklist applies: compare relentlessly, understand exactly what you're paying for, and never let emotion set the price.</p>`,
})}

<div class="cta">
  <p><strong>Considering UPPERHOUSE at Orchard Boulevard — or wondering whether the time is right to upgrade to Orchard Road?</strong></p>
  <p>Let's talk — no pressure, just honest analysis of what fits your family and your budget.</p>
  <a href="https://wa.me/6587649315?text=Hi%20Jet%20Lee%2C%20I%20read%20your%20article%20on%20how%20the%20ultra-rich%20buy%20property%20(UPPERHOUSE)">📱 WhatsApp Jet Lee</a>
</div>

<p class="source">Source: <a href="https://www.businesstimes.com.sg/lifestyle/style-society/how-ultra-rich-buy-property" rel="nofollow noopener">The Business Times — How the ultra-rich buy property</a> (brokers from Knight Frank, Savills and List Sotheby's International Realty, Aug 2026). This article is a commentary on the BT piece and is for general information only.</p>


<div class="footer">
  <p>Jet Lee @ 8764 9315 · CEA Reg No. R007613B · PropNex Realty</p>
  <p><a href="https://jetleechannel.sg">jetleechannel.sg</a></p>
</div>

<div class="thomson-promo" style="margin-top:2rem;background:#14281e;border:1px solid rgba(201,168,76,.35);border-left:4px solid #c9a84c;border-radius:8px;padding:1.5rem 1.8rem;">
  <p style="margin:0 0 .4rem;color:#e4c97e;font-size:.78rem;letter-spacing:.14em;text-transform:uppercase;font-weight:600;">🏗️ New Launch · District 20 · Upper Thomson</p>
  <p style="margin:0;color:#e8eae6;font-size:1.02rem;line-height:1.7;"><strong>Thinking about buying a new launch in 2026?</strong> Thomson Reserve — 1,268 units at Bright Hill Drive, Upper Thomson — is one of the most anticipated launches of the year, jointly developed by UOL Group, CapitaLand and SingLand.</p>
  <p style="margin:.8rem 0 0;color:rgba(232,234,230,.75);font-size:.9rem;">Get the <strong>direct developer price</strong> and first access to the preview before public launch.</p>
  <a href="https://thomson-reserve-direct-developer.com/" target="_blank" rel="noopener" style="display:inline-block;margin-top:1rem;padding:.7rem 2rem;background:#c9a84c;color:#0d1a12;text-decoration:none;font-size:.78rem;letter-spacing:.12em;text-transform:uppercase;font-weight:600;border-radius:4px;">👉 Visit Thomson Reserve Official Site</a>
</div>
<div style="margin-top:1.2rem;padding-top:1rem;border-top:1px solid rgba(255,255,255,.08);text-align:center;">
  <p style="margin:0;color:rgba(232,234,230,.45);font-size:.82rem;">🏗️ <a href="https://thomson-reserve-direct-developer.com/" target="_blank" rel="noopener" style="color:#c9a84c;text-decoration:none;font-weight:600;">Thomson Reserve</a> — New Launch D20 · Preview Oct 2026 · Direct Developer Price</p>
</div>
</body>
</html>`;

// ---- 4. Amberwood - light theme + wa-float ----
const amberwoodArticle = `<!DOCTYPE html>
<html lang="en-SG">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>How the Ultra-Rich Buy Property: Privacy, GCB Enclaves &amp; the S$40M Playbook | Jet Lee</title>
    <meta name="description" content="Off-market mansions, NDAs, S$40M GCBs — brokers reveal how the ultra-rich really buy property. Why exclusive landed enclaves like D10 and low-density living hold value best.">
    
    <script type="application/ld+json">
    {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": "How the Ultra-Rich Buy Property: Privacy, GCB Enclaves & the S$40M Playbook",
        "description": "Brokers share how the ultra-rich really buy property — off-market deals, NDAs, GCB enclaves and the discipline behind every purchase. What it means for Amberwood at Holland buyers.",
        "author": { "@type": "Person", "name": "Jet Lee", "knowsAbout": "Singapore real estate" },
        "publisher": { "@type": "Organization", "name": "Jet Lee Channel" },
        "datePublished": "${iso}",
        "dateModified": "${iso}"
    }
    </script>
    
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; line-height: 1.8; color: #333; }
        h1 { color: #1a1a2e; border-bottom: 3px solid #1A3A5C; padding-bottom: 10px; font-size: 1.8rem; }
        h2 { color: #16213e; margin-top: 35px; font-size: 1.3rem; }
        h3 { color: #16213e; margin-top: 25px; font-size: 1.1rem; }
        p { margin: 16px 0; }
        .highlight { background: #f0f4ff; padding: 20px; border-left: 4px solid #1A3A5C; margin: 25px 0; border-radius: 4px; }
        .highlight strong { color: #1A3A5C; }
        ul, ol { padding-left: 20px; }
        li { margin-bottom: 10px; }
        .cta { background: #1A3A5C; color: white; padding: 24px; text-align: center; border-radius: 8px; margin: 30px 0; }
        .cta a { color: white; text-decoration: underline; font-weight: bold; }
        .disclaimer { font-size: 0.78rem; color: #888; border-top: 1px solid #ddd; margin-top: 40px; padding-top: 20px; line-height: 1.5; }
        .tldr { background: #f8f8f8; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .tldr strong { color: #1A3A5C; }
        .nav-top { margin-bottom: 24px; }
        .nav-top a { color: #1A3A5C; font-weight: 600; font-size: 0.9rem; }
        .danger-box { background: #fff3f3; border: 1px solid #ffcccc; border-left: 4px solid #e74c3c; padding: 20px; border-radius: 8px; margin: 25px 0; }
        .danger-box strong { color: #c0392b; }
        .framework-inline { background: #f8f8f8; padding: 16px; border-radius: 8px; margin: 16px 0; }
        .framework-inline h4 { margin: 0 0 4px 0; color: #1A3A5C; }
        .framework-inline p { margin: 0 0 12px 0; font-size: 0.95rem; }
        .framework-inline p:last-child { margin-bottom: 0; }
    </style>
  <link rel="canonical" href="https://jetleechannel.sg/amberwood/articles/article-ultra-rich-buy-property.html">
</head>
<body>

<p class="nav-top"><a href="https://jetleechannel.sg/amberwood/">&larr; Back to Amberwood at Holland</a></p>

<h1>How the Ultra-Rich Buy Property: Privacy, GCB Enclaves &amp; the S$40M Playbook</h1>

<p><em>Published ${date} by Jet Lee, Property Journey Advisor · Source: The Business Times</em></p>

<div class="tldr">
<strong>Quick summary:</strong> Brokers from Knight Frank, Savills and List Sotheby's International Realty reveal how ultra-high-net-worth individuals really buy property — off-market mansions, NDAs, relentless comparison, and a refusal to overpay. The patterns they describe — exclusive landed enclaves, low density, privacy, and architecture that ages well — are exactly what holds value best in Singapore.
</div>

${bodySections({
  tieIn: `<h2>What This Means for Amberwood at Holland</h2>
<p>When Knight Frank's Nicholas Keong describes what UHNW buyers look for in Singapore, he lists: <strong>"exclusive landed enclaves, especially GCBs, and low-density developments with excellent security, concierges and private lifts and entrances in prime but quiet neighbourhoods."</strong></p>
<p>That is a remarkably precise description of the Amberwood at Holland setting. Sitting in District 10 — Singapore's most prestigious residential district — surrounded by GCB enclaves, with low-density, quiet streets and mature greenery, Amberwood delivers the <em>environment</em> the ultra-rich pay premiums for, without the S$40 million price tag.</p>
<p>The UHNW playbook also explains why this holds value: they buy scarcity, privacy and permanence. A low-density home in a prime quiet enclave, in move-in condition, in an address with no more land to be created — that's the profile of an asset that always has a buyer.</p>`,
})}

<div class="cta">
    <p><strong>Contact Jet Lee Today</strong></p>
    <p><strong>Jet Lee</strong><br>Senior Associate Group District Director (PropNex)</p>
    <p>📱 <strong>Call / WhatsApp: <a href="https://wa.me/6587649315">8764 9315</a></strong></p>
    <p>🌐 <a href="https://jetleechannel.sg/amberwood/">jetleechannel.sg/amberwood</a></p>
    <p style="margin-top:12px;"><strong>Buy Safe. Protect Your Downside. Unlock Your Upside.</strong><br>Jet Lee | SRPU Property Framework</p>
</div>

<div class="disclaimer">
<strong>Disclaimer:</strong> The information provided in this article is for general informational purposes only and does not constitute professional advice, recommendation, or solicitation. Project details are based on publicly available information as of ${iso} and may change. Jet Lee (CEA Reg. R007613B) and PropNex make no representations as to the accuracy or completeness of any information. Past performance and market trends are not indicative of future results. Property transactions involve risks. Individual circumstances may vary.
</div>

<style>
  .wa-float {
    position: fixed; bottom: 24px; right: 24px; z-index: 9999;
    width: 60px; height: 60px; border-radius: 50%;
    background: #25D366; display: flex; align-items: center;
    justify-content: center;
    box-shadow: 0 4px 20px rgba(37,211,102,.4);
    transition: transform .2s, box-shadow .2s; text-decoration: none;
  }
  .wa-float:hover { transform: scale(1.08); box-shadow: 0 6px 28px rgba(37,211,102,.55); }
  .wa-float svg { width: 32px; height: 32px; fill: white; }
  @media (max-width: 600px) {
    .wa-float { width: 52px; height: 52px; bottom: 18px; right: 18px; }
    .wa-float svg { width: 28px; height: 28px; }
  }
</style>
<a href="https://wa.me/6587649315?text=Hi%20Jet%20Lee%2C%20I%20read%20your%20article%20on%20how%20the%20ultra-rich%20buy%20property%20(Amberwood)"
   class="wa-float" target="_blank" rel="noopener" aria-label="Chat on WhatsApp">
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
</a>

<p style="margin-top:24px;"><a href="https://jetleechannel.sg/amberwood/" style="color:#C9A84C;font-weight:600;">&larr; Back to Amberwood at Holland</a></p>

<div class="thomson-promo" style="margin-top:2rem;background:#f0f4ff;border:1px solid #c8d4e8;border-left:4px solid #1A3A5C;border-radius:8px;padding:1.5rem 1.8rem;">
  <p style="margin:0 0 .4rem;color:#1A3A5C;font-size:.78rem;letter-spacing:.14em;text-transform:uppercase;font-weight:600;">🏗️ New Launch · District 20 · Upper Thomson</p>
  <p style="margin:0;color:#333;font-size:1.02rem;line-height:1.7;"><strong>Thinking about buying a new launch in 2026?</strong> Thomson Reserve — 1,268 units at Bright Hill Drive, Upper Thomson — is one of the most anticipated launches of the year, jointly developed by UOL Group, CapitaLand and SingLand.</p>
  <p style="margin:.8rem 0 0;color:#555;font-size:.9rem;">Get the <strong>direct developer price</strong> and first access to the preview before public launch.</p>
  <a href="https://thomson-reserve-direct-developer.com/" target="_blank" rel="noopener" style="display:inline-block;margin-top:1rem;padding:.7rem 2rem;background:#1A3A5C;color:#fff;text-decoration:none;font-size:.78rem;letter-spacing:.12em;text-transform:uppercase;font-weight:600;border-radius:4px;">👉 Visit Thomson Reserve Official Site</a>
</div>
<div style="margin-top:1.2rem;padding-top:1rem;border-top:1px solid #ddd;text-align:center;">
  <p style="margin:0;color:#888;font-size:.82rem;">🏗️ <a href="https://thomson-reserve-direct-developer.com/" target="_blank" rel="noopener" style="color:#1A3A5C;text-decoration:none;font-weight:600;">Thomson Reserve</a> — New Launch D20 · Preview Oct 2026 · Direct Developer Price</p>
</div>

</body>
</html>`;

// ============ WRITE FILES ============
const targets = [
  { name: 'HQ', file: 'articles/article-ultra-rich-buy-property.html', content: hqArticle },
  { name: 'Thomson', file: 'thomson-articles/article-ultra-rich-buy-property.html', content: thomsonArticle },
  { name: 'UPPERHOUSE', file: 'upperhouse_articles/article-ultra-rich-buy-property.html', content: upperhouseArticle },
  { name: 'Amberwood', file: 'amberwood_articles/article-ultra-rich-buy-property.html', content: amberwoodArticle },
];

for (const t of targets) {
  const p = path.join(OUT, t.file);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, t.content);
  console.log(`✅ ${t.name}: ${t.file} (${t.content.length} bytes)`);
}
console.log('\nDone — 4 article files generated.');
