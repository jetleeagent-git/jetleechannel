#!/usr/bin/env python3
"""Regenerate zyongrand + promenadepeak + rivergreen from theorie template — section-based, no fragile regexes."""
import os, re

TPL = open('theorie/index.html', encoding='utf-8').read()
lines = TPL.split('\n')

def lines_between(start_marker, end_marker, include_start=False):
    """Extract lines between two markers (exclusive of both)."""
    s = e = None
    for i, l in enumerate(lines):
        if start_marker in l and s is None:
            s = i + (0 if include_start else 1)
        elif end_marker and end_marker in l and s is not None:
            e = i
            break
    if e is None:
        e = len(lines)
    return '\n'.join(lines[s:e])

# --- Extract static template parts ---
HEAD = '\n'.join(lines[:612])  # everything before <!-- NAV --> (includes </head>)
NAV = lines_between('<!-- NAV -->', '<!-- HERO -->')
HERO = lines_between('<!-- HERO -->', '<!-- TICKER -->')
TICKER = lines_between('<!-- TICKER -->', '<!-- GALLERY -->')
FOOTER = lines_between('<!-- FOOTER -->', '<!-- WhatsApp Float -->')
WHATSAPP = lines_between('<!-- WhatsApp Float -->', None)

# Extract original sections as reference for structure
GALLERY_TPL = lines_between('<!-- GALLERY -->', '<!-- FLOOR PLANS -->')
FP_TPL = lines_between('<!-- FLOOR PLANS -->', '<!-- BALANCE UNITS -->')
BALANCE_TPL = lines_between('<!-- BALANCE UNITS -->', '<!-- LOCATION MAP / SITE PLAN -->')
SITEPLAN_TPL = lines_between('<!-- LOCATION MAP / SITE PLAN -->', '<!-- AMENITIES & LOCATION -->')
AMENITIES_TPL = lines_between('<!-- AMENITIES & LOCATION -->', '<!-- FEATURES -->')
FEATURES_TPL = lines_between('<!-- FEATURES -->', '<!-- FAQ -->')
FAQ_TPL = lines_between('<!-- FAQ -->', '<!-- CONTACT -->')
CONTACT_TPL = lines_between('<!-- CONTACT -->', '<!-- FOOTER -->')

