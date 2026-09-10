import os, json

enc_dir = '/home/ubuntu/.openclaw/workspace/elta_enc_opt'

images = {}
for name in ['hero','towers','arch','night','living','lobby','facilities','master_bedroom',
             'g05','g07','g10','g11','g16','g17','g20','g26','g27','g28']:
    with open(f'{enc_dir}/{name}.txt') as f:
        images[name] = f.read().strip()

fp_order = [
    ('siteplan', 'Site Plan', ''),
    ('fp_5br', 'Type E1 &middot; 5-Bedroom', '1,776 sqft &middot; 27 avail from $3,965,000'),
    ('fp_4br_study', 'Type D4s &middot; 4-Bedroom + Study', '1,507 sqft &middot; 22 avail from $3,686,000'),
    ('fp_4br_dual', 'Type D3K &middot; 4-Bedroom Dual Key', '1,313 sqft &middot; 20 avail from $3,396,000'),
    ('fp_4br_prem', 'Type D2P &middot; 4-Bedroom Premium', '1,313 sqft &middot; 6 avail from $3,506,000'),
    ('fp_4br_std', 'Type D1 &middot; 4-Bedroom', '1,184 sqft &middot; 7 avail from $3,330,000'),
    ('fp_3br', 'Type C1 &middot; 3-Bedroom', '926 sqft &middot; 5 avail from $2,658,000'),
    ('fp_2br_study', 'Type B5S &middot; 2-Bedroom + Study', '807 sqft &middot; 1 unit from $2,275,000'),
    ('fp_1br_study', 'Type A1S &middot; 1-Bedroom + Study', '506 sqft &middot; 4 avail from $1,404,000'),
]

fp_thumb = {}
fp_full = {}
for key, _, _ in fp_order:
    with open(f'{enc_dir}/{key}_thumb.txt') as f:
        fp_thumb[key] = f.read().strip()
    with open(f'{enc_dir}/{key}.txt') as f:
        fp_full[key] = f.read().strip()

fp_sections = '<div class="fpg">'
for key, label, desc in fp_order:
    fp_sections += '<div class="fpc" id="' + key + '">'
    fp_sections += '<div class="fpl">' + label + '</div>'
    if desc:
        fp_sections += '<p class="fpd">' + desc + '</p>'
    fp_sections += '<div class="fptw" onclick="of(\'' + key + '\')">'
    fp_sections += '<img src="data:image/jpeg;base64,' + fp_thumb[key] + '" alt="ELTA ' + label + '" class="fpt" loading="lazy">'
    fp_sections += '<div class="fpzh">Tap to view full size</div>'
    fp_sections += '</div></div>'

fp_js = json.dumps(fp_full)

