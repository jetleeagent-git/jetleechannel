#!/usr/bin/env node
/**
 * Grand Dunman - Weekly Price & Unit Update Script
 * Runs every Monday 9am SGT.
 * Scrapes https://granddunman.jetleeproperty.sg → updates jetleechannel.sg/granddunman/
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const WORKSPACE = join(__dirname, '..');
const STATE_FILE = join(WORKSPACE, 'granddunman', '.last-state.json');
const HTML_FILE = join(WORKSPACE, 'granddunman', 'index.html');

// --- FTP Config ---
const FTP_HOST = '191.101.228.66';
const FTP_USER = 'u851958941.jetleechannel.sg';
const FTP_PASS = 'Jetleechannel12345&';
const FTP_PATH = '/granddunman/index.html';

// --- Fetch & Parse ---
async function fetchPage(retries = 3) {
  let lastErr;
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const resp = await fetch('https://granddunman.jetleeproperty.sg', {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; JetleeBot/1.0)' },
        signal: AbortSignal.timeout(30000),
      });
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      return await resp.text();
    } catch (err) {
      lastErr = err;
      console.log(`⚠️  Fetch attempt ${attempt}/${retries} failed: ${err.message}. Retrying...`);
      if (attempt < retries) await new Promise(r => setTimeout(r, 5000 * attempt));
    }
  }
  throw lastErr;
}

function extractAvailableUnits(html) {
  const match = html.match(/AVAILABLE UNITS[\s\S]*?<p[^>]*>(\d+)/);
  return match ? parseInt(match[1]) : null;
}

function extractLastUpdated(html) {
  const match = html.match(/Last Updated:\s*(\d{1,2}\s+[A-Z][a-z]+\s+\d{4})/);
  return match ? match[1] : null;
}

function extractPricing(html) {
  const results = [];
  // Find each table row in the pricing table
  const rowRegex = /<label>([A-Z0-9\s+()]+)<\/label>[\s\S]*?<label class="l-tb">(\d+)<span>\s*Units[\s\S]*?<label class="l-tb">([^<]+)<\/label>[\s\S]*?<label class="d-block">([^<]+)<span>([^<]+)<\/span>/g;

  let match;
  while ((match = rowRegex.exec(html)) !== null) {
    results.push({
      type: match[1].trim(),
      units: parseInt(match[2]),
      sqft: match[3].trim(),
      price: (match[4] + match[5]).trim().replace(/\s+/g, ' '),
    });
  }

  // Fallback: simpler extraction if above fails
  if (results.length === 0) {
    const simpleRegex = /<label>([A-Z0-9\s+()]+)<\/label>[\s\S]*?<label class="l-tb">(\d+)/g;
    while ((match = simpleRegex.exec(html)) !== null) {
      results.push({
        type: match[1].trim(),
        units: parseInt(match[2]),
      });
    }
  }

  return results;
}

function extractTotalUnits(html) {
  const match = html.match(/TOTAL HOUSING UNITS[\s\S]*?<p[^>]*>(\d+)/);
  return match ? parseInt(match[1]) : null;
}

// --- Update HTML ---
function buildUpdatedHtml(currentHtml, data) {
  const { availableUnits, prices, lastUpdated } = data;

  // Update hero-stats available count
  let updated = currentHtml;

  // Update available units count in hero stats
  updated = updated.replace(
    /(<span class="num">)80(<\/span>\s*<span class="lbl">Available)/,
    `$1${availableUnits}$2`
  );

  // Update the "Last Updated" text in the pricing section
  updated = updated.replace(
    /Last Updated:\s*\d{1,2}\s+[A-Z][a-z]+\s+\d{4}/,
    lastUpdated ? `Last Updated: ${lastUpdated}` : 'Last Updated: 30 July 2026'
  );

  // Update available unit count in the pricing intro paragraph
  updated = updated.replace(
    /(\d+) units available\./i,
    `${availableUnits} units available.`
  );

  // Update each price card
  for (const price of prices) {
    const typeKey = price.type.toLowerCase().replace(/[^a-z0-9]/g, '');

    // Find matching card by type
    const cardRegex = new RegExp(
      `(<div class="ptype">)([^<]+)(</div>\\s*<div class="pcount">)([^<]+)(</div>)`,
      'g'
    );

    // We need to find cards in order, so let's do a different approach
    // Update pcount for each type
    const typeMapping = {
      '1BEDROOM(LUXURY)': ['1 Bedroom (Luxury)', '1 Bedroom (Luxury)', 0],
      '1BEDROOM+STUDY(LUXURY)': ['1 Bedroom + Study (Luxury)', '1 Bedroom + Study (Luxury)', 1],
      '5BEDROOM(GRAND)': ['5 Bedroom (Grand)', '5 Bedroom (Grand)', 2],
      'PENTHOUSE(GRAND)': ['Penthouse (Grand)', 'Penthouse (Grand)', 3],
    };

    // Simple sequential approach - update price cards in order
    // Use the html structure more directly
  }

  // Simpler: rebuild the pricing section of the HTML
  // Find the price-grid and replace it
  const priceGridStart = updated.indexOf('class="price-grid"');
  const priceGridEnd = updated.indexOf('Need Full Pricelist?', priceGridStart);

  if (priceGridStart > 0 && priceGridEnd > 0) {
    const beforeGrid = updated.substring(0, updated.lastIndexOf('<div class="price-grid"', priceGridStart));
    const afterGrid = updated.substring(priceGridEnd);

    const newPriceCards = prices.map(p => {
      const typeLabel = p.type.charAt(0).toUpperCase() + p.type.slice(1).toLowerCase();
      const displayType = typeLabel
        .replace(/(\d)/, '$1 ')
        .replace(/\s+/, ' ')
        .trim();

      let psize = p.sqft || '';
      let pprice = p.price || '';
      let ppsft = '';

      // Parse price for PSF display
      if (pprice) {
        // Already has PSF info
        ppsft = pprice;
      }

      // Build display type
      const niceType = p.type
        .replace(/\s+/g, ' ')
        .split(' ')
        .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(' ');

      // Count label
      const unitLabel = p.units === 1 ? '1 Unit Available' : `${p.units} Units Available`;

      return `      <div class="price-card">
        <div class="ptype">${niceType}</div>
        <div class="pcount">${unitLabel}</div>
        <div class="psize">${p.sqft || ''}</div>
        <div class="pprice">${p.price || ''}</div>
        <div class="ppsft"></div>
      </div>`;
    }).join('\n\n');

    const replacement = `<div class="price-grid">\n${newPriceCards}\n    </div>`;
    updated = beforeGrid + replacement + afterGrid;
  }

  // Also update the FAQ about available units
  updated = updated.replace(
    /there are (\d+) units still available/i,
    `there are ${availableUnits} units still available`
  );

  return updated;
}

// --- Upload via FTP ---
async function uploadViaFtp(filePath, remotePath) {
  const { execSync } = await import('child_process');

  const cmd = `curl -s -T "${filePath}" "ftp://${FTP_HOST}${remotePath}" \
    --user "${FTP_USER}:${FTP_PASS}" \
    -o /dev/null -w "%{http_code}"`;

  const result = execSync(cmd, { encoding: 'utf-8' }).trim();
  return result === '226';
}

// --- Telegram notification ---
async function sendTelegram(message) {
  const { execSync } = await import('child_process');
  const TOKEN = '8124287935:AAHlC8ylOK8IEuSQRLjKGJKLYaMu77ndHsU';
  const CHAT_ID = '87383567';
  const text = encodeURIComponent(message);
  const url = `https://api.telegram.org/bot${TOKEN}/sendMessage?chat_id=${CHAT_ID}&text=${text}`;
  try {
    const res = execSync(`curl -s -o /dev/null -w "%{http_code}" "${url}"`, { encoding: 'utf-8' }).trim();
    console.log(`  Telegram notify: HTTP ${res}`);
  } catch (err) {
    console.error('  Telegram notify failed:', err.message);
  }
}

// --- Main ---
async function main() {
  console.log(`\n=== Grand Dunman Auto-Update ===`);
  console.log(`Time: ${new Date().toLocaleString('en-SG', { timeZone: 'Asia/Singapore' })}\n`);

  try {
    // Fetch reference page
    console.log('Fetching reference page...');
    const html = await fetchPage();

    // Extract data
    const availableUnits = extractAvailableUnits(html);
    const totalUnits = extractTotalUnits(html);
    const prices = extractPricing(html);
    const lastUpdated = extractLastUpdated(html);

    console.log(`Available Units: ${availableUnits}`);
    console.log(`Total Units: ${totalUnits}`);
    console.log(`Last Updated: ${lastUpdated}`);
    console.log(`Pricing entries: ${prices.length}`);
    prices.forEach(p => console.log(`  ${p.type}: ${p.units} units, ${p.sqft}, ${p.price || ''}`));

    if (availableUnits === null) {
      console.error('ERROR: Could not extract available units count.');
      return;
    }

    // Load previous state
    let prevState = {};
    if (existsSync(STATE_FILE)) {
      prevState = JSON.parse(readFileSync(STATE_FILE, 'utf-8'));
    }

    const newState = {
      availableUnits,
      totalUnits,
      prices,
      lastUpdated: lastUpdated || 'Unknown',
      scrapedAt: new Date().toISOString(),
    };

    // Compare — prices/units drive whether we need a full update
    const changed = JSON.stringify(prevState.prices) !== JSON.stringify(prices) ||
                    prevState.availableUnits !== availableUnits;
    // Always refresh the "Last Updated" date display if it changed, even when prices are identical
    const dateChanged = prevState.lastUpdated !== lastUpdated;
    
    if (!changed && !dateChanged && prevState.availableUnits !== undefined) {
      console.log('\n✅ No changes detected. Prices and units are the same. No update needed.');
      return;
    }
    
    if (!changed && dateChanged) {
      console.log(`\n🔄 No price changes, but Last Updated date changed (${lastUpdated}). Refreshing date...`);
    } else {
      console.log('\n🔄 Changes detected! Updating page...');
    }

    // Read current HTML
    if (!existsSync(HTML_FILE)) {
      console.error('ERROR: granddunman/index.html not found.');
      return;
    }

    const currentHtml = readFileSync(HTML_FILE, 'utf-8');

    // Update the HTML in-place by rebuilding the price-grid section
    let newHtml = currentHtml;

    // Update available units count in hero stats
    newHtml = newHtml.replace(
      /(<span class="num">)\d+(<\/span>\s*<span class="lbl">\s*Available\b)/,
      `$1${availableUnits}$2`
    );

    // Update "Last Updated" in pricing section
    if (lastUpdated) {
      const oldDateMatch = newHtml.match(/Last Updated:\s*\d{1,2}\s+[A-Z][a-z]+\s+\d{4}/);
      if (oldDateMatch) {
        // Just replace the full date pattern in that context
        newHtml = newHtml.replace(
          /Last Updated:\s*\d{1,2}\s+[A-Z][a-z]+\s+\d{4}/,
          `Last Updated: ${lastUpdated}`
        );
      }
    }

    // Update "X units available" in intro paragraph
    newHtml = newHtml.replace(
      /(\d+) units? available\./i,
      `${availableUnits} units available.`
    );

    // Update facts-grid "Available Units" count (e.g. "80 Units")
    newHtml = newHtml.replace(
      /(<div class="fact-label">Available Units<\/div><div class="fact-value">)\d+ Units/,
      `$1${availableUnits} Units`
    );

    // Build new price cards
    const priceCardsHtml = prices.map(p => {
      const niceType = p.type
        .split(/[\s+]+/)
        .filter(w => w)
        .map((w, i) => i === 0 ? w.charAt(0).toUpperCase() + w.slice(1).toLowerCase() : w)
        .join(' ')
        .replace(/\s*\(/g, ' (');

      const unitLabel = p.units === 1 ? `1 Unit Available` : `${p.units} Units Available`;

      return `      <div class="price-card">
        <div class="ptype">${niceType}</div>
        <div class="pcount">${unitLabel}</div>
        <div class="psize">${p.sqft || ''}</div>
        <div class="pprice">${p.price || ''}</div>
        <div class="ppsft"></div>
      </div>`;
    }).join('\n\n');

    // Find and replace price-grid
    const priceGridStart = newHtml.indexOf('class="price-grid"');
    const needFullPricelist = newHtml.indexOf('Need Full Pricelist?', priceGridStart);

    if (priceGridStart > 0 && needFullPricelist > 0) {
      // Find the end of the price grid div
      // Look for the closing </div> of the price-grid
      let depth = 0;
      let foundStart = false;
      let gridEnd = -1;

      for (let i = newHtml.indexOf('class="price-grid"'); i < newHtml.length; i++) {
        if (newHtml[i] === '<') {
          if (newHtml.substring(i, i + 5) === '<div ') depth++;
          if (newHtml.substring(i, i + 6) === '</div>') {
            if (depth === 0) { gridEnd = i + 6; break; }
            depth--;
          }
        }
        if (newHtml.substring(i, i + 17) === 'class="price-grid"') foundStart = true;
        // Count opening divs after finding the start
        if (foundStart && newHtml[i] === '<') {
          if (newHtml.substring(i, i + 4) === '<div') depth++;
          if (newHtml.substring(i, i + 6) === '</div>') {
            depth--;
            if (depth <= 0) { gridEnd = i + 6; break; }
          }
        }
      }

      if (gridEnd > 0) {
        const beforeGrid = newHtml.substring(0, newHtml.indexOf('<div class="price-grid"'));
        const afterGrid = newHtml.substring(gridEnd);
        newHtml = beforeGrid + `<div class="price-grid">\n${priceCardsHtml}\n    </div>` + afterGrid;
      }
    }

    // Update FAQ text about available units
    newHtml = newHtml.replace(
      /there are \d+ units? still available/i,
      `there are ${availableUnits} units still available`
    );

    // Write updated HTML
    writeFileSync(HTML_FILE, newHtml, 'utf-8');
    console.log('  ✅ Updated index.html');

    // Upload to FTP
    console.log('  Uploading to FTP...');
    const uploaded = await uploadViaFtp(HTML_FILE, FTP_PATH);

    if (uploaded) {
      console.log('  ✅ FTP upload successful!');

      // Save state for next comparison
      writeFileSync(STATE_FILE, JSON.stringify(newState, null, 2), 'utf-8');
      console.log('  ✅ State saved.');
      console.log('\n🎉 Grand Dunman site updated successfully!');

      // Notify Jetlee ONLY when prices/units actually changed (not on date-only refreshes)
      if (changed) {
        const today = new Date().toLocaleDateString('en-SG', { timeZone: 'Asia/Singapore', day: '2-digit', month: 'short', year: 'numeric' });
        await sendTelegram(
          `Grand Dunman auto-update ${today} - prices/units updated ✅\n${availableUnits} units now available (total ${totalUnits}).\nLast updated: ${lastUpdated}`
        );
      } else {
        console.log('  ℹ Date-only refresh — no Telegram notification (prices/units unchanged).');
      }
    } else {
      console.error('  ❌ FTP upload failed!');
    }

  } catch (err) {
    console.error('❌ Error:', err.message);
  }
}

main();