# ============ PROJECT DATA ============
P = {
 'zyongrand': {
  'site':'zyongrand','dir':'zyongrand','name':'Zyon Grand','name_short':'Zyon',
  'title':'Zyon Grand | 706 Units D03 Kim Seng Road | Direct Developer Price | Jet Lee',
  'desc':'Zyon Grand – 706 units at 3 & 5 Kim Seng Road, District 3. Two 62-storey towers + 36-storey serviced residences by CDL & Mitsui Fudosan. 1BR+Study to 5BR Supreme & Penthouse. 99-year leasehold, TOP Sep 2032. Register interest with Jet Lee.',
  'tagline':'3 & 5 Kim Seng Road · District 3','hero_tag':'99-Year Leasehold · District 3',
  'hero_title':'<em>Zyon</em> Grand','hero_sub':'A New Icon on Kim Seng Road.',
  'hero_img':'/zyongrand/images/hero-day.jpg',
  'stats':[('706','Units'),('2 × 62','Storeys'),('15,277','Sqm Land'),('D3','District')],
  'ticker':'ZYON GRAND · 3 & 5 KIM SENG ROAD · DISTRICT 3 · 99-YEAR LEASEHOLD · 706 UNITS · 2 TOWERS OF 62 STOREYS · CDL · MITSUI FUDOSAN',
  'wa':'https://wa.me/6587649315?text=Hi%20Jet%20Lee%2C%20interested%20in%20Zyon%20Grand',
  'overview_title':'A New Icon on <em>Kim Seng Road</em>',
  'overview':[
   '<strong>Zyon Grand</strong> is an integrated mixed-development by <strong>CDL and Mitsui Fudosan</strong> — two iconic <strong>62-storey residential towers</strong> with a connected <strong>36-storey serviced apartment tower</strong> offering restaurants, a supermarket and an early childhood development centre. North-south orientation delivers panoramic views towards Sentosa, the CBD and Marina Bay Sands.',
   'With <strong>direct access to Havelock MRT Station</strong>, Zyon Grand sits at the heart of the Alexandra/Commonwealth district — one stop to Outram Park interchange, two stops to Orchard, and a short walk to Great World City. Designed by world-class architects <strong>Nikken Sekkei × ADDP Architects LLP</strong>.',
   'Residents enjoy comprehensive facilities including a 50m lap pool, tennis/pickleball court, clubhouses, hydro spa, yoga studio and lush lagoon pools — all wrapped in premium kitchen appliances and Italian master wardrobes.',
  ],
  'facts':[
   ('Project Name','Zyon Grand 卓悦峰'),('Developer','CDL · Mitsui Fudosan'),
   ('Tenure','99 Years (from 15 Jul 2024)'),('District','District 3 (Alexandra / Commonwealth)'),
   ('Address','3 & 5 Kim Seng Road'),('Site Area','15,276.8 sqm'),
   ('Total Units','706 Units'),('Towers','2 × 62 Storeys + 36 Storeys'),
   ('Architect','Nikken Sekkei × ADDP Architects LLP'),('Expected T.O.P.','Sep 2032'),
  ],
  'gallery':[
   ('/zyongrand/images/hero-day.jpg','Hero Perspective','Perspective'),
   ('/zyongrand/images/relaxation-lagoon.jpg','Relaxation Lagoon','Facilities'),
   ('/zyongrand/images/waterfall-cove.jpg','Waterfall Cove','Facilities'),
   ('/zyongrand/images/lap-pool.jpg','50m Lap Pool','Facilities'),
   ('/zyongrand/images/perspective-2.jpg','Perspective View','Perspective'),
   ('/zyongrand/images/hero-evening.jpg','Evening View','Perspective'),
  ],
  'fps':[('A1s','1 Bedroom + Study'),('B1','2 Bedroom'),('BP1','2 Bedroom Premium'),('BP2s','2 Bedroom Premium + Study'),
         ('C1','3 Bedroom'),('CD1','3 Bedroom Deluxe'),('CP1s','3 Bedroom Premium + Study'),('CP2s','3 Bedroom Premium + Study'),
         ('DP1','4 Bedroom Premium (Private Lift)'),('DS1','4 Bedroom Supreme (Private Lift)'),('DS2s','4 Bedroom Supreme + Study (Private Lift)'),
         ('ES1','5 Bedroom Supreme (Private Lift)'),('PH1','Penthouse 5BR (Private Lift)'),('PH2','Penthouse 5BR (Private Lift)')],
  'fp_intro':'Explore the full range of Zyon Grand floor plans — from 1-Bedroom + Study to 5-Bedroom Supreme and Penthouses. Click any layout to view it full size, or download the official e-brochure below.',
  'pdfs':[('/zyongrand/docs/Zyon_Grand_eBrochure.pdf','📐 Official E-Brochure'),('/zyongrand/docs/Zyon_Grand_2025.09.11-Brochure_Plans.pdf','📖 Brochure Floor Plans')],
  'balance_title':'Current Balance · as of 4 Aug 2026',
  'balance':[('1 Bedroom + Study','27','Available'),('2 Bedroom Premium + Study','9','Available'),('3 Bedroom','4','Available'),
             ('4 Bedroom Supreme + Study','11','Available'),('5 Bedroom Supreme','18','Available'),('Penthouse (5BR + Private Lift)','1','Available')],
  'balance_total':('Current Available','70 Units','—'),
  'siteplan':'/zyongrand/images/siteplan.jpg','siteplan_alt':'Zyon Grand Site Plan',
  'loc_img':'/zyongrand/images/location-map.jpg','loc_alt':'Zyon Grand Location Map',
  'loc_title':'Heart of <em>Kim Seng</em>',
  'loc_p':'Zyon Grand enjoys exceptional connectivity — <strong>direct access to Havelock MRT (466m)</strong>, Great World MRT 657m, Tiong Bahru MRT 1.5km. One stop to Outram Park Interchange, two stops to Orchard Road, four stops to Marina Bay. Schools nearby: River Valley Primary, Alexandra Primary, Zhangde Primary, Gan Eng Seng School, Crescent Girls’ School.',
  'loc_items':[('Havelock MRT','Direct Access'),('Great World MRT','657m'),('Outram Park Interchange','1 Stop'),('Orchard Interchange','2 Stops'),('Marina Bay','4 Stops')],
  'amen_title':'A Lifestyle <em>Above the Rest</em>',
  'amenities':[
   ('Arrival Sanctuary','Grand Pavilion · Reflective Court · Arrival Cascades · Water Reflexology'),
   ('Social Habitat','Central Club · Tennis / Pickleball Court · Adventure Playground · Pets Play'),
   ('Relaxation Lagoon','Lagoon Deck · Bubbling Pool · Hydro Splash · Hydro Spa · Family Pool'),
   ('Wellness Oasis','50m Lap Pool · Waterfall Cove · Fitness Suite · Yoga Studio · Steam Room'),
  ],
  'features':[
   ('👑','CDL × Mitsui Fudosan','Renowned developers with a track record of quality and innovation.'),
   ('🚇','Direct Havelock MRT','Integrated access to Havelock MRT Station at your doorstep.'),
   ('🏙️','Iconic 62-Storey Towers','Two landmark towers with panoramic Sentosa, CBD & MBS views.'),
   ('🎨','World-Class Design','Nikken Sekkei × ADDP Architects LLP collaboration.'),
   ('🏬','Integrated Living','Restaurants, supermarket & ECDC within the development.'),
   ('✨','Premium Interiors','Italian master wardrobes & premium kitchen appliances.'),
  ],
  'faq':[
   ('What is Zyon Grand?','Zyon Grand is a 706-unit integrated mixed development at 3 & 5 Kim Seng Road, District 3, by CDL and Mitsui Fudosan.'),
   ('What is the tenure?','99-year leasehold commencing from 15 July 2024.'),
   ('When is TOP?','Expected T.O.P. in September 2032.'),
   ('What unit types are available?','From 1-Bedroom + Study to 5-Bedroom Supreme (with private lift) and Penthouses.'),
   ('How near is the MRT?','Direct access to Havelock MRT Station — one stop to Outram Park Interchange.'),
  ],
 },
 'promenadepeak': {
  'site':'promenadepeak','dir':'promenadepeak','name':'Promenade Peak','name_short':'Promenade',
  'title':'Promenade Peak | 596 Units D03 Zion Road | Direct Developer Price | Jet Lee',
  'desc':'Promenade Peak – 596 units at 1 Zion Promenade, District 3. Luxury 99-year leasehold condominium by Allgreen Properties (Kheng Leong). 1BR+Study to 5BR Premium with private lift, sky pools at Level 43 & roof. TOP Feb 2031. Register interest with Jet Lee.',
  'tagline':'1 Zion Promenade · District 3','hero_tag':'99-Year Leasehold · District 3',
  'hero_title':'<em>Promenade</em> Peak','hero_sub':'Luxury Living on Zion Road.',
  'hero_img':'/promenadepeak/images/roof-top.jpg',
  'stats':[('596','Units'),('43','Storeys'),('9,286','Sqm Land'),('D3','District')],
  'ticker':'PROMENADE PEAK · 1 ZION PROMENADE · DISTRICT 3 · 99-YEAR LEASEHOLD · 596 UNITS · LUXURY RESIDENTIAL · ALLGREEN PROPERTIES',
  'wa':'https://wa.me/6587649315?text=Hi%20Jet%20Lee%2C%20interested%20in%20Promenade%20Peak',
  'overview_title':'Luxury on <em>Zion Road</em>',
  'overview':[
   '<strong>Promenade Peak</strong> is a luxury condominium along Zion Road in Singapore\'s prestigious <strong>District 3</strong>, developed by <strong>Allgreen Properties (Kheng Leong Group)</strong>. This 99-year leasehold development features <strong>596 residential units</strong> across a high-rise tower with breathtaking skyline views.',
   'Just <strong>311m from Havelock MRT Station</strong> and a short stroll to Great World MRT (580m), residents enjoy effortless connectivity — one stop to Outram Park Interchange, minutes to Orchard Road and the CBD. The Ganges Ave / Zion Road enclave is set for transformation into a vibrant riverside lifestyle district.',
   'Rise above it all with three levels of sky amenities — a <strong>50m lap pool, sky infinity pool on the roof, gymnasium, boxing & cross-training areas, hydrospa bay</strong> and lush canopy decks, all curated for resort-style living.',
  ],
  'facts':[
   ('Project Name','Promenade Peak'),('Developer','Allgreen Properties (Kheng Leong)'),
   ('Tenure','99 Years (from 4 Nov 2024)'),('District','District 3 (Alexandra / Commonwealth)'),
   ('Address','1 Zion Promenade'),('Site Area','9,285.9 sqm'),
   ('Total Units','596 Units'),('Project Type','Residential Highrise'),
   ('Launch','Aug 2025'),('Expected T.O.P.','Feb 2031'),
  ],
  'gallery':[
   ('/promenadepeak/images/roof-top.jpg','Sky Peak Roof','Facilities'),
   ('/promenadepeak/images/view-43f.jpg','View from Level 43','View'),
   ('/promenadepeak/images/view-22f.jpg','View from Level 22','View'),
   ('/promenadepeak/images/tier1-2.jpg','Tower Perspective','Perspective'),
   ('/promenadepeak/images/drone.jpg','Aerial View','Perspective'),
   ('/promenadepeak/images/view-1l.jpg','Promenade Level','Facilities'),
  ],
  'fps':[('AS1','1 Bedroom + Study'),('AS2','1 Bedroom + Study'),('B1','2 Bedroom'),('B2','2 Bedroom'),('B3','2 Bedroom'),
         ('B4','2 Bedroom'),('B5','2 Bedroom'),('BS1','2 Bedroom + Study'),('BS2','2 Bedroom + Study'),('BS3','2 Bedroom + Study'),
         ('C1','3 Bedroom'),('C2','3 Bedroom'),('CP1','3 Bedroom Premium (Private Lift)'),('CP2','3 Bedroom Premium (Private Lift)'),
         ('DP1','4 Bedroom Premium (Private Lift)'),('DP2','4 Bedroom Premium (Private Lift)'),('DP3','4 Bedroom Premium (Private Lift)'),
         ('EP1','5 Bedroom Premium (Private Lift)')],
  'fp_intro':'Explore the full range of Promenade Peak floor plans — from 1-Bedroom + Study to 5-Bedroom Premium with private lift. Click any layout to view it full size, or download the official e-brochure below.',
  'pdfs':[('/promenadepeak/docs/Promenade_Peak_E-Brochure.pdf','📐 Official E-Brochure')],
  'balance_title':'Current Balance · as of 4 Aug 2026',
  'balance':[('1 Bedroom + Study','37','Available'),('2 Bedroom','18','Available'),('2 Bedroom + Study','63','Available'),
             ('3 Bedroom','3','Available'),('3 Bedroom Premium (Private Lift)','5','Available'),('4 Bedroom Premium (Private Lift)','18','Available'),
             ('5 Bedroom Premium (Private Lift)','15','Available')],
  'balance_total':('Current Available','159 Units','—'),
  'siteplan':'/promenadepeak/images/siteplan.jpg','siteplan_alt':'Promenade Peak Site Plan',
  'loc_img':'/promenadepeak/images/showflat-location.jpg','loc_alt':'Promenade Peak Location Map',
  'loc_title':'Zion Road <em>Riverside</em>',
  'loc_p':'Promenade Peak is <strong>311m from Havelock MRT</strong> and 580m from Great World MRT. One stop to Outram Park Interchange, minutes to Clarke Quay, Orchard Road and the CBD. The Zion Road / Ganges Avenue area is being revitalised with new parks, retail and riverfront promenades.',
  'loc_items':[('Havelock MRT','311m'),('Great World MRT','580m'),('Tiong Bahru MRT','1.5km'),('Clarke Quay MRT','1.9km'),('Outram Park Interchange','1 Stop')],
  'amen_title':'Three Levels of <em>Sky Amenities</em>',
  'amenities':[
   ('The Promenade (L1)','50m Lap Pool · Promenade Bar · Serenity Cove · Alfresco Dining'),
   ('The Canopy (Upper)','Tree Top Pavilion · Canopy Deck · Club Canopy'),
   ('Social Peak (L22)','Hanging Garden · Floating Hammock · Social Pods · Green Haven'),
   ('Wellness Peak (L43)','Gymnasium · Boxing & Cross-Training · Zen Veranda · Steam Room'),
   ('Sky Peak (Roof)','Sky Infinity Pool · Sky Champagne Pool · Sky Lounge · Sky Observatory'),
  ],
  'features':[
   ('👑','Allgreen Properties','Backed by the Kheng Leong Group — a name synonymous with quality.'),
   ('🚇','Havelock MRT 311m','Steps from Havelock MRT — one stop to Outram Park.'),
   ('🏙️','3 Sky Amenity Levels','Roof infinity pool, Level 43 wellness & Level 22 social decks.'),
   ('🔑','Private Lift Options','3BR Premium to 5BR Premium with private lift access.'),
   ('🌊','Riverside Lifestyle','Zion Road transformation with riverfront promenades & parks.'),
   ('✨','Luxury Finishes','Curated interiors with premium fittings throughout.'),
  ],
  'faq':[
   ('What is Promenade Peak?','Promenade Peak is a 596-unit luxury condominium at 1 Zion Promenade, District 3, developed by Allgreen Properties.'),
   ('What is the tenure?','99-year leasehold from 4 November 2024.'),
   ('When is TOP?','Expected T.O.P. in February 2031.'),
   ('What unit types are available?','From 1-Bedroom + Study to 5-Bedroom Premium with private lift.'),
   ('What amenities are there?','50m lap pool, roof sky infinity pool, gym, boxing area, hydrospa bay, playground and more across three sky levels.'),
  ],
 },
 'rivergreen': {
  'site':'rivergreen','dir':'rivergreen','name':'River Green','name_short':'River Green',
  'title':'River Green | 524 Units D09 River Valley | Direct Developer Price | Jet Lee',
  'desc':'River Green – 524 units at 11 River Valley Green, District 9. A 36-storey residential tower by WINCHAMP INVESTMENT. 1BR to 4BR. 99-year leasehold, TOP Q1 2029. Steps from Great World MRT. Register interest with Jet Lee.',
  'tagline':'11 River Valley Green · District 9','hero_tag':'99-Year Leasehold · District 9',
  'hero_title':'<em>River</em> Green','hero_sub':'Exclusive Living on the River Valley.',
  'hero_img':'/rivergreen/images/hero.jpg',
  'stats':[('524','Units'),('36','Storeys'),('100,032','Sqft Land'),('D9','District')],
  'ticker':'RIVER GREEN · 11 RIVER VALLEY GREEN · DISTRICT 9 · 99-YEAR LEASEHOLD · 524 UNITS · 1 TOWER OF 36 STOREYS · WINCHAMP INVESTMENT',
  'wa':'https://wa.me/6587649315?text=Hi%20Jet%20Lee%2C%20interested%20in%20River%20Green',
  'overview_title':'Exclusive Living on the <em>River Valley</em>',
  'overview':[
   '<strong>River Green</strong> is an exclusive new launch in District 09 by <strong>WINCHAMP INVESTMENT PTE LTD</strong>, perfectly located in the heart of the River Valley cluster. This prestigious 36-storey tower comprises <strong>524 units</strong> rising above a beautifully landscaped podium with facilities befitting a D9 address.',
   'With a <strong>site-sensitive design approach</strong>, River Green places residents a prime location <strong>next to Great World City MRT</strong> — an E-deck berm raised 5m from street level, with units raised another 16m (equivalent to 5 storeys) for elevated privacy and views. The roof feature combined with façade lighting enhances the city skyline.',
   'Unit plans are <strong>compact, functional and efficient</strong> — all units are non-PPVC with flexible internal layouts, universal design and sustainability efforts (Greenmark Platinum, SLE 5-Badge).',
  ],
  'facts':[
   ('Project Name','River Green 嘉溪绿苑'),('Developer','WINCHAMP INVESTMENT PTE LTD'),
   ('Tenure','99 Years (from 24 Sep 2024)'),('District','District 9 (Orchard / River Valley)'),
   ('Address','11 River Valley Green'),('Site Area','Est. 100,032 sqft'),
   ('Total Units','524 Units'),('Project Type','Residential Highrise (36 Storeys)'),
   ('Launch','Aug 2025'),('Expected T.O.P.','Q1 2029'),
  ],
  'gallery':[
   ('/rivergreen/images/hero.jpg','Hero Perspective','Perspective'),
   ('/rivergreen/images/clubhouse-pool.jpg','Clubhouse & Pool','Facilities'),
   ('/rivergreen/images/night-pool.jpg','Night Pool','Facilities'),
   ('/rivergreen/images/gallery-1.jpg','Gallery View','Perspective'),
  ],
  'fps':[('A1','1 Bedroom'),('A2','1 Bedroom'),('AS1','1 Bedroom + Study'),
         ('B1','2 Bedroom'),('B2','2 Bedroom'),('BP1','2 Bedroom Premium'),('BP2','2 Bedroom Premium'),('BS1','2 Bedroom + Study'),
         ('C1','3 Bedroom'),('C2','3 Bedroom'),('C3','3 Bedroom'),
         ('D1','4 Bedroom')],
  'fp_intro':'Explore the full range of River Green floor plans — from 1-Bedroom to 4-Bedroom. Click any layout to view it full size, or download the official e-brochure and typical floor plans below.',
  'pdfs':[('/rivergreen/docs/RG-eBrochure.pdf','📐 Official E-Brochure'),('/rivergreen/docs/River_Green_Typical_Floorplans_10.7.25.pdf','📖 Typical Floor Plans'),('/rivergreen/docs/River_Green_Master_Briefing_Unit_Mix_and_LayoutWIP_ver2.0.pdf','🗂️ Unit Mix & Layout')],
  'balance_title':'Current Balance · as of 4 Aug 2026',
  'balance':[('1 Bedroom','14','Available'),('1 Bedroom + Study','2','Available'),('2 Bedroom (Premium)','8','Available'),
             ('2 Bedroom + Study','3','Available'),('3 Bedroom','2','Available')],
  'balance_total':('Current Available','29 Units','—'),
  'siteplan':'/rivergreen/images/Site-Plan.jpg','siteplan_alt':'River Green Site Plan',
  'loc_img':'/rivergreen/images/location-map.jpg','loc_alt':'River Green Location Map',
  'loc_title':'Great World <em>MRT Next Door</em>',
  'loc_p':'River Green is <strong>right next to Great World MRT (17m)</strong>, with Havelock MRT 902m, Somerset 1.27km, Orchard 1.43km and Fort Canning 1.54km. One stop to Orchard Road, minutes to the CBD. The River Valley Green area offers riverside promenades, supermarkets and F&amp;B at Great World City, with childcare and schools nearby.',
  'loc_items':[('Great World MRT','17m'),('Havelock MRT','902m'),('Somerset MRT','1.3km'),('Orchard MRT','1.4km'),('Fort Canning MRT','1.5km')],
  'amen_title':'Facilities Befitting a <em>D9 Address</em>',
  'amenities':[
   ('Grand Arrival','Grand Arrival · Concierge · Arrival Lounge · Drop-off'),
   ('Aquatic Wellness','50m Stardust Pool · Sculpture Pool · Wellness Pool · Jacuzzi · Wading Pool · Reflective Pool'),
   ('Relax & Socialise','The Jewel · The Oasis · The Dining Room · Cook &amp; Connect · Grill &amp; Gather · Sip &amp; Chill'),
   ('Health & Wellness','Gym · Fitness Studio · Yoga Lawn · Changing Room · The Sound Sanctuaries'),
   ('Green & Gardens','Zen Garden · Rain Grove · Rain Garden · Petals &amp; Pollen · Spice &amp; Herb · The Meadows · Picnic Green'),
   ('Play & Leisure','Tennis Court · Paws &amp; Run · Fur &amp; Suds · Family Toilet · Hang / Out · Home / Work'),
   ('Roof Terrace','The Hideout · The Lookout · The Enclave · Stargaze Deck · Sky Loft'),
  ],
  'features':[
   ('🚇','Great World MRT Next Door','A prime location right next to Great World City MRT station.'),
   ('🌿','Greenmark Platinum','Universal design, sustainability efforts — SLE 5-Badge certified.'),
   ('🏙️','36-Storey Icon','Single elegant tower with a roof feature &amp; façade lighting that enhances the skyline.'),
   ('📐','Compact &amp; Efficient Layouts','All units are non-PPVC with flexible internal layouts.'),
   ('🏊','D9-Class Facilities','50m pool, tennis court, gym, wellness pool and more across basement to roof terrace.'),
   ('🔝','Raised E-Deck Berm','Units raised 5m + 16m from street level for elevated privacy and views.'),
  ],
  'faq':[
   ('What is River Green?','River Green is a 524-unit exclusive condominium at 11 River Valley Green, District 9, developed by WINCHAMP INVESTMENT PTE LTD.'),
   ('What is the tenure?','99-year leasehold commencing from 24 September 2024.'),
   ('When is TOP?','Expected T.O.P. in Q1 2029.'),
   ('What unit types are available?','From 1-Bedroom to 4-Bedroom, including 2-Bedroom Premium and 2-Bedroom + Study.'),
   ('How near is the MRT?','Right next to Great World MRT (17m) — one stop to Orchard Road.'),
  ],
 },
 'newportresidences': {
  'site':'newportresidences','dir':'newportresidences','name':'Newport Residences','name_short':'Newport',
  'title':'Newport Residences | 246 Units D02 Anson Road | Freehold CDL | Jet Lee',
  'desc':'Newport Residences – 246 freehold units at 80 Anson Road, District 2. A mixed development by City Developments Limited (CDL), redeveloped from the former Fuji Xerox Towers. 1BR to 4BR Premium & Super Penthouse. TOP 2H 2027. Register interest with Jet Lee.',
  'tagline':'80 Anson Road · District 2','hero_tag':'Freehold · District 2',
  'hero_title':'<em>Newport</em> Residences','hero_sub':'The New Icon of Anson Road.',
  'hero_img':'/newportresidences/images/hero.jpg',
  'stats':[('246','Units'),('41','Storeys'),('5,091','Sqm Land'),('D2','District')],
  'ticker':'NEWPORT RESIDENCES · 80 ANSON ROAD · DISTRICT 2 · FREEHOLD · 246 UNITS · 41 STOREYS · CITY DEVELOPMENTS LIMITED · 铂海峰',
  'wa':'https://wa.me/6587649315?text=Hi%20Jet%20Lee%2C%20interested%20in%20Newport%20Residences',
  'overview_title':'The New Icon of <em>Anson Road</em>',
  'overview':[
   '<strong>Newport Residences</strong> is the latest modern integrated development redeveloped from the former <strong>Fuji Xerox Towers</strong>, by prestigious developer <strong>City Developments Limited (CDL)</strong>. Rising <strong>41 storeys</strong> at 80 Anson Road in the heart of the Central Business District, this <strong>freehold</strong> mixed development offers <strong>246 exclusive residences</strong>.',
   'Set within Tanjong Pagar, Newport Residences sits at the crossroads of Singapore\'s financial district and heritage enclave — <strong>Tanjong Pagar MRT 766m</strong>, Maxwell 1km, Shenton Way 1.2km, and Raffles Place 1.8km. A short walk to Amoy Street Food Centre, Lau Pa Sat and the vibrant Duxton Hill dining scene.',
   'Rare <strong>sky facilities</strong> across multiple levels — Sky Pool, Sky Club, Sky Gourmet, gymnasium, community garden and cascading terraces — with breathtaking views of the CBD skyline, cruise terminal and the sea beyond.',
  ],
  'facts':[
   ('Project Name','Newport Residences 铂海峰'),('Developer','City Developments Limited (CDL)'),
   ('Tenure','Freehold'),('District','District 2 (Chinatown / Tanjong Pagar)'),
   ('Address','80 Anson Road'),('Site Area','5,091.2 sqm'),
   ('Total Units','246 Units'),('Project Type','Mixed Development (41 Storeys)'),
   ('Former','Fuji Xerox Towers'),('Expected T.O.P.','2H 2027'),
  ],
  'gallery':[
   ('/newportresidences/images/hero.jpg','Aerial View','Perspective'),
   ('/newportresidences/images/from-sea.jpg','View from the Sea','Perspective'),
   ('/newportresidences/images/sky-pool.jpg','Sky Pool','Facilities'),
   ('/newportresidences/images/sky-club.jpg','Sky Club','Facilities'),
   ('/newportresidences/images/lobby.jpg','Residence Lobby','Interiors'),
   ('/newportresidences/images/terraces.jpg','Cascading Terraces','Facilities'),
   ('/newportresidences/images/sky-gourmet.jpg','Sky Gourmet','Facilities'),
   ('/newportresidences/images/gym.jpg','Gymnasium','Facilities'),
   ('/newportresidences/images/vista-lounge.jpg','Vista Lounge','Interiors'),
   ('/newportresidences/images/community-garden.jpg','Community Garden','Facilities'),
   ('/newportresidences/images/aerial-cruise.jpg','Aerial towards Cruise Centre','Perspective'),
  ],
  'fps':[('A1','1 Bedroom'),('A2','1 Bedroom'),('A3','1 Bedroom'),('A4','1 Bedroom'),('A5','1 Bedroom'),
         ('AS1','1 Bedroom + Study'),
         ('B1','2 Bedroom'),('B2','2 Bedroom'),('B3','2 Bedroom'),
         ('BP1','2 Bedroom Premium'),('BP2','2 Bedroom Premium'),('BP3','2 Bedroom Premium'),
         ('BPS1','2 Bedroom Premium + Ensuite Study'),('BPS2','2 Bedroom Premium + Ensuite Study'),
         ('C1','3 Bedroom'),('CP1','3 Bedroom Premium'),('CPS1','3 Bedroom + Study'),
         ('D1','4 Bedroom Premium'),('D1a','4 Bedroom Premium')],
  'fp_intro':'Explore the full range of Newport Residences floor plans — from 1-Bedroom to 4-Bedroom Premium. Click any layout to view it full size, or download the official e-brochure below.',
  'pdfs':[('/newportresidences/docs/Newport_Residences_E-Brochure_12Jan2026.pdf','📐 Official E-Brochure'),('/newportresidences/docs/2025.11.06_Newport_Plaza_RA_BROCHURE_BP04_Typical_units.pdf','📖 Typical Units Brochure'),('/newportresidences/docs/Newport_Residences_Final_Schematic_Diagram_with_logo.pdf','🗺️ Schematic Diagram')],
  'balance_title':'Current Balance · as of 4 Aug 2026',
  'balance':[('1 Bedroom','11','Available'),('1 Bedroom + Study','9','Available'),('3 Bedroom','2','Available'),
             ('3 Bedroom Premium','4','Available'),('4 Bedroom Premium','17','Available'),('Super Penthouse','1','Available')],
  'balance_total':('Current Available','44 Units','—'),
  'siteplan':'/newportresidences/images/Site-Plan.jpg','siteplan_alt':'Newport Residences Site Plan',
  'loc_img':'/newportresidences/images/location-map.jpg','loc_alt':'Newport Residences Location Map',
  'loc_title':'Heart of the <em>CBD</em>',
  'loc_p':'Newport Residences is at the heart of the CBD — <strong>Tanjong Pagar MRT 766m</strong>, Maxwell 1km, Shenton Way 1.2km, Downtown 1.5km, Raffles Place 1.8km. A short stroll to Lau Pa Sat, Amoy Street Food Centre and Duxton Hill. Two stops to Marina Bay, one stop to Outram Park.',
  'loc_items':[('Tanjong Pagar MRT','766m'),('Maxwell MRT','1.0km'),('Shenton Way MRT','1.2km'),('Raffles Place MRT','1.8km'),('Outram Park Interchange','1 Stop')],
  'amen_title':'Sky Facilities <em>Above the City</em>',
  'amenities':[
   ('Sky Pool & Club','Sky Pool · Sky Club · Sky Gourmet · Sky Top Garden'),
   ('Wellness','Gymnasium · Yoga &amp; Fitness Deck · Changing Facilities'),
   ('Green Spaces','Community Garden · Cascading Terraces · Roof Garden'),
   ('Social & Dining','Vista Lounge · Vista Gourmet · Sky Dining Pavilion'),
   ('Convenience','Concierge · Integrated Retail &amp; F&amp;B · Direct Access'),
  ],
  'features':[
   ('👑','CDL Freehold','A prestigious freehold address by City Developments Limited.'),
   ('🏙️','41-Storey Icon','A landmark mixed development rising above Anson Road.'),
   ('🚇','CBD Connectivity','Tanjong Pagar MRT 766m — steps from the financial district.'),
   ('🏊','Sky Amenities','Sky pool, sky club and cascading terraces with CBD views.'),
   ('🍽️','Integrated Living','Retail, dining and residences in one integrated development.'),
   ('✨','Heritage Enclave','Near Amoy Street, Lau Pa Sat and vibrant Duxton Hill.'),
  ],
  'faq':[
   ('What is Newport Residences?','Newport Residences is a 246-unit freehold mixed development at 80 Anson Road, District 2, by City Developments Limited — redeveloped from the former Fuji Xerox Towers.'),
   ('What is the tenure?','Freehold.'),
   ('When is TOP?','Expected T.O.P. in 2H 2027.'),
   ('What unit types are available?','From 1-Bedroom to 4-Bedroom Premium, plus a Super Penthouse.'),
   ('How near is the MRT?','Tanjong Pagar MRT is 766m away — right in the heart of the CBD.'),
  ],
 },
 'upperhouse': {
  'site':'upperhouse','dir':'upperhouse','name':'UPPERHOUSE at Orchard Boulevard','name_short':'UPPERHOUSE',
  'title':'UPPERHOUSE at Orchard Boulevard | 301 Units D10 | Direct Developer Price | Jet Lee',
  'desc':'UPPERHOUSE at Orchard Boulevard – 301 exclusive units at 22 Orchard Boulevard, District 10, by UOL (United Venture Development). 1BR+Study to 4BR Suite with private lift. 99-year leasehold, TOP 2H 2028. Orchard Boulevard MRT at doorstep. Register interest with Jet Lee.',
  'tagline':'22 Orchard Boulevard · District 10','hero_tag':'99-Year Leasehold · District 10',
  'hero_title':'<em>UPPERHOUSE</em> at Orchard Boulevard','hero_sub':'A Legacy on Orchard Boulevard.',
  'hero_img':'/upperhouse/images/facade.jpg',
  'stats':[('301','Units'),('35','Storeys'),('7,031','Sqm Land'),('D10','District')],
  'ticker':'UPPERHOUSE AT ORCHARD BOULEVARD · 22 ORCHARD BOULEVARD · DISTRICT 10 · 99-YEAR LEASEHOLD · 301 UNITS · 1 BLOCK OF 35 STOREYS · UOL · ORCHARD BOULEVARD MRT AT DOORSTEP',
  'wa':'https://wa.me/6587649315?text=Hi%20Jet%20Lee%2C%20interested%20in%20UPPERHOUSE%20at%20Orchard%20Boulevard',
  'overview_title':'A Legacy on <em>Orchard Boulevard</em>',
  'overview':[
   '<strong>UPPERHOUSE at Orchard Boulevard</strong> is more than a residence — it is a legacy, born from <strong>UOL&rsquo;s</strong> renowned dedication to crafting collectible and liveable luxury. Its prestigious address grants residents an exclusive vantage over Singapore&rsquo;s most coveted district, offering a lifestyle defined by refinement and distinction.',
   'With <strong>Orchard Boulevard MRT at the doorstep (17m)</strong> — one stop to Orchard, and easy links to Napier, Great World and the wider city — the residence sits at the very centre of District 10&rsquo;s Tanglin / Holland enclave. The Botanical Villa, signature infinity pool and world-class fittings elevate everyday living into an art form.',
   'Residents enjoy a full suite of resort facilities including a 50m lap pool, The Botanical Villa with indoor spa pools and hydropool, gourmet pavilion, function rooms and a fully-equipped gym — all wrapped in UOL&rsquo;s signature attention to detail.',
  ],
  'facts':[
   ('Project Name','UPPERHOUSE at Orchard Boulevard 傲杰嘉苑'),('Developer','United Venture Development (No.7) Pte Ltd (UOL)'),
   ('Tenure','99 Years (from 20 May 2024)'),('District','District 10 (Tanglin / Holland)'),
   ('Address','22 Orchard Boulevard'),('Site Area','7,031.4 sqm'),
   ('Total Units','301 Units'),('Towers','1 Block of 35 Storeys'),
   ('Unit Types','1BR+Study · 2BR Premium · 3BR Premium · 4BR Suite'),('Expected T.O.P.','2H 2028'),
  ],
  'gallery':[
   ('/upperhouse/images/facade.jpg','UPPERHOUSE Facade','Perspective'),
   ('/upperhouse/images/infinity-pool.jpg','50m Infinity Pool','Facilities'),
   ('/upperhouse/images/botanical-villa-1.jpg','The Botanical Villa','Facilities'),
   ('/upperhouse/images/spa-pool-1.jpg','Indoor Spa Pool','Facilities'),
   ('/upperhouse/images/hydropool.jpg','Hydropool','Facilities'),
   ('/upperhouse/images/residents-lounge.jpg','Residents Lounge','Facilities'),
   ('/upperhouse/images/gourmet-pavilion.jpg','Gourmet Pavilion','Facilities'),
   ('/upperhouse/images/gym.jpg','The Gym','Facilities'),
   ('/upperhouse/images/4br-suite.jpg','4BR Suite External','Interiors'),
   ('/upperhouse/images/botanical-villa-2.jpg','Botanical Villa View','Facilities'),
   ('/upperhouse/images/spa-sanctuary.jpg','The Spa Sanctuary','Facilities'),
  ],
  'fps':[('AS1','1 Bedroom + Study'),('BP1','2 Bedroom Premium'),('BP2','2 Bedroom Premium'),
         ('BPS1','2 Bedroom Premium + Study'),('BPS2','2 Bedroom Premium + Study'),
         ('CP1','3 Bedroom Premium'),('DP1','4 Bedroom Suite (Private Lift)'),('DP2','4 Bedroom Suite (Private Lift)')],
  'fp_intro':'Explore the full range of UPPERHOUSE floor plans — from 1-Bedroom + Study to the exclusive 4-Bedroom Suite with private lift and carpark lot. Click any layout to view it full size, or download the official e-brochure below.',
  'pdfs':[('/upperhouse/docs/UPPERHOUSE-E-Brochure-compressed.pdf','📐 Official E-Brochure'),('/upperhouse/docs/UPPERHOUSE-Developer-Factsheet-Final.pdf','📖 Developer Factsheet'),('/upperhouse/docs/UPPERHOUSE-Location-Map_Final.pdf','🗺️ Location Map')],
  'balance_title':'Current Balance · as of 4 Aug 2026',
  'balance':[('1 Bedroom + Study','26','Available'),('2 Bedroom Premium','18','Available'),('4 Bedroom Suite (Private Lift)','10','Available')],
  'balance_total':('Current Available','54 Units','—'),
  'siteplan':'/upperhouse/images/siteplan.jpg','siteplan_alt':'UPPERHOUSE Site Plan',
  'loc_img':'/upperhouse/images/location-map.jpg','loc_alt':'UPPERHOUSE Location Map',
  'loc_title':'The Centre of <em>District 10</em>',
  'loc_p':'UPPERHOUSE at Orchard Boulevard enjoys unrivalled connectivity — <strong>Orchard Boulevard MRT at the doorstep (17m)</strong>, Napier MRT 716m, Orchard MRT 1km, Great World MRT 1.9km. One stop to Orchard, minutes to Tanglin Mall, Dempsey Hill and the Botanic Gardens. An address synonymous with Singapore&rsquo;s finest living.',
  'loc_items':[('Orchard Boulevard MRT','17m · Doorstep'),('Napier MRT','716m'),('Orchard MRT','1.0km'),('Somerset MRT','1.9km'),('Great World MRT','1.9km')],
  'amen_title':'Resort Living, <em>Reimagined</em>',
  'amenities':[
   ('Arrival Experience','Drop Off · Arrival Courtyard · Grand Lobby · Water Feature'),
   ('The Botanical Villa','Villa Bridge · Hydropool · Indoor Spa Pools · Spa Sanctuary · Garden Rain Shower'),
   ('Aqua & Leisure','50m Lap Pool · Infinity Pool · Bubble Pool · Play Pool · Leisure Pool · Poolside Deck'),
   ('Wellness & Social','The Gym · Function Rooms · Gourmet Pavilion · Garden Lounge · Serenity Lawn'),
  ],
  'features':[
   ('👑','UOL Legacy','UOL&rsquo;s renowned dedication to collectible, liveable luxury.'),
   ('🚇','Orchard Boulevard MRT','MRT station at the doorstep — 17m from the residence.'),
   ('🏙️','35-Storey Icon','A landmark single block with exclusive District 10 address.'),
   ('🌿','The Botanical Villa','Signature spa villa with indoor spa pools, hydropool & sanctuary.'),
   ('🏊','50m Infinity Pool','A statement pool experience high above Orchard.'),
   ('✨','World-Class Fittings','UOL&rsquo;s signature finishes and appointments throughout.'),
  ],
  'faq':[
   ('What is UPPERHOUSE at Orchard Boulevard?','A 301-unit 99-year leasehold luxury residence at 22 Orchard Boulevard, District 10, developed by UOL (United Venture Development (No.7) Pte Ltd).'),
   ('What is the tenure?','99-year leasehold commencing from 20 May 2024.'),
   ('When is TOP?','Expected T.O.P. in 2H 2028.'),
   ('What unit types are available?','1-Bedroom + Study, 2-Bedroom Premium, 3-Bedroom Premium and 4-Bedroom Suite (with private lift & carpark lot).'),
   ('How near is the MRT?','Orchard Boulevard MRT is at the doorstep — just 17m away.'),
  ],
 },
}

