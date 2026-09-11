#!/usr/bin/env node
/**
 * Add Article + FAQPage JSON-LD schema to ALL articles on
 * thomson-reserve-direct-developer.com and loyangvalleyresidences-official.com.
 *
 * Extracts FAQ Q&As from existing <p class="faq-q"> markup, injects schema
 * into <head>, uploads via FTP.
 */

import { execSync } from 'child_process';
import { writeFileSync, readFileSync, existsSync } from 'fs';

const SITES = {
  thomson: {
    domain: 'thomson-reserve-direct-developer.com',
    ftpUser: 'u851958941.thomson-reserve-direct-developer.com',
    ftpPass: 'Thomson12345&',
    articles: readFileSync('/tmp/thomson-files.txt', 'utf-8').split('\n').filter(Boolean),
  },
  loyang: {
    domain: 'loyangvalleyresidences-official.com',
    ftpUser: 'u851958941.loyangvalleyresidences-official.com',
    ftpPass: 'Loyang12345&',
    articles: readFileSync('/tmp/loyang-files.txt', 'utf-8').split('\n').filter(Boolean),
  },
};

function sh(cmd) {
  return execSync(cmd, { encoding: 'utf-8', maxBuffer: 4 * 1024 * 1024 });
}

function esc(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function extractFaqs(html) {
  // Match <p class="faq-q">Question</p>\n<p>Answer</p>
  const faqs = [];
  const re = /<p class="faq-q">([\s\S]*?)<\/p>\s*<p>([\s\S]*?)<\/p>/g;
  let m;
  while ((m = re.exec(html)) !== null) {
    const q = m[1].replace(/<[^>]+>/g, '').trim();
    const a = m[2].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
    if (q && a) faqs.push({ q, a });
  }
  return faqs;
}

function injectSchema(html, url, title, description, faqs) {
  // Only inject if not already present
  if (html.includes('"@type":"Article"') || html.includes('"@type": "Article"')) {
    return { html, injected: false };
  }

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description,
    url,
    author: { '@type': 'Person', name: 'Jet Lee' },
    publisher: { '@type': 'Organization', name: 'Jet Lee Property', url: 'https://jetleechannel.sg' },
    datePublished: new Date().toISOString().split('T')[0],
    dateModified: new Date().toISOString().split('T')[0],
    mainEntityOfPage: url,
  };

  let schemas = `<script type="application/ld+json">\n${JSON.stringify(articleSchema, null, 2)}\n</script>`;

  if (faqs.length > 0) {
    const faqSchema = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqs.map(f => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.a },
      })),
    };
    schemas += `\n<script type="application/ld+json">\n${JSON.stringify(faqSchema, null, 2)}\n</script>`;
  }

  // Insert before </head>
  const idx = html.lastIndexOf('</head>');
  if (idx < 0) return { html, injected: false };
  html = html.slice(0, idx) + schemas + '\n' + html.slice(idx);
  return { html, injected: true };
}

function upload(file, site, remoteName) {
  const cmd = `curl -s -T "${file}" "ftp://191.101.228.66/articles/${remoteName}" --user "${site.ftpUser}:${site.ftpPass}" -o /dev/null -w "%{http_code}" --connect-timeout 15 --max-time 90`;
  try {
    return execSync(cmd, { encoding: 'utf-8', maxBuffer: 1024 * 1024 }).trim();
  } catch (e) { return 'ERR'; }
}

for (const [siteName, site] of Object.entries(SITES)) {
  let ok = 0, skip = 0, fail = 0;
  for (const article of site.articles) {
    const url = `https://${site.domain}/articles/${article}`;
    try {
      const html = sh(`curl -s "${url}" --max-time 25`);
      if (!html || !html.includes('<head>')) { console.log(`✗ ${article}: fetch failed`); fail++; continue; }

      // Extract title/description
      const title = (html.match(/<title>([^<]*)<\/title>/) || [])[1] || '';
      const desc = (html.match(/<meta name="description" content="([^"]*)"/) || [])[1] || '';

      const faqs = extractFaqs(html);
      const { html: newHtml, injected } = injectSchema(html, url, title, desc, faqs);
      if (!injected) { console.log(`• ${article}: already has schema`); skip++; continue; }

      const tmp = `/tmp/schema-${siteName}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}.html`;
      writeFileSync(tmp, newHtml);
      const code = upload(tmp, site, article);
      if (code === '226') { ok++; console.log(`✓ ${article}: schema added (${faqs.length} FAQs)`); }
      else { console.log(`✗ ${article}: upload ${code}`); fail++; }
    } catch (e) {
      console.log(`✗ ${article}: ${e.message}`); fail++;
    }
  }
  console.log(`\n${siteName}: ${ok} added, ${skip} already, ${fail} failed\n`);
}
