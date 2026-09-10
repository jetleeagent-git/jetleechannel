#!/usr/bin/env node
/**
 * Swap Gallery nav item → Balance Units (#pricing) on all 19 sites.
 * - 8 dir-based sites (already have Balance Units nav item): remove the
 *   standalone <li> Gallery nav entry.
 * - 11 new sites: relabel nav Gallery link → "Balance Units" pointing #pricing.
 * Gallery SECTION stays on the page (only the nav entry changes).
 * Hero/CTA/footer links to gallery stay untouched (user said nav only).
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const WORKSPACE = join(__dirname, '..');

const SITES = [
  // dir-based: already have #pricing nav item → remove gallery <li>
  { file: 'bagnallhous/index.html', mode: 'remove' },
  { file: 'theorie/index.html', mode: 'remove' },
  { file: 'upperhouse/index.html', mode: 'remove' },
  { file: 'promenadepeak/index.html', mode: 'remove' },
  { file: 'zyongrand/index.html', mode: 'remove' },
  { file: 'rivergreen/index.html', mode: 'remove' },
  { file: 'newportresidences/index.html', mode: 'remove' },
  { file: 'sophiameadow/index.html', mode: 'remove' },
  // single-file: relabel nav gallery → balance units
  { file: 'site-elta.html', mode: 'relabel', anchor: '#gallery' },
  { file: 'site-dunearnhouse.html', mode: 'relabel', anchor: '#gallery' },
  { file: 'site-hudsonplace.html', mode: 'relabel', anchor: '#gal' },
  { file: 'site-lentorgardens.html', mode: 'relabel', anchor: '#gallery' },
  { file: 'site-onemarinagarden.html', mode: 'relabel', anchor: '#gal' },
  { file: 'site-unionsquare.html', mode: 'relabel', anchor: '#gallery' },
  { file: 'narraresidences/index.html', mode: 'relabel', anchor: '#gal' },
  { file: 'thesen/index.html', mode: 'relabel', anchor: '#gal' },
  { file: 'site-thecontinuum.html', mode: 'relabel', anchor: '#gallery' },
];

function main() {
  for (const cfg of SITES) {
    const file = join(WORKSPACE, cfg.file);
    if (!existsSync(file)) { console.error(`✗ ${cfg.file} not found`); continue; }
    let html = readFileSync(file, 'utf-8');
    let changed = false;

    if (cfg.mode === 'remove') {
      // Remove nav <li> pointing to gallery/floorplans section anchors
      // Patterns: <li><a href="#gallery">Gallery</a></li>
      const re = /<li><a href="#gallery">Gallery<\/a><\/li>\s*/;
      if (re.test(html)) {
        html = html.replace(re, '');
        changed = true;
      }
    } else if (cfg.mode === 'relabel') {
      const anchor = cfg.anchor;
      // Nav links (li items or nav <a>): replace href + text
      // Pattern 1: <li><a href="#gallery">Gallery</a></li>
      let re = new RegExp(`<li><a href="${anchor}">Gallery</a></li>`, 'g');
      if (re.test(html)) {
        html = html.replace(re, `<li><a href="#pricing">Balance Units</a></li>`);
        changed = true;
      }
      // Pattern 2: <a href="#gal" onclick="hmT()">Gallery</a> (hudson mobile)
      re = new RegExp(`<a href="${anchor}" onclick="hmT\\(\\)">Gallery</a>`, 'g');
      if (re.test(html)) {
        html = html.replace(re, `<a href="#pricing" onclick="hmT()">Balance Units</a>`);
        changed = true;
      }
      // Pattern 3: continuum <a href="#gallery" onclick="...remove('open')">Gallery</a>
      re = new RegExp(`<a href="${anchor}" onclick="document\\.getElementById\\('navLinks'\\)\\.classList\\.remove\\('open'\\)">Gallery</a>`, 'g');
      if (re.test(html)) {
        html = html.replace(re, `<a href="#pricing" onclick="document.getElementById('navLinks').classList.remove('open')">Balance Units</a>`);
        changed = true;
      }
    }

    if (changed) {
      writeFileSync(file, html, 'utf-8');
      console.log(`✓ ${cfg.file}: nav updated`);
    } else {
      console.log(`• ${cfg.file}: no nav change needed`);
    }
  }
}

main();