# ============ SECTION BUILDERS ============
def sec_details(p):
    facts = '\n'.join(f'        <div class="fact-item"><div class="fact-label">{k}</div><div class="fact-value">{v}</div></div>' for k, v in p['facts'])
    paras = '\n      '.join(f'<p>{x}</p>' for x in p['overview'])
    return f'''<!-- OVERVIEW -->
<section id="details">
  <div class="overview-grid">
    <div class="overview-text">
      <span class="section-label">Project Overview</span>
      <h2 class="section-title">{p['overview_title']}</h2>
      <div class="section-divider"></div>
      {paras}
    </div>
    <div>
      <div class="fact-grid">
{facts}
      </div>
    </div>
  </div>
</section>'''

def sec_gallery(p):
    items = '\n'.join(f'      <div class="gallery-item"><span class="gallery-badge">{b}</span><img src="{s}" alt="{a}" loading="lazy"></div>' for s, a, b in p['gallery'])
    name = p['name']
    parts = name.split()
    title = f'{parts[0]} <em>{parts[1]}</em>' if len(parts) > 1 else f'<em>{parts[0]}</em>'
    return f'''<!-- GALLERY -->
<section class="gallery-section" id="gallery">
  <div class="container" style="max-width:1200px;margin:0 auto">
    <div class="gallery-header">
      <div>
        <span class="section-label">Gallery</span>
        <h2 class="section-title" style="margin-bottom:0">{title}</h2>
      </div>
      <div class="gallery-badge-big">REGISTER NOW</div>
    </div>
    <div class="section-divider"></div>
    <div class="gallery-grid">
{items}
    </div>
  </div>
</section>'''

