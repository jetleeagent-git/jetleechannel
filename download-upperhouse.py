#!/usr/bin/env python3
"""Download UPPERHOUSE media from singmap."""
import json, requests, os, urllib.parse

IMGBASE = 'https://img.singmap.com'
os.makedirs('upperhouse/images/floorplans', exist_ok=True)
os.makedirs('upperhouse/docs', exist_ok=True)

def dl(url, dest):
    if os.path.exists(dest) and os.path.getsize(dest) > 1000:
        return 'cached'
    full = url if url.startswith('http') else IMGBASE + url
    try:
        r = requests.get(full, timeout=60, headers={'User-Agent': 'Mozilla/5.0'})
        if r.status_code == 200 and len(r.content) > 1000:
            open(dest, 'wb').write(r.content)
            return f"OK {len(r.content)//1024}KB"
        return f"ERR {r.status_code}"
    except Exception as e:
        return f"ERR {str(e)[:40]}"

data = json.load(open('upperhouse-api.json'))
info = data.get('info', {}).get('datas', {})
media = data.get('media', {}).get('datas', {})

# Gallery images (exclude logos)
logo_kw = ['logo', 'SignatureCollection', 'BespokeCollection', 'BrandGuide', 'ChineseLogo', 'SimplifiedLogo']
gallery = [i for i in media.get('img', []) if not any(k in i['title'] for k in logo_kw)]
print(f"=== GALLERY ({len(gallery)}) ===")
for i in gallery:
    fn = i['abbreviation'] + os.path.splitext(i['url'])[1]
    fn = urllib.parse.unquote(fn)
    fn = fn.replace("'", '').replace(' ', '-')
    dest = f"upperhouse/images/{fn}"
    res = dl(i['url'], dest)
    print(f"{i['title'][:45]}: {res}")

# Floorplans
print(f"\n=== FLOORPLANS ===")
fps = data.get('floorPlans', {}).get('datas', {}).get('lists', [])
for fp in fps:
    fn = fp['floorPlanName'] + os.path.splitext(fp['img'])[1]
    dest = f"upperhouse/images/floorplans/{fn}"
    res = dl(fp['img'], dest)
    print(f"{fp['floorPlanName']} ({fp['type'][:30]}): {res}")

# Siteplan
print(f"\n=== SITEPLAN ===")
sp = data.get('siteplan', {}).get('datas', [])
for s in sp:
    fn = s['sitePlanName'].replace(' ', '-') + os.path.splitext(s['img'])[1]
    dest = f"upperhouse/images/{fn}"
    res = dl(s['img'], dest)
    print(f"{s['sitePlanName']}: {res}")
