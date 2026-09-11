#!/usr/bin/env python3
"""Fetch UPPERHOUSE at Orchard Boulevard full data from ecoprop/singmap API."""
import hashlib, requests, json, os, sys

SECRET = 'c1d65f3667324592a071ebec5038f38c'
BASE = 'https://api.singmap.com'
IMGBASE = 'https://img.singmap.com'
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
        'User-Agent': 'Mozilla/5.0 Chrome/125.0',
        'Accept': 'application/json, text/plain, */*',
    }
    r = requests.post(BASE + path, data=params, headers=headers, timeout=30)
    try: return r.json()
    except: return {'raw': r.text[:300]}

out = {}

# 1. Resolve project
print("=== getShareParams ===")
sp = post('/app-service/share/getShareParams', {
    'projectName': 'UPPERHOUSE-at-Orchard-Boulevard', 'regNum': 'R007613B',
    'appSource': 'share', 'appVer': '1.0', 'mobileMode': '', 'token': '',
})
print(json.dumps(sp, ensure_ascii=False)[:500])
if not (sp.get('datas') and sp['datas'].get('projectId')):
    print("NO PROJECT ID — trying variants...")
    for name in ['UPPERHOUSE-at-Orchard-Boulevard', 'UpperHouse-at-Orchard-Boulevard', 'UPPER-HOUSE-at-Orchard-Boulevard']:
        sp2 = post('/app-service/share/getShareParams', {
            'projectName': name, 'regNum': 'R007613B',
            'appSource': 'share', 'appVer': '1.0', 'mobileMode': '', 'token': '',
        })
        print(name, '->', json.dumps(sp2, ensure_ascii=False)[:200])
    sys.exit(1)

PROJECT_ID = sp['datas']['projectId']
print("PROJECT_ID:", PROJECT_ID)
out['projectId'] = PROJECT_ID

def q(path, extra=None):
    p = {'projectId': PROJECT_ID, 'agentId': AGENT_ID,
         'appSource': 'share', 'appVer': '1.0', 'mobileMode': '', 'token': ''}
    if extra: p.update(extra)
    return post(path, p)

print("\n=== queryProjectInfo ===")
info = q('/app-service/project/queryProjectInfo')
out['info'] = info
print(json.dumps(info, ensure_ascii=False)[:3000])

print("\n=== queryProjectShareMedia ===")
media = q('/app-service/media/queryProjectShareMedia')
out['media'] = media
print(json.dumps(media, ensure_ascii=False)[:3000])

print("\n=== queryUnitType ===")
ut = q('/app-service/floor/queryUnitType', {'pageNo': 1, 'pageSize': 50})
out['unitTypes'] = ut
print(json.dumps(ut, ensure_ascii=False)[:2000])

print("\n=== queryFloorPlansByType ===")
fp = q('/app-service/floor/queryFloorPlansByType', {'unitType': '', 'pageNo': 1, 'pageSize': 50})
out['floorPlans'] = fp
print(json.dumps(fp, ensure_ascii=False)[:2000])

print("\n=== querySitePlanImg ===")
sp2 = q('/app-service/project/querySitePlanImg')
out['siteplan'] = sp2
print(json.dumps(sp2, ensure_ascii=False)[:800])

print("\n=== unitTypeReport ===")
try:
    utr = q('/app-service/floor/unitTypeReport', {'pageNo': 1, 'pageSize': 50})
    out['unitTypeReport'] = utr
    print(json.dumps(utr, ensure_ascii=False)[:2000])
except Exception as e:
    print("ERR", e)

with open('upperhouse-api.json', 'w', encoding='utf-8') as f:
    json.dump(out, f, ensure_ascii=False, indent=1)
print("\nSaved upperhouse-api.json")