# Build CSS
css = '''
*{margin:0;padding:0;box-sizing:border-box}
html{scroll-behavior:smooth}
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;background:#0d1a12;color:#e8eae6;overflow-x:hidden}
h1,h2,h3{font-family:'Playfair Display',Georgia,serif}
:root{--dk:#0d1a12;--dk2:#14281e;--dk3:#1c3a2a;--gd:#c9a84c;--gl:#e4c97e;--cr:#e8eae6;--dm:rgba(232,234,230,.5)}
#ld{position:fixed;inset:0;z-index:9999;background:var(--dk)}
.li{display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh}
.ll{font-size:clamp(2rem,5vw,3.5rem);color:var(--gd);letter-spacing:.25em;animation:fu 1s ease}
.ls{font-size:.7rem;letter-spacing:.4em;color:var(--dm);text-transform:uppercase;animation:fu 1s .3s ease both;margin-top:.75rem}
.lb{width:200px;height:1px;background:rgba(201,168,76,.2);margin-top:2rem;overflow:hidden}
.lbf{height:100%;background:linear-gradient(90deg,transparent,var(--gd),transparent);animation:lda 1.5s .5s ease forwards;width:0}
@keyframes lda{to{width:100%}}
@keyframes fu{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
nav{position:fixed;top:0;left:0;right:0;z-index:100;padding:1rem 4vw;display:flex;justify-content:space-between;align-items:center;transition:background .3s}
nav.sc{background:rgba(13,26,18,.95);backdrop-filter:blur(10px)}
.nlo{font-size:1.1rem;color:var(--gd);font-weight:600;letter-spacing:.15em;text-decoration:none;text-transform:uppercase}
.nl{display:flex;gap:2rem;list-style:none}
.nl a{color:var(--cr);text-decoration:none;font-size:.75rem;letter-spacing:.1em;text-transform:uppercase;transition:color .3s}
.nl a:hover{color:var(--gd)}
.ham{display:none;flex-direction:column;gap:4px;cursor:pointer}
.ham span{width:24px;height:2px;background:var(--cr);transition:.3s}
.hero{position:relative;height:100vh;min-height:600px;display:flex;align-items:center;justify-content:center;text-align:center;overflow:hidden}
.hbg{position:absolute;inset:0;background:url(data:image/jpeg;base64,''' + images['hero'] + ''') center/cover no-repeat;filter:brightness(.45)}
.hov{position:absolute;inset:0;background:linear-gradient(180deg,rgba(13,26,18,.3),rgba(13,26,18,.8))}
.hc{position:relative;z-index:2;padding:0 4vw}
.htg{font-size:.7rem;letter-spacing:.4em;color:var(--gd);text-transform:uppercase;margin-bottom:1rem}
.hti{font-size:clamp(2.5rem,7vw,5rem);color:var(--cr);margin-bottom:.5rem}
.hsu{font-size:clamp(1rem,2.5vw,1.5rem);color:var(--gl);font-weight:300;letter-spacing:.15em}
.hps{font-size:clamp(1.2rem,3vw,2rem);color:#4cc47c;margin-top:1.5rem;font-weight:600}
.btn{display:inline-block;margin-top:2rem;padding:1rem 3rem;background:var(--gd);color:var(--dk);text-decoration:none;font-size:.85rem;letter-spacing:.15em;text-transform:uppercase;font-weight:600;transition:all .3s;border-radius:4px;cursor:pointer;border:none}
.btn:hover{background:var(--gl);transform:translateY(-2px)}
section{padding:6rem 4vw}
.sti{font-size:clamp(1.5rem,3vw,2.5rem);color:var(--cr);margin-bottom:.5rem}
.ssu{color:var(--dm);font-size:.85rem;letter-spacing:.15em;text-transform:uppercase;margin-bottom:3rem}
.g2{display:grid;grid-template-columns:1fr 1fr;gap:3rem;align-items:center}
.g2 img{width:100%;border-radius:8px}
.stats{display:grid;grid-template-columns:1fr 1fr;gap:1.5rem;margin-top:2rem}
.sv{font-size:1.8rem;color:var(--gd);font-weight:700;text-align:center}
.sl{font-size:.7rem;color:var(--dm);text-transform:uppercase;letter-spacing:.1em;text-align:center;margin-top:.25rem}
#units{background:var(--dk2)}
.tbl{width:100%;border-collapse:collapse;margin-top:1rem}
.tbl th{text-align:left;padding:1rem;background:var(--dk3);color:var(--gd);font-size:.75rem;letter-spacing:.1em;text-transform:uppercase;font-weight:600}
.tbl td{padding:1rem;border-bottom:1px solid rgba(255,255,255,.05);font-size:.9rem}
.tbl tr:hover{background:rgba(255,255,255,.03)}
.avl{color:#4cc47c;font-weight:600}
.prc{color:var(--gd);font-weight:600}
.plk{color:#4cc47c;font-size:.75rem;text-decoration:none;margin-left:.3rem}
.plk:hover{text-decoration:underline}
#plans{background:var(--dk3)}
.fpg{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:1rem}
.fpc{margin-bottom:0}
.fpl{color:var(--gd);font-size:.9rem;letter-spacing:.08em;margin-bottom:.4rem;font-weight:600}
.fpd{color:var(--dm);font-size:.82rem;margin-bottom:.5rem}
.fptw{display:inline-block;position:relative;cursor:pointer;border-radius:8px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,.35);transition:all .2s}
.fptw:hover{transform:scale(1.02);box-shadow:0 4px 20px rgba(0,0,0,.45)}
.fpt{display:block;width:100%;max-width:300px;height:auto}
.fpzh{position:absolute;bottom:6px;right:8px;background:rgba(0,0,0,.65);color:var(--cr);font-size:.65rem;padding:4px 10px;border-radius:4px;pointer-events:none;backdrop-filter:blur(4px)}
.gal{display:grid;grid-template-columns:repeat(3,1fr);gap:.6rem}
.gal img{width:100%;border-radius:4px;cursor:pointer;transition:transform .2s}
.gal img:hover{transform:scale(1.03)}
#location{background:var(--dk2)}
.l2{display:grid;grid-template-columns:1fr 1fr;gap:3rem}
.li2{margin-bottom:1.5rem}
.li2 h4{color:var(--gd);font-size:.8rem;letter-spacing:.1em;margin-bottom:.5rem}
.li2 p{font-size:.9rem;color:var(--cr);line-height:1.6}
#faq{background:var(--dk3)}
.faqi{border-bottom:1px solid rgba(255,255,255,.06);padding:.8rem 0;cursor:pointer}
.faqq{color:var(--cr);font-size:.95rem;font-weight:500;display:flex;justify-content:space-between;align-items:center;padding:.3rem 0}
.faqq::after{content:'+';color:var(--gd);font-size:1.2rem;font-weight:300;transition:transform .2s}
.faqi.open .faqq::after{content:'−'}
.faqa{max-height:0;overflow:hidden;transition:max-height .3s ease;color:var(--dm);font-size:.85rem;line-height:1.7;padding:0 .5rem}
.faqi.open .faqa{max-height:300px;padding:.5rem .5rem .8rem}
#developer{background:var(--dk)}
.dv{display:flex;gap:3rem;justify-content:center;flex-wrap:wrap}
.dc{background:var(--dk2);padding:2rem;border-radius:8px;text-align:center;max-width:300px}
.dc h3{color:var(--gd);margin-bottom:.5rem}
.dc p{font-size:.85rem;color:var(--dm);line-height:1.6}
#contact{background:linear-gradient(135deg,var(--dk2),var(--dk3));text-align:center}
.fw{max-width:500px;margin:0 auto;text-align:left}
.fg{margin-bottom:1.25rem}
.fl{display:block;font-size:.75rem;color:var(--dm);letter-spacing:.1em;text-transform:uppercase;margin-bottom:.5rem}
.fi,.fs{width:100%;padding:.85rem 1rem;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);color:var(--cr);font-size:.9rem;border-radius:4px;outline:none;transition:border-color .3s;font-family:inherit}
.fi:focus,.fs:focus{border-color:var(--gd)}
.fs option{background:var(--dk3)}
.fsub{width:100%;padding:1rem;background:var(--gd);color:var(--dk);border:none;font-size:.8rem;letter-spacing:.15em;text-transform:uppercase;font-weight:600;cursor:pointer;border-radius:4px;transition:all .3s}
.fsub:hover{background:var(--gl)}
.fsub:disabled{opacity:.6;cursor:not-allowed}
.wa{display:flex;align-items:center;justify-content:center;gap:.8rem;width:100%;padding:1rem;background:rgba(37,211,102,.1);border:1px solid rgba(37,211,102,.3);color:#25D366;font-size:.7rem;letter-spacing:.2em;text-transform:uppercase;text-decoration:none;margin-top:1rem;border-radius:4px}
.wa:hover{background:rgba(37,211,102,.2)}
#fok{display:none;text-align:center;padding:2rem}
#fok .ck{font-size:3rem;margin-bottom:1rem}
#fok h3{font-size:1.8rem;color:var(--cr);margin-bottom:.5rem}
footer{padding:2rem 4vw;text-align:center;color:var(--dm);font-size:.8rem;border-top:1px solid rgba(255,255,255,.05)}
@media(max-width:768px){
.ham{display:flex}
.nl{position:fixed;top:0;right:-100%;width:70%;height:100vh;background:rgba(13,26,18,.98);flex-direction:column;padding:5rem 2rem;transition:right .3s;z-index:99}
.nl.active{right:0}
.g2{grid-template-columns:1fr}
.gal{grid-template-columns:1fr 1fr}
.l2{grid-template-columns:1fr}
}
#lb{display:none;position:fixed;inset:0;z-index:9998;background:rgba(0,0,0,.95);align-items:center;justify-content:center;cursor:pointer}
#lb img{max-width:95vw;max-height:95vh;object-fit:contain}
.waf{position:fixed;bottom:24px;right:24px;z-index:99;width:56px;height:56px;background:#25D366;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 20px rgba(37,211,102,.4);transition:all .3s;text-decoration:none}
.waf:hover{transform:scale(1.1)}
'''

