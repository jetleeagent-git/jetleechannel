#!/usr/bin/env python3
"""Fetch River Green full data: project info, media, floor plans, site plan."""
import hashlib, requests, json, os, sys

SECRET = 'c1d65f3667324592a071ebec5038f38c'
BASE = 'https://api.singmap.com'
IMGBASE = 'https://img.singmap.com'
PROJECT_ID = '26c7f1c04dfa4e7eba1a830c9cd0b3ab'
AGENT_ID = '52c577d8165b40d8a1c64348a5f216c7'

def sign(params):
    excluded = {'file', 'appVer', 'mobileMode', 'appSource', 'token', 'keyword', 'signature'}
    keys = sorted(k for k in params if k not in excluded)
    raw = ''.join(str(params[k]) for k in keys) + SECRET
    return hashlib.md5(raw.encode('utf-8')).hexdigest()

def post(path, params):
    params = dict(params)
    params['signature'] = sign(params)
    headers = {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Origin': 'https://share.ecoprop.com',
        'Referer': 'https://share.ecoprop.com/',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0 Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
    }
    r = requests.post(BASE + path, data=params, headers=headers, timeout=30)
    try:
        return r.json()
    except Exception:
        return {'raw': r.text[:500]}

out = {}

print("=== queryProjectInfo ===")
info = post('/app-service/project/queryProjectInfo', {
    'projectId': PROJECT_ID, 'agentId': AGENT_ID,
    'appSource': 'share', 'appVer': '1.0', 'mobileMode': '', 'token': '',
})
out['info'] = info
print(json.dumps(info, ensure_ascii=False)[:3000])

print("\n=== queryProjectShareMedia ===")
media = post('/app-service/media/queryProjectShareMedia', {
    'projectId': PROJECT_ID, 'agentId': AGENT_ID,
    'appSource': 'share', 'appVer': '1.0', 'mobileMode': '', 'token': '',
})
out['media'] = media
print(json.dumps(media, ensure_ascii=False)[:4000])

print("\n=== queryUnitType ===")
ut = post('/app-service/floor/queryUnitType', {
    'projectId': PROJECT_ID, 'agentId': AGENT_ID,
    'appSource': 'share', 'appVer': '1.0', 'mobileMode': '', 'token': '',
})
out['unitTypes'] = ut
print(json.dumps(ut, ensure_ascii=False)[:2000])

print("\n=== querySitePlanImg ===")
sp = post('/app-service/siteplan/querySitePlanImg', {
    'projectId': PROJECT_ID, 'agentId': AGENT_ID,
    'appSource': 'share', 'appVer': '1.0', 'mobileMode': '', 'token': '',
})
out['siteplan'] = sp
print(json.dumps(sp, ensure_ascii=False)[:2000])

print("\n=== queryFloorPlansByType (each unit type) ===")
fps = {}
types = []
d = ut.get('datas')
if isinstance(d, list):
    types = [x.get('unitType') or x.get('unitTypeName') or x.get('type') for x in d if x]
elif isinstance(d, dict):
    types = list(d.keys())
for t in types:
    if not t: continue
    fp = post('/app-service/floor/queryFloorPlansByType', {
        'projectId': PROJECT_ID, 'agentId': AGENT_ID, 'unitType': t,
        'appSource': 'share', 'appVer': '1.0', 'mobileMode': '', 'token': '',
    })
    fps[str(t)] = fp
    print(f"  {t}: {json.dumps(fp, ensure_ascii=False)[:500]}")
out['floorplans'] = fps

open('/tmp/rivergreen-full.json', 'w').write(json.dumps(out, ensure_ascii=False))
print("\nsaved /tmp/rivergreen-full.json")
