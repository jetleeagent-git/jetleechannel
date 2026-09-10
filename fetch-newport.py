#!/usr/bin/env python3
"""Fetch Newport Residences full data from ecoprop/singmap API."""
import hashlib, requests, json

SECRET = 'c1d65f3667324592a071ebec5038f38c'
BASE = 'https://api.singmap.com'
IMGBASE = 'https://img.singmap.com'
PROJECT_ID = '89abbcafcb6d4b85a543d4131a5148fb'
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
print("=== queryProjectInfo ===")
info = post('/app-service/project/queryProjectInfo', {
    'projectId': PROJECT_ID, 'agentId': AGENT_ID,
    'appSource': 'share', 'appVer': '1.0', 'mobileMode': '', 'token': '',
})
out['info'] = info
print(json.dumps(info, ensure_ascii=False)[:2500])

print("\n=== queryProjectShareMedia ===")
media = post('/app-service/media/queryProjectShareMedia', {
    'projectId': PROJECT_ID, 'agentId': AGENT_ID,
    'appSource': 'share', 'appVer': '1.0', 'mobileMode': '', 'token': '',
})
out['media'] = media
print(json.dumps(media, ensure_ascii=False)[:2500])

print("\n=== queryUnitType ===")
ut = post('/app-service/floor/queryUnitType', {
    'projectId': PROJECT_ID, 'agentId': AGENT_ID, 'pageNo': 1, 'pageSize': 50,
    'appSource': 'share', 'appVer': '1.0', 'mobileMode': '', 'token': '',
})
out['unitTypes'] = ut
print(json.dumps(ut, ensure_ascii=False)[:1000])

print("\n=== queryFloorPlansByType ===")
fp = post('/app-service/floor/queryFloorPlansByType', {
    'projectId': PROJECT_ID, 'agentId': AGENT_ID, 'unitType': '', 'pageNo': 1, 'pageSize': 50,
    'appSource': 'share', 'appVer': '1.0', 'mobileMode': '', 'token': '',
})
out['floorplans'] = fp
print(json.dumps(fp, ensure_ascii=False)[:2000])

print("\n=== querySitePlanImg ===")
sp = post('/app-service/siteplan/querySitePlanImg', {
    'projectId': PROJECT_ID, 'agentId': AGENT_ID,
    'appSource': 'share', 'appVer': '1.0', 'mobileMode': '', 'token': '',
})
out['siteplan'] = sp
print(json.dumps(sp, ensure_ascii=False)[:1200])

print("\n=== unitTypeReport ===")
ur = post('/app-service/unit/unitTypeReport', {
    'projectId': PROJECT_ID, 'agentId': AGENT_ID,
    'appSource': 'share', 'appVer': '1.0', 'mobileMode': '', 'token': '',
})
out['availability'] = ur
print(json.dumps(ur, ensure_ascii=False)[:2500])

json.dump(out, open('/tmp/newport-full.json', 'w'), ensure_ascii=False)
print("\nsaved /tmp/newport-full.json")