js_code = '''
var fpd = FP_DATA_PLACEHOLDER;
window.addEventListener('load',function(){setTimeout(function(){document.getElementById('ld').style.display='none'},600)});
window.addEventListener('scroll',function(){document.getElementById('nav').classList.toggle('sc',window.scrollY>80)});
document.getElementById('hm').addEventListener('click',function(){document.getElementById('nl').classList.toggle('active')});
document.querySelectorAll('#nl a').forEach(function(a){a.addEventListener('click',function(){document.getElementById('nl').classList.remove('active')})});
function sp(id){setTimeout(function(){var e=document.getElementById(id);if(e)e.scrollIntoView({behavior:'smooth',block:'center'})},100)}
var lb=document.getElementById('lb'),lbi=document.getElementById('lbi');
function olb(i){lbi.src=i.src;lb.style.display='flex'}
function clb(){lb.style.display='none'}
function ft(e){e.classList.toggle('open')}
function of(k){if(fpd[k]){lbi.src='data:image/jpeg;base64,'+fpd[k];lb.style.display='flex'}}
document.addEventListener('keydown',function(e){if(e.key==='Escape')clb()});
document.getElementById('rf').addEventListener('submit',async function(e){
e.preventDefault();var b=document.getElementById('fsbb');b.textContent='Sending...';b.disabled=true;
try{var r=await fetch('https://api.web3forms.com/submit',{method:'POST',body:new FormData(this)});var d=await r.json();
if(d.success){document.getElementById('rf').style.display='none';document.getElementById('fok').style.display='block'}else{b.textContent='Try WhatsApp';b.disabled=false}}
catch(e){b.textContent='Try WhatsApp';b.disabled=false}});
'''

