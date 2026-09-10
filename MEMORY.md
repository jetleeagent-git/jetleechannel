# MEMORY.md - Long-term Context

## Identity
- **Name:** Natasha
- **Role:** AI Assistant / Web Developer / SEO
- **Client:** Jetlee (@jetleekn, Telegram @jetleechannel)

## All Sites Status (Updated 2026-07-19)
All sites behind **Cloudflare** proxying. Hostinger origin at `191.101.228.66`. No more Founders Cluster.

**ALL project pages live at `jetleechannel.sg/{project}/`** — no subdomains other than HQ.

| Site | Status | Notes |
|------|--------|-------|
| jetleechannel.sg | ✅ Live | HQ site + all project subdirectories |
| jetlee413.com | ✅ Live | Still on old Hostinger IPs |
| thomson-reserve-direct-developer.com | ✅ Live | Separate FTP, GA installed ✅ G-S46Y1ZCYJH (17 pages) |
| loyangvalleyresidences-official.com | ✅ Live | Separate FTP, GA installed ✅ G-MLD5XYQ2HK (17 pages) |

**Project pages under jetleechannel.sg:**
- `/elta/` — ✅ GA4 installed (NOT eltasingapore!)
- `/dunearnhouse/` — ✅ GA4 installed (NOT dunearnhouse.jetleechannel.sg!)
- `/amberwood/` — ✅ GA4 installed
- `/arcady/` — ✅ GA4 installed
- `/hudsonplace/` — ✅ GA4 installed
- `/hougangcentral/` — ✅ GA4 installed
- `/lentor-gardens/` — ✅ GA4 installed
- `/lucernegrand/` — ✅ GA4 installed
- `/OneMarinaGardens/` — ✅ GA4 installed
- `/unionsquare/` — ✅ GA4 installed
- `/generations-tannery/` — ✅ GA4 installed
- `/TheSerra/` — ✅ GA4 installed (freehold D11, 133 units, 7 Bassein Rd, Transurban Properties, Novena MRT 8-min walk). **Renamed from `/TheSierra/` Aug 17** — old URLs 301 → /TheSerra/. Deploy label: thesierra
- `/TheOrie/` — ✅ GA4 installed (777 units D12 Toa Payoh, CDL/Frasers/Sekisui House, built Aug 4)
- `/SophiaMeadow/` — ✅ GA4 installed (41 units D9 Sophia Rd, Sin Thai Hin, built Aug 4)
- `/bagnallhous/` — ✅ GA4 installed (113 units freehold D16 Upper East Coast, Roxy-Pacific, built Aug 4)
- `/zyongrand/` — ✅ GA4 installed (706 units D03 Kim Seng Rd, CDL + Mitsui Fudosan, 99yr, 2×62 storeys + 36-storey serviced tower, TOP Sep 2032, Havelock MRT direct access)
- `/promenadepeak/` — ✅ GA4 installed (596 units D03 1 Zion Promenade, Allgreen/Kheng Leong, 99yr, luxury highrise, TOP Feb 2031, Havelock MRT 311m)
- `/rivergreen/` — ✅ GA4 installed (524 units D09 11 River Valley Green, WINCHAMP Investment, 99yr, 36-storey tower, TOP Q1 2029, Great World MRT 17m)
- `/newportresidences/` — ✅ GA4 installed (246 freehold units D02 80 Anson Rd, CDL, redeveloped Fuji Xerox Towers, mixed dev 41 storeys, TOP 2H 2027, Tanjong Pagar MRT 766m)
- `/BelgraviaAce/` — ✅ GA4 installed (107 freehold strata landed units D28 Belgravia Drive: 104 semi-D + 3 terrace, Fairview Developments, TOP Jan 2028, from $4.531M, 23 semi-D balance as of Aug 2026). Has dedicated balance page `/BelgraviaAce/balance/` (chart + live table) + `/articles/`.
- `/luxushill10/` — ✅ GA4 installed (156 brand new 999-yr leasehold landed homes D28 Seletar Hills: 136 terrace + 18 semi-D + 2 detached, Bukit Sembawang Estates via Singapore United Estates, 5 ensuite bedrooms + private electric lift, 4-5 levels, rooftop solar + EV-ready, V-Zug kitchen, TOP Q4 2028, 98 Luxus Hills Heights S804155, architect Park + Associates, sales gallery BSEL Landed Homes Flagship Gallery AMK Ave 5). Built Aug 9. Added to HQ homepage featured grid + `/projects/` D28 + `/new-launch/` D28. Source: `luxushill10/`.

