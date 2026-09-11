#!/usr/bin/env node
/**
 * Add Thomson Reserve promo (thomson-reserve-direct-developer.com) to ALL
 * existing articles across jetleechannel.sg project sites + HQ, per user
 * instruction: every article should end promoting Thomson Reserve.
 *
 * - Dark template (gold/forest): styled promo box + footer link
 * - Light template (navy/white): styled promo box + footer link
 * Inserted immediately before </body>. Idempotent: skips files that already
 * contain thomson-reserve-direct-developer.
 */

import { readFileSync, writeFileSync, readdirSync, existsSync, statSync } from 'fs';
import { join } from 'path';

const WORKSPACE = '/home/ubuntu/.openclaw/workspace';
const MARKER = 'thomson-reserve-direct-developer.com';

const DARK_PROMO = `<div class="thomson-promo" style="margin-top:2rem;background:#14281e;border:1px solid rgba(201,168,76,.35);border-left:4px solid #c9a84c;border-radius:8px;padding:1.5rem 1.8rem;">
  <p style="margin:0 0 .4rem;color:#e4c97e;font-size:.78rem;letter-spacing:.14em;text-transform:uppercase;font-weight:600;">🏗️ New Launch · District 20 · Upper Thomson</p>
  <p style="margin:0;color:#e8eae6;font-size:1.02rem;line-height:1.7;"><strong>Thinking about buying a new launch in 2026?</strong> Thomson Reserve — 1,268 units at Bright Hill Drive, Upper Thomson — is one of the most anticipated launches of the year, jointly developed by UOL Group, CapitaLand and SingLand.</p>
  <p style="margin:.8rem 0 0;color:rgba(232,234,230,.75);font-size:.9rem;">Get the <strong>direct developer price</strong> and first access to the preview before public launch.</p>
  <a href="https://thomson-reserve-direct-developer.com/" target="_blank" rel="noopener" style="display:inline-block;margin-top:1rem;padding:.7rem 2rem;background:#c9a84c;color:#0d1a12;text-decoration:none;font-size:.78rem;letter-spacing:.12em;text-transform:uppercase;font-weight:600;border-radius:4px;">👉 Visit Thomson Reserve Official Site</a>
</div>`;

const LIGHT_PROMO = `<div class="thomson-promo" style="margin-top:2rem;background:#f0f4ff;border:1px solid #c8d4e8;border-left:4px solid #1A3A5C;border-radius:8px;padding:1.5rem 1.8rem;">
  <p style="margin:0 0 .4rem;color:#1A3A5C;font-size:.78rem;letter-spacing:.14em;text-transform:uppercase;font-weight:600;">🏗️ New Launch · District 20 · Upper Thomson</p>
  <p style="margin:0;color:#333;font-size:1.02rem;line-height:1.7;"><strong>Thinking about buying a new launch in 2026?</strong> Thomson Reserve — 1,268 units at Bright Hill Drive, Upper Thomson — is one of the most anticipated launches of the year, jointly developed by UOL Group, CapitaLand and SingLand.</p>
  <p style="margin:.8rem 0 0;color:#555;font-size:.9rem;">Get the <strong>direct developer price</strong> and first access to the preview before public launch.</p>
  <a href="https://thomson-reserve-direct-developer.com/" target="_blank" rel="noopener" style="display:inline-block;margin-top:1rem;padding:.7rem 2rem;background:#1A3A5C;color:#fff;text-decoration:none;font-size:.78rem;letter-spacing:.12em;text-transform:uppercase;font-weight:600;border-radius:4px;">👉 Visit Thomson Reserve Official Site</a>
</div>`;

const DARK_FOOTER = `<div style="margin-top:1.2rem;padding-top:1rem;border-top:1px solid rgba(255,255,255,.08);text-align:center;">
  <p style="margin:0;color:rgba(232,234,230,.45);font-size:.82rem;">🏗️ <a href="https://thomson-reserve-direct-developer.com/" target="_blank" rel="noopener" style="color:#c9a84c;text-decoration:none;font-weight:600;">Thomson Reserve</a> — New Launch D20 · Preview Oct 2026 · Direct Developer Price</p>
</div>`;

const LIGHT_FOOTER = `<div style="margin-top:1.2rem;padding-top:1rem;border-top:1px solid #ddd;text-align:center;">
  <p style="margin:0;color:#888;font-size:.82rem;">🏗️ <a href="https://thomson-reserve-direct-developer.com/" target="_blank" rel="noopener" style="color:#1A3A5C;text-decoration:none;font-weight:600;">Thomson Reserve</a> — New Launch D20 · Preview Oct 2026 · Direct Developer Price</p>
</div>`;

function isDark(html) {
  // Dark templates use forest/gold backgrounds
  return /background:#0d1a12|background:#1a1a2e|background: #0d1a12|#14281e/.test(html) &&
         !/body\s*\{\s*color:\s*#333|color: #333/.test(html);
}

function inject(html) {
  const dark = isDark(html);
  const promo = dark ? DARK_PROMO : LIGHT_PROMO;
  const footer = dark ? DARK_FOOTER : LIGHT_FOOTER;
  const block = `${promo}\n${footer}\n`;
  if (html.includes(MARKER)) return { changed: false, html };
  // Insert before </body> (after any existing wa-float etc.)
  const idx = html.lastIndexOf('</body>');
  if (idx === -1) return { changed: false, html };
  const out = html.slice(0, idx) + block + html.slice(idx);
  return { changed: true, html: out, dark };
}

let processed = 0, changed = 0, skipped = 0;
const files = [];

// 1. All {project}_articles/*.html (excluding index.html)
const dirs = readdirSync(WORKSPACE).filter(d => d.endsWith('_articles'));
for (const d of dirs) {
  const dir = join(WORKSPACE, d);
  for (const f of readdirSync(dir)) {
    if (!f.endsWith('.html')) continue;
    if (f === 'index.html') continue;
    files.push(join(dir, f));
  }
}

// 2. HQ root articles (article-*.html)
for (const f of readdirSync(WORKSPACE)) {
  if (f.startsWith('article-') && f.endsWith('.html')) files.push(join(WORKSPACE, f));
}

// 3. HQ articles/ dir (exclude index.html)
const hqDir = join(WORKSPACE, 'articles');
if (existsSync(hqDir)) {
  for (const f of readdirSync(hqDir)) {
    if (!f.endsWith('.html') || f === 'index.html') continue;
    files.push(join(hqDir, f));
  }
}

const report = { changed: [], already: [], unchanged: [] };
for (const f of files) {
  if (!existsSync(f)) continue;
  const orig = readFileSync(f, 'utf-8');
  if (orig.includes(MARKER)) { report.already.push(f); skipped++; continue; }
  const res = inject(orig);
  if (res.changed) {
    writeFileSync(f, res.html);
    report.changed.push(`${res.dark ? 'D' : 'L'} ${f}`);
    changed++;
  } else {
    report.unchanged.push(f);
  }
  processed++;
}

console.log(`Processed ${processed} files, changed ${changed}, already had promo ${skipped}, unchanged ${report.unchanged.length}`);
console.log(`\n=== CHANGED (${report.changed.length}) ===`);
for (const f of report.changed) console.log(`  ${f}`);
if (report.unchanged.length) {
  console.log(`\n=== UNCHANGED (no </body> or non-article) ===`);
  for (const f of report.unchanged) console.log(`  ${f}`);
}
console.log(`\n=== ALREADY HAD PROMO (${report.already.length}) ===`);
for (const f of report.already) console.log(`  ${f}`);
