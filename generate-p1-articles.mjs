#!/usr/bin/env node
/**
 * Generate P1 Phase 2C article for all 19 jetleechannel.sg project sites.
 * Creates {project}_articles/p1-phase-2c-ballots-2026.html locally.
 * School tie-ins based on verified data from each project homepage.
 */

import { writeFileSync, mkdirSync } from 'fs';

const ARTICLE_NAME = 'p1-phase-2c-ballots-2026.html';

const PROJECTS = [
  {
    dir: 'elta', slug: 'elta', name: 'ELTA', back: 'ELTA',
    school: 'Qifa Primary School',
    schoolBlurb: '<strong>ELTA is within 1km of Qifa Primary School</strong> — a school with sustained registration demand in the Clementi area. For families living within 1km, Phase 2C registration starts from the strongest possible position.',
  },
  {
    dir: 'dunearnhouse', slug: 'dunearnhouse', name: 'Dunearn House', back: 'Dunearn House',
    school: 'Nanyang Primary School',
    schoolBlurb: '<strong>Dunearn House sits in one of Singapore\'s most sought-after school belts, within 1km of Nanyang Primary School</strong> — consistently one of the most in-demand schools in the country. Living within 1km means first priority at every ballot phase.',
  },
  {
    dir: 'amberwood', slug: 'amberwood', name: 'Amberwood', back: 'Amberwood',
    school: 'Henry Park Primary School',
    schoolBlurb: '<strong>Amberwood is positioned near a strong school belt, close to Henry Park Primary School and MGS (Methodist Girls\' School)</strong> — schools that draw consistent registration demand year after year. The 1km advantage has never mattered more.',
  },
  {
    dir: 'arcady', slug: 'arcady', name: 'The Arcady at Boon Keng', back: 'The Arcady',
    school: 'Bendemeer Primary School',
    schoolBlurb: '<strong>The Arcady is just 170m from Bendemeer Primary School</strong> — well within the 1km priority zone. In a year where 73 schools are balloting, that distance is a genuine registration advantage.',
  },
  {
    dir: 'hudsonplace', slug: 'hudsonplace', name: 'Hudson Place', back: 'Hudson Place',
    school: 'Fairfield Methodist Primary',
    schoolBlurb: '<strong>Hudson Place is within 1km of Fairfield Methodist Primary</strong> — a school with persistent registration demand. The 1km priority zone gives Singapore Citizen families the strongest starting position in every ballot phase.',
  },
  {
    dir: 'hougangcentral', slug: 'hougangcentral', name: 'Hougang Central', back: 'Hougang Central',
    school: 'a cluster of reputable schools',
    schoolBlurb: '<strong>Hougang Central is surrounded by reputable schools</strong> including Holy Innocents\' High School and Montfort School, with several other educational institutions within the area. For families weighing school access, the location holds steady long-term appeal.',
  },
  {
    dir: 'lentor-gardens', slug: 'lentor-gardens', name: 'Lentor Gardens', back: 'Lentor Gardens',
    school: 'Anderson Primary School',
    schoolBlurb: '<strong>Lentor Gardens is within 1km of Anderson Primary School</strong>, with Mayflower Primary also nearby. Anderson Primary draws strong registration demand — and the 1km priority zone matters more than ever in a year of widespread balloting.',
  },
  {
    dir: 'lucernegrand', slug: 'lucernegrand', name: 'Lucerne Grand', back: 'Lucerne Grand',
    school: 'Boon Lay Garden Primary School',
    schoolBlurb: '<strong>Lucerne Grand is near Boon Lay Garden Primary School, Lakeside Primary and Rulang Primary</strong> — giving families a distinct advantage during the Primary 1 registration process. Multiple strong options within reach make this a genuine school-belt location.',
  },
  {
    dir: 'OneMarinaGardens', slug: 'OneMarinaGardens', name: 'One Marina Gardens', back: 'One Marina Gardens',
    school: 'Cantonment Primary School',
    schoolBlurb: '<strong>One Marina Gardens is near Cantonment Primary School</strong> — a school with steady registration demand in the CBD fringe. For young families who want city living with school access, the 1km question is a real part of the decision.',
  },
  {
    dir: 'unionsquare', slug: 'unionsquare', name: 'Union Square', back: 'Union Square',
    school: 'a strong central school belt',
    schoolBlurb: '<strong>Union Square sits within a strong central school belt</strong>, surrounded by established schools that draw consistent registration demand. In a year of widespread balloting, school proximity adds durable value to city living.',
  },
  {
    dir: 'generations-tannery', slug: 'generations-tannery', name: 'Generations @ Tannery', back: 'Generations @ Tannery',
    school: 'a growing family-oriented school network',
    schoolBlurb: '<strong>Generations @ Tannery is surrounded by a growing family-oriented school network</strong> in a neighbourhood that continues to develop. For young families, school access is part of the long-term value story.',
  },
  {
    dir: 'TheSierra', slug: 'TheSierra', name: 'The Serra Residences', back: 'The Serra Residences',
    school: 'Farrer Park Primary School & Hong Wen School',
    schoolBlurb: '<strong>The Serra Residences is close to Farrer Park Primary School and Hong Wen School</strong>, with Singapore Chinese Girls\' School also nearby. A strong Novena school belt — and the 1km priority zone matters more than ever.',
  },
  {
    dir: 'TheOrie', slug: 'TheOrie', name: 'The Orie', back: 'The Orie',
    school: 'CHIJ Primary (Toa Payoh)',
    schoolBlurb: '<strong>The Orie sits in a strong Toa Payoh school belt — near CHIJ Primary and Raffles Institution</strong>, plus Kheng Cheng School and First Toa Payoh Primary. Families here have one of Singapore\'s richest education networks within reach.',
  },
  {
    dir: 'SophiaMeadow', slug: 'SophiaMeadow', name: 'Sophia Meadow', back: 'Sophia Meadow',
    school: 'River Valley Primary & ACS Junior',
    schoolBlurb: '<strong>Sophia Meadow is within 1km of River Valley Primary and ACS Junior</strong> — both schools with sustained registration demand. The 1km priority zone gives Singapore Citizen families the strongest starting position at every ballot phase.',
  },
  {
    dir: 'bagnallhous', slug: 'bagnallhous', name: 'Bagnall Haus', back: 'Bagnall Haus',
    school: 'Temasek Primary School',
    schoolBlurb: '<strong>Bagnall Haus is close to Temasek Primary, Bedok Green Primary and Changkat Primary</strong> — a solid East Coast school belt. With balloting pressure rising across Singapore, a location within reach of multiple strong schools holds durable appeal.',
  },
  {
    dir: 'zyongrand', slug: 'zyongrand', name: 'ZYON Grand', back: 'ZYON Grand',
    school: 'Alexandra Primary School',
    schoolBlurb: '<strong>ZYON Grand is near Alexandra Primary, River Valley Primary and Zhangde Primary</strong>, with Gan Eng Seng School nearby. Multiple strong options within reach make this a genuine school-belt location in the river valley area.',
  },
  {
    dir: 'promenadepeak', slug: 'promenadepeak', name: 'Promenade Peak', back: 'Promenade Peak',
    school: 'a strong central school belt',
    schoolBlurb: '<strong>Promenade Peak sits within a strong central school belt</strong> near Havelock Road, with established schools within easy reach. For city-living families, school access adds durable value to the address.',
  },
  {
    dir: 'rivergreen', slug: 'rivergreen', name: 'River Green', back: 'River Green',
    school: 'a strong River Valley school network',
    schoolBlurb: '<strong>River Green is surrounded by childcare and schools nearby</strong> in the family-friendly River Valley Green area, with Great World City\'s amenities at hand. School proximity remains a core part of the area\'s long-term appeal.',
  },
  {
    dir: 'newportresidences', slug: 'newportresidences', name: 'Newport Residences', back: 'Newport Residences',
    school: 'a strong central school network',
    schoolBlurb: '<strong>Newport Residences sits at the crossroads of Tanjong Pagar\'s financial district and heritage enclave</strong>, with a strong central school network nearby. For families who want CBD living with school access, the 1km question is a real part of the decision.',
  },
];

