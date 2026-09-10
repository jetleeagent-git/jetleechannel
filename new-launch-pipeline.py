#!/usr/bin/env python3
"""
Fetch each live jetleechannel.sg page, inject the 'New Launch' nav link,
save to local source file, and (optionally) upload via FTP.

This preserves whatever is currently live (including per-site Articles links)
and only adds the New Launch nav item.

Usage:
  python3 new-launch-pipeline.py sync       # fetch live + inject + save local
  python3 new-launch-pipeline.py upload     # upload local (already-injected) files to FTP
  python3 new-launch-pipeline.py all        # fetch + inject + save + upload
"""
import re, sys, os, subprocess, time

WS = '/home/ubuntu/.openclaw/workspace'
URL = 'https://jetleechannel.sg/new-launch/'
FTP_HOST = '191.101.228.66'
FTP_USER = 'u851958941.jetleechannel.sg'
FTP_PASS = 'Jetleechannel12345&'

# local_file -> (live_path, ftp_subdir)
SITES = [
    ('site-jetleechannel.html',       '/',            ''),
    ('site-arcady.html',              '/arcady/',     'arcady'),
    ('site-dunearnhouse.html',        '/dunearnhouse/','dunearnhouse'),
    ('site-elta.html',                '/elta/',       'elta'),
    ('site-amberwood.html',           '/amberwood/',  'amberwood'),
    ('site-hougangcentral.html',      '/hougangcentral/','hougangcentral'),
    ('site-lentorgardens.html',       '/lentor-gardens/','lentor-gardens'),
    ('site-lucernegrand.html',        '/lucernegrand/','lucernegrand'),
    ('site-unionsquare.html',         '/unionsquare/','unionsquare'),
    ('site-hudsonplace.html',         '/hudsonplace/','hudsonplace'),
    ('site-onemarinagarden.html',     '/OneMarinaGardens/','OneMarinaGardens'),
    ('site-generations-tannery.html', '/generations-tannery/','generations-tannery'),
    ('site-thecontinuum.html',        '/thecontinuum/','thecontinuum'),
    ('theorie/index.html',            '/TheOrie/',    'TheOrie'),
    ('thesierra/index.html',          '/TheSierra/',  'TheSierra'),
    ('sophiameadow/index.html',       '/SophiaMeadow/','SophiaMeadow'),
    ('bagnallhous/index.html',        '/bagnallhous/','bagnallhous'),
    ('upperhouse/index.html',         '/upperhouse/','upperhouse'),
    ('zyongrand/index.html',          '/zyongrand/',  'zyongrand'),
    ('promenadepeak/index.html',      '/promenadepeak/','promenadepeak'),
    ('rivergreen/index.html',         '/rivergreen/','rivergreen'),
    ('newportresidences/index.html',  '/newportresidences/','newportresidences'),
    ('granddunman/index.html',        '/granddunman/','granddunman'),
    ('thesen/index.html',             '/thesen/',     'thesen'),
    ('velabay/index.html',            '/velabay/',    'velabay'),
    ('narraresidences/index.html',    '/narraresidences/','narraresidences'),
    ('projects/aurea/index.html',     '/aurea/',       'aurea'),
    ('robertsonopus-live.html',       '/robertsonopus/','robertsonopus'),
    ('articles/index.html',           '/articles/',   'articles'),
]

LI_LINK = '<li><a href="%s" rel="noopener">New Launch</a></li>' % URL
A_LINK = '<a href="%s" rel="noopener" style="font-weight:600">New Launch</a>' % URL

def inject(html):
    """Insert New Launch link before the nav Contact/Register link. Returns (new_html, ok, how)."""
    if 'jetleechannel.sg/new-launch/' in html:
        return html, True, 'already'
    # Try <li><a href="#contact" or #ct ...> patterns
    li_pat = re.compile(r'<li><a href="#(?:contact|ct)"[^>]*>', re.I)
    li_m = li_pat.search(html)
    if li_m:
        idx = li_m.start()
        return html[:idx] + '\n    ' + LI_LINK + '\n  ' + html[idx:], True, 'li'
    # Try bare <a href="#contact" ...> (amberwood/thecontinuum/velabay/articles)
    a_pat = re.compile(r'<a href="#(?:contact|ct)"[^>]*>(?:Register|Contact|Book)[^<]*</a>', re.I)
    a_m = a_pat.search(html)
    if a_m:
        idx = a_m.start()
        return html[:idx] + A_LINK + '\n    ' + html[idx:], True, 'a'
    # Fallback: insert after </ul> that contains nav-links/nl (before nav-cta)
    ul_pat = re.compile(r'</ul>')
    ul_m = ul_pat.search(html)
    if ul_m:
        idx = ul_m.end()
        return html[:idx] + '\n    ' + LI_LINK + html[idx:], True, 'ul-fallback'
    return html, False, 'no-anchor'

def fetch(url):
    r = subprocess.run(['curl', '-s', '-L', url, '-A', 'Mozilla/5.0'], capture_output=True, text=True)
    return r.stdout

def save(path, content):
    full = os.path.join(WS, path)
    os.makedirs(os.path.dirname(full), exist_ok=True) if os.path.dirname(path) else None
    with open(full, 'w', encoding='utf-8') as f:
        f.write(content)

def main():
    mode = sys.argv[1] if len(sys.argv) > 1 else 'sync'
    do_fetch = mode in ('sync', 'all')
    do_upload = mode in ('upload', 'all')

    if do_fetch:
        print("═══ STEP 1: Fetch live + inject + save local ═══")
        for local, live_path, ftp_sub in SITES:
            url = 'https://jetleechannel.sg' + live_path
            html = fetch(url)
            if len(html) < 2000:
                print(f"  ⚠ {local}: fetch suspiciously short ({len(html)} bytes), skipping")
                continue
            new_html, ok, how = inject(html)
            if not ok:
                print(f"  ❌ {local}: {how}")
                continue
            save(local, new_html)
            print(f"  ✅ {local} <- {url}  ({how})")

    if do_upload:
        print("═══ STEP 2: Upload to FTP ═══")
        for local, live_path, ftp_sub in SITES:
            full = os.path.join(WS, local)
            if not os.path.exists(full):
                print(f"  ⚠ {local}: missing, skip")
                continue
            if 'jetleechannel.sg/new-launch/' not in open(full, encoding='utf-8').read():
                print(f"  ⚠ {local}: no New Launch link (not injected?), skip upload")
                continue
            if ftp_sub:
                ftp_path = f"/{ftp_sub}/index.html"
            else:
                ftp_path = "/index.html"
            r = subprocess.run([
                'curl', '-s', '-T', full,
                f'ftp://{FTP_HOST}{ftp_path}',
                '--user', f'{FTP_USER}:{FTP_PASS}',
                '-o', '/dev/null', '-w', '%{http_code}'
            ], capture_output=True, text=True)
            code = r.stdout.strip()
            ok = code in ('226', '250')
            print(f"  {'✅' if ok else '❌'} {ftp_path}: {code}")
            time.sleep(0.3)

if __name__ == '__main__':
    main()