js_final = js_code.replace('FP_DATA_PLACEHOLDER', fp_js)

# Build final HTML by concatenation
html = '<!DOCTYPE html>\n<html lang="en">\n<head>\n'
html += '<meta charset="UTF-8">\n'
html += '<meta name="google-site-verification" content="tlUhMT8r2XjxyD0GkiZbW82TFbQTe1mhoxWLzdPMXVg">\n'
html += '<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0">\n'
html += '<meta name="description" content="ELTA at 10 & 12 Clementi Avenue 1 - 501 units, 2 towers 39-storey. Limited balance units from $2,233 psf. View floor plans, site plan, location map & FAQ. MCL Land & CSC Land.">\n'
html += '<link rel="canonical" href="https://eltasingapore.jetleechannel.sg/">\n'
html += '<meta property="og:type" content="website">\n'
html += '<meta property="og:title" content="ELTA Clementi | Floor Plans & Balance Units | MCL Land">\n'
html += '<meta property="og:description" content="ELTA at Clementi Ave 1. 1BR to 5BR. Limited units $2,233 psf. View floor plans.">\n'
html += '<meta property="og:site_name" content="ELTA by Jet Lee">\n'
html += '<meta property="og:locale" content="en_SG">\n'
html += '<meta name="twitter:card" content="summary_large_image">\n'
html += '<meta name="twitter:title" content="ELTA Clementi | D05 | MCL Land">\n'
html += '<meta name="twitter:description" content="ELTA 501 units Clementi Ave 1. From $2,233 psf.">\n'
html += '<title>ELTA Clementi | Floor Plans, Balance Units & FAQ | D05 | MCL Land</title>\n'
html += '<style>' + css + '</style>\n'
faq_schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    'mainEntity': [
        {'@type': 'Question', 'name': 'Where exactly is ELTA located?', 'acceptedAnswer': {'@type': 'Answer', 'text': 'ELTA is at 10 & 12 Clementi Avenue 1, District 05 (Clementi). It is a 5-minute walk from Clementi MRT (EW Line).'}},
        {'@type': 'Question', 'name': 'What unit types are available at ELTA?', 'acceptedAnswer': {'@type': 'Answer', 'text': 'ELTA offers 1BR+Study (A1S), 2BR+Study (B5S), 3BR (C1), 4BR (D1), 4BR Premium (D2P), 4BR Dual Key (D3K), 4BR+Study (D4s), and 5BR (E1). Sizes 506 to 1,776 sqft.'}},
        {'@type': 'Question', 'name': 'How many units are still available at ELTA?', 'acceptedAnswer': {'@type': 'Answer', 'text': '92 units remain out of 501 total (81% sold). The most available are 5BR (27 units) and 4BR+Study (22 units).'}},
        {'@type': 'Question', 'name': 'What is the TOP date for ELTA?', 'acceptedAnswer': {'@type': 'Answer', 'text': 'ELTA is expected to receive TOP in 2030.'}},
        {'@type': 'Question', 'name': 'Who is the developer of ELTA?', 'acceptedAnswer': {'@type': 'Answer', 'text': 'ELTA is a joint venture between MCL Land (Jardine Matheson/Hongkong Land) and CSC Land Group.'}},
        {'@type': 'Question', 'name': 'How far is ELTA from Clementi MRT?', 'acceptedAnswer': {'@type': 'Answer', 'text': 'About 5 minutes walk. Clementi MRT serves the East-West Line.'}},
        {'@type': 'Question', 'name': 'What are the nearby schools to ELTA?', 'acceptedAnswer': {'@type': 'Answer', 'text': 'NUS High School, Nan Hua High School, Qifa Primary, Singapore Polytechnic, NUS, and NP within 1 km.'}},
        {'@type': 'Question', 'name': 'How do I register interest for ELTA?', 'acceptedAnswer': {'@type': 'Answer', 'text': 'WhatsApp Jet Lee at 8764 9315 or fill in the contact form at eltasingapore.jetleechannel.sg.'}},
    ]
}
html += '<script type="application/ld+json">' + json.dumps(faq_schema, ensure_ascii=False) + '</script>'
html += '</head>\n<body>\n'

