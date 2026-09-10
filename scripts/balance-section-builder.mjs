#!/usr/bin/env node
/**
 * Shared: build Balance Units section HTML for a site config.
 * Used by add-balance-sections.mjs (inject) and update-balance-units.mjs (refresh).
 *
 * Site config fields:
 *   family: 'elta' | 'hudson' | 'gold-stg' | 'continuum' | 'bagnall'
 *   accent: optional override for gold color (e.g. '#8BC34A')
 *   sub:    descriptive line
 *   title:  unused (kept for clarity)
 */
export function buildBalanceSection(cfg, rows, dateStr) {
  const fam = cfg.family;
  const acc = cfg.accent || 'var(--gold)';
  const acc2 = cfg.accent || 'var(--gold-light, var(--gl, #e4c97e))';

  const total = rows.reduce((s, r) => s + r.units, 0);
  const trs = rows.map(r => {
    const label = cfg.displayMap?.[r.type] || r.type;
    return `          <tr>
            <td>${label}</td>
            <td>${r.units}</td>
            <td>Available</td>
          </tr>`;
  }).join('\n');

  const tbody = `<tbody>
${trs}
          <tr class="total">
            <td>Current Available</td>
            <td>${total} Units</td>
            <td>—</td>
          </tr>
        </tbody>`;

  // ---- header per family ----
  let header = '';
  if (fam === 'elta') {
    header = `<div class="sti">Balance Units</div><div class="ssu">${dateStr}</div><p style="color:var(--dm);font-size:.85rem;margin-bottom:1.5rem;max-width:600px">${cfg.sub}</p>`;
  } else if (fam === 'hudson') {
    header = `<p class="stg fu" style="color:var(--g)">Balance Units</p>
    <h2 class="sh fu" style="color:var(--tx)">Current <em>Balance</em></h2>
    <div class="gl fu" style="background:linear-gradient(90deg,var(--g),transparent);height:1px;margin:18px 0 8px"></div>
    <p style="font-size:13px;color:var(--mu);margin-bottom:18px;font-weight:300" class="fu">${cfg.sub}</p>
    <p style="font-size:13px;color:var(--g);margin-bottom:14px;letter-spacing:0.5px" class="fu">${dateStr}</p>`;
  } else if (fam === 'gold-stg') {
    header = `<span class="stg">Balance Units</span>
    <h2 class="sh">Current <em>Balance</em></h2>
    <div style="height:1px;background:linear-gradient(90deg,${acc2},transparent);margin:18px 0 8px"></div>
    <p style="font-size:13px;color:var(--mu);margin-bottom:18px;font-weight:300">${cfg.sub}</p>
    <p style="font-size:13px;color:${acc};margin-bottom:14px;letter-spacing:0.5px">${dateStr}</p>`;
  } else if (fam === 'continuum') {
    header = `<span class="section-label" style="color:var(--gold);display:block;font-size:11px;letter-spacing:3px;text-transform:uppercase;margin-bottom:14px">Balance Units</span>
    <h2 class="section-title" style="font-family:var(--font-serif);color:var(--white);font-size:clamp(28px,4vw,44px);margin-bottom:8px">Current <em style="color:var(--gold);font-style:italic">Balance</em></h2>
    <div style="height:1px;background:linear-gradient(90deg,var(--gold),transparent);margin:18px 0 8px"></div>
    <p style="font-size:13px;color:rgba(255,255,255,0.55);margin-bottom:18px">${cfg.sub}</p>
    <p style="font-size:13px;color:var(--gold);margin-bottom:14px;letter-spacing:0.5px">${dateStr}</p>`;
  } else {
    // bagnall family (section-label/section-title/section-divider/unit-table)
    header = `<span class="section-label" style="color:${acc}">Balance Units</span>
    <h2 class="section-title">Current <em>Balance</em></h2>
    <div class="section-divider"></div>
    <p style="color:rgba(255,255,255,0.5);font-size:14px;margin-bottom:24px;max-width:600px">${cfg.sub}</p>
    <h3 style="font-family:'Cormorant Garamond',serif;font-size:20px;color:${acc};margin-bottom:14px">${dateStr}</h3>`;
  }

  // ---- table per family ----
  let table = '';
  if (fam === 'elta') {
    table = `<div style="overflow-x:auto"><table class="tbl"><thead><tr><th>Unit Type</th><th>No. of Units</th><th>Status</th></tr></thead>${tbody}</table></div>`;
  } else if (fam === 'hudson') {
    table = `<div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse;min-width:640px;background:rgba(255,255,255,0.03)"><thead><tr><th style="text-align:left;padding:14px 16px;color:var(--g);font-size:12px;letter-spacing:1px;text-transform:uppercase;border-bottom:1px solid rgba(232,201,138,0.25)">Unit Type</th><th style="text-align:center;padding:14px 16px;color:var(--g);font-size:12px;letter-spacing:1px;text-transform:uppercase;border-bottom:1px solid rgba(232,201,138,0.25)">No. of Units</th><th style="text-align:center;padding:14px 16px;color:var(--g);font-size:12px;letter-spacing:1px;text-transform:uppercase;border-bottom:1px solid rgba(232,201,138,0.25)">Status</th></tr></thead>${tbody}</table></div>`;
  } else {
    table = `<div class="unit-table" style="overflow-x:auto"><table style="width:100%;border-collapse:collapse;min-width:640px"><thead><tr><th>Unit Type</th><th>No. of Units</th><th>Status</th></tr></thead>${tbody}</table></div>`;
  }

  return `<!-- BALANCE UNITS -->
<section id="pricing">
  <div class="container" style="max-width:1200px;margin:0 auto">
    ${header}
    ${table}
  </div>
</section>
<!-- END BALANCE UNITS -->`;
}

/** Format "4 Aug 2026" */
export function todayStr() {
  return new Date().toLocaleDateString('en-SG', {
    timeZone: 'Asia/Singapore', day: '2-digit', month: 'short', year: 'numeric',
  }).replace(/^0/, '');
}
