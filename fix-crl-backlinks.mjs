#!/usr/bin/env node
/**
 * Fix CRL article back links: "Back to X Articles" → "Back to X" (project homepage).
 */
import { execSync } from 'child_process';

const FTP_HOST = '191.101.228.66';
const FTP_USER = 'u851958941.jetleechannel.sg';
const FTP_PASS = 'Jetleechannel12345&';

const FIXES = [
  { path: 'elta/articles/crl-phase-2-clementi.html', from: 'https://jetleechannel.sg/elta/articles/', label: 'Back to ELTA Articles', to: 'https://jetleechannel.sg/elta/', newLabel: 'Back to ELTA' },
  { path: 'lucernegrand/articles/crl-phase-3-jurong.html', from: 'https://jetleechannel.sg/lucernegrand/articles/', label: 'Back to Lucerne Grand Articles', to: 'https://jetleechannel.sg/lucernegrand/', newLabel: 'Back to Lucerne Grand' },
  { path: 'hougangcentral/articles/crl-phase-1-defu.html', from: 'https://jetleechannel.sg/hougangcentral/articles/', label: 'Back to Hougang Central Articles', to: 'https://jetleechannel.sg/hougangcentral/', newLabel: 'Back to Hougang Central' },
];

for (const fx of FIXES) {
  const tmp = `/tmp/${fx.path.replace(/\//g, '_')}`;
  // Download
  execSync(`curl -s "https://jetleechannel.sg/${fx.path}" --max-time 30 -o "${tmp}"`, { encoding: 'utf-8', maxBuffer: 5 * 1024 * 1024 });
  // Replace in file via perl for safety
  execSync(
    `perl -pi -e 's|${fx.from}|${fx.to}|g; s|${fx.label}|${fx.newLabel}|g' "${tmp}"`,
    { encoding: 'utf-8', maxBuffer: 1024 * 1024 }
  );
  // Upload
  const code = execSync(
    `curl -s -T "${tmp}" "ftp://${FTP_HOST}/${fx.path}" --user "${FTP_USER}:${FTP_PASS}" -o /dev/null -w "%{http_code}" --max-time 60 2>/dev/null`,
    { encoding: 'utf-8', maxBuffer: 1024 * 1024 }
  ).trim();
  console.log(`  ${fx.path}: ${code}`);
  execSync(`rm -f "${tmp}"`);
}
console.log('Done.');
