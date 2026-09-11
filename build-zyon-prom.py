#!/usr/bin/env python3
"""Generate zyongrand + promenadepeak project pages from theorie template."""
import os, json, re

TPL = open('theorie/index.html', encoding='utf-8').read()

# ============ PROJECT DATA ============
PROJECTS = {
    'zyongrand': {
        'dir': 'zyongrand',
        'site': 'zyongrand',
        'name': 'Zyon Grand',
        'name_cn': '卓悦峰',
        'title': 'Zyon Grand | 706 Units D03 Kim Seng Road | Direct Developer Price | Jet Lee',
        'desc': 'Zyon Grand – 706 units at 3/5 Kim Seng Road, District 3. 2 towers of 62 storeys + 36-storey serviced residences by CDL & Mitsui Fudosan. 1BR+Study to 5BR Supreme & Penthouse. 99-year leasehold, TOP Sep 2032. Register interest with Jet Lee.',
        'tagline': 'Two Iconic 62-Storey Towers on Kim Seng Road',
        'hero_tag': '99-Year Leasehold · District 3',
        'hero_img': '/zyongrand/images/hero-day.jpg',
        'ticker': 'ZYON GRAND · 3 & 5 KIM SENG ROAD · DISTRICT 3 · 99-YEAR LEASEHOLD · 706 UNITS · 2 TOWERS OF 62 STOREYS · CDL · MITSUI FUDOSAN',
        'stats': [('706','Units'),('2 × 62','Storeys'),('15,277','Sqm Land'),('D3','District')],
        'wa_msg': 'Hi%20Jet%20Lee%2C%20interested%20in%20Zyon%20Grand',
        'overview_label': 'Project Overview',
        'overview_title': 'A New Icon on <em>Kim Seng Road</em>',
        'overview_p1': '<strong>Zyon Grand</strong> is an integrated mixed-development by <strong>CDL and Mitsui Fudosan</strong> — two iconic <strong>62-storey residential towers</strong> with a connected <strong>36-storey serviced apartment tower</strong> offering restaurants, a supermarket and an early childhood development centre. North-south orientation delivers panoramic views towards Sentosa, the CBD and Marina Bay Sands.',
        'overview_p2': 'With <strong>direct access to Havelock MRT Station</strong>, Zyon Grand sits at the heart of the Alexandra/Commonwealth district — one stop to Outram Park interchange, two stops to Orchard, and a short walk to Great World City. Designed by world-class architects <strong>Nikken Sekkei × ADDP Architects LLP</strong>.',
        'overview_p3': 'Residents enjoy comprehensive facilities including a 50m lap pool, tennis/pickleball court, clubhouses, hydro spa, yoga studio and lush lagoon pools — all wrapped in premium kitchen appliances and Italian master wardrobes.',
        'facts': [
            ('Project Name','Zyon Grand 卓悦峰'),
            ('Developer','CDL · Mitsui Fudosan'),
            ('Tenure','99 Years (from 15 Jul 2024)'),
            ('District','District 3 (Alexandra / Commonwealth)'),
            ('Address','3 & 5 Kim Seng Road'),
            ('Site Area','15,276.8 sqm'),
            ('Total Units','706 Units'),
            ('Towers','2 × 62 Storeys + 1 × 36 Storeys'),
            ('Architect','Nikken Sekkei × ADDP Architects LLP'),
            ('Expected T.O.P.','Sep 2032'),
        ],
        'gallery': [
            ('/zyongrand/images/hero-day.jpg','Hero Perspective','Perspective'),
            ('/zyongrand/images/relaxation-lagoon.jpg','Relaxation Lagoon','Facilities'),
            ('/zyongrand/images/waterfall-cove.jpg','Waterfall Cove','Facilities'),
            ('/zyongrand/images/lap-pool.jpg','50m Lap Pool','Facilities'),
            ('/zyongrand/images/perspective-2.jpg','Perspective View','Perspective'),
            ('/zyongrand/images/hero-evening.jpg','Evening View','Perspective'),
        ],
        'floorplans': [
            ('A1s','1 Bedroom + Study'),
            ('B1','2 Bedroom'),
            ('BP1','2 Bedroom Premium'),
            ('BP2s','2 Bedroom Premium + Study'),
            ('C1','3 Bedroom'),
            ('CD1','3 Bedroom Deluxe'),
            ('CP1s','3 Bedroom Premium + Study'),
            ('CP2s','3 Bedroom Premium + Study'),
            ('DP1','4 Bedroom Premium (Private Lift)'),
            ('DS1','4 Bedroom Supreme (Private Lift)'),
            ('DS2s','4 Bedroom Supreme + Study (Private Lift)'),
            ('ES1','5 Bedroom Supreme (Private Lift)'),
            ('PH1','Penthouse 5BR (Private Lift)'),
            ('PH2','Penthouse 5BR (Private Lift)'),
        ],
        'floorplan_intro': 'Explore the full range of Zyon Grand floor plans — from 1-Bedroom + Study to 5-Bedroom Supreme and Penthouses. Click any layout to view it full size, or download the official e-brochure below.',
        'pdfs': [
            ('/zyongrand/docs/Zyon_Grand_eBrochure.pdf','📖 Download E-Brochure'),
            ('/zyongrand/docs/Zyon_Grand_2025.09.11-Brochure_Plans.pdf','📐 Brochure Floor Plans'),
        ],
        'balance_title': 'Current Balance · as of 4 Aug 2026',
        'balance_rows': [
            ('1 Bedroom + Study','27','Available'),
            ('2 Bedroom Premium + Study','9','Available'),
            ('3 Bedroom','4','Available'),
            ('4 Bedroom Supreme + Study','11','Available'),
            ('5 Bedroom Supreme','18','Available'),
            ('Penthouse (5BR + Private Lift)','1','Available'),
        ],
        'balance_total': ('Current Available','70 Units','—'),
        'siteplan': '/zyongrand/images/siteplan.jpg',
        'siteplan_alt': 'Zyon Grand Site Plan',
        'location_title': 'Heart of <em>Kim Seng</em>',
        'location_p': 'Zyon Grand enjoys exceptional connectivity — <strong>direct access to Havelock MRT (466m)</strong>, Great World MRT 657m, Tiong Bahru MRT 1.5km. One stop to Outram Park Interchange, two stops to Orchard Road, four stops to Marina Bay. Schools nearby: River Valley Primary, Alexandra Primary, Zhangde Primary, Gan Eng Seng School, Crescent Girls’ School.',
        'location_items': [
            ('Havelock MRT','Direct Access'),
            ('Great World MRT','657m'),
            ('Outram Park Interchange','1 Stop'),
            ('Orchard Interchange','2 Stops'),
            ('Marina Bay','4 Stops'),
        ],
        'amenities_title': 'A Lifestyle <em>Above the Rest</em>',
        'amenities_items': [
            ('Arrival Sanctuary','Grand Pavilion · Reflective Court · Arrival Cascades · Water Reflexology'),
            ('Social Habitat','Central Club · Tennis / Pickleball Court · Adventure Playground · Pets Play'),
            ('Relaxation Lagoon','Lagoon Deck · Bubbling Pool · Hydro Splash · Hydro Spa · Family Pool'),
            ('Wellness Oasis','50m Lap Pool · Waterfall Cove · Fitness Suite · Yoga Studio · Steam Room'),
        ],
        'features_title': 'Why <em>Zyon Grand</em>',
        'features_items': [
            ('Direct Havelock MRT','Integrated access to Havelock MRT Station at your doorstep'),
            ('Iconic 62-Storey Towers','Two landmark towers with panoramic Sentosa, CBD & MBS views'),
            ('CDL × Mitsui Fudosan','Renowned developers with a track record of quality'),
            ('World-Class Design','Nikken Sekkei × ADDP Architects LLP collaboration'),
            ('Integrated Living','Restaurants, supermarket & ECDC within the development'),
            ('Premium Interiors','Italian master wardrobes & premium kitchen appliances'),
        ],
        'faq': [
            ('What is Zyon Grand?','Zyon Grand is a 706-unit integrated mixed development at 3 & 5 Kim Seng Road, District 3, by CDL and Mitsui Fudosan.'),
            ('What is the tenure?','99-year leasehold commencing from 15 July 2024.'),
            ('When is TOP?','Expected T.O.P. in September 2032.'),
            ('What unit types are available?','From 1-Bedroom + Study to 5-Bedroom Supreme (with private lift) and Penthouses.'),
            ('How near is the MRT?','Direct access to Havelock MRT Station — one stop to Outram Park Interchange.'),
        ],
        'contact_wa': 'https://wa.me/6587649315?text=Hi%20Jet%20Lee%2C%20interested%20in%20Zyon%20Grand',
    },
    'promenadepeak': {
        'dir': 'promenadepeak',
        'site': 'promenadepeak',
        'name': 'Promenade Peak',
        'name_cn': '',
        'title': 'Promenade Peak | 596 Units D03 Zion Road | Direct Developer Price | Jet Lee',
        'desc': 'Promenade Peak – 596 units at 1 Zion Promenade, District 3. Luxury 99-year leasehold condominium by Allgreen Properties (Kheng Leong). 1BR+Study to 5BR Premium with private lift, sky pools at Level 43 & roof. TOP Feb 2031. Register interest with Jet Lee.',
        'tagline': 'Luxury Living on Zion Road, District 3',
        'hero_tag': '99-Year Leasehold · District 3',
        'hero_img': '/promenadepeak/images/roof-top.jpg',
        'ticker': 'PROMENADE PEAK · 1 ZION PROMENADE · DISTRICT 3 · 99-YEAR LEASEHOLD · 596 UNITS · LUXURY RESIDENTIAL · ALLGREEN PROPERTIES',
        'stats': [('596','Units'),('43','Storeys'),('9,286','Sqm Land'),('D3','District')],
        'wa_msg': 'Hi%20Jet%20Lee%2C%20interested%20in%20Promenade%20Peak',
        'overview_label': 'Project Overview',
        'overview_title': 'Luxury on <em>Zion Road</em>',
        'overview_p1': '<strong>Promenade Peak</strong> is a luxury condominium along Zion Road in Singapore\'s prestigious <strong>District 3</strong>, developed by <strong>Allgreen Properties (Kheng Leong Group)</strong>. This 99-year leasehold development features <strong>596 residential units</strong> across a high-rise tower with breathtaking skyline views.',
        'overview_p2': 'Just <strong>311m from Havelock MRT Station</strong> and a short stroll to Great World MRT (580m), residents enjoy effortless connectivity — one stop to Outram Park Interchange, minutes to Orchard Road and the CBD. The Ganges Ave / Zion Road enclave is set for transformation into a vibrant riverside lifestyle district.',
        'overview_p3': 'Rise above it all with three levels of sky amenities — a <strong>50m lap pool, sky infinity pool on the roof, gymnasium, boxing & cross-training areas, hydrospa bay</strong> and lush canopy decks, all curated for resort-style living.',
        'facts': [
            ('Project Name','Promenade Peak'),
            ('Developer','Allgreen Properties (Kheng Leong)'),
            ('Tenure','99 Years (from 4 Nov 2024)'),
            ('District','District 3 (Alexandra / Commonwealth)'),
            ('Address','1 Zion Promenade'),
            ('Site Area','9,285.9 sqm'),
            ('Total Units','596 Units'),
            ('Project Type','Residential Highrise'),
            ('Launch','Aug 2025'),
            ('Expected T.O.P.','Feb 2031'),
        ],
        'gallery': [
            ('/promenadepeak/images/roof-top.jpg','Sky Peak Roof','Facilities'),
            ('/promenadepeak/images/view-43f.jpg','View from Level 43','View'),
            ('/promenadepeak/images/view-22f.jpg','View from Level 22','View'),
            ('/promenadepeak/images/tier1-2.jpg','Tower Perspective','Perspective'),
            ('/promenadepeak/images/drone.jpg','Aerial View','Perspective'),
            ('/promenadepeak/images/view-1l.jpg','Promenade Level','Facilities'),
        ],
        'floorplans': [
            ('AS1','1 Bedroom + Study'),
            ('AS2','1 Bedroom + Study'),
            ('B1','2 Bedroom'),
            ('B2','2 Bedroom'),
            ('B3','2 Bedroom'),
            ('B4','2 Bedroom'),
            ('B5','2 Bedroom'),
            ('BS1','2 Bedroom + Study'),
            ('BS2','2 Bedroom + Study'),
            ('BS3','2 Bedroom + Study'),
            ('C1','3 Bedroom'),
            ('C2','3 Bedroom'),
            ('CP1','3 Bedroom Premium (Private Lift)'),
            ('CP2','3 Bedroom Premium (Private Lift)'),
            ('DP1','4 Bedroom Premium (Private Lift)'),
            ('DP2','4 Bedroom Premium (Private Lift)'),
            ('DP3','4 Bedroom Premium (Private Lift)'),
            ('EP1','5 Bedroom Premium (Private Lift)'),
        ],
        'floorplan_intro': 'Explore the full range of Promenade Peak floor plans — from 1-Bedroom + Study to 5-Bedroom Premium with private lift. Click any layout to view it full size, or download the official e-brochure below.',
        'pdfs': [
            ('/promenadepeak/docs/Promenade_Peak_E-Brochure.pdf','📖 Download E-Brochure'),
        ],
        'balance_title': 'Current Balance · as of 4 Aug 2026',
        'balance_rows': [
            ('1 Bedroom + Study','37','Available'),
            ('2 Bedroom','18','Available'),
            ('2 Bedroom + Study','63','Available'),
            ('3 Bedroom','3','Available'),
            ('3 Bedroom Premium (Private Lift)','5','Available'),
            ('4 Bedroom Premium (Private Lift)','18','Available'),
            ('5 Bedroom Premium (Private Lift)','15','Available'),
        ],
        'balance_total': ('Current Available','159 Units','—'),
        'siteplan': '/promenadepeak/images/siteplan.jpg',
        'siteplan_alt': 'Promenade Peak Site Plan',
        'location_title': 'Zion Road <em>Riverside</em>',
        'location_p': 'Promenade Peak is <strong>311m from Havelock MRT</strong> and 580m from Great World MRT. One stop to Outram Park Interchange, minutes to Clarke Quay, Orchard Road and the CBD. The Zion Road / Ganges Avenue area is being revitalised with new parks, retail and riverfront promenades.',
        'location_items': [
            ('Havelock MRT','311m'),
            ('Great World MRT','580m'),
            ('Tiong Bahru MRT','1.5km'),
            ('Clarke Quay MRT','1.9km'),
            ('Outram Park Interchange','1 Stop'),
        ],
        'amenities_title': 'Three Levels of <em>Sky Amenities</em>',
        'amenities_items': [
            ('The Promenade (L1)','50m Lap Pool · Promenade Bar · Serenity Cove · Alfresco Dining'),
            ('The Canopy (Upper)','Tree Top Pavilion · Canopy Deck · Club Canopy'),
            ('Social Peak (L22)','Hanging Garden · Floating Hammock · Social Pods · Green Haven'),
            ('Wellness Peak (L43)','Gymnasium · Boxing & Cross-Training · Zen Veranda · Steam Room'),
            ('Sky Peak (Roof)','Sky Infinity Pool · Sky Champagne Pool · Sky Lounge · Sky Observatory'),
        ],
        'features_title': 'Why <em>Promenade Peak</em>',
        'features_items': [
            ('Allgreen Properties','Backed by the Kheng Leong Group — a name synonymous with quality'),
            ('3 Sky Amenity Levels','Roof infinity pool, Level 43 wellness & Level 22 social decks'),
            ('Private Lift Options','3BR Premium to 5BR Premium with private lift access'),
            ('Havelock MRT 311m','Steps from Havelock MRT — one stop to Outram Park'),
            ('Riverside Lifestyle','Zion Road transformation with riverfront promenades & parks'),
            ('Luxury Finishes','Curated interiors with premium fittings throughout'),
        ],
        'faq': [
            ('What is Promenade Peak?','Promenade Peak is a 596-unit luxury condominium at 1 Zion Promenade, District 3, developed by Allgreen Properties.'),
            ('What is the tenure?','99-year leasehold from 4 November 2024.'),
            ('When is TOP?','Expected T.O.P. in February 2031.'),
            ('What unit types are available?','From 1-Bedroom + Study to 5-Bedroom Premium with private lift.'),
            ('What amenities are there?','50m lap pool, roof sky infinity pool, gym, boxing area, hydrospa bay, playground and more across three sky levels.'),
        ],
        'contact_wa': 'https://wa.me/6587649315?text=Hi%20Jet%20Lee%2C%20interested%20in%20Promenade%20Peak',
    },
}