Standalone subdomains (old) now 301 redirect to HQ paths.

## Hero Lightening (Aug 9, 2026)
- **ALL 22 project homepages on jetleechannel.sg lightened** (hero backgrounds no longer dark/gloomy) — **except luxushill10** (user excluded, already bright).
- Per-project surgical replacements via `lighten-heroes.mjs`: Pattern A files (theorie, sophiameadow, bagnallhous, promenadepeak, rivergreen, newportresidences, upperhouse, zyongrand, BelgraviaAce, thesierra) got 3 replacements each (90° gradient, ::after 180° bottom, mobile 180° override) — e.g. `rgba(14,13,11,0.85)` → `0.45`, `::after 0.2/0.1/0.5/0.85` → `0.08/0.04/0.25/0.55`, mobile `0.65/0.82/0.96` → `0.30/0.42/0.60`. thesierra 0.96→0.50.
- Pattern B/C + pure gradients: elta `filter:brightness(.45)→.85`, hudsonplace `.38/.18/.92→.20/.08/.50`, hougangcentral `.25/.5/.85→.12/.25/.50`, lucernegrand `.18/.52/.82→.08/.25/.45`, OMG+thesen `opacity:.5→.78` + overlay `.3/.9→.15/.5`, dunearnhouse `.45/.65→.20/.35` + `#0E0D0B→#2A2418` gradient, lentorgardens `.25/.35/.85→.12/.18/.50`, generations-tannery `#1A1A2E/#16213E/#0F3460→#2A2A44/#24324F/#1E4666`, amberwood img `opacity .3→.62` + overlay lightened, arcady `#0E0D0B→#241F18`, unionsquare `#0d0d0d→#1f1f26`.
- ⚠️ **Script bug found**: `lighten-heroes.mjs` originally wrote only if `src.length !== origLen` — equal-length replacements (hex colors, same-digit rgba) never persisted. Fixed to `src !== fs.readFileSync(file,'utf8')`. 6 files + arcady were missed on run 1; fixed with direct one-off + re-upload.
- Uploaded via `upload-lightened.mjs` (22 files, all 226 OK), verified live with cache-busted curl (old values 0 occurrences on all 22).

## Arcady hero image + gallery (Aug 10, 2026)
- User: "arcady dont have any images at all.. pls find n add it in" — Arcady hero was pure gradients, no photo.
- First pass: found official images from the-arcady.com.sg (KSH Holdings official site) — facade aerial view + facility shots (Family Pool, Botanic Club, Gourmet Vista, Sky Gym). Downloaded, optimized (hero 1280×640 @82q, gallery 800×450 @80q), uploaded to `/arcady/images/` (5 files: hero-facade.jpg, gallery-pool/botanic/gourmet/gym.jpg).
- Updated `site-arcady.html`: ① hero-bg now uses facade image with light 90° overlay (bright, matches lightened theme); ② mobile 900px media query override added (`auto 55%`); ③ new Gallery section (`id="gallery"`, cream bg) after Floor Plans with 5 image cards + captions; ④ nav now has GALLERY link; ⑤ og:image/twitter:image updated from broken `arcady-og.jpg` → real image.
- **Second pass (user gave ecoprop link)**: User sent `https://share.ecoprop.com/The-Arcady-at-Boon-Keng/R007613B` — extracted 41 official images (img.singmap.com CDN). **Hero switched to `drone-hero.jpg`** (7313×3657 developer aerial shot → optimized 1600×800, 344KB) — much better than facade. Gallery expanded to **9 images**: drone-hero, exterior (1600×1000), penthouse living/dining, pool, Arcady Club, Kids Club, Gourmet Vista, Sky Gym, Botanic Club. og:image → drone-hero.jpg.
- Uploaded via main jetleechannel.sg FTP (`/arcady/images/*`). Verified live: all 9 gallery imgs 200 + load in browser (naturalWidth > 0), hero renders drone aerial. Local optimized copies in `arcady-eco/` (drone-hero, exterior, penthouse, arcady-club, kids-club).

