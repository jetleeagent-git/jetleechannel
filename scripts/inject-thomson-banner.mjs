// Inject Thomson Reserve promo banner into all project pages + Loyang site
// Banner placed right before </footer> in each file.
// Banner links to https://thomson-reserve-direct-developer.com/

import { readFileSync, writeFileSync, existsSync } from 'fs';

const BANNER = `
<!-- ===== Thomson Reserve Promo Banner (injected by scripts/inject-thomson-banner.mjs) ===== -->
<div class="tr-banner" style="background:linear-gradient(135deg,#141414 0%,#1E1E1E 60%,#2A2318 100%);border-top:1px solid rgba(184,151,90,0.35);border-bottom:1px solid rgba(184,151,90,0.35);padding:0;margin:0;width:100%;">
  <div style="max-width:1100px;margin:0 auto;display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:20px;padding:28px 24px;">
    <div style="flex:1;min-width:260px;">
      <div style="font-size:11px;letter-spacing:3px;text-transform:uppercase;color:var(--gold,#C9A84C);font-weight:600;margin-bottom:6px;">&#127881; Coming Soon &mdash; October 2026</div>
      <div style="font-family:'Cormorant Garamond',Georgia,serif;font-size:clamp(24px,3.5vw,38px);font-weight:500;color:#FFFFFF;line-height:1.1;letter-spacing:0.5px;">Thomson Reserve</div>
      <div style="font-size:13px;color:rgba(255,255,255,0.6);margin-top:6px;">UOL / CapitaLand / SingLand &middot; Upper Thomson D20 &middot; 1,268 Units &middot; Direct Developer Price</div>
    </div>
    <div style="flex-shrink:0;">
      <a href="https://thomson-reserve-direct-developer.com/" target="_blank" rel="noopener" style="display:inline-block;background:#000;color:var(--gold,#C9A84C);border:1px solid rgba(201,168,76,0.6);padding:12px 30px;font-size:11px;letter-spacing:2px;text-transform:uppercase;font-weight:600;text-decoration:none;transition:all .25s;border-radius:2px;">Learn More &#8594;</a>
    </div>
  </div>
</div>
<!-- ===== /Thomson Reserve Promo Banner ===== -->
`;

// 26 subdirectory projects → local source file
const PROJECTS = {
  amberwood: 'site-amberwood.html',
  arcady: 'site-arcady.html',
  bagnallhous: 'bagnallhous/index.html',
  BelgraviaAce: 'BelgraviaAce/index.html',
  dunearnhouse: 'site-dunearnhouse.html',
  elta: 'site-elta.html',
  'generations-tannery': 'generations-tannery/index.html',
  granddunman: 'granddunman/index.html',
  hougangcentral: 'site-hougangcentral.html',
  hudsonplace: 'site-hudsonplace.html',
  'lentor-gardens': 'site-lentorgardens.html',
  lucernegrand: 'site-lucernegrand.html',
  narraresidences: 'narraresidences/index.html',
  newportresidences: 'newportresidences/index.html',
  OneMarinaGardens: 'site-onemarinagarden.html',
  promenadepeak: 'promenadepeak/index.html',
  rivergreen: 'rivergreen/index.html',
  SophiaMeadow: 'sophiameadow/index.html',
  thecontinuum: 'site-thecontinuum.html',
  TheOrie: 'theorie/index.html',
  thesen: 'thesen/index.html',
  TheSerra: 'thesierra/index.html',
  unionsquare: 'site-unionsquare.html',
  upperhouse: 'upperhouse/index.html',
  velabay: 'velabay/index.html',
  zyongrand: 'zyongrand/index.html',
};

const MARKER = 'Thomson Reserve Promo Banner';
let modified = 0, skipped = 0;

for (const [proj, file] of Object.entries(PROJECTS)) {
  if (!existsSync(file)) { console.log(`SKIP ${proj}: ${file} not found`); skipped++; continue; }
  let html = readFileSync(file, 'utf-8');
  if (html.includes(MARKER)) { console.log(`SKIP ${proj}: already has banner`); skipped++; continue; }
  const idx = html.lastIndexOf('</footer>');
  if (idx < 0) { console.log(`SKIP ${proj}: no </footer>`); skipped++; continue; }
  html = html.slice(0, idx) + BANNER + html.slice(idx);
  writeFileSync(file, html, 'utf-8');
  console.log(`OK   ${proj}: banner injected (${file})`);
  modified++;
}

console.log(`\nDone: ${modified} modified, ${skipped} skipped`);
