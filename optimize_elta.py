#!/usr/bin/env python3
"""
Optimize ELTA site:
1. Extract all base64 images to real .jpg files
2. Add Neighborhood section, People Also Ask, Breadcrumb schema, Product schema, HowTo schema
3. Add internal links to blog
4. Rebuild page (from base64 to URL references)
"""

import os, json, base64, struct

enc_dir = '/home/ubuntu/.openclaw/workspace/elta_enc_opt'
out_dir = '/home/ubuntu/.openclaw/workspace/elta_images'

os.makedirs(out_dir, exist_ok=True)

# Image files and their output names
image_map = {
    'hero': 'hero.jpg',
    'towers': 'towers.jpg',
    'arch': 'arch.jpg',
    'night': 'night.jpg',
    'living': 'living.jpg',
    'lobby': 'lobby.jpg',
    'facilities': 'facilities.jpg',
    'master_bedroom': 'master_bed.jpg',
    'g05': 'g05.jpg','g07': 'g07.jpg','g10': 'g10.jpg','g11': 'g11.jpg',
    'g16': 'g16.jpg','g17': 'g17.jpg','g20': 'g20.jpg','g26': 'g26.jpg',
    'g27': 'g27.jpg','g28': 'g28.jpg',
    'location_map': 'location_map.jpg',
    'logo': 'logo.jpg',
    'lower_floors': 'lower_floors.jpg',
    'site_section': 'site_section.jpg',
    'siteplan': 'siteplan.jpg',
    'siteplan_thumb': 'siteplan_thumb.jpg',
    'fp_5br': 'fp_5br.jpg', 'fp_5br_thumb': 'fp_5br_thumb.jpg',
    'fp_4br_study': 'fp_4br_study.jpg', 'fp_4br_study_thumb': 'fp_4br_study_thumb.jpg',
    'fp_4br_dual': 'fp_4br_dual.jpg', 'fp_4br_dual_thumb': 'fp_4br_dual_thumb.jpg',
    'fp_4br_prem': 'fp_4br_prem.jpg', 'fp_4br_prem_thumb': 'fp_4br_prem_thumb.jpg',
    'fp_4br_std': 'fp_4br_std.jpg', 'fp_4br_std_thumb': 'fp_4br_std_thumb.jpg',
    'fp_4br_plus': 'fp_4br_plus.jpg', 'fp_4br_plus_thumb': 'fp_4br_plus_thumb.jpg',
    'fp_3br': 'fp_3br.jpg', 'fp_3br_thumb': 'fp_3br_thumb.jpg',
    'fp_2br_study': 'fp_2br_study.jpg', 'fp_2br_study_thumb': 'fp_2br_study_thumb.jpg',
    'fp_1br_study': 'fp_1br_study.jpg', 'fp_1br_study_thumb': 'fp_1br_study_thumb.jpg',
}

# Extract images
for name, fname in image_map.items():
    with open(f'{enc_dir}/{name}.txt') as f:
        data = f.read().strip()
    # Handle potential base64 with or without data URI prefix
    if ',' in data:
        data = data.split(',', 1)[1]
    try:
        img_bytes = base64.b64decode(data)
        with open(f'{out_dir}/{fname}', 'wb') as f:
            f.write(img_bytes)
        sz = len(img_bytes) / 1024
        print(f'  {fname} -> {sz:.0f}KB')
    except Exception as e:
        print(f'  {name}.txt -> ERROR: {e}')

# Calculate total
total = sum(os.path.getsize(f'{out_dir}/{v}') for v in image_map.values()) / 1024
print(f'\nTotal images: {total:.0f}KB')
print(f'Total files: {len(os.listdir(out_dir))}')
