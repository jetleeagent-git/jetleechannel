import { readFileSync, writeFileSync, mkdirSync } from 'fs';

const files = [
  { name: 'dunearn-house', file: '../dunearn-house-original.html', url: 'dunearnhouse.jetleechannel.sg' },
  { name: 'thomson-reserve', file: '../thomson-reserve-original.html', url: 'thomsonreserve.jetleechannel.sg' },
  { name: 'lentor-gardens', file: '../lentor-gardens-original.html', url: 'lentorgardens.jetleechannel.sg' },
];

for (const site of files) {
  console.log(`\n=== Processing ${site.name} ===`);
  const html = readFileSync(site.file, 'utf-8');
  
  // Create project folder  
  const projectDir = `./${site.name}`;
  const imagesDir = `${projectDir}/images`;
  mkdirSync(imagesDir, { recursive: true });
  
  // Extract all base64 images
  const imgRegex = /src="data:image\/([a-z]+);base64,([A-Za-z0-9+/=]+)"/g;
  let match;
  let imgCount = 0;
  let newHtml = html;
  
  while ((match = imgRegex.exec(html)) !== null) {
    const ext = match[1] === 'jpeg' ? 'jpg' : match[1];
    const b64 = match[2];
    const imgName = `image-${++imgCount}.${ext}`;
    const imgPath = `${imagesDir}/${imgName}`;
    
    // Write image file
    writeFileSync(imgPath, Buffer.from(b64, 'base64'));
    
    // Replace in HTML
    const fullMatch = match[0];
    const replacement = `src="images/${imgName}"`;
    newHtml = newHtml.replace(fullMatch, replacement);
    
    console.log(`  Extracted: ${imgName} (${(Buffer.from(b64, 'base64').length / 1024).toFixed(1)}KB)`);
  }
  
  // Update SEO tags
  newHtml = enhanceSEO(newHtml, site);
  
  // Write enhanced index.html
  writeFileSync(`${projectDir}/index.html`, newHtml);
  
  const finalSize = (Buffer.byteLength(newHtml, 'utf-8') / 1024).toFixed(1);
  console.log(`  Written index.html (${finalSize}KB + ${imgCount} images)`);
}

function enhanceSEO(html, site) {
  let enhanced = html;
  
  // 1. Add Google Analytics and SEO meta tags before </head>
  const seoInject = `
  <!-- Google tag (gtag.js) -->
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-XXXXXXXXXX');
  </script>
  
  <!-- SEO Meta Tags -->
  <link rel="canonical" href="https://${site.url}/" />
  <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large" />
  <meta name="author" content="Jetlee Property" />
  
  <!-- Open Graph -->
  <meta property="og:type" content="website" />
  <meta property="og:url" content="https://${site.url}/" />
  <meta property="og:site_name" content="Jetlee Property" />
  <meta property="og:locale" content="en_SG" />
  
  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:site" content="@jetleekn" />
  
  <!-- JSON-LD Schema -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    "name": "Jetlee Property",
    "url": "https://${site.url}/",
    "telephone": "+6587649315",
    "areaServed": ["Singapore", "District 11", "Bukit Timah"]
  }
  </script>
  `;
  
  enhanced = enhanced.replace('</head>', seoInject + '\n</head>');
  
  return enhanced;
}
