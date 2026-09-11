import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto('https://jetleechannel.sg/lucernegrand/', { waitUntil: 'networkidle', timeout: 60000 });

// Scroll to floorplans section
await page.locator('#floor-plans').scrollIntoViewIfNeeded();
await page.waitForTimeout(1500);
await page.screenshot({ path: 'fp-section.png' });

// Check images loaded
const imgs = await page.locator('.floorplan-card img').evaluateAll(imgs =>
  imgs.map(i => ({ src: i.getAttribute('src'), naturalWidth: i.naturalWidth, naturalHeight: i.naturalHeight, loaded: i.complete }))
);
console.log('FLOORPLAN IMGS:', JSON.stringify(imgs, null, 2));

await browser.close();