## ⛔ LOCKED REQUIREMENTS (do not revert)
- **HQ homepage #projects section = district-grouped PERMANENTLY** (locked 2026-08-12 by Jetlee: "lock it permanent, dont change back to old way again"). Projects on jetleechannel.sg/ MUST show grouped directly by district (D01→D28) with `.district-group`/`.district-label` — NEVER revert to flat grid. Source marker in site-jetleechannel.html + backup `backups/site-jetleechannel-DISTRICT-LOCKED-2026-08-12.html`. District data lives on `/projects/` (19 groups, 33 cards) — keep home in sync when adding new projects.
- **ALL contact forms = Web3Forms ONLY** (locked 2026-08-12): no WhatsApp auto-popup after form submit anywhere. Manual WhatsApp buttons OK. Every form needs `botcheck` honeypot or Web3Forms silently drops it.

## Key Projects Completed
- **Article back-link fix (Aug 9)**: All project article pages now link back to their own project, NOT HQ. Before: project pages linked to HQ articles (`jetleechannel.sg/articles/...`) which said "Back to Blog" → home. Fixed: ① copied HQ articles into each project's `/articles/` dir with back link rewritten to `← Back to {Project}` ② fixed wrong "Back to ELTA" labels (amberwood/OMG/generations en-bloc copies) ③ injected missing back links into `article-hdb-waitout-removed.html` copies (11 projects) ④ CRL articles (elta/lucerne/hougang) now point to project homepage ⑤ created thesen `/articles/` (was 404) ⑥ all project homepages (21) now point nav + cards to project-local articles ⑦ **upperhouse added later same day** — created `upperhouse_articles/` (index + P1 article), homepage Articles nav → `/upperhouse/articles/`, back links → UPPERHOUSE at Orchard Boulevard. Helpers: `fix-article-backlinks.mjs`, `fix-navtop-backlinks.mjs`, `fix-hdb-waitout.mjs`, `fix-crl-backlinks.mjs`, `add-index-cards.mjs`, `upload-fixed-articles.mjs`. HQ articles still correctly say "Back to Blog".
- **P1 Phase 2C article (Aug 6)**: CNA-sourced article deployed to HQ + Thomson + Loyang + all 19 projects (22 URLs, all 200). Per-project school tie-ins. Created real /articles/ pages for 8 projects that were silently falling back to HQ homepage (TheSierra, TheOrie, SophiaMeadow, bagnallhous, zyongrand, promenadepeak, rivergreen, newportresidences). Sitemaps updated (59/26/23 URLs). IndexNow key file live on all 3 domains; pings 200. Generators: `generate-p1-articles.mjs` + `deploy-p1-articles.mjs`.
- **SEO/AEO/Indexing push (3 sites, Aug 5)**: sitemaps regenerated (jetleechannel 58, thomson 25, loyang 22 URLs); homepage subdomain refs→canonical paths; dunearnhouse.jetleechannel.sg 301→/dunearnhouse/; IndexNow key `f2f51fad679de9eda3426492625c4260` on all 3 domains; Loyang homepage +6 article links (was 0); **Article+FAQPage schema on ALL 40 real articles** (22 thomson + 18 loyang; first script run had upload-to-junk-filename bug — fixed + 34 junk files deleted); rebuilt broken Thomson price-guide-2026.html (was 0 bytes); **Loyang homepage 1.78MB→95KB** (base64 images→WebP); Thomson 3 imgs→WebP. All verified live. Zero eltasingapore refs anywhere (user confirmed unused).
- **Blog fixed** — `/blog/` now live with full article set at `/articles/` (Hostinger cache finally cleared)
- **SEO & AEO optimization** for all sites (base64→JPG, schemas, meta tags)
- **Image optimization**: Lentor Gardens 7.4MB→95KB, Hudson Place 3.1MB→53KB, Thomson Reserve 1.9MB→543KB
- **Web3Forms + WhatsApp dual contact forms** on all sites
- **Footer standardization**: All sites have jetleechannel.sg link + TikTok (@jetleechannel)
- **10 SEO blog articles** on jetleechannel.sg/articles/
- **DNS migration**: All sites moved from CrazyDomain WEBFWD → Cloudflare DNS
- **The Arcady at Boon Keng** — built via Telegram Jul 2-3, live at `/arcady/` (freehold D12, 99 units, 107 Serangoon Rd)
- **The Serra Residences** — built Jul 31, live at `/TheSerra/` (renamed from /TheSierra/ Aug 17; freehold D11, 133 units, 7 Bassein Rd, Transurban Properties, Novena MRT 8-min walk). Source files in `thesierra/`