# ============ TEMPLATE BUILDERS ============

def build_floorplan_items(p, site):
    items = []
    for fp, fp_type in p['floorplans']:
        img_path = f"/{site}/images/floorplans/{fp}.jpg"
        # check if the file exists as jpg (already converted)
        local = os.path.join(p['dir'], 'images', 'floorplans', fp + '.jpg')
        ext = '.jpg'
        if not os.path.exists(local):
            local = os.path.join(p['dir'], 'images', 'floorplans', fp + '.png')
            ext = '.png'
        img_path = f"/{site}/images/floorplans/{fp}{ext}"
        items.append(f'''      <div class="floorplan-item">
        <a href="{img_path}" target="_blank" data-lightbox="floorplans" data-title="{fp} · {fp_type}">
          <img src="{img_path}" alt="{p['name']} {fp} Floor Plan {fp_type}" loading="lazy">
        </a>
        <div class="floorplan-label">{fp} · {fp_type}</div>
      </div>''')
    return '\n'.join(items)

def build_balance_rows(p):
    rows = []
    for t, n, s in p['balance_rows']:
        rows.append(f'''          <tr>
            <td>{t}</td>
            <td>{n}</td>
            <td>{s}</td>
          </tr>''')
    total_t, total_n, total_s = p['balance_total']
    rows.append(f'''          <tr class="total">
            <td>{total_t}</td>
            <td>{total_n}</td>
            <td>{total_s}</td>
          </tr>''')
    return '\n'.join(rows)

