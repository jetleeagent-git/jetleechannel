#!/usr/bin/env python3
"""Fetch River Green data from ecoprop/singmap API."""
import hashlib, requests, json, os

SECRET = 'c1d65f3667324592a071ebec5038f38c'
BASE = 'https://api.singmap.com'
IMGBASE = 'https://img.singmap.com'
AGENT_ID = '52c577d8165b40d8a1c64348a5f216c7'

def sign(params):
    """MD5 signature: sort keys, concat values (exclude excluded keys), append secret."""
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

# 1. Get share params
print("=== getShareParams ===")
sp = post('/app-service/share/getShareParams', {
    'projectName': 'River-Green',
    'regNum': 'R007613B',
    'appSource': 'share',
    'appVer': '1.0',
    'mobileMode': '',
    'token': '',
})
print(json.dumps(sp, ensure_ascii=False, indent=1)[:2000])

project_id = None
agent_id = None
datas = sp.get('datas')
if isinstance(datas, dict):
    project_id = datas.get('projectId') or datas.get('project_id')
    agent_id = datas.get('agentId') or datas.get('agent_id')
elif isinstance(datas, list) and datas:
    project_id = datas[0].get('projectId') or datas[0].get('project_id')
    agent_id = datas[0].get('agentId') or datas[0].get('agent_id')
if not project_id and isinstance(datas, str):
    # maybe plain string
    pass
print(f"\nprojectId={project_id} agentId={agent_id}")
open('/tmp/rivergreen-params.json', 'w').write(json.dumps(sp, ensure_ascii=False))