html += '<div id="ld"><div class="li"><div class="ll">ELTA</div><div class="ls">Elevated Modern Living</div><div class="lb"><div class="lbf"></div></div></div></div>\n'
html += '<nav id="nav"><a href="#" class="nlo">ELTA</a><ul class="nl" id="nl"><li><a href="#overview">Overview</a></li><li><a href="#units">Units</a></li><li><a href="#plans">Plans</a></li><li><a href="#gallery">Gallery</a></li><li><a href="#location">Location</a></li><li><a href="#faq">FAQ</a></li><li><a href="#developer">Developer</a></li><li><a href="#contact">Contact</a></li></ul><div class="ham" id="hm"><span></span><span></span><span></span></div></nav>\n'

# Hero
html += '<section class="hero"><div class="hbg"></div><div class="hov"></div><div class="hc">'
html += '<div class="htg">Limited Balance Units</div><h1 class="hti">ELTA</h1><p class="hsu">Elevated Modern Living</p>'
html += '<p class="hps">From $2,233 psf</p><p style="color:var(--dm);margin-top:.5rem;font-size:.85rem">10 &amp; 12 Clementi Ave 1 &middot; D05 Clementi</p>'
html += '<a href="#contact" class="btn">Register Interest</a></div></section>\n'

# Overview
html += '<section id="overview"><div class="g2"><div><div class="sti">Elevated Living,<br>Nature-Inspired Luxury</div>'
html += '<p style="color:var(--dm);line-height:1.8;margin:1rem 0 2rem">501 units across two 39-storey towers. A modern treehouse sanctuary in the heart of Clementi.</p>'
html += '<div class="stats"><div style="text-align:center"><div class="sv">501</div><div class="sl">Units</div></div>'
html += '<div style="text-align:center"><div class="sv">2</div><div class="sl">Towers &middot; 39 Storeys</div></div>'
html += '<div style="text-align:center"><div class="sv">5</div><div class="sl">Min to Clementi MRT</div></div>'
html += '<div style="text-align:center"><div class="sv">81%</div><div class="sl">Sold</div></div></div></div>'
html += '<img src="data:image/jpeg;base64,' + images['towers'] + '" alt="ELTA towers" loading="lazy"></div></section>\n'