// Generic dark template (matching elta_articles style)
function template(p) {
  const canon = `https://jetleechannel.sg/${p.slug}/articles/${ARTICLE_NAME}`;
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="description" content="79 of 179 primary schools oversubscribed in Phase 2C of P1 registration 2026 — 73 going to ballot. Why the 1km rule matters, and how ${p.name}'s school-belt location gives families an edge.">
<link rel="canonical" href="${canon}">
<title>P1 Registration Phase 2C: Nearly Half of Primary Schools Oversubscribed — What It Means for Buyers | ${p.name}</title>
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
<h1>P1 Registration Phase 2C: Nearly Half of Primary Schools Oversubscribed — What It Means for Buyers</h1>
<p class="meta">Published 6 August 2026 · Schools &amp; Market Update</p>

<p>If you're a parent — or planning to become one near a popular primary school — this year's Primary 1 registration numbers deserve your attention.</p>

<p>According to MOE data released on Wednesday (Aug 5), <strong>79 of 179 primary schools accepting students in Phase 2C are oversubscribed</strong>. Of those with more applicants than vacancies, <strong>73 will go to the ballot</strong>.</p>

<p>Phase 2C is the most competitive phase — open to all children, with 40 places reserved in each primary school. For property buyers, it's a direct signal about which school zones carry the strongest demand.</p>

<div class="highlight">
  <strong>The headline numbers:</strong>
  179 primary schools accepted students in Phase 2C · 79 oversubscribed (nearly half) · 73 going to ballot.
  Most oversubscribed: Princess Elizabeth Primary (Bukit Batok) — 159 applicants for 40 places. Northland Primary (Yishun) — 141 applicants for 42 places. Nan Hua, Chongfu and Rosyth completed the top five.
</div>

<h2>How Balloting Works — and Why 1km Matters</h2>
<p>Balloting happens when applicants exceed vacancies. Priority admission order:</p>
<ol>
<li><strong>Singaporeans living within 1km</strong> of the school</li>
<li>Singaporeans living between 1km and 2km</li>
<li>Singaporeans living further than 2km</li>
<li>Permanent residents in the same distance groups</li>
</ol>
<p>The 1km advantage is decisive — that's why "within 1km of a popular school" has historically commanded a premium in Singapore property. <strong>This year's data confirms the pattern hasn't changed.</strong></p>

<h2>Bigger Picture: Fewer Spots Overall</h2>
<p>There's another layer: MOE earlier <strong>cut the Primary 1 intake for most schools</strong> this year in view of significantly falling student cohort sizes from 2027.</p>
<ul>
<li>Compared to 2025, there are <strong>1,460 fewer spots overall in 2026</strong></li>
<li>Of 179 primary schools, <strong>61 cut their intake</strong> while 12 increased spaces</li>
</ul>
<p>Smaller cohorts mean fewer places — even as demand for popular schools stays intense. <strong>The net effect: oversubscription pressure concentrates in the schools parents most want.</strong></p>

<h2>${p.name} &amp; the 1km Advantage</h2>
<p>This is where the property angle gets interesting. ${p.schoolBlurb}</p>

<div class="highlight">
  <strong>The takeaway for ${p.name} buyers:</strong>
  School proximity isn't a marketing line — it's a registration mechanic. In a year where 73 schools are balloting, living within 1km of a strong school removes the biggest uncertainty in the entire process. And that translates into durable resale demand for the project down the line.
</div>

<h2>What Buyers Should Watch</h2>
<ul>
<li><strong>The 1km premium is alive and well.</strong> When a school is oversubscribed, Singapore Citizen children within 1km get first priority. Proximity to in-demand schools remains one of the most durable value drivers in Singapore property.</li>
<li><strong>Persistent hotspots signal structural demand.</strong> Schools like Princess Elizabeth, Northland, Nan Hua and Chongfu have been oversubscribed year after year — sustained oversubscription isn't a fluke.</li>
<li><strong>New launches near strong school belts benefit.</strong> Projects within 1km of popular primary schools have a measurable advantage — for registration priority, and for resale demand when families with school-aged children look for homes.</li>
<li><strong>The next phase matters too.</strong> Phase 2C Supplementary vacancies will be updated by 1pm on Aug 11 — the next milestone to watch if you're still deciding.</li>
</ul>

<div class="highlight">
  <strong>Looking for a home near a strong school belt?</strong>
  Whether it's a new launch within 1km of a popular primary school, or a resale in a proven school district, the school map should be part of your property decision — and I can help you read it.
</div>

<div class="cta">
  <p><strong>Considering ${p.name} — or any property near a strong school?</strong></p>
  <p>Let's talk — no pressure, just honest analysis of what fits your family and your budget.</p>
  <a href="https://wa.me/6587649315?text=Hi%20Jet%20Lee%2C%20I%20read%20your%20P1%20Phase%202C%20article%20on%20${encodeURIComponent(p.name)}">📱 WhatsApp Jet Lee</a>
</div>

<a href="https://jetleechannel.sg/${p.slug}/articles/" class="back" style="text-align:center;display:block;">← Back to all articles</a>

<p class="source">Source: <a href="https://www.channelnewsasia.com/singapore/primary-1-registration-p1-phase-2c-ballots-schools-moe-6300706" rel="nofollow noopener">CNA — Primary 1 registration: Nearly half of all primary schools oversubscribed in Phase 2C</a> · MOE data via CNA, Aug 5 2026.</p>

<div class="footer">
  <p>Jet Lee @ 8764 9315 · CEA Reg No. R007613B · PropNex Realty</p>
  <p><a href="https://jetleechannel.sg">jetleechannel.sg</a></p>
</div>

</body>
</html>
`;
}

for (const p of PROJECTS) {
  mkdirSync(`${p.dir}_articles`, { recursive: true });
  const html = template(p);
  writeFileSync(`${p.dir}_articles/${ARTICLE_NAME}`, html);
  console.log(`✅ ${p.dir}_articles/${ARTICLE_NAME} (${(html.length/1024).toFixed(1)} KB)`);
}
console.log('Done — all project articles generated.');
