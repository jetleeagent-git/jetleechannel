#!/usr/bin/env node
// Lighten hero/background overlays on ALL jetleechannel.sg project homepages
// EXCEPT luxushill10 (user explicitly excluded).
// Each entry: file -> array of [oldString, newString, expectedMinOccurrences]
import fs from 'fs';

const FILES = [
  // ===== Pattern A: #home .hero-bg (90deg overlay) + ::after + mobile 180deg =====
  ['site-theorie.html', [
    ['linear-gradient(90deg, rgba(14,13,11,0.85) 0%, rgba(14,13,11,0.55) 35%, rgba(14,13,11,0.25) 70%, rgba(14,13,11,0.08) 100%)',
     'linear-gradient(90deg, rgba(14,13,11,0.45) 0%, rgba(14,13,11,0.25) 35%, rgba(14,13,11,0.10) 70%, rgba(14,13,11,0.02) 100%)', 1],
    ['linear-gradient(180deg, rgba(14,13,11,0.2) 0%, rgba(14,13,11,0.1) 15%, rgba(14,13,11,0.5) 50%, rgba(14,13,11,0.85) 100%)',
     'linear-gradient(180deg, rgba(14,13,11,0.08) 0%, rgba(14,13,11,0.04) 15%, rgba(14,13,11,0.25) 50%, rgba(14,13,11,0.55) 100%)', 1],
    ['linear-gradient(180deg, rgba(14,13,11,0.65) 0%, rgba(14,13,11,0.82) 50%, rgba(14,13,11,0.96) 100%)',
     'linear-gradient(180deg, rgba(14,13,11,0.30) 0%, rgba(14,13,11,0.42) 50%, rgba(14,13,11,0.60) 100%)', 1],
  ]],
  ['site-sophiameadow.html', [
    ['linear-gradient(90deg, rgba(14,13,11,0.85) 0%, rgba(14,13,11,0.55) 35%, rgba(14,13,11,0.25) 70%, rgba(14,13,11,0.08) 100%)',
     'linear-gradient(90deg, rgba(14,13,11,0.45) 0%, rgba(14,13,11,0.25) 35%, rgba(14,13,11,0.10) 70%, rgba(14,13,11,0.02) 100%)', 1],
    ['linear-gradient(180deg, rgba(14,13,11,0.2) 0%, rgba(14,13,11,0.1) 15%, rgba(14,13,11,0.5) 50%, rgba(14,13,11,0.85) 100%)',
     'linear-gradient(180deg, rgba(14,13,11,0.08) 0%, rgba(14,13,11,0.04) 15%, rgba(14,13,11,0.25) 50%, rgba(14,13,11,0.55) 100%)', 1],
    ['linear-gradient(180deg, rgba(14,13,11,0.65) 0%, rgba(14,13,11,0.82) 50%, rgba(14,13,11,0.96) 100%)',
     'linear-gradient(180deg, rgba(14,13,11,0.30) 0%, rgba(14,13,11,0.42) 50%, rgba(14,13,11,0.60) 100%)', 1],
  ]],
  ['site-bagnallhous.html', [
    ['linear-gradient(90deg, rgba(14,13,11,0.85) 0%, rgba(14,13,11,0.55) 35%, rgba(14,13,11,0.25) 70%, rgba(14,13,11,0.08) 100%)',
     'linear-gradient(90deg, rgba(14,13,11,0.45) 0%, rgba(14,13,11,0.25) 35%, rgba(14,13,11,0.10) 70%, rgba(14,13,11,0.02) 100%)', 1],
    ['linear-gradient(180deg, rgba(14,13,11,0.2) 0%, rgba(14,13,11,0.1) 15%, rgba(14,13,11,0.5) 50%, rgba(14,13,11,0.85) 100%)',
     'linear-gradient(180deg, rgba(14,13,11,0.08) 0%, rgba(14,13,11,0.04) 15%, rgba(14,13,11,0.25) 50%, rgba(14,13,11,0.55) 100%)', 1],
    ['linear-gradient(180deg, rgba(14,13,11,0.65) 0%, rgba(14,13,11,0.82) 50%, rgba(14,13,11,0.96) 100%)',
     'linear-gradient(180deg, rgba(14,13,11,0.30) 0%, rgba(14,13,11,0.42) 50%, rgba(14,13,11,0.60) 100%)', 1],
  ]],
  ['promenadepeak/index.html', [
    ['linear-gradient(90deg, rgba(14,13,11,0.85) 0%, rgba(14,13,11,0.55) 35%, rgba(14,13,11,0.25) 70%, rgba(14,13,11,0.08) 100%)',
     'linear-gradient(90deg, rgba(14,13,11,0.45) 0%, rgba(14,13,11,0.25) 35%, rgba(14,13,11,0.10) 70%, rgba(14,13,11,0.02) 100%)', 1],
    ['linear-gradient(180deg, rgba(14,13,11,0.2) 0%, rgba(14,13,11,0.1) 15%, rgba(14,13,11,0.5) 50%, rgba(14,13,11,0.85) 100%)',
     'linear-gradient(180deg, rgba(14,13,11,0.08) 0%, rgba(14,13,11,0.04) 15%, rgba(14,13,11,0.25) 50%, rgba(14,13,11,0.55) 100%)', 1],
    ['linear-gradient(180deg, rgba(14,13,11,0.65) 0%, rgba(14,13,11,0.82) 50%, rgba(14,13,11,0.96) 100%)',
     'linear-gradient(180deg, rgba(14,13,11,0.30) 0%, rgba(14,13,11,0.42) 50%, rgba(14,13,11,0.60) 100%)', 1],
  ]],
  ['rivergreen/index.html', [
    ['linear-gradient(90deg, rgba(14,13,11,0.85) 0%, rgba(14,13,11,0.55) 35%, rgba(14,13,11,0.25) 70%, rgba(14,13,11,0.08) 100%)',
     'linear-gradient(90deg, rgba(14,13,11,0.45) 0%, rgba(14,13,11,0.25) 35%, rgba(14,13,11,0.10) 70%, rgba(14,13,11,0.02) 100%)', 1],
    ['linear-gradient(180deg, rgba(14,13,11,0.2) 0%, rgba(14,13,11,0.1) 15%, rgba(14,13,11,0.5) 50%, rgba(14,13,11,0.85) 100%)',
     'linear-gradient(180deg, rgba(14,13,11,0.08) 0%, rgba(14,13,11,0.04) 15%, rgba(14,13,11,0.25) 50%, rgba(14,13,11,0.55) 100%)', 1],
    ['linear-gradient(180deg, rgba(14,13,11,0.65) 0%, rgba(14,13,11,0.82) 50%, rgba(14,13,11,0.96) 100%)',
     'linear-gradient(180deg, rgba(14,13,11,0.30) 0%, rgba(14,13,11,0.42) 50%, rgba(14,13,11,0.60) 100%)', 1],
  ]],
  ['newportresidences/index.html', [
    ['linear-gradient(90deg, rgba(14,13,11,0.85) 0%, rgba(14,13,11,0.55) 35%, rgba(14,13,11,0.25) 70%, rgba(14,13,11,0.08) 100%)',
     'linear-gradient(90deg, rgba(14,13,11,0.45) 0%, rgba(14,13,11,0.25) 35%, rgba(14,13,11,0.10) 70%, rgba(14,13,11,0.02) 100%)', 1],
    ['linear-gradient(180deg, rgba(14,13,11,0.2) 0%, rgba(14,13,11,0.1) 15%, rgba(14,13,11,0.5) 50%, rgba(14,13,11,0.85) 100%)',
     'linear-gradient(180deg, rgba(14,13,11,0.08) 0%, rgba(14,13,11,0.04) 15%, rgba(14,13,11,0.25) 50%, rgba(14,13,11,0.55) 100%)', 1],
    ['linear-gradient(180deg, rgba(14,13,11,0.65) 0%, rgba(14,13,11,0.82) 50%, rgba(14,13,11,0.96) 100%)',
     'linear-gradient(180deg, rgba(14,13,11,0.30) 0%, rgba(14,13,11,0.42) 50%, rgba(14,13,11,0.60) 100%)', 1],
  ]],
  ['upperhouse/index.html', [
    ['linear-gradient(90deg, rgba(14,13,11,0.85) 0%, rgba(14,13,11,0.55) 35%, rgba(14,13,11,0.25) 70%, rgba(14,13,11,0.08) 100%)',
     'linear-gradient(90deg, rgba(14,13,11,0.45) 0%, rgba(14,13,11,0.25) 35%, rgba(14,13,11,0.10) 70%, rgba(14,13,11,0.02) 100%)', 1],
    ['linear-gradient(180deg, rgba(14,13,11,0.2) 0%, rgba(14,13,11,0.1) 15%, rgba(14,13,11,0.5) 50%, rgba(14,13,11,0.85) 100%)',
     'linear-gradient(180deg, rgba(14,13,11,0.08) 0%, rgba(14,13,11,0.04) 15%, rgba(14,13,11,0.25) 50%, rgba(14,13,11,0.55) 100%)', 1],
    ['linear-gradient(180deg, rgba(14,13,11,0.65) 0%, rgba(14,13,11,0.82) 50%, rgba(14,13,11,0.96) 100%)',
     'linear-gradient(180deg, rgba(14,13,11,0.30) 0%, rgba(14,13,11,0.42) 50%, rgba(14,13,11,0.60) 100%)', 1],
  ]],
  ['site-thesierra.html', [
    ['linear-gradient(90deg, rgba(14,13,11,0.96) 0%, rgba(14,13,11,0.75) 38%, rgba(14,13,11,0.4) 68%, rgba(14,13,11,0.18) 100%)',
     'linear-gradient(90deg, rgba(14,13,11,0.50) 0%, rgba(14,13,11,0.30) 38%, rgba(14,13,11,0.12) 68%, rgba(14,13,11,0.03) 100%)', 1],
    ['linear-gradient(180deg, rgba(14,13,11,0.2) 0%, rgba(14,13,11,0.1) 15%, rgba(14,13,11,0.5) 50%, rgba(14,13,11,0.85) 100%)',
     'linear-gradient(180deg, rgba(14,13,11,0.08) 0%, rgba(14,13,11,0.04) 15%, rgba(14,13,11,0.25) 50%, rgba(14,13,11,0.55) 100%)', 1],
    ['linear-gradient(180deg, rgba(14,13,11,0.65) 0%, rgba(14,13,11,0.82) 50%, rgba(14,13,11,0.96) 100%)',
     'linear-gradient(180deg, rgba(14,13,11,0.30) 0%, rgba(14,13,11,0.42) 50%, rgba(14,13,11,0.60) 100%)', 1],
  ]],
  ['zyongrand/index.html', [
    ['linear-gradient(90deg, rgba(14,13,11,0.85) 0%, rgba(14,13,11,0.55) 35%, rgba(14,13,11,0.25) 70%, rgba(14,13,11,0.08) 100%)',
     'linear-gradient(90deg, rgba(14,13,11,0.45) 0%, rgba(14,13,11,0.25) 35%, rgba(14,13,11,0.10) 70%, rgba(14,13,11,0.02) 100%)', 1],
    ['linear-gradient(180deg, rgba(14,13,11,0.2) 0%, rgba(14,13,11,0.1) 15%, rgba(14,13,11,0.5) 50%, rgba(14,13,11,0.85) 100%)',
     'linear-gradient(180deg, rgba(14,13,11,0.08) 0%, rgba(14,13,11,0.04) 15%, rgba(14,13,11,0.25) 50%, rgba(14,13,11,0.55) 100%)', 1],
    ['linear-gradient(180deg, rgba(14,13,11,0.65) 0%, rgba(14,13,11,0.82) 50%, rgba(14,13,11,0.96) 100%)',
     'linear-gradient(180deg, rgba(14,13,11,0.30) 0%, rgba(14,13,11,0.42) 50%, rgba(14,13,11,0.60) 100%)', 1],
  ]],
  ['BelgraviaAce/index.html', [
    ['linear-gradient(90deg, rgba(14,13,11,0.85) 0%, rgba(14,13,11,0.55) 35%, rgba(14,13,11,0.25) 70%, rgba(14,13,11,0.08) 100%)',
     'linear-gradient(90deg, rgba(14,13,11,0.45) 0%, rgba(14,13,11,0.25) 35%, rgba(14,13,11,0.10) 70%, rgba(14,13,11,0.02) 100%)', 1],
    ['linear-gradient(180deg, rgba(14,13,11,0.2) 0%, rgba(14,13,11,0.1) 15%, rgba(14,13,11,0.5) 50%, rgba(14,13,11,0.85) 100%)',
     'linear-gradient(180deg, rgba(14,13,11,0.08) 0%, rgba(14,13,11,0.04) 15%, rgba(14,13,11,0.25) 50%, rgba(14,13,11,0.55) 100%)', 1],
    ['linear-gradient(180deg, rgba(14,13,11,0.65) 0%, rgba(14,13,11,0.82) 50%, rgba(14,13,11,0.96) 100%)',
     'linear-gradient(180deg, rgba(14,13,11,0.30) 0%, rgba(14,13,11,0.42) 50%, rgba(14,13,11,0.60) 100%)', 1],
  ]],

  // ===== Pattern B: separate bg + overlay elements =====
  ['site-elta.html', [
    ['filter:brightness(.45)}', 'filter:brightness(.85)}', 1],
    ['linear-gradient(180deg,rgba(13,26,18,.3),rgba(13,26,18,.8))',
     'linear-gradient(180deg,rgba(13,26,18,.15),rgba(13,26,18,.45))', 1],
  ]],
  ['site-hudsonplace.html', [
    ['linear-gradient(180deg,rgba(0,0,0,.38) 0%,rgba(0,0,0,.18) 50%,rgba(44,10,10,.92) 100%)',
     'linear-gradient(180deg,rgba(0,0,0,.20) 0%,rgba(0,0,0,.08) 50%,rgba(44,10,10,.50) 100%)', 1],
  ]],
  ['site-hougangcentral.html', [
    ['linear-gradient(180deg, rgba(10,22,40,0.3) 0%, rgba(10,22,40,0.5) 40%, rgba(10,22,40,0.85) 100%)',
     'linear-gradient(180deg, rgba(10,22,40,0.15) 0%, rgba(10,22,40,0.25) 40%, rgba(10,22,40,0.50) 100%)', 1],
    ['linear-gradient(180deg, rgba(10,22,40,0.25) 0%, rgba(10,22,40,0.3) 40%, rgba(10,22,40,0.75) 100%)',
     'linear-gradient(180deg, rgba(10,22,40,0.12) 0%, rgba(10,22,40,0.15) 40%, rgba(10,22,40,0.45) 100%)', 1],
  ]],
  ['site-lucernegrand.html', [
    ['linear-gradient(180deg, rgba(14,12,8,0.18) 0%, rgba(14,12,8,0.52) 60%, rgba(14,12,8,0.82) 100%)',
     'linear-gradient(180deg, rgba(14,12,8,0.08) 0%, rgba(14,12,8,0.25) 60%, rgba(14,12,8,0.45) 100%)', 1],
  ]],
  ['site-onemarinagarden.html', [
    ['opacity:.5}', 'opacity:.78}', 1],
    ['background:linear-gradient(rgba(17,17,17,.3),rgba(17,17,17,.9))',
     'background:linear-gradient(rgba(17,17,17,.15),rgba(17,17,17,.5))', 1],
  ]],
  ['thesen/index.html', [
    ['opacity:.5}', 'opacity:.78}', 1],
    ['background:linear-gradient(rgba(17,17,17,.3),rgba(17,17,17,.9))',
     'background:linear-gradient(rgba(17,17,17,.15),rgba(17,17,17,.5))', 1],
  ]],
  ['site-dunearnhouse.html', [
    ['background: linear-gradient(to bottom, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.65) 100%)',
     'background: linear-gradient(to bottom, rgba(0,0,0,0.20) 0%, rgba(0,0,0,0.35) 100%)', 1],
    ['linear-gradient(160deg, #0E0D0B 0%, #1A1810 40%, #0E0D0B 100%)',
     'linear-gradient(160deg, #2A2418 0%, #3A3320 40%, #2A2418 100%)', 1],
  ]],
  ['site-lentorgardens.html', [
    ['rgba(10,22,40,0.25) 0%,\n      rgba(10,22,40,0.35) 40%,\n      rgba(10,22,40,0.85) 100%',
     'rgba(10,22,40,0.12) 0%,\n      rgba(10,22,40,0.18) 40%,\n      rgba(10,22,40,0.50) 100%', 1],
  ]],
  ['site-generations-tannery.html', [
    ['linear-gradient(135deg, #1A1A2E 0%, #16213E 50%, #0F3460 100%)',
     'linear-gradient(135deg, #2A2A44 0%, #24324F 50%, #1E4666 100%)', 1],
  ]],

  // ===== Pattern C: amberwood =====
  ['site-amberwood.html', [
    ['background: url(\'/amberwood/images/hero-bg.jpg\') center/cover no-repeat;\n  opacity: 0.3;',
     'background: url(\'/amberwood/images/hero-bg.jpg\') center/cover no-repeat;\n  opacity: 0.62;', 1],
    ['background: linear-gradient(to bottom, var(--dark) 0%, rgba(26,26,46,.7) 40%, rgba(42,31,14,.7) 100%);',
     'background: linear-gradient(to bottom, rgba(12,12,16,.45) 0%, rgba(26,26,46,.35) 40%, rgba(42,31,14,.35) 100%);', 1],
  ]],

  // ===== No photo, pure gradients (lighten colors) =====
  ['site-arcady.html', [
    ['linear-gradient(160deg, #0E0D0B 0%, #1A1810 40%, #0E0D0B 100%)',
     'linear-gradient(160deg, #241F18 0%, #322B1C 40%, #241F18 100%)', 1],
  ]],
  ['site-unionsquare.html', [
    ['linear-gradient(160deg, #0d0d0d 0%, #1a1a2e 55%, #0f1520 100%)',
     'linear-gradient(160deg, #1f1f26 0%, #2a2a3a 55%, #232833 100%)', 1],
  ]],
];

let fail = 0;
for (const [file, repls] of FILES) {
  if (!fs.existsSync(file)) { console.log(`❌ MISSING: ${file}`); fail++; continue; }
  let src = fs.readFileSync(file, 'utf8');
  const origLen = src.length;
  for (const [oldS, newS, min] of repls) {
    const count = src.split(oldS).length - 1;
    if (count === 0) {
      console.log(`⚠️  ${file}: NOT FOUND (${oldS.slice(0, 70)}...)`);
      fail++;
    } else if (count < min) {
      console.log(`⚠️  ${file}: found ${count} < min ${min} (${oldS.slice(0, 70)}...)`);
      fail++;
    } else {
      src = src.split(oldS).join(newS);
      console.log(`✅ ${file}: replaced ${count}x  ${oldS.slice(0, 60)}...`);
    }
  }
  if (src !== fs.readFileSync(file, 'utf8')) fs.writeFileSync(file, src);
}
console.log(fail === 0 ? '\n🎉 ALL REPLACEMENTS OK' : `\n⚠️  ${fail} issue(s) — fix before upload`);
process.exit(fail === 0 ? 0 : 1);