def sec_floorplans(p):
    site = p['site']
    fps = []
    for fp, t in p['fps']:
        fps.append(f'''      <div class="floorplan-item">
        <a href="/{site}/images/floorplans/{fp}.jpg" target="_blank" data-lightbox="floorplans" data-title="{fp} · {t}">
          <img src="/{site}/images/floorplans/{fp}.jpg" alt="{p['name']} {fp} Floor Plan {t}" loading="lazy">
        </a>
        <div class="floorplan-label">{fp} · {t}</div>
      </div>''')
    pdfs = '\n'.join(f'      <a href="{u}" target="_blank" rel="noopener" class="btn-primary">{lbl}</a>' for u, lbl in p['pdfs'])
    return f'''<!-- FLOOR PLANS -->
<section class="floorplan-section" id="floorplans" style="background:var(--cream2)">
  <div class="container" style="max-width:1200px;margin:0 auto">
    <span class="section-label">Floor Plans</span>
    <h2 class="section-title">Explore the <em>Layouts</em></h2>
    <div class="section-divider"></div>
    <p style="font-size:15px;line-height:1.8;color:var(--text-light);margin-bottom:20px;max-width:800px">
      {p['fp_intro']}
    </p>
    <div style="display:flex;gap:14px;flex-wrap:wrap;margin-bottom:40px">
{pdfs}
    </div>
    <div class="floorplan-grid">
{chr(10).join(fps)}
    </div>
  </div>
</section>'''