def build_gallery(p, site):
    items = []
    for src, alt, badge in p['gallery']:
        items.append(f'''      <div class="gallery-item"><span class="gallery-badge">{badge}</span><img src="{src}" alt="{alt}" loading="lazy"></div>''')
    return '\n'.join(items)

def build_location_items(p):
    return '\n'.join(f'''        <div class="loc-item"><div class="loc-name">{n}</div><div class="loc-dist">{d}</div></div>''' for n, d in p['location_items'])

def build_amenities(p):
    return '\n'.join(f'''        <div class="amenity-card"><div class="amenity-name">{n}</div><div class="amenity-desc">{d}</div></div>''' for n, d in p['amenities_items'])

def build_features(p):
    return '\n'.join(f'''        <div class="feature-item"><div class="feature-name">{n}</div><div class="feature-desc">{d}</div></div>''' for n, d in p['features_items'])

def build_faq(p):
    items = []
    for i, (q, a) in enumerate(p['faq']):
        items.append(f'''      <div class="faq-item">
        <div class="faq-q" onclick="toggleFaq(this)">{q}<span class="faq-icon">+</span></div>
        <div class="faq-a">{a}</div>
      </div>''')
    return '\n'.join(items)

def build_facts(p):
    return '\n'.join(f'''        <div class="fact-item"><div class="fact-label">{k}</div><div class="fact-value">{v}</div></div>''' for k, v in p['facts'])