# Units table
html += '<section id="units"><div class="sti">Balance Units Available</div><div class="ssu">As of 12 June 2026</div>'
html += '<div style="overflow-x:auto"><table class="tbl"><thead><tr><th>Unit Type</th><th>Size</th><th>Avail</th><th>From Price</th><th>PSF</th></tr></thead><tbody>'
html += '<tr><td>Type E1 &middot; 5-Bedroom <a href="#plans" onclick="sp(\'fp_5br\')" class="plk">[Plan]</a></td><td>1,776 sqft</td><td class="avl">27</td><td class="prc">$3,965,000</td><td>$2,233</td></tr>'
html += '<tr><td>Type D4s &middot; 4BR + Study <a href="#plans" onclick="sp(\'fp_4br_study\')" class="plk">[Plan]</a></td><td>1,507 sqft</td><td class="avl">22</td><td class="prc">$3,686,000</td><td>$2,446</td></tr>'
html += '<tr><td>Type D3K &middot; 4BR Dual Key <a href="#plans" onclick="sp(\'fp_4br_dual\')" class="plk">[Plan]</a></td><td>1,313 sqft</td><td class="avl">20</td><td class="prc">$3,396,000</td><td>$2,586</td></tr>'
html += '<tr><td>Type D2P &middot; 4BR Premium <a href="#plans" onclick="sp(\'fp_4br_prem\')" class="plk">[Plan]</a></td><td>1,313 sqft</td><td class="avl">6</td><td class="prc">$3,506,000</td><td>$2,670</td></tr>'
html += '<tr><td>Type D1 &middot; 4BR <a href="#plans" onclick="sp(\'fp_4br_std\')" class="plk">[Plan]</a></td><td>1,184 sqft</td><td class="avl">7</td><td class="prc">$3,330,000</td><td>$2,813</td></tr>'
html += '<tr><td>Type C1 &middot; 3BR <a href="#plans" onclick="sp(\'fp_3br\')" class="plk">[Plan]</a></td><td>926 sqft</td><td class="avl">5</td><td class="prc">$2,658,000</td><td>$2,847</td></tr>'
html += '<tr><td>Type B5S &middot; 2BR + Study <a href="#plans" onclick="sp(\'fp_2br_study\')" class="plk">[Plan]</a></td><td>807 sqft</td><td class="avl">1</td><td class="prc">$2,275,000</td><td>$2,819</td></tr>'
html += '<tr><td>Type A1S &middot; 1BR + Study <a href="#plans" onclick="sp(\'fp_1br_study\')" class="plk">[Plan]</a></td><td>506 sqft</td><td class="avl">4</td><td class="prc">$1,404,000</td><td>$2,775</td></tr>'
html += '</tbody></table></div>'
html += '<p style="color:var(--dm);font-size:.75rem;margin-top:1rem">* Prices subject to change.</p>'
html += '<div style="text-align:center;margin-top:2rem"><a href="#plans" class="btn">View Floor Plans</a></div></section>\n'

# Floor plans
html += '<section id="plans"><div class="sti">Floor Plans</div><div class="ssu">Tap any plan to view full size</div>\n'
html += fp_sections + '\n</div></section>\n'

# Gallery
html += '<section id="gallery"><div class="sti">Gallery</div><div class="ssu">Artist Impressions</div><div class="gal">\n'
gallery_names = ['arch','living','master_bedroom','lobby','facilities','night',
                  'g05','g07','g16','g17','g20','g26','g27','g28','g10']
for gn in gallery_names:
    alt = gn.replace('_',' ')
    html += '<img src="data:image/jpeg;base64,' + images[gn] + '" alt="ELTA ' + alt + '" onclick="olb(this)" loading="lazy">\n'
html += '</div></section>\n'

# Lightbox
html += '<div id="lb" onclick="clb()"><img id="lbi" src="" alt=""></div>\n'

