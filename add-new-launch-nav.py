#!/usr/bin/env python3
"""Inject 'New Launch' nav link into all jetleechannel.sg pages.

Link: <a href="https://jetleechannel.sg/new-launch/">New Launch</a>
Inserted right before the 'Contact'/'Register' link in each site's nav.

Usage: python3 add-new-launch-nav.py [--dry-run]
"""
import re, sys, os

DRY = '--dry-run' in sys.argv
WS = '/home/ubuntu/.openclaw/workspace'
URL = 'https://jetleechannel.sg/new-launch/'

# Standard link for <ul>/<li> based navs
LI_LINK = '<li><a href="%s" rel="noopener">New Launch</a></li>' % URL
# Plain link for navs with bare <a> (amberwood, thecontinuum, velabay)
A_LINK = '<a href="%s" rel="noopener" style="font-weight:600">New Launch</a>' % URL

# Files to process: (path, mode)
# mode 'li': insert before Contact/Register <li>
# mode 'a' : insert before Contact/Register <a>
FILES = [
    # --- HQ root ---
    ('site-jetleechannel.html', 'li'),
    # --- Project pages (site-*.html source of truth) ---
    ('site-arcady.html', 'li'),
    ('site-dunearnhouse.html', 'li'),
    ('site-elta.html', 'li'),
    ('site-amberwood.html', 'a'),
    ('site-hougangcentral.html', 'li'),
    ('site-lentorgardens.html', 'li'),
    ('site-lucernegrand.html', 'li'),
    ('site-unionsquare.html', 'li'),
    ('site-hudsonplace.html', 'li'),
    ('site-onemarinagarden.html', 'li'),
    ('site-generations-tannery.html', 'li'),
    ('site-thecontinuum.html', 'a'),
    # --- Project dirs (newer builds) ---
    ('theorie/index.html', 'li'),
    ('thesierra/index.html', 'li'),
    ('sophiameadow/index.html', 'li'),
    ('bagnallhous/index.html', 'li'),
    ('upperhouse/index.html', 'li'),
    ('zyongrand/index.html', 'li'),
    ('promenadepeak/index.html', 'li'),
    ('rivergreen/index.html', 'li'),
    ('newportresidences/index.html', 'li'),
    ('granddunman/index.html', 'li'),
    ('thesen/index.html', 'li'),
    ('velabay/index.html', 'a'),
    ('narraresidences/index.html', 'li'),
    # --- Articles hub ---
    ('articles/index.html', 'a'),
]

def find_contact_li(html, marker='#contact'):
    """Find insertion point before the Contact/Register nav li."""
    # Patterns: <li><a href="#contact"...> or <li><a href="#ct"...> (Register)
    pats = [
        re.compile(r'<li><a href="#contact"[^>]*>', re.I),
        re.compile(r'<li><a href="#ct"[^>]*>', re.I),
        re.compile(r'<li><a href="[^"]*contact[^"]*"[^>]*>', re.I),
    ]
    best = None
    for p in pats:
        m = p.search(html)
        if m:
            if best is None or m.start() < best:
                best = m.start()
    return best

def find_contact_a(html):
    """Find insertion point before the Contact/Register bare <a> (no <li> wrapper)."""
    # For amberwood-style: <a href="#contact" class="nav-cta">Contact</a>
    # For thecontinuum-style: <a href="#contact" class="nav-cta" onclick=...>Register</a>
    # For velabay: <a href="#contact">Contact</a>
    pats = [
        re.compile(r'<a href="#contact"[^>]*>(?:Register|Contact|Book)[^<]*</a>', re.I),
        re.compile(r'<a href="[^"]*contact[^"]*"[^>]*>[^<]*</a>', re.I),
    ]
    best = None
    for p in pats:
        m = p.search(html)
        if m:
            if best is None or m.start() < best:
                best = m.start()
    return best

def already_has(html):
    # only the actual page link counts (not article 'new-launches-2026.html')
    return 'jetleechannel.sg/new-launch/' in html

results = []
for path, mode in FILES:
    full = os.path.join(WS, path)
    if not os.path.exists(full):
        results.append((path, 'MISSING', ''))
        continue
    html = open(full, encoding='utf-8').read()
    if already_has(html):
        results.append((path, 'SKIP (already)', ''))
        continue

    idx = None
    if mode == 'li':
        idx = find_contact_li(html)
        link = LI_LINK
        # For lucernegrand the li is <li><a href="mortgage-calculator.html"...>Calculator</a> ... Articles
        # contact is <li><a href="#contact" class="nav-cta" onclick="closeMenu()">Register Interest</a></li>
    else:
        idx = find_contact_a(html)
        link = A_LINK

    if idx is None:
        results.append((path, 'NO ANCHOR', ''))
        continue

    # Find end of that <li>...</li> or <a>...</a> element to insert before it
    if mode == 'li':
        # from idx, find closing </li>
        end = html.find('</li>', idx)
        if end == -1:
            results.append((path, 'NO </li>', ''))
            continue
        end += len('</li>')
        insert_pos = end
        # insert new li right after the contact li (so New Launch sits before Register? or after?)
        # Better: insert BEFORE the contact li so nav reads ... New Launch | Contact
        # Actually let's insert before the contact li (idx) — cleaner.
        insert_pos = idx
        new_html = html[:insert_pos] + '\n    ' + link + '\n  ' + html[insert_pos:]
    else:
        end = html.find('</a>', idx)
        if end == -1:
            results.append((path, 'NO </a>', ''))
            continue
        end += len('</a>')
        insert_pos = end
        new_html = html[:insert_pos] + '\n    ' + link + html[insert_pos:]

    if not DRY:
        open(full, 'w', encoding='utf-8').write(new_html)
    results.append((path, 'OK', link[:60]))

print("=" * 70)
for path, status, detail in results:
    print(f"  {status:18s} {path}  {detail}")
print("=" * 70)
if DRY:
    print("DRY RUN — no files written")