## GA4
- **Measurement ID:** G-6LFG5HCYKP
- **Property:** Jetlee Channel
- **Installed on:** All jetleechannel.sg project pages, dunearnhouse, eltasingapore FTP, jetlee413.com
- thomson-reserve-direct-developer.com: G-S46Y1ZCYJH ✅ (installed all 17 pages)
- loyangvalleyresidences-official.com: G-MLD5XYQ2HK ✅ (installed all 17 pages)

## Google Search Console
- `.gsc/` has credentials.json + pkce.json + token.json (webmasters.readonly scope)
- **Token expired/revoked (Aug 24)** — refresh grant returns `invalid_grant`, access token 401. Cannot pull performance data until Jetlee re-consents via fresh PKCE link in `.gsc/pkce.json` (state 8RHfCv7f2icBcinDhbkvAQ, redirect http://localhost).

## Known FTP Credentials (host 191.101.228.66)
Passwords follow pattern: `SiteName87649315$` (case-sensitive!)
- jetleechannel.sg: `u851958941.jetleechannel.sg` / `Jetleechannel12345&` (web root = FTP ROOT `/`, NOT `public_html/`)
- generations-tannery: Same as jetleechannel.sg - lives under jetleechannel.sg/generations-tannery/
- arcady: Same as jetleechannel.sg - lives under jetleechannel.sg/arcady/
- OneMarinaGardens: Same as jetleechannel.sg - lives under jetleechannel.sg/OneMarinaGardens/
  - FTP path: /arcady/index.html, images in /arcady/images/
- TheSerra: Same as jetleechannel.sg - lives under jetleechannel.sg/TheSerra/ (was TheSierra, renamed Aug 17)
  - FTP path: /TheSerra/index.html, images in /TheSerra/images/ (deploy.sh label: thesierra)
- loyangvalleyresidences-official.com: `u851958941.loyangvalleyresidences-official.com` / `Loyang12345&` ✅ GA installed on 17 pages
- thomson-reserve-direct-developer.com: `u851958941.thomson-reserve-direct-developer.com` / `Thomson12345&` ✅ GA installed on 17 pages
- jetlee413.com: `u851958941.jetlee413.com` / `Jetlee41387649315$`
- elta: lives at `jetleechannel.sg/elta/` (NOT eltasingapore! Uses main jetleechannel.sg FTP)
- dunearnhouse: lives at `jetleechannel.sg/dunearnhouse/` (NOT dunearnhouse.jetleechannel.sg! Uses main jetleechannel.sg FTP)
- thomsonreserve: `u851958941.thomsonreserve.jetleechannel.sg` / `Thomson87649315$`
- lucernegrand: `u851958941.lucernegrand.jetleechannel.sg` / `Lucerngrand87649315$`
- unionsquare: `u851958941.unionsquare.jetleechannel.sg` / `Unionsquare87649315$`
- hudsonplace: `u851958941.hudsonplace.jetleechannel.sg` / `Hudsonplace87649315$`
- dunearnhouse: `u851958941.dunearnhouse.jetleechannel.sg` / `Dunearnhouse87649315$`
- amberwood: `u851958941.amberwood.jetleechannel.sg` / `Amberwood123$`
- lentorgardens: `u851958941.lentorgardens.jetleechannel.sg` / ❌ **password unknown**
- hougangcentral: `u851958941.hougangcentral.jetleechannel.sg` / password not recorded

## Cloudflare
- API Token: `[REDACTED_CF_TOKEN]`
- Token has DNS edit permissions but **NOT cache purge or workers**
- Zone ID: `7ac361e0924385a07e585e747f5ff839`
- Jetlee uses `jetlee.agent@gmail.com` for Cloudflare + Hostinger accounts
- Deploy script: `bash /home/ubuntu/.openclaw/workspace/deploy.sh <sitename>`

## Cron Jobs / Automation
- **Weekly articles — 3 sites ONLY (locked Aug 24)**: loyangvalleyresidences-official.com + thomson-reserve-direct-developer.com + jetleechannel.sg/articles. NO more continuum/narra/aurea updates (user: "3 website ONLY"). OpenClaw cron: `articles-loyang-mwf` Mon&Fri 9:05 SGT, `articles-thomson-mwf` 9:10, `articles-hq-mwf` 9:15. Scripts: `scripts/loyang-weekly-articles.mjs`, `scripts/thomson-weekly-articles.mjs`, `scripts/hq-weekly-articles.mjs`. All read/write shared pool `loyang-articles/.shared-used.json` to prevent cross-site duplicate posts (cap 60). HQ articles always end with Thomson Reserve promo box. Scripts self-notify Telegram.
- ⚠️ Container has NO cron daemon (system crontab wiped Aug 20; /etc/cron.d empty except e2scrub). OpenClaw cron is the ONLY scheduler — any new recurring job must go through `cron` tool.
- **Balance Units & Pricing auto-updates (AD-HOC ONLY, updated Sep 4)**: Per Jetlee's instruction, no background cron schedules for pricing or elevation charts (`balance-units-mwf` & `grand-dunman-mwf` disabled). Pricing & elevation chart updates are ONLY performed ad-hoc when explicitly requested by Jetlee in chat.
- ⚠️ **execSync gotcha**: don't pass `timeout` option to execSync for FTP curl — causes spurious `spawnSync /bin/sh ETIMEDOUT`. Use curl's own `--max-time` + `maxBuffer` instead.
- ⚠️ **Deepseek billing scare Aug 24**: balance-units + grand-dunman cron failed with "deepseek out of credits / provider cooldown (billing)". Resolved Aug 25 — deepseek API works again (direct test 200). OpenAI sk-proj key IS out of credits (insufficient_quota) — don't switch to it.

## Pending Issues
- **Lentor Gardens FTP** — password unknown, can't upload (live site works via HTTPS)
- **Dunearn House** — separate Hostinger account, needs `deploy.sh dunearnhouse` for updates
- **Hostinger cache** — internal cache takes ~3 days to expire even after purge
- **Cloudflare token** — DNS-only, no cache purge or workers permissions

## Known Contacts
- Jetlee — primary client. WhatsApp +65 8764 9315, CEA R007613B

## Communication Notes
- When Jetlee is frustrated, just fix — no explanations or questions
- Be decisive; don't ask permission for basic fixes
- Jetlee prefers Telegram (@jetleechannel) but also uses WebChat