def sec_balance(p):
    rows = []
    for t, n, s in p['balance']:
        rows.append(f'''          <tr>
            <td>{t}</td>
            <td>{n}</td>
            <td>{s}</td>
          </tr>''')
    tt, tn, ts = p['balance_total']
    rows.append(f'''          <tr class="total">
            <td>{tt}</td>
            <td>{tn}</td>
            <td>{ts}</td>
          </tr>''')
    return f'''<!-- BALANCE UNITS -->
<section id="pricing">
  <div class="container" style="max-width:1200px;margin:0 auto">
    <span class="section-label" style="color:var(--gold)">Balance Units</span>
    <h2 class="section-title">A Mix for <em>Every Lifestyle</em></h2>
    <div class="section-divider"></div>
    <p style="color:rgba(255,255,255,0.5);font-size:14px;margin-bottom:24px;max-width:600px">
      {p['name']} offers a wide range of unit types. Areas are subject to final verification by surveyor and authorities approval.
    </p>
    <h3 style="font-family:'Cormorant Garamond',serif;font-size:20px;color:var(--gold);margin-bottom:14px">{p['balance_title']}</h3>
    <div class="unit-table" style="overflow-x:auto">
      <table style="width:100%;border-collapse:collapse;min-width:640px">
        <thead>
          <tr>
            <th>Unit Type</th>
            <th>No. of Units</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
{chr(10).join(rows)}
        </tbody>
      </table>
    </div>
    <div style="margin-top:48px;padding:32px;background:rgba(255,255,255,0.04);border:1px solid rgba(184,151,90,0.2);border-radius:4px;text-align:center">
      <h3 style="font-family:'Cormorant Garamond',serif;font-size:24px;color:var(--gold);margin-bottom:12px">Need Full Pricelist?</h3>
      <p style="color:rgba(255,255,255,0.5);font-size:14px;margin-bottom:20px">Get the complete pricelist, e-brochure, and floor plans sent to your phone.</p>
      <a href="{p['wa']}" target="_blank" rel="noopener" class="btn-primary">📱 Request Full Pricelist on WhatsApp</a>
    </div>
  </div>
</section>'''

