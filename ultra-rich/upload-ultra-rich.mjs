#!/usr/bin/env node
/**
 * Upload ultra-rich article + updated index pages:
 * - HQ/upperhouse/amberwood → main jetleechannel.sg FTP
 * - thomson → thomson-reserve-direct-developer.com FTP
 */
import { execSync } from 'child_process';

const MAIN = { host: '191.101.228.66', user: 'u851958941.jetleechannel.sg', pass: 'Jetleechannel12345&' };
const THOMSON = { host: '191.101.228.66', user: 'u851958941.thomson-reserve-direct-developer.com', pass: 'Thomson12345&' };

const files = [
  // [local, remote, ftp]
  ['articles/article-ultra-rich-buy-property.html', 'articles/article-ultra-rich-buy-property.html', MAIN],
  ['articles/index.html', 'articles/index.html', MAIN],
  ['upperhouse_articles/article-ultra-rich-buy-property.html', 'upperhouse/articles/article-ultra-rich-buy-property.html', MAIN],
  ['upperhouse_articles/index.html', 'upperhouse/articles/index.html', MAIN],
  ['amberwood_articles/article-ultra-rich-buy-property.html', 'amberwood/articles/article-ultra-rich-buy-property.html', MAIN],
  ['amberwood_articles/index.html', 'amberwood/articles/index.html', MAIN],
  ['thomson-articles/article-ultra-rich-buy-property.html', 'articles/article-ultra-rich-buy-property.html', THOMSON],
  ['thomson-articles/index.html', 'articles/index.html', THOMSON],
];

function ftpUpload(localPath, remotePath, ftp) {
  const cmd = `curl -s -T "${localPath}" "ftp://${ftp.host}/${remotePath}" --user "${ftp.user}:${ftp.pass}" -o /dev/null -w "%{http_code}" --max-time 60 2>/dev/null`;
  try { return execSync(cmd, { encoding: 'utf-8', maxBuffer: 1024 * 1024 }).trim(); }
  catch (e) { return 'ERR'; }
}

let ok = 0;
for (const [local, remote, ftp] of files) {
  const code = ftpUpload(local, remote, ftp);
  const label = `${ftp === MAIN ? 'MAIN' : 'THOMSON'} /${remote}`;
  if (code === '226' || code === '200') { console.log(`✅ ${label}`); ok++; }
  else { console.log(`❌ ${label} => ${code}`); }
}
console.log(`\n${ok}/${files.length} uploaded`);
