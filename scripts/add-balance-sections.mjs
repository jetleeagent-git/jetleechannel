#!/usr/bin/env node
/**
 * One-time injection: add Balance Units section to the 11 sites that
 * don't have one yet. Inserts before the FAQ section using the shared
 * builder so the daily updater can refresh it in place.
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { buildBalanceSection, todayStr } from './balance-section-builder.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const WORKSPACE = join(__dirname, '..');

const SITES = [
  { key: 'elta', file: 'site-elta.html', ftpDir: 'elta', family: 'elta', sub: 'Live availability from developer. Updated daily.' },
  { key: 'dunearnhouse', file: 'site-dunearnhouse.html', ftpDir: 'dunearnhouse', family: 'bagnall', sub: 'Live availability from developer. Updated daily.' },
  { key: 'arcady', file: 'site-arcady.html', ftpDir: 'arcady', family: 'bagnall', sub: 'Live availability from developer. Updated daily.' },
  { key: 'hudsonplace', file: 'site-hudsonplace.html', ftpDir: 'hudsonplace', family: 'hudson', sub: 'Live availability from developer. Updated daily.' },
  { key: 'lentor-gardens', file: 'site-lentorgardens.html', ftpDir: 'lentor-gardens', family: 'bagnall', sub: 'Live availability from developer. Updated daily.' },
  { key: 'OneMarinaGardens', file: 'site-onemarinagarden.html', ftpDir: 'OneMarinaGardens', family: 'gold-stg', sub: 'Live availability from developer. Updated daily.' },
  { key: 'unionsquare', file: 'site-unionsquare.html', ftpDir: 'unionsquare', family: 'bagnall', sub: 'Live availability from developer. Updated daily.' },
  { key: 'narraresidences', file: 'narraresidences/index.html', ftpDir: 'narraresidences', family: 'gold-stg', accent: '#8BC34A', sub: 'Live availability from developer. Updated daily.' },
  { key: 'velabay', file: 'velabay/index.html', ftpDir: 'velabay', family: 'bagnall', sub: 'Live availability from developer. Updated daily.' },
  { key: 'thesen', file: 'thesen/index.html', ftpDir: 'thesen', family: 'gold-stg', sub: 'Live availability from developer. Updated daily.' },
  { key: 'thecontinuum', file: 'site-thecontinuum.html', ftpDir: 'thecontinuum', family: 'continuum', sub: 'Live availability from developer. Updated daily.' },
];

// Placeholder rows (updater fills real data)
const PLACEHOLDER = [{ type: '—', units: '—' }];

function main() {
  const date = todayStr();
  for (const cfg of SITES) {
    const file = join(WORKSPACE, cfg.file);
    if (!existsSync(file)) { console.error(`✗ ${cfg.key}: ${cfg.file} not found`); continue; }
    let html = readFileSync(file, 'utf-8');

    if (html.includes('<!-- BALANCE UNITS -->')) {
      console.log(`• ${cfg.key}: already has balance section — skipping`);
      continue;
    }

    const section = buildBalanceSection(cfg, PLACEHOLDER, `Current Balance · as of ${date}`);
    let anchor = '<section id="faq"';
    let faqIdx = html.indexOf(anchor);
    if (faqIdx < 0) {
      anchor = '<section class="cta-section" id="contact"';
      faqIdx = html.indexOf(anchor);
    }
    if (faqIdx < 0) { console.error(`✗ ${cfg.key}: no FAQ/contact anchor`); continue; }

    html = html.slice(0, faqIdx) + '\n' + section + '\n' + html.slice(faqIdx);
    writeFileSync(file, html, 'utf-8');
    console.log(`✓ ${cfg.key}: balance section injected before FAQ (${file})`);
  }
}

main();
