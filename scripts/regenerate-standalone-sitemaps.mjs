#!/usr/bin/env node
/**
 * Regenerate sitemaps for thomson-reserve-direct-developer.com and
 * loyangvalleyresidences-official.com from actual FTP file listings.
 * Ensures every article/page is included; skips junk files.
 */

import { execSync } from 'child_process';
import { writeFileSync } from 'fs';

const SITES = [
  {
    name: 'thomson',
    domain: 'thomson-reserve-direct-developer.com',
    ftpUser: 'u851958941.thomson-reserve-direct-developer.com',
    ftpPass: 'Thomson12345&',
    core: [
      { path: '/', pri: '1.0', freq: 'weekly' },
      { path: '/articles/', pri: '0.9', freq: 'weekly' },
      { path: '/mortgage-calculator.html', pri: '0.9', freq: 'monthly' },
    ],
    skip: ['(1).html'],
  },
  {
    name: 'loyang',
    domain: 'loyangvalleyresidences-official.com',
    ftpUser: 'u851958941.loyangvalleyresidences-official.com',
    ftpPass: 'Loyang12345&',
    core: [
      { path: '/', pri: '1.0', freq: 'weekly' },
      { path: '/articles/', pri: '0.9', freq: 'weekly' },
      { path: '/mortgage-calculator.html', pri: '0.9', freq: 'monthly' },
      { path: '/crl.html', pri: '0.7', freq: 'monthly' },
    ],
    skip: [],
  },
];

const today = new Date().toISOString().slice(0, 10);

function listFtp(site) {
  const cmd = `curl -s --user "${site.ftpUser}:${site.ftpPass}" "ftp://191.101.228.66/articles/" --max-time 30`;
  const out = execSync(cmd, { encoding: 'utf-8', maxBuffer: 2 * 1024 * 1024 });
  return out.split('\n').map(l => l.trim().split(/\s+/).pop()).filter(f => f.endsWith('.html'));
}

function buildSitemap(site) {
  const files = listFtp(site).filter(f => !site.skip.includes(f) && !/^index/.test(f));
  const lines = [];
  lines.push('<?xml version="1.0" encoding="UTF-8"?>');
  lines.push('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');

  for (const c of site.core) {
    lines.push(`  <url>\n    <loc>https://${site.domain}${c.path}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>${c.freq}</changefreq>\n    <priority>${c.pri}</priority>\n  </url>`);
  }

  lines.push('\n  <!-- Articles -->');
  for (const f of files) {
    lines.push(`  <url>\n    <loc>https://${site.domain}/articles/${f}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.8</priority>\n  </url>`);
  }

  lines.push('</urlset>');
  return lines.join('\n') + '\n';
}

for (const site of SITES) {
  const sitemap = buildSitemap(site);
  const tmp = `/tmp/${site.name}-sitemap-new.xml`;
  writeFileSync(tmp, sitemap);

  const cmd = `curl -s -T ${tmp} "ftp://191.101.228.66/sitemap.xml" --user "${site.ftpUser}:${site.ftpPass}" -o /dev/null -w "%{http_code}" --connect-timeout 15 --max-time 90`;
  const code = execSync(cmd, { encoding: 'utf-8', maxBuffer: 1024 * 1024 }).trim();
  console.log(`${site.name}: uploaded ${code} | ${sitemap.split('\n').filter(l => l.includes('<loc>')).length} URLs`);
}
