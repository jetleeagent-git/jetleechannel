#!/usr/bin/env node
/**
 * Fix remaining nav-top "Back to Property Blog" links in project article copies.
 * Each copy's project slug is derived from the dir name.
 */
import { readFileSync, writeFileSync } from 'fs';
import { execSync } from 'child_process';
import { join } from 'path';

const WORKSPACE = '/home/ubuntu/.openclaw/workspace';

const NAMES = {
  hudsonplace: 'Hudson Place',
  hougangcentral: 'Hougang Central',
  unionsquare: 'Union Square',
  amberwood: 'Amberwood',
  lucernegrand: 'Lucerne Grand',
  elta: 'ELTA',
  OneMarinaGardens: 'One Marina Gardens',
  'generations-tannery': 'Generations @ Tannery',
  dunearnhouse: 'Dunearn House',
  arcady: 'The Arcady',
  'lentor-gardens': 'Lentor Gardens',
  thesen: 'The Sen @ Upper Bukit Timah',
  TheSierra: 'The Serra Residences',
  TheOrie: 'The Orie',
  SophiaMeadow: 'Sophia Meadow',
  bagnallhous: 'Bagnall Haus',
  zyongrand: 'ZYON Grand',
  promenadepeak: 'Promenade Peak',
  rivergreen: 'River Green',
  newportresidences: 'Newport Residences',
  BelgraviaAce: 'Belgravia Ace',
};

const dirs = execSync(`ls -d ${WORKSPACE}/*_articles/`, { encoding: 'utf-8' }).trim().split('\n');
for (const dir of dirs) {
  const slug = dir.split('/').filter(Boolean).pop().replace('_articles', '');
  const name = NAMES[slug];
  if (!name) continue;
  const files = execSync(`ls ${dir}/*.html 2>/dev/null`, { encoding: 'utf-8' }).trim().split('\n').filter(Boolean);
  for (const f of files) {
    let html = readFileSync(f, 'utf-8');
    const orig = html;
    // nav-top style: <p class="nav-top"><a href="https://jetleechannel.sg/blog.html">&larr; Back to Property Blog</a></p>
    html = html.replace(
      /<p class="nav-top"><a href="https:\/\/jetleechannel\.sg\/blog\.html">[^<]*<\/a><\/p>/g,
      `<p class="nav-top"><a href="https://jetleechannel.sg/${slug}/">&larr; Back to ${name}</a></p>`
    );
    // back-link style variants
    html = html.replace(
      /<a href="https:\/\/jetleechannel\.sg\/blog\.html" class="back-link">[^<]*<\/a>/g,
      `<a href="https://jetleechannel.sg/${slug}/" class="back-link">&larr; Back to ${name}</a>`
    );
    html = html.replace(
      /<a href="\/blog\.html" class="back-link">[^<]*<\/a>/g,
      `<a href="https://jetleechannel.sg/${slug}/" class="back-link">&larr; Back to ${name}</a>`
    );
    if (html !== orig) {
      writeFileSync(f, html);
      console.log(`  ✅ ${slug}/${f.split('/').pop()}`);
    }
  }
}
console.log('Done.');