# Location
html += '<section id="location"><div class="sti">Location</div><div class="ssu">10 &amp; 12 Clementi Avenue 1</div>'
html += '<div class="l2"><div>'
html += '<div class="li2"><h4>MRT</h4><p>Clementi MRT (EW) - 5 mins walk</p></div>'
html += '<div class="li2"><h4>Schools</h4><p>Singapore Poly, NUS, NP, SIM, SUSS</p></div>'
html += '<div class="li2"><h4>Retail</h4><p>The Clementi Mall, 321 Clementi, JEM, Westgate</p></div>'
html += '</div><div>'
html += '<div class="li2"><h4>Business</h4><p>one-north, Science Park, IBP, JLD</p></div>'
html += '<div class="li2"><h4>Access</h4><p>AYE, PIE</p></div>'
# Load the proper location map image
with open('/home/ubuntu/.openclaw/workspace/elta_enc_opt/location_map.txt') as _f:
    _loc_map = _f.read().strip()
html += '<div style="margin-top:1.5rem;text-align:center"><img src="data:image/jpeg;base64,' + _loc_map + '" alt="ELTA location map - Clementi Ave 1" style="max-width:500px;width:100%;border-radius:8px" loading="lazy"></div>'
html += '</div></div></section>\n'

# FAQ
faq_data = [
    ('Where exactly is ELTA located?', 'ELTA is at 10 &amp; 12 Clementi Avenue 1, District 05 (Clementi). It is a 5-minute walk from Clementi MRT (EW Line) and minutes to AYE, PIE, NUS, Singapore Polytechnic, and one-north.'),
    ('What unit types are available?', 'ELTA offers 1BR+Study (Type A1S), 2BR+Study (B5S), 3BR (C1), 4BR (D1), 4BR Premium (D2P), 4BR Dual Key (D3K), 4BR+Study (D4s), and 5BR (E1). Sizes range from 506 to 1,776 sqft.'),
    ('How many units are still available?', 'As of now, 92 units remain out of 501 (81% sold). The most available are 5BR (27 units) and 4BR+Study (22 units). Contact us for the latest live updates.'),
    ('What is the TOP (Temporary Occupation Permit) date?', 'ELTA is expected to receive TOP in 2030. Booking now gives you time to plan your finances while the development takes shape.'),
    ('Who is the developer?', 'ELTA is a joint venture between MCL Land (Jardine Matheson / Hongkong Land group) and CSC Land Group (China Construction subsidiary, BCA A1 contractor). Both are established developers with strong track records.'),
    ('What are the nearby schools?', 'Schools within 1 km include NUS High School of Mathematics and Science, Nan Hua High School, and Qifa Primary. The area also has Singapore Polytechnic, NUS, NP, and SIM within a short drive.'),
    ('How far is it to Clementi MRT?', 'About 5 minutes walk. Clementi MRT serves the East-West Line, connecting you to Raffles Place in ~25 minutes and Jurong East in ~5 minutes.'),
    ('What facilities does ELTA have?', 'ELTA features a 50m lap pool, wading pool, clubhouse, gym, function rooms, BBQ pavilions, children\'s playground, tennis court, and lush landscaped gardens across its 39-storey twin towers.'),
    ('Are there any shopping malls nearby?', 'Yes. The Clementi Mall and 321 Clementi are within walking distance. Major malls like JEM, Westgate, and Jurong East are one MRT stop away or a short drive down AYE.'),
    ('How do I register interest or book a viewing?', 'WhatsApp Jet Lee at 8764 9315 or fill in the contact form on this page. He will get back to you with pricing, floor plans, and a showflat appointment.'),
]
html += '<section id="faq"><div class="sti">Frequently Asked Questions</div><div class="ssu">Everything you need to know about ELTA</div>'
for i, (q, a) in enumerate(faq_data):
    html += '<div class="faqi" onclick="ft(this)"><div class="faqq">' + q + '</div><div class="faqa">' + a + '</div></div>'
html += '</section>\n'

# Developer
html += '<section id="developer"><div class="sti" style="text-align:center">Developer</div>'
html += '<div class="dv"><div class="dc"><h3>MCL Land</h3><p>Jardine Matheson Group. Hongkong Land Holdings. 40+ projects, 15,000+ units.</p></div>'
html += '<div class="dc"><h3>CSC Land Group</h3><p>Subsidiary of China Construction. BCA A1 contractor.</p></div></div></section>\n'

