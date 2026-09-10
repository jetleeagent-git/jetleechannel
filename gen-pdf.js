const { PDFDocument, StandardFonts, rgb } = require('pdf-lib');
const fs = require('fs');

(async () => {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const boldFont = await doc.embedFont(StandardFonts.HelveticaBold);
  
  const pageWidth = 595;
  const pageHeight = 842;
  const margin = 50;
  const contentWidth = pageWidth - 2 * margin;
  
  let y = 0;
  let page = null;
  
  function newPage() {
    page = doc.addPage([pageWidth, pageHeight]);
    y = pageHeight - margin;
  }
  
  function wrapText(text, maxWidth, fontSize) {
    const words = text.split(' ');
    const lines = [];
    let current = '';
    for (const word of words) {
      const test = current ? current + ' ' + word : word;
      const width = font.widthOfTextAtSize(test, fontSize);
      if (width < maxWidth) {
        current = test;
      } else {
        lines.push(current);
        current = word;
      }
    }
    if (current) lines.push(current);
    return lines;
  }
  
  function addText(text, fontSize, opts = {}) {
    const f = opts.bold ? boldFont : font;
    const color = opts.color || rgb(0, 0, 0);
    const indent = opts.indent || 0;
    
    if (!page || y < fontSize + 10) newPage();
    
    if (opts.heading) {
      page.drawText(text, { x: margin + indent, y: y, size: fontSize, font: f, color });
      y -= fontSize + 12;
      if (opts.line !== false) {
        page.drawLine({ start: { x: margin, y: y }, end: { x: pageWidth - margin, y: y }, thickness: 1.5, color: rgb(0.8, 0.8, 0.85) });
        y -= 8;
      }
    } else if (opts.bullet) {
      page.drawText('\u2022', { x: margin + indent, y: y, size: fontSize, font: font, color });
      page.drawText(text, { x: margin + indent + 15, y: y, size: fontSize, font: f, color });
      y -= fontSize + 6;
    } else {
      const lines = wrapText(text, contentWidth - indent, fontSize);
      for (const line of lines) {
        if (y < fontSize + 10) newPage();
        page.drawText(line, { x: margin + indent, y: y, size: fontSize, font: f, color });
        y -= fontSize + 4;
      }
      if (opts.spacing) y -= opts.spacing;
    }
  }
  
  // === BUILD PDF ===
  newPage();
  
  // Title
  addText('JETLEE PROPERTY - SEO & LEAD GENERATION WORKFLOW', 22, { bold: true, heading: true, color: rgb(0.05, 0.05, 0.15) });
  addText('Complete step-by-step guide for getting property sites online, indexed on Google, and generating leads.', 10, { color: rgb(0.4, 0.4, 0.4), spacing: 10 });
  addText('Last updated: 11 June 2026', 9, { color: rgb(0.5, 0.5, 0.5), spacing: 20 });
  
  // SECTION 1
  addText('1. PROJECT STRUCTURE', 16, { bold: true, heading: true, spacing: 6 });
  addText('Sites Managed:', 12, { bold: true, spacing: 4 });
  
  const sites = [
    ['Dunearn House', 'dunernhouse.jetleechannel.sg', 'Live & Indexed'],
    ['Lentor Gardens', 'lentorgardens.jetleechannel.sg', 'Live & Indexed'],
    ['Thomson Reserve', 'thomsonreserve.jetleechannel.sg', 'Live & Indexed'],
  ];
  for (const row of sites) {
    addText(row[0] + ' | ' + row[1] + ' | ' + row[2], 10, { bullet: true });
  }
  addText('', 10, { spacing: 6 });
  addText('Hosting: Hostinger hPanel -> jetleechannel.sg', 10, { bullet: true });
  addText('Contact form leads: WhatsApp -> +65 8764 9315', 10, { spacing: 16 });
  
  // SECTION 2
  addText('2. GO-LIVE WORKFLOW (Upload to Hostinger)', 16, { bold: true, heading: true, spacing: 6 });
  addText('1. Login to Hostinger -> hpanel.hostinger.com', 10, { spacing: 4 });
  addText('2. Create subdomain per project (Domains -> Subdomains)', 10, { spacing: 4 });
  addText('3. Upload SEO-optimized index.html to subdomain folder', 10, { spacing: 4 });
  addText('4. Upload images/ folder alongside index.html', 10, { spacing: 4 });
  addText('5. Test the site - visit the subdomain URL', 10, { spacing: 4 });
  addText('6. Submit to Google Search Console -> verify -> submit sitemap', 10, { spacing: 16 });
  
  // SECTION 3
  addText('3. GOOGLE INDEXING WORKFLOW', 16, { bold: true, heading: true, spacing: 6 });
  addText('1. Site must be live on Hostinger first', 10, { spacing: 3 });
  addText('2. Submit to Google Search Console (search.google.com/search-console)', 10, { spacing: 3 });
  addText('3. Verify ownership (easiest: DNS TXT record)', 10, { spacing: 3 });
  addText('4. Request indexing - URL Inspection -> Request Indexing', 10, { spacing: 3 });
  addText('5. Submit sitemap.xml', 10, { spacing: 3 });
  addText('6. Wait - typically 1-7 days for initial indexing', 10, { spacing: 10 });
  addText('Current Status (11 June): All 3 sites indexed on Google', 11, { bold: true, color: rgb(0.06, 0.5, 0.06), spacing: 16 });
  
  // SECTION 4
  addText('4. SEO OPTIMIZATION CHECKLIST', 16, { bold: true, heading: true, spacing: 6 });
  const seoItems = [
    ['Page Title', 'Project name + target keywords', 'Critical'],
    ['Meta Description', 'Compelling desc with location + CTA', 'Critical'],
    ['H1 Tag', 'Project Name - District', 'Critical'],
    ['Image Alt Text', 'Descriptive text, not filenames', 'High'],
    ['Schema Markup', 'RealEstateAgent + Product', 'High'],
    ['Open Graph Tags', 'Social preview cards', 'High'],
    ['Mobile Responsive', 'Must work on phones', 'Critical'],
    ['Page Speed', 'Optimize images, minify CSS', 'High'],
    ['Canonical URL', 'Prevents duplicate content', 'Medium'],
  ];
  addText('Element | Priority', 10, { bold: true, spacing: 4 });
  for (const item of seoItems) {
    addText(item[0] + ' - ' + item[2], 10, { bullet: true });
  }
  addText('', 10, { spacing: 10 });
  
  addText('Target Keywords:', 12, { bold: true, spacing: 4 });
  addText('Dunearn House: "Dunearn House Singapore", "new launch Bukit Timah 2026"', 10, { bullet: true });
  addText('Lentor Gardens: "Lentor Gardens Singapore", "Lentor new launch"', 10, { bullet: true });
  addText('Thomson Reserve: "Thomson Reserve Singapore", "Upper Thomson property"', 10, { bullet: true });
  addText('Jetlee (Brand): "Jetlee property agent", "property agent Singapore"', 10, { spacing: 16 });
  
  // SECTION 5
  addText('5. LEAD GENERATION CHANNELS (Weekly Actions)', 16, { bold: true, heading: true, spacing: 6 });
  addText('Google Business Profile - Claim & verify. Post weekly. Impact: 5/5', 10, { bullet: true });
  addText('Facebook Property Groups - Share project pages. 4/5', 10, { bullet: true });
  addText('Instagram / TikTok - Link in bio + Reels. 4/5', 10, { bullet: true });
  addText('WhatsApp Status - Share direct links. 3/5', 10, { bullet: true });
  addText('PropertyGuru / 99.co - Add site URL to agent profiles. 5/5', 10, { bullet: true });
  addText('Blog / Area Guides - 300-word guides. 3/5', 10, { spacing: 10 });
  addText('Currently: WhatsApp -> +65 8764 9315', 10, { spacing: 4 });
  addText('Recommended: Google Analytics 4 (free) + Google Sheets CRM', 10, { spacing: 16 });
  
  // SECTION 6
  addText('6. AUTOMATION & REPORTING', 16, { bold: true, heading: true, spacing: 6 });
  addText('Daily Property News Brief - Top 3 SG property news', 10, { bullet: true });
  addText('Weekly Traffic Report - Visitor count + trending pages', 10, { bullet: true });
  addText('Weekly Search Console Insights - Keywords driving traffic', 10, { bullet: true });
  addText('Monthly Backlink Check - Who is linking to your sites', 10, { spacing: 10 });
  addText('All reports delivered via Telegram. Just ask!', 10, { spacing: 16 });
  
  // SECTION 7
  addText('7. QUICK REFERENCE - KEY LINKS', 16, { bold: true, heading: true, spacing: 6 });
  addText('Hostinger hPanel: hpanel.hostinger.com', 10, { bullet: true });
  addText('Google Search Console: search.google.com/search-console', 10, { bullet: true });
  addText('Google Business Profile: business.google.com', 10, { bullet: true });
  addText('Dunearn House: dunernhouse.jetleechannel.sg', 10, { bullet: true });
  addText('Lentor Gardens: lentorgardens.jetleechannel.sg', 10, { bullet: true });
  addText('Thomson Reserve: thomsonreserve.jetleechannel.sg', 10, { spacing: 10 });
  
  addText('Agent: Natasha (via Telegram)', 10, { spacing: 4 });
  addText('Lead WhatsApp: +65 8764 9315', 10, { spacing: 10 });
  
  addText('Generated by Natasha - 11 June 2026 | Part of Jetlee Property Digital Assistant Setup', 8, { color: rgb(0.6, 0.6, 0.6) });
  
  const pdfBytes = await doc.save();
  fs.writeFileSync('jetlee-seo-workflow.pdf', pdfBytes);
  console.log('PDF generated successfully, size:', pdfBytes.length, 'bytes');
})();