def sec_siteplan(p):
    loc_items = '\n'.join(f'        <div class="loc-item"><div class="loc-name">{n}</div><div class="loc-dist">{d}</div></div>' for n, d in p['loc_items'])
    return f'''<!-- LOCATION MAP / SITE PLAN -->
<section id="siteplan" style="background:var(--cream)">
  <div class="container" style="max-width:1200px;margin:0 auto">
    <span class="section-label">Location</span>
    <h2 class="section-title">{p['loc_title']}</h2>
    <div class="section-divider"></div>
    <p style="font-size:15px;line-height:1.8;color:var(--text-light);margin-bottom:32px;max-width:800px">
      {p['loc_p']}
    </p>
    <div class="siteplan-grid">
      <div class="siteplan-item">
        <a href="{p['siteplan']}" target="_blank">
          <img src="{p['siteplan']}" alt="{p['siteplan_alt']}" loading="lazy">
        </a>
      </div>
      <div class="siteplan-item">
        <a href="{p['loc_img']}" target="_blank">
          <img src="{p['loc_img']}" alt="{p['loc_alt']}" loading="lazy">
        </a>
      </div>
    </div>
    <div class="loc-grid">
{loc_items}
    </div>
  </div>
</section>'''

def sec_amenities(p):
    col1 = p['amenities'][:2] if len(p['amenities']) > 2 else p['amenities'][:1]
    col2 = p['amenities'][len(col1):]
    def col(items):
        out = []
        for n, d in items:
            parts = d.split(' · ')
            first = parts[0]
            rest = ' · '.join(parts[1:])
            out.append(f'''        <div class="amenity-item">
          <div class="icon">✦</div>
          <div><div class="lbl">{n}</div><div class="val">{first}{f' <small>· {rest}</small>' if rest else ''}</div></div>
        </div>''')
        return '\n'.join(out)
    return f'''<!-- AMENITIES & LOCATION -->
<section id="amenities">
  <div class="container" style="max-width:1200px;margin:0 auto">
    <span class="section-label">Amenities</span>
    <h2 class="section-title">{p['amen_title']}</h2>
    <div class="section-divider"></div>
    <div class="amenities-grid">
      <div>
{col(col1)}
      </div>
      <div>
{col(col2)}
      </div>
    </div>
  </div>
</section>'''

