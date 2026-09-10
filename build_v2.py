#!/usr/bin/env python3
"""Build ELTA v2 — replaces @@IMG@@ with actual image base URL"""
TEMPLATE = '/home/ubuntu/.openclaw/workspace/index_v2_template.html'
OUTPUT = '/home/ubuntu/.openclaw/workspace/index.html'

with open(TEMPLATE) as f:
    html = f.read()

html = html.replace('@@IMG@@', 'https://eltasingapore.jetleechannel.sg/images')

with open(OUTPUT, 'w') as f:
    f.write(html)

size = len(html.encode('utf-8'))
print(f"HTML: {size/1024:.0f} KB")
print("Written to index.html")
