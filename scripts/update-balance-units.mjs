#!/usr/bin/env node
/**
 * Daily Balance Units Auto-Update for all jetleechannel.sg project sites
 * =====================================================================
 * Scrapes balance unit availability from the ecoprop/singmap API
 * (same source as share.ecoprop.com/{Project}/R007613B) and updates
 * the "Current Balance" table + "as of" date on each site's index.html,
 * then uploads to jetleechannel.sg FTP.
 *
 * Sites covered (all on main jetleechannel.sg FTP):
 *   bagnallhous, TheOrie, upperhouse, promenadepeak, zyongrand,
 *   rivergreen, newportresidences, sophiameadow (dir-based sites)
 *   elta, dunearnhouse, arcady, hudsonplace, lentor-gardens,
 *   OneMarinaGardens, unionsquare, narraresidences, velabay,
 *   thesen, thecontinuum (single-file site-*.html sites)
 *
 * Grand Dunman is handled separately by scripts/update-granddunman.mjs
 * (different site structure + its own reference page).
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import { createHash } from 'crypto';

const __dirname = dirname(fileURLToPath(import.meta.url));
const WORKSPACE = join(__dirname, '..');
const STATE_FILE = join(WORKSPACE, 'balance-units', '.last-state.json');

// --- API Config (from ecoprop share app) ---
const SECRET = 'c1d65f3667324592a071ebec5038f38c';
const BASE = 'https://api.singmap.com';
const AGENT_ID = '52c577d8165b40d8a1c64348a5f216c7';

// --- FTP Config (main account — all sites live here) ---
const FTP_HOST = '191.101.228.66';
const FTP_USER = 'u851958941.jetleechannel.sg';
const FTP_PASS = 'Jetleechannel12345&';

// --- Sites: label → { projectId, ftpDir, displayMap } ---
// displayMap: API type name → pretty name shown on the site.
// Falls back to a normalized API name for unknown types.
const SITES = {
  bagnallhous: {
    projectId: 'd628a74456874b778432799fd9e53517',
    ftpDir: 'bagnallhous',
    displayMap: {
      '1BR + Flexi': '1BR + Flexi',
      '4BR': '4 Bedroom',
      '4BR + Flexi': '4BR + Flexi',
      '5BR': '5 Bedroom',
    },
  },
  TheOrie: {
    projectId: '23a0bd1f430c4d55a8bf6fd39fb177b8',
    localDir: 'theorie',
    ftpDir: 'TheOrie',
    displayMap: {
      '1 Bedroom + Study': '1 Bedroom + Study',
      '3 Bedroom Dual Key': '3 Bedroom Dual Key',
    },
  },
  upperhouse: {
    projectId: '7cf72256c81743dfba3986a927ef79e6',
    ftpDir: 'upperhouse',
    displayMap: {
      '1 Bedroom + Study': '1 Bedroom + Study',
      '2 Bedroom Premium': '2 Bedroom Premium',
      '4 Bedroom Suite (With Private Lift & Carpark Lot)': '4 Bedroom Suite (Private Lift)',
    },
  },
  promenadepeak: {
    projectId: '1917872113dc425797ca4239311a6ee3',
    ftpDir: 'promenadepeak',
    displayMap: {
      '1 BEDROOM + STUDY': '1 Bedroom + Study',
      '2 BEDROOM': '2 Bedroom',
      '2 BEDROOM + STUDY': '2 Bedroom + Study',
      '3 BEDROOM': '3 Bedroom',
      '3 BEDROOM PREMIUM (with Private Lift)': '3 Bedroom Premium (Private Lift)',
      '4 BEDROOM PREMIUM (with Private Lift)': '4 Bedroom Premium (Private Lift)',
      '5 BEDROOM PREMIUM (with Private Lift)': '5 Bedroom Premium (Private Lift)',
    },
  },
  zyongrand: {
    projectId: 'a92578afb30f481ea19b4bf48fffb96b',
    ftpDir: 'zyongrand',
    displayMap: {
      '1 Bedroom + Study': '1 Bedroom + Study',
      '2 Bedroom Premium + Study': '2 Bedroom Premium + Study',
      '3 Bedroom': '3 Bedroom',
      '4 Bedroom Supreme + Study (With Private Lift)': '4 Bedroom Supreme + Study',
      '5 Bedroom Supreme (With Private Lift)': '5 Bedroom Supreme',
      'Penthouse (5 Bedroom With Private Lift)': 'Penthouse (5BR + Private Lift)',
    },
  },
  rivergreen: {
    projectId: '26c7f1c04dfa4e7eba1a830c9cd0b3ab',
    ftpDir: 'rivergreen',
    displayMap: {
      '1 Bedroom': '1 Bedroom',
      '1 Bedroom + Study': '1 Bedroom + Study',
      '2 Bedroom (Premium)': '2 Bedroom (Premium)',
      '2 Bedroom + Study': '2 Bedroom + Study',
      '3 Bedroom': '3 Bedroom',
    },
  },
  newportresidences: {
    projectId: '89abbcafcb6d4b85a543d4131a5148fb',
    ftpDir: 'newportresidences',
    displayMap: {
      '1 Bedroom': '1 Bedroom',
      '1 Bedroom + Study': '1 Bedroom + Study',
      '3 Bedroom': '3 Bedroom',
      '3 Bedroom Premium': '3 Bedroom Premium',
      '4 Bedroom Premium': '4 Bedroom Premium',
      'Super Penthouse': 'Super Penthouse',
    },
  },
  sophiameadow: {
    projectId: 'eadec74ff2a84a8eb85de08de5bb4664',
    ftpDir: 'SophiaMeadow',
    totalLabel: 'Total',
    displayMap: {
      '1 Bedroom': '1 Bedroom',
      '1 Bedroom + Study': '1 Bedroom + Study',
      '2 Bedroom': '2 Bedroom',
      '3 Bedroom': '3 Bedroom',
    },
  },
  // --- single-file sites (site-*.html in workspace root) ---
  elta: {
    projectId: '88a853a0ae6443749b7e5f957b8e6480',
    file: 'site-elta.html',
    ftpDir: 'elta',
    displayMap: {
      '1 BEDROOM + STUDY': '1 Bedroom + Study',
      '2 BEDROOM + STUDY': '2 Bedroom + Study',
      '3 BEDROOM': '3 Bedroom',
      '4 BEDROOM': '4 Bedroom',
      '4 BEDROOM + STUDY': '4 Bedroom + Study',
      '4 BEDROOM DUAL KEY': '4 Bedroom Dual Key',
      '4 BEDROOM PREMIUM': '4 Bedroom Premium',
      '5 BEDROOM': '5 Bedroom',
    },
  },
  dunearnhouse: {
    projectId: '700527d89a91474a8887269b36cb1642',
    file: 'site-dunearnhouse.html',
    ftpDir: 'dunearnhouse',
    displayMap: {
      '2 Bedroom': '2 Bedroom',
      '2 Bedroom + Study': '2 Bedroom + Study',
      '2 Bedroom Premium': '2 Bedroom Premium',
      '3 Bedroom + Study': '3 Bedroom + Study',
      '3 Bedroom Premium': '3 Bedroom Premium',
      '4 Bedroom': '4 Bedroom',
      '4 Bedroom Premium': '4 Bedroom Premium',
      '4 Bedroom Premium + Study': '4 Bedroom Premium + Study',
    },
  },
  arcady: {
    projectId: '81f063c801ef487f8a695b825e20c30c',
    file: 'site-arcady.html',
    ftpDir: 'arcady',
    displayMap: {
      '1 Bedroom + Study': '1 Bedroom + Study',
      '2 Bedroom': '2 Bedroom',
      '2 Bedroom + Study': '2 Bedroom + Study',
      '3 Bedroom Premium': '3 Bedroom Premium',
      '3 Bedroom Premium + Study': '3 Bedroom Premium + Study',
      'PentHouse': 'Penthouse',
    },
  },
  hudsonplace: {
    projectId: 'e80c8fc512304bd7b7969fcf96b00048',
    file: 'site-hudsonplace.html',
    ftpDir: 'hudsonplace',
    displayMap: {
      '2 BEDROOM PREMIUM': '2 Bedroom Premium',
      '2 BEDROOM PREMIUM + STUDY': '2 Bedroom Premium + Study',
      '3 BEDROOM PREMIUM': '3 Bedroom Premium',
      '3 BEDROOM PREMIUM + STUDY': '3 Bedroom Premium + Study',
      '4 BEDROOM SUITE + FLEXI': '4 Bedroom Suite + Flexi',
      '5BR + Entertainment Room + Flexi': '5BR + Entertainment Room + Flexi',
      '5BR + Study': '5BR + Study',
      '6BR + Entertainment rm + pte lift': '6BR + Entertainment Room + Private Lift',
    },
  },
  'lentor-gardens': {
    projectId: '02a030d8f3ca4ed1b2093e94e3b31115',
    file: 'site-lentorgardens.html',
    ftpDir: 'lentor-gardens',
    displayMap: {
      '2 BEDROOM + STUDY': '2 Bedroom + Study',
      '2 BEDROOM PREMIUM': '2 Bedroom Premium',
      '2 BEDROOM PREMIUM (HS)': '2 Bedroom Premium (HS)',
      '3 BEDROOM PREMIUM': '3 Bedroom Premium',
      '3 BEDROOM PREMIUM + STUDY': '3 Bedroom Premium + Study',
      '4 BEDROOM COMPACT': '4 Bedroom Compact',
      '4 BEDROOM PREMIUM': '4 Bedroom Premium',
      'STRATA TERRACE HOUSE': 'Strata Terrace House',
    },
  },
  OneMarinaGardens: {
    projectId: 'b1d78cceab4d4515a1ec7969ccda74b8',
    file: 'site-onemarinagarden.html',
    ftpDir: 'OneMarinaGardens',
    displayMap: {
      '2 Bedroom': '2 Bedroom',
      '3 Bedroom': '3 Bedroom',
      '3 Bedroom (Dual Key)': '3 Bedroom (Dual Key)',
      '3 Bedroom Premium': '3 Bedroom Premium',
      '4 Bedroom Premium': '4 Bedroom Premium',
    },
  },
  unionsquare: {
    projectId: '8799614909f948d280ad127a9f14360a',
    file: 'site-unionsquare.html',
    ftpDir: 'unionsquare',
    displayMap: {
      '1 Bedroom': '1 Bedroom',
      '1 Bedroom + Study': '1 Bedroom + Study',
      '2 Bedroom': '2 Bedroom',
      '2 Bedroom + Study': '2 Bedroom + Study',
      '4 Bedroom Premium': '4 Bedroom Premium',
      'Sky Suite': 'Sky Suite',
    },
  },
  narraresidences: {
    projectId: '030fee210b074a86a512f1f6cfaf62b6',
    file: 'narraresidences/index.html',
    ftpDir: 'narraresidences',
    displayMap: {
      '2 BEDROOM COMPACT': '2 Bedroom Compact',
      '2 BEDROOM PREMIUM': '2 Bedroom Premium',
      '2 BEDROOM with HS': "2 Bedroom + Helper's Room",
      '2 BEDROOM with HS & STUDY': "2 Bedroom + Helper's Room & Study",
      '2 BEDROOM with STUDY': '2 Bedroom + Study',
      '3 BEDROOM FLEXI': '3 Bedroom Flexi',
      '3 BEDROOM PREMIUM': '3 Bedroom Premium',
      '3 BEDROOM with STUDY': '3 Bedroom + Study',
      '4 BEDROOM COMPACT': '4 Bedroom Compact',
      '4 BEDROOM PREMIUM': '4 Bedroom Premium',
      '5 BEDROOM with PRIVATE LIFT': '5 Bedroom + Private Lift',
    },
  },
  velabay: {
    projectId: 'cf7d4684ea39448697222b2a7d7aeab6',
    file: 'velabay/index.html',
    ftpDir: 'velabay',
    displayMap: {
      '1 BEDROOM + STUDY': '1 Bedroom + Study',
      '2 BEDROOM': '2 Bedroom',
      '2 BEDROOM PREMIUM': '2 Bedroom Premium',
      '3 BEDROOM': '3 Bedroom',
      '3 BEDROOM PREMIUM': '3 Bedroom Premium',
      '4 BEDROOM': '4 Bedroom',
      '4 BEDROOM (PRIVATE LIFT)': '4 Bedroom (Private Lift)',
      '5 BEDROOM (PRIVATE LIFT)': '5 Bedroom (Private Lift)',
      'PENTHOUSE 2': 'Penthouse 2',
    },
  },
  thesen: {
    projectId: '70b9d30f47f5447da1d5c4252439fd26',
    file: 'thesen/index.html',
    ftpDir: 'thesen',
    displayMap: {
      '2 Bedroom': '2 Bedroom',
      '2 Bedroom + Study': '2 Bedroom + Study',
      '3 Bedroom': '3 Bedroom',
      '3 Bedroom + Study': '3 Bedroom + Study',
      '4 Bedroom + Study': '4 Bedroom + Study',
    },
  },
  thecontinuum: {
    projectId: 'f924f8d2afc64bfab4ba3b3b5bce5462',
    file: 'site-thecontinuum.html',
    ftpDir: 'thecontinuum',
    displayMap: {
      '4 BEDROOM PREMIER': '4 Bedroom Premier',
      '5 BEDROOM': '5 Bedroom',
    },
  },
  BelgraviaAce: {
    projectId: '6527d3d2d1724fdc965f655766848e9e',
    ftpDir: 'BelgraviaAce',
    displayMap: {
      'Semi-Detached': 'Semi-Detached',
    },
  },
  TheHillshore: {
    projectId: 'deac97981cbc41baab577f9cf9f03f33',
    localDir: 'TheHillshore',
    ftpDir: 'TheHillshore',
    displayMap: {
      '2 Bedroom': '2 Bedroom',
      '2 Bedroom Penthouse': '2 Bedroom Penthouse',
      '2 Bedroom Premium': '2 Bedroom Premium',
      '2 Bedroom Premium Penthouse': '2 Bedroom Premium Penthouse',
      '3 Bedroom': '3 Bedroom',
      '3 Bedroom Premium': '3 Bedroom Premium',
      '3 Bedroom Premium Penthouse': '3 Bedroom Premium Penthouse',
      '4 Bedroom (Dual Key)': '4 Bedroom (Dual Key)',
      '4 Bedroom Penthouse': '4 Bedroom Penthouse',
    },
  },
  thecolletive: {
    projectId: '03c7e19648714d9b88e7002ba6d4c0ec',
    localDir: 'thecolletive',
    ftpDir: 'theColletive',
    extraFiles: [{ local: 'price/index.html', remote: '/theColletive/price/index.html' }],
    displayMap: {
      'Studio': 'Studio',
      '1 Bed Suite': '1 Bedroom Suite',
      '1 Bed Premium': '1 Bedroom Premium',
      '1 Bed + Study': '1 Bedroom + Study',
      '2 Bed Deluxe': '2 Bedroom Deluxe',
      '2 Bed Deluxe + Study': '2 Bedroom Deluxe + Study',
      '2 Bed Premium': '2 Bedroom Premium',
      '2 Bed Premium + Study': '2 Bedroom Premium + Study',
      '3 Bed Premium': '3 Bedroom Premium',
      '3 Bed Luxury': '3 Bedroom Luxury',
    },
  },
};

// --- Sign params like the ecoprop app ---
function sign(params) {
  const excluded = ['file', 'appVer', 'mobileMode', 'appSource', 'token', 'keyword', 'signature'];
  const keys = Object.keys(params).filter(k => !excluded.includes(k)).sort();
  const raw = keys.map(k => params[k] ?? '').join('') + SECRET;
  return createHash('md5').update(raw, 'utf-8').digest('hex');
}

async function apiPost(path, params) {
  const body = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) body.append(k, v);
  body.append('signature', sign(params));
  const resp = await fetch(BASE + path, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Origin': 'https://share.ecoprop.com',
      'Referer': 'https://share.ecoprop.com/',
      'User-Agent': 'Mozilla/5.0 Chrome/125.0',
      'Accept': 'application/json, text/plain, */*',
    },
    body,
    signal: AbortSignal.timeout(30000),
  });
  if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
  return resp.json();
}