# Contact
html += '<section id="contact"><div class="sti">Register Interest</div>'
html += '<p style="color:var(--dm);max-width:500px;margin:0 auto 2rem;font-size:.9rem">WhatsApp or fill in for pricing, plans &amp; showflat viewing.</p>'
html += '<div class="fw">'
html += '<form id="rf" action="https://api.web3forms.com/submit" method="POST">'
html += '<input type="hidden" name="access_key" value="000f5e12-8691-4aa6-baa2-a2bf6a5cf3bc">'
html += '<input type="hidden" name="subject" value="New Lead - ELTA Clementi">'
html += '<input type="checkbox" name="botcheck" style="display:none">'
html += '<div class="fg"><label class="fl">Full Name *</label><input type="text" name="Full Name" class="fi" required></div>'
html += '<div class="fg"><label class="fl">Mobile *</label><input type="tel" name="Mobile" class="fi" required></div>'
html += '<div class="fg"><label class="fl">Email</label><input type="email" name="Email" class="fi"></div>'
html += '<div class="fg"><label class="fl">Interested Unit</label><select name="Unit Type" class="fs">'
html += '<option>Select</option><option>1BR+Study (506 sqft)</option><option>2BR (614 sqft)</option><option>2BR Premium (700 sqft)</option>'
html += '<option>2BR+Study (807 sqft)</option><option>3BR (926 sqft)</option><option>4BR (1,184 sqft)</option>'
html += '<option>4BR Premium/Dual Key (1,313 sqft)</option><option>4BR+Study (1,507 sqft)</option><option>5BR (1,776 sqft)</option><option>Open to All</option>'
html += '</select></div>'
html += '<button type="submit" class="fsub" id="fsbb">Submit Enquiry</button>'
html += '<a href="https://wa.me/6587649315?text=Hi%20Jet%20Lee%2C%20I%20am%20interested%20in%20ELTA" target="_blank" class="wa">WhatsApp Me Instead</a></form>'
html += '<div id="fok"><div class="ck">&#10004;</div><h3>Thank You!</h3><p style="color:var(--dm);line-height:1.7">Received! Jet Lee will contact you shortly.</p>'
html += '<a href="https://wa.me/6587649315" target="_blank" style="display:inline-block;margin-top:1.5rem;padding:.8rem 2rem;background:rgba(37,211,102,.15);border:1px solid rgba(37,211,102,.3);color:#25D366;font-size:.65rem;letter-spacing:.2em;text-decoration:none;text-transform:uppercase;border-radius:4px">WhatsApp Jet Lee</a></div></div>'
html += '<div style="margin-top:2rem;border-top:1px solid rgba(255,255,255,.1);padding-top:2rem">'
html += '<p>&#128222; <a href="https://wa.me/6587649315" style="color:var(--gd);text-decoration:none;font-weight:600">8764 9315</a></p>'
html += '</div></section>'

# Footer
html += '<footer>\n<p style="font-size:1rem;color:var(--gd);font-weight:600;margin-bottom:.5rem">Jet Lee @ 8764 9315 &middot; CEA Reg No. R007613B</p>\n'
html += '<p>&copy; 2026 Jet Lee &middot; PropNex Realty</p>\n<p style="margin-top:.5rem">jetlee413.com</p>\n</footer>\n'

# WA float
html += '<a href="https://wa.me/6587649315?text=Hi%20Jet%20Lee%2C%20I%20am%20interested%20in%20ELTA" class="waf" target="_blank">'
html += '<svg viewBox="0 0 24 24" width="28" height="28" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg></a>\n'

# JS
html += '<script>' + js_final + '</script>\n'

html += '</body>\n</html>'

with open('/home/ubuntu/.openclaw/workspace/index.html', 'w') as f:
    f.write(html)

sz = os.path.getsize('/home/ubuntu/.openclaw/workspace/index.html')
print(f"Done! Size: {sz/1024:.0f} KB ({sz/1024/1024:.1f} MB)")

# Verify
with open('/home/ubuntu/.openclaw/workspace/index.html') as f:
    c = f.read()
if '9f8c2165' in c:
    print("ERROR: Old composite STILL present!")
elif 'fp_large_units' in c or 'fp_small_units' in c:
    print("ERROR: Old blurry composites still present!")
else:
    print("VERIFIED: Old composites NOT in HTML")
    print("Floor plan cards present:", sum(1 for k,_,_ in fp_order if ('id=\"' + k) in c))
