import fs from 'fs';
import path from 'path';

// Map local dir -> live URL prefix
const dirMap = {
  'amberwood_articles': 'amberwood',
  'hudsonplace_articles': 'hudsonplace',
  'hougangcentral_articles': 'hougangcentral',
  'OneMarinaGardens_articles': 'OneMarinaGardens',
  'unionsquare_articles': 'unionsquare',
  'generations-tannery_articles': 'generations-tannery',
  'thesen_articles': 'thesen',
};

// Files needing canonical per dir (verified MISSING + live)
const targets = [
  ['amberwood_articles', 'article-amberwood-gcb-enclave.html'],
  ['amberwood_articles', 'article-d10-generational-wealth.html'],
  ['amberwood_articles', 'article-quiet-luxury-trend.html'],
  ['hudsonplace_articles', 'article-absd-guide-2026.html'],
  ['hudsonplace_articles', 'article-absd-timing-trap.html'],
  ['hudsonplace_articles', 'article-top-new-launches-2026.html'],
  ['hougangcentral_articles', 'article-absd-guide-2026.html'],
  ['hougangcentral_articles', 'article-top-new-launches-2026.html'],
  ['OneMarinaGardens_articles', 'article-omg-record-3290.html'],
  ['unionsquare_articles', 'article-absd-guide-2026.html'],
  ['unionsquare_articles', 'article-top-new-launches-2026.html'],
  ['generations-tannery_articles', 'article-absd-guide-2026.html'],
  ['generations-tannery_articles', 'article-top-new-launches-2026.html'],
  ['thesen_articles', 'article-hdb-waitout-removed.html'],
];

let done = 0;
for (const [dir, file] of targets) {
  const p = path.join(dir, file);
  if (!fs.existsSync(p)) { console.log('SKIP (no file):', p); continue; }
  let s = fs.readFileSync(p, 'utf8');
  const url = `https://jetleechannel.sg/${dirMap[dir]}/articles/${file}`;
  // Skip if canonical already exists
  if (/<link\s+rel="canonical"/i.test(s)) { console.log('SKIP (has canon):', p); continue; }
  // Insert after <head> or before </head>
  const canonical = `  <link rel="canonical" href="${url}">\n`;
  if (s.includes('</head>')) {
    s = s.replace('</head>', canonical + '</head>');
  } else {
    // insert after <meta charset...>
    s = s.replace(/<meta charset="[^"]*">/, '$&\n' + canonical);
  }
  fs.writeFileSync(p, s);
  console.log('✅', p, '->', url);
  done++;
}
console.log('Done. Added:', done);