def build_pdfs(p):
    return '\n'.join(f'''      <a href="{url}" target="_blank" rel="noopener" class="btn-primary">📐 {label}</a>''' if 'PDF' in label else f'''      <a href="{url}" target="_blank" rel="noopener" class="btn-outline">{label}</a>''' for url, label in p['pdfs'])

def build_site(site, p):
    html = TPL
    # --- head ---
    html = html.replace('<title>The Orie | 777 Units D12 Toa Payoh | Direct Developer Price | Jet Lee</title>', f'<title>{p["title"]}</title>')
    html = html.replace('<meta name="description" content="The Orie – 777 units at Lorong 1 Toa Payoh, District 12. 2 towers of 40 storeys by CDL, Frasers Property & Sekisui House. 1BR+Study to 5BR. 99-year leasehold, TOP 2030. Register interest with Jet Lee.">',
                        f'<meta name="description" content="{p["desc"]}">')
    # --- nav logo ---
    html = html.replace('<div class="logo-dh">The Orie</div>', f'<div class="logo-dh">{p["name"]}</div>')
    html = html.replace('<div class="logo-sub">Lorong 1 Toa Payoh · District 12</div>', f'<div class="logo-sub">{p["tagline"]}</div>')
    # --- hero ---
    html = html.replace('<div class="hero-tag">99-Year Leasehold · District 12</div>', f'<div class="hero-tag">{p["hero_tag"]}</div>')
    html = html.replace('<h1 class="hero-title"><em>The</em> Orie</h1>', f'<h1 class="hero-title"><em>{p["name"].split()[0]}</em> {p["name"].split()[-1] if len(p["name"].split())>1 else ""}</h1>'.replace('  ',' '))
    html = html.replace('<p class="hero-subtitle">A New Landmark in Toa Payoh.</p>', f'<p class="hero-subtitle">{p["tagline"]}.</p>')
    # hero stats
    stats_html = ''
    for i, (num, lbl) in enumerate(p['stats']):
        if i > 0:
            stats_html += '\n      <div class="hero-divider"></div>'
        stats_html += f'\n      <div class="hero-stat"><span class="num">{num}</span><span class="lbl">{lbl}</span></div>'
    html = re.sub(r'<div class="hero-stats">.*?</div>\n    </div>', f'<div class="hero-stats">{stats_html}\n    </div>\n    </div>', html, flags=re.S)
    # WA link
    html = html.replace('https://wa.me/6587649315?text=Hi%20Jet%20Lee%2C%20interested%20in%20The%20Orie', p['contact_wa'])
    # hero bg
    html = re.sub(r"url\('/[^']*exterior-1\.jpg'\)", f"url('{p['hero_img']}')", html)
    # --- ticker ---
    html = re.sub(r'<div class="ticker-inner">.*?</div>\n</div>', f'<div class="ticker-inner">\n    {p["ticker"]} &nbsp;·&nbsp;&nbsp;&nbsp;\n    {p["ticker"]} &nbsp;·&nbsp;&nbsp;&nbsp;\n  </div>\n</div>', html, flags=re.S)
    # --- overview ---
    html = html.replace('<h2 class="section-title">Toa Payoh\'s <em>New Landmark</em></h2>', f'<h2 class="section-title">{p["overview_title"]}</h2>')
    # replace the 3 paragraphs
    para_pattern = re.compile(r'(<p>.*?</p>\s*<p>.*?</p>\s*<p>.*?</p>)', re.S)
    paras = f'<p>{p["overview_p1"]}</p>\n      <p>{p["overview_p2"]}</p>\n      <p>{p["overview_p3"]}</p>'
    html = para_pattern.sub(paras, html, count=1)
    # facts
    html = re.sub(r'<div class="fact-grid">.*?</div>\n    </div>', f'<div class="fact-grid">\n{build_facts(p)}\n      </div>\n    </div>', html, flags=re.S)
    # --- gallery ---
    html = html.replace('<h2 class="section-title" style="margin-bottom:0">The <em>Orie</em> Living</h2>', f'<h2 class="section-title" style="margin-bottom:0">{p["name"].split()[0]} <em>{p["name"].split()[-1] if len(p["name"].split())>1 else ""}</em></h2>')
    html = re.sub(r'<div class="gallery-grid">.*?</div>\n  </div>', f'<div class="gallery-grid">\n{build_gallery(p, site)}\n    </div>\n  </div>', html, flags=re.S)
    # --- floorplans ---
    html = html.replace('The Orie floor plans — from 1-Bedroom + Study to 5-Bedroom. Click any layout to view it full size, or download the official floor plan &amp; e-brochure below.', p['floorplan_intro'])
    # pdf buttons
    html = re.sub(r'<div style="display:flex;gap:14px;flex-wrap:wrap;margin-bottom:40px">.*?</div>\n    <div class="floorplan-grid">', f'<div style="display:flex;gap:14px;flex-wrap:wrap;margin-bottom:40px">\n{build_pdfs(p)}\n    </div>\n    <div class="floorplan-grid">', html, flags=re.S)
    # floorplan items
    html = re.sub(r'<div class="floorplan-grid">.*?</div>\n  </div>\n</section>', f'<div class="floorplan-grid">\n{build_floorplan_items(p, site)}\n    </div>\n  </div>\n</section>', html, flags=re.S)
    # --- balance units ---
    html = html.replace('Current Balance · as of 4 Aug 2026', p['balance_title'])
    # replace table rows (keep thead, replace tbody)
    html = re.sub(r'(<tbody>).*?(</tbody>)', lambda m: m.group(1) + '\n' + build_balance_rows(p) + '\n        ' + m.group(2), html, flags=re.S)
    # --- siteplan ---
    html = html.replace('/TheOrie/images/siteplan.jpg', p['siteplan'])
    html = html.replace('alt="The Orie Site Plan"', f'alt="{p["siteplan_alt"]}"')
    # location
    html = html.replace('Heart of <em>Toa Payoh</em>', p['location_title'])
    html = re.sub(r'<p>Positioned in the Rest of Central Region.*?</p>', f'<p>{p["location_p"]}</p>', html, flags=re.S)
    # location items
    html = re.sub(r'<div class="loc-item"><div class="loc-name">.*?</div><div class="loc-dist">.*?</div></div>', lambda m: '\n'.join([f'<div class="loc-item"><div class="loc-name">{n}</div><div class="loc-dist">{d}</div></div>' for n, d in p['location_items']]), html, count=1, flags=re.S)
    # --- amenities ---
    html = html.replace('Location &amp; Amenities', 'Amenities')
    html = re.sub(r'<h2 class="section-title">.*?<em>.*?</em></h2>', lambda m: f'<h2 class="section-title">{p["amenities_title"]}</h2>', html, count=1, flags=re.S)
    html = re.sub(r'<div class="amenity-card">.*?</div>\s*</div>', f'<div class="amenity-card">{build_amenities(p)}</div>\n      </div>', html, count=1, flags=re.S)
    # --- features ---
    html = html.replace('Why The Orie', f'Why {p["name"].split()[0]}')
    html = re.sub(r'<div class="feature-item">.*?</div>\s*</div>', lambda m: f'<div class="feature-item">{build_features(p)}</div>\n      </div>', html, count=1, flags=re.S)
    # --- FAQ ---
    html = re.sub(r'<div class="faq-item">.*?</div>\s*</div>', lambda m: f'<div class="faq-item">{build_faq(p)}</div>\n      </div>', html, count=1, flags=re.S)
    # --- contact ---
    html = html.replace('interested in The Orie', f'interested in {p["name"]}')
    html = html.replace('The Orie full pricelist', f'{p["name"]} full pricelist')
    html = html.replace('the The Orie e-brochure', f'the {p["name"]} e-brochure')
    html = html.replace('The Orie', p['name'])
    # footer copyright
    html = html.replace('© 2026 The Orie', f'© 2026 {p["name"]}')
    return html

for site, p in PROJECTS.items():
    out = build_site(site, p)
    os.makedirs(p['dir'], exist_ok=True)
    with open(os.path.join(p['dir'], 'index.html'), 'w', encoding='utf-8') as f:
        f.write(out)
    print(f"OK {site}: {len(out)//1024}KB written")