/** Fetch balance rows for one project. Returns [{type, units, minPrice, avgPsf}] */
async function fetchBalance(projectId) {
  const r = await apiPost('/app-service/unit/unitTypeReport', {
    projectId, agentId: AGENT_ID,
    appSource: 'share', appVer: '1.0', mobileMode: '', token: '',
  });
  if (!r || r.code !== '0' || !Array.isArray(r.datas)) {
    throw new Error(`unitTypeReport failed: ${JSON.stringify(r).slice(0, 200)}`);
  }
  return r.datas.map(d => ({
    type: String(d.type || '').trim(),
    units: parseInt(d.unitNum, 10) || 0,
    minPrice: d.min_price || '',
    avgPsf: d.avgPsf || '',
  }));
}

/** Normalize an unknown API type into a readable display name. */
function normalizeType(type) {
  return type
    .split(/\s+/)
    .map(w => {
      if (/^(and|with|the)$/i.test(w)) return w.toLowerCase();
      return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
    })
    .join(' ')
    .replace(/\(With Private Lift\)/g, '(Private Lift)')
    .replace(/\(with private lift\)/g, '(Private Lift)')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Build the <tbody> HTML for the balance table with display names. */
function buildTableRows(rows, siteCfg) {
  const displayMap = siteCfg.displayMap || {};
  const totalLabel = siteCfg.totalLabel || 'Current Available';
  const total = rows.reduce((s, r) => s + r.units, 0);
  const trs = rows.map(r => {
    const label = displayMap[r.type] || normalizeType(r.type);
    return `          <tr>
            <td>${label}</td>
            <td>${r.units}</td>
            <td>Available</td>
          </tr>`;
  }).join('\n');
  return `<tbody>
${trs}
          <tr class="total">
            <td>${totalLabel}</td>
            <td>${total} Units</td>
            <td>—</td>
          </tr>
        </tbody>`;
}

/** Update one site's index.html in place. Returns true if changed. */
function updateSiteHtml(site, rows, todayStr) {
  const cfg = SITES[site];
  const htmlFile = join(WORKSPACE, cfg.file || `${cfg.localDir || site}/index.html`);
  if (!existsSync(htmlFile)) {
    console.error(`  ⚠ ${site}: ${htmlFile} not found locally — skipping`);
    return false;
  }
  let html = readFileSync(htmlFile, 'utf-8');

  // 1. Replace the "as of" date
  const dateRe = /Current Balance · as of [^<]+</;
  if (!dateRe.test(html)) {
    console.error(`  ⚠ ${site}: date marker not found`);
    return false;
  }
  html = html.replace(dateRe, `Current Balance · as of ${todayStr}<`);

  // 2. Replace the <tbody> of the unit table (first table after BALANCE UNITS)
  const tbodyStart = html.indexOf('<tbody>', html.indexOf('BALANCE UNITS'));
  const tbodyEnd = html.indexOf('</tbody>', tbodyStart);
  if (tbodyStart < 0 || tbodyEnd < 0) {
    console.error(`  ⚠ ${site}: tbody not found`);
    return false;
  }
  html = html.slice(0, tbodyStart) + buildTableRows(rows, cfg) + html.slice(tbodyEnd + '</tbody>'.length);

  writeFileSync(htmlFile, html, 'utf-8');

  // 2b. Extra files (e.g. price page) — same date marker + tbody pattern
  for (const extra of cfg.extraFiles || []) {
    const extraFile = join(WORKSPACE, `${cfg.localDir || site}/${extra.local}`);
    if (!existsSync(extraFile)) {
      console.error(`  ⚠ ${site}: extra file ${extraFile} not found — skipping`);
      continue;
    }
    let xhtml = readFileSync(extraFile, 'utf-8');
    const xdateRe = /Current Balance · as of [^<]+</;
    if (xdateRe.test(xhtml)) {
      xhtml = xhtml.replace(xdateRe, `Current Balance · as of ${todayStr}<`);
    } else {
      console.error(`  ⚠ ${site}: extra file ${extra.local} date marker not found`);
    }
    const xStart = xhtml.indexOf('<tbody>', xhtml.indexOf('BALANCE UNITS'));
    const xEnd = xhtml.indexOf('</tbody>', xStart);
    if (xStart >= 0 && xEnd >= 0) {
      xhtml = xhtml.slice(0, xStart) + buildTableRows(rows, cfg) + xhtml.slice(xEnd + '</tbody>'.length);
      writeFileSync(extraFile, xhtml, 'utf-8');
      console.log(`  ✅ ${extra.local} table + date updated`);
    } else {
      console.error(`  ⚠ ${site}: extra file ${extra.local} tbody not found`);
    }
  }

  return true;
}

/** Upload index.html (and extraFiles) to FTP. */
async function uploadSite(site, ftpDir) {
  const cfg = SITES[site];
  const htmlFile = join(WORKSPACE, cfg.file || `${cfg.localDir || site}/index.html`);
  const remote = `/${ftpDir}/index.html`;
  const cmd = `curl -s -T "${htmlFile}" "ftp://${FTP_HOST}${remote}" --user "${FTP_USER}:${FTP_PASS}" --ftp-create-dirs -o /dev/null -w "%{http_code}" --connect-timeout 15 --max-time 90`;
  try {
    const code = execSync(cmd, { encoding: 'utf-8', maxBuffer: 1024 * 1024 }).trim();
    if (code !== '226') return false;
    for (const extra of cfg.extraFiles || []) {
      const extraFile = join(WORKSPACE, `${cfg.localDir || site}/${extra.local}`);
      const xcmd = `curl -s -T "${extraFile}" "ftp://${FTP_HOST}${extra.remote}" --user "${FTP_USER}:${FTP_PASS}" --ftp-create-dirs -o /dev/null -w "%{http_code}" --connect-timeout 15 --max-time 90`;
      const xcode = execSync(xcmd, { encoding: 'utf-8', maxBuffer: 1024 * 1024 }).trim();
      if (xcode !== '226') {
        console.error(`  ⚠ ${site}: extra file ${extra.remote} upload failed (${xcode})`);
      } else {
        console.log(`  ✅ ${extra.remote} uploaded`);
      }
    }
    return true;
  } catch (err) {
    console.error(`  FTP exec error: ${err.message}`);
    return false;
  }
}

/** Telegram notification (same as granddunman script). */
async function sendTelegram(message) {
  const TOKEN = process.env.TELEGRAM_BOT_TOKEN || "";
  const CHAT_ID = '87383567';
  const url = `https://api.telegram.org/bot${TOKEN}/sendMessage?chat_id=${CHAT_ID}&text=${encodeURIComponent(message)}`;
  try {
    const res = execSync(`curl -s -o /dev/null -w "%{http_code}" "${url}"`, { encoding: 'utf-8', maxBuffer: 1024 * 1024 }).trim();
    console.log(`  Telegram notify: HTTP ${res}`);
  } catch (err) {
    console.error('  Telegram notify failed:', err.message);
  }
}

// --- Main ---
async function main() {
  console.log(`\n=== Balance Units Auto-Update ===`);
  console.log(`Time: ${new Date().toLocaleString('en-SG', { timeZone: 'Asia/Singapore' })}\n`);

  const todayRaw = new Date().toLocaleDateString('en-SG', {
    timeZone: 'Asia/Singapore', day: '2-digit', month: 'short', year: 'numeric',
  });
  const today = todayRaw.replace(/^0/, ''); // "04 Aug 2026" → "4 Aug 2026"

  let prevState = {};
  if (existsSync(STATE_FILE)) prevState = JSON.parse(readFileSync(STATE_FILE, 'utf-8'));
  else mkdirSync(dirname(STATE_FILE), { recursive: true });

  const newState = {};
  const changes = [];
  const errors = [];
  const toUpload = [];

  for (const [site, cfg] of Object.entries(SITES)) {
    try {
      console.log(`━━━ ${site} ━━━`);
      const rows = await fetchBalance(cfg.projectId);
      const total = rows.reduce((s, r) => s + r.units, 0);
      console.log(`  Available: ${total} units (${rows.length} types)`);
      rows.forEach(r => console.log(`    ${cfg.displayMap[r.type] || normalizeType(r.type)}: ${r.units}`));

      const prevRows = prevState[site]?.rows;
      const changed = JSON.stringify(prevRows) !== JSON.stringify(rows);

      newState[site] = { rows, total, checkedAt: new Date().toISOString() };

      const ok = updateSiteHtml(site, rows, today);
      if (!ok) {
        errors.push(`${site}: html update failed`);
        continue;
      }
      toUpload.push(site);

      if (changed) {
        changes.push(`${site}: ${prevState[site]?.total ?? '?'} → ${total} units`);
        console.log(`  ✅ Table updated → ${total} units`);
      } else {
        console.log(`  ℹ️  No count change (${total} units). Date refreshed.`);
      }
    } catch (err) {
      errors.push(`${site}: ${err.message}`);
      console.error(`  ❌ ${err.message}`);
    }
  }

  // Upload all sites (date always refreshed, even when counts are unchanged)
  if (toUpload.length > 0) {
    console.log('\n=== Uploading to FTP ===');
    for (const site of toUpload) {
      const ok = await uploadSite(site, SITES[site].ftpDir);
      console.log(`  ${site}: ${ok ? '✅ uploaded' : '❌ FTP FAILED'}`);
      if (!ok) errors.push(`${site}: FTP upload failed`);
    }
  }

  writeFileSync(STATE_FILE, JSON.stringify(newState, null, 2), 'utf-8');
  console.log('\n✅ State saved.');

  // Notify
  if (changes.length > 0) {
    const msg = `Balance Units auto-update ${today} — changes:\n${changes.join('\n')}` +
      (errors.length ? `\n\n⚠ Errors: ${errors.join(' | ')}` : '');
    await sendTelegram(msg);
  } else if (errors.length > 0) {
    await sendTelegram(`Balance Units auto-update ${today} — ⚠ errors:\n${errors.join('\n')}`);
  } else {
    console.log('No changes to report.');
  }
}

main();
