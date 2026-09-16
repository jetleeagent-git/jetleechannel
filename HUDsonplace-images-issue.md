# Hudson Place Images — RESOLVED (2026-09-16)

## ✅ Fix applied
Pushed `hudsonplace/images/*` (12 files) via **git auto-deploy** — all now live.
Verified: `https://jetleechannel.sg/hudsonplace/images/img-02.jpg` → 200, `image/jpeg`, MD5 matches local.

No Hostinger login and no FTP were needed.

---

## 🔑 KEY DISCOVERY — git push IS a working deploy route (FTP is dead)

**The repo `jetleeagent-git/jetleechannel` auto-deploys to `jetleechannel.sg` web root.**
Repo root == web root. So `git add … && git commit && git push origin main` publishes
any file to the live site within ~60–120s.

Verified 2026-09-16: pushed `_deploytest2.html` (2026-09-15) and it went live at `/`.

Testing that push works beats fighting the network. Confirmed both:
- `hudsonplace/images/img-02.jpg` … `img-12`, `img-price-table.jpg` → live ✅
- 35 restored project images → live ✅

### Network reality check (2026-09-16)
| Route | Status |
|---|---|
| FTP 191.101.228.66:21 direct | ❌ blocked |
| SSH/SFTP :22 | ❌ blocked |
| HTTP CONNECT proxy 47.91.121.127:8443 | ⚠️ flaky — CONNECT sometimes 200, then data channel times out |
| **git push → auto-deploy** | ✅ **works** |

`upload-hudson-images.mjs` and the proxy route are now unnecessary — prefer git.

⚠️ `deploy.sh` uses **FTP** (curl `-T ftp://…`) and will fail while port 21 is blocked.
Prefer git push. Also `site-hudsonplace.html` etc. are 0 bytes — `deploy.sh` would push an empty file.

---

## ⚠️ SYSTEMIC BUGS FOUND & FIXED this session

### 1. Site-wide MIME corruption (fixed)
`.htaccess` had an unscoped:
```
<IfModule mod_headers.c>
    Header set Content-Type "text/html; charset=UTF-8"
</IfModule>
```
This forced **every** file — images, CSS, JS, SVG — to `text/html`. Browsers still rendered
images (sniffing) but the header was wrong site-wide; CSS/JS would break.
Added 2026-09-11 (commit `5220deb`), so live ~5 days.

**Fix:** scoped to HTML only:
```
<FilesMatch "\.html?$">
    <IfModule mod_headers.c>
        Header set Content-Type "text/html; charset=UTF-8"
    </IfModule>
</FilesMatch>
```
Result: badMIME across all 24 projects → **0**.

### 2. `.htaccess` alias rewrites swallowed subpaths (fixed)
Old rules did `RewriteRule ^ /thecolletive/ [R=301,L]` — dropped the subpath, so
`/thecolletive/images/*` 301'd to the page → **all theColletive images 404**.
Also hit amberwood / TheSerra / grand-dunman / lentor-gardens aliases.

**Fix:** match in `RewriteCond` (per-dir rules have no leading slash on the pattern), capture
the subpath, use backrefs, and add a **case-sensitive** `!^/canonical(/|$)` guard so the
canonical path can't redirect to itself:
```
RewriteCond %{REQUEST_URI} !^/thecolletive(/|$)
RewriteCond %{REQUEST_URI} ^/(theColletive|thecollective|TheCollective|Thecolletive)(/.*)?$ [NC]
RewriteRule ^ /thecolletive%2 [R=301,L]
```

---

## Image audit results (2026-09-16)

Live refs checked across 24 projects, following redirects and sniffing magic bytes.

| | before | after |
|---|---|---|
| broken refs | 73 | **12** |
| wrong-MIME | 204 | **0** |

### Restored via git (all verified live)
- **thecolletive** 24 — fixed by .htaccess repair (files were always in git)
- **arcady** 9 · **TheSerra** 8 · **lucernegrand** 19 · **amberwood** 20
- **OneMarinaGardens** 15 · **TheOrie / SophiaMeadow / bagnallhous** 48 microsite icons
- **hougangcentral** 1 · **TheHillshore** 1

Microsite icons (`train-ico.png`, `walking-*.png`, …) were referenced as **relative**
`microsite/img/*` but only existed absolutely at `<project>-87649315.propnex.net`.
Downloaded all 16 and committed to each project. Source site serves them fine.

### Still missing (12) — no local source, no reachable original
| Project | Missing |
|---|---|
| amberwood | `images/location-map-v2.jpg` |
| unionsquare | `images/usq-4bedroom-d1p.jpg` (4BR D1P floor plan) |
| lucernegrand | `images/dev-cdl-1.jpg`, `images/dev-cdl-2.jpg` (CDL flyers) |
| OneMarinaGardens | `floorplan-3br-premium.jpg`, `floorplan-3br-904.jpg`, `location-map.jpg`, `location-stylized.jpg`, `gallery/08.jpg`, `gallery/09.jpg` |

`onemarinagarden-official.com` only publishes gallery-1..7, floorplan-1/2/3/4br, siteplan, hero —
so OMG's gallery 8–9 and the two 3BR variants aren't recoverable from there.
Wayback Machine CDX is rate-limiting (429) — retry later; that's the best remaining lead.

---

## Next actions if desired
1. Retry Wayback CDX for the 12 missing (spaced ~60s apart to dodge 429).
2. Or re-source from the developers' official sites / Jetlee's local copies.
3. Or trim the page refs to what exists.
4. Consider dropping the now-dead `upload-hudson-images.mjs` / proxy scripts.
