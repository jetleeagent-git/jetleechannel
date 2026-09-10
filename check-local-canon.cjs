const fs = require('fs');
const dirs = fs.readdirSync('.').filter(d => d.endsWith('_articles') || d === 'loyang-articles' || d === 'thomson-articles' || d === 'thesen_articles' || d === 'narraresidences-articles');
for (const d of dirs) {
  const files = fs.readdirSync(d).filter(f => f.endsWith('.html') && f !== 'index.html');
  for (const f of files) {
    const html = fs.readFileSync(`${d}/${f}`, 'utf8');
    const m = html.match(/<link\s+rel="canonical"[^>]*href="([^"]+)"/i);
    if (!m) { console.log(`❌ NO CANON | ${d}/${f}`); continue; }
    const canon = m[1];
    const expectedBase = canon.match(/^https?:\/\/[^/]+/)[0];
    // check canonical domain matches the site's domain
    if (d === 'loyang-articles' && !canon.includes('loyangvalleyresidences-official.com')) console.log(`⚠️ LOYANG WRONG DOMAIN | ${d}/${f} -> ${canon}`);
    if (d === 'thomson-articles' && !canon.includes('thomson-reserve-direct-developer.com')) console.log(`⚠️ THOMSON WRONG DOMAIN | ${d}/${f} -> ${canon}`);
    if (d.endsWith('_articles') && !canon.includes('jetleechannel.sg')) console.log(`⚠️ HQ WRONG DOMAIN | ${d}/${f} -> ${canon}`);
    // check self-canonical: last path segment should match filename
    const seg = canon.split('/').pop();
    if (seg && seg !== f && !seg.includes('articles')) console.log(`⚠️ CANON MISMATCH | ${d}/${f} -> ${canon}`);
  }
}
console.log('done');