def sec_features(p):
    cards = []
    for icon, n, d in p['features']:
        cards.append(f'''      <div class="feature-card">
        <div class="f-icon">{icon}</div>
        <h4>{n}</h4>
        <p>{d}</p>
      </div>''')
    return f'''<!-- FEATURES -->
<section class="features-section" id="features">
  <div class="container" style="max-width:1200px;margin:0 auto">
    <span class="section-label">Why {p['name_short']}</span>
    <h2 class="section-title">Key <em>Selling Points</em></h2>
    <div class="section-divider"></div>
    <div class="features-grid">
{chr(10).join(cards)}
    </div>
  </div>
</section>'''

def sec_faq(p):
    items = []
    for q, a in p['faq']:
        items.append(f'''    <div class="faq-item">
      <div class="faq-q" onclick="toggleFaq(this)">{q}<span class="faq-icon">+</span></div>
      <div class="faq-a">{a}</div>
    </div>''')
    return f'''<!-- FAQ -->
<section id="faq">
  <div class="container" style="max-width:1200px;margin:0 auto">
    <span class="section-label" style="color:var(--gold)">FAQ</span>
    <h2 class="section-title">Frequently <em>Asked Questions</em></h2>
    <div class="section-divider"></div>
{chr(10).join(items)}
  </div>
</section>'''

def sec_contact(p):
    return f'''<!-- CONTACT -->
<section id="contact">
  <div class="container" style="max-width:1200px;margin:0 auto">
    <span class="section-label" style="color:var(--gold)">Contact</span>
    <h2 class="section-title" style="color:var(--white)">Register <em>Interest</em></h2>
    <div class="section-divider"></div>
    <p style="color:rgba(255,255,255,0.5);font-size:14px;margin-bottom:32px;max-width:600px;text-align:center;margin-left:auto;margin-right:auto">
      Get direct developer pricing, exclusive previews, and the latest e-brochure with floor plans and complete pricelist. No obligation, no commission payable.
    </p>
    <div class="contact-grid">
      <div>
        <form action="https://api.web3forms.com/submit" method="POST" class="contact-form">
          <input type="hidden" name="access_key" value="80bb82c8-aa68-4974-b63b-66bac63a8016">
          <input type="hidden" name="subject" value="{p['name']} Enquiry via jetleechannel.sg">
          <input type="hidden" name="redirect" value="https://jetleechannel.sg/{p['site']}/thanks">
          <input type="text" name="name" placeholder="Your Name" required>
          <input type="tel" name="phone" placeholder="Phone Number" required>
          <input type="email" name="email" placeholder="Email (optional)">
          <textarea name="message" placeholder="I am interested in {p['name']} — please send me the e-brochure and pricelist." rows="4" required></textarea>
          <button type="submit" class="btn-primary">Submit Enquiry</button>
        </form>
      </div>
      <div>
        <div class="contact-detail">
          <div class="icon">📞</div>
          <div><div class="lbl">Call / WhatsApp</div><div class="val">+65 8764 9315</div></div>
        </div>
        <div class="contact-detail">
          <div class="icon">🏢</div>
          <div><div class="lbl">License</div><div class="val">CEA Reg R007613B · Estate Agent L3008022J · PropNex Realty</div></div>
        </div>
        <div style="margin-top:32px">
          <a href="{p['wa']}" target="_blank" rel="noopener" class="btn-primary">💬 WhatsApp Jet Lee Now</a>
        </div>
      </div>
    </div>
  </div>
</section>'''

# ============ ASSEMBLE ============
def build_nav(p):
    return f'''<!-- NAV -->
<nav>
  <div class="nav-logo">
    <div class="logo-dh">{p['name']}</div>
    <div class="logo-sub">{p['tagline']}</div>
  </div>
  <button class="mobile-toggle" onclick="toggleMobileMenu()" aria-label="Menu"><span></span><span></span><span></span></button>
    <ul class="nav-links" id="navLinks">
    <li><a href="#home">Home</a></li>
    <li><a href="#details">Overview</a></li>
    <li><a href="#gallery">Gallery</a></li>
    <li><a href="#floorplans">Floorplans</a></li>
    <li><a href="#pricing">Balance Units</a></li>
    <li><a href="#siteplan">Location</a></li>
    <li><a href="#amenities">Amenities</a></li>
    <li><a href="#features">Features</a></li>
    <li><a href="#faq">FAQ</a></li>
    <li><a href="https://jetleechannel.sg/articles/" target="_blank" rel="noopener">Articles</a></li>
    <li><a href="#contact">Contact</a></li>
  </ul>
  <a href="#contact" class="nav-cta">Register Interest</a>
</nav>'''

def build_hero(p):
    stats = []
    for i, (num, lbl) in enumerate(p['stats']):
        if i > 0: stats.append('      <div class="hero-divider"></div>')
        stats.append(f'      <div class="hero-stat"><span class="num">{num}</span><span class="lbl">{lbl}</span></div>')
    return f'''<!-- HERO -->
<section id="home">
  <div class="hero-bg"></div>
  <div class="hero-pattern"></div>
  <div class="hero-content">
    <div class="hero-tag">{p['hero_tag']}</div>
    <h1 class="hero-title">{p['hero_title']}</h1>
    <p class="hero-subtitle">{p['hero_sub']}</p>
    <div class="hero-stats">
{chr(10).join(stats)}
    </div>
    <div class="hero-actions">
      <a href="{p['wa']}" target="_blank" rel="noopener" class="btn-primary">💬 WhatsApp Jet Lee</a>
      <a href="#contact" class="btn-outline">Register Interest →</a>
    </div>
  </div>
  <div class="hero-scroll">
    Scroll
    <div class="scroll-line"></div>
  </div>
</section>'''

def build_ticker(p):
    t = p['ticker']
    return f'''<!-- TICKER -->
<div class="ticker">
  <div class="ticker-inner">
    {t} &nbsp;·&nbsp;&nbsp;&nbsp;
    {t} &nbsp;·&nbsp;&nbsp;&nbsp;
  </div>
</div>'''

def build_head(p):
    h = HEAD
    h = h.replace('<title>The Orie | 777 Units D12 Toa Payoh | Direct Developer Price | Jet Lee</title>', f'<title>{p["title"]}</title>')
    h = h.replace('<meta name="description" content="The Orie – 777 units at Lorong 1 Toa Payoh, District 12. 2 towers of 40 storeys by CDL, Frasers Property & Sekisui House. 1BR+Study to 5BR. 99-year leasehold, TOP 2030. Register interest with Jet Lee.">', f'<meta name="description" content="{p["desc"]}">')
    # canonical/OG/twitter URLs
    site_path = f'https://jetleechannel.sg/{p["site"]}/'
    h = h.replace('https://jetleechannel.sg/TheOrie/', site_path)
    h = h.replace('https://jetleechannel.sg/TheOrie/images/exterior-1.jpg', site_path + 'images/' + (p['hero_img'].split('/')[-1]))
    # also fix any remaining exterior-1 refs after site path substitution (og/twitter images)
    h = h.replace(site_path + 'images/exterior-1.jpg', site_path + 'images/' + (p['hero_img'].split('/')[-1]))
    return h

def build_hero_css(p):
    """Replace hero bg image URL in CSS."""
    return p['hero_img']

def assemble(p):
    head = build_head(p)
    # fix hero bg in CSS (inside head)
    head = re.sub(r"url\('/[^']*exterior-1\.jpg'\)", f"url('{p['hero_img']}')", head)
    nav = build_nav(p)
    hero = build_hero(p)
    ticker = build_ticker(p)
    body_sections = '\n\n'.join([
        sec_details(p), sec_gallery(p), sec_floorplans(p), sec_balance(p),
        sec_siteplan(p), sec_amenities(p), sec_features(p), sec_faq(p), sec_contact(p),
    ])
    # footer: replace project name
    footer = FOOTER.replace('The Orie', p['name'])
    # whatsapp float
    whatsapp = WHATSAPP.replace('https://wa.me/6587649315?text=Hi%20Jet%20Lee%2C%20interested%20in%20The%20Orie', p['wa'])
    whatsapp = whatsapp.replace('interested in The Orie', f'interested in {p["name"]}')
    return head + '\n\n' + nav + '\n\n' + hero + '\n\n' + ticker + '\n\n' + body_sections + '\n\n' + footer + '\n\n' + whatsapp

for key, p in P.items():
    out = assemble(p)
    os.makedirs(p['dir'], exist_ok=True)
    with open(os.path.join(p['dir'], 'index.html'), 'w', encoding='utf-8') as f:
        f.write(out)
    print(f"OK {key}: {len(out)//1024}KB")
