import { chromium } from 'playwright';
const browser = await chromium.launch({ headless: true });
// iPhone-ish viewport
const page = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
await page.goto('https://jetleechannel.sg/lucernegrand/', { waitUntil: 'domcontentloaded', timeout: 60000 });
await page.locator('#floor-plans').scrollIntoViewIfNeeded();
await page.waitForTimeout(2000);
await page.screenshot({ path: 'mobile-floorplans.png' });
const cards = await page.locator('.floorplan-card').count();
const cardW = await page.locator('.floorplan-card').first().boundingBox();
const gridW = await page.locator('.floorplan-grid').boundingBox();
console.log('cards:', cards, '| grid width:', gridW?.width, '| card width:', cardW?.width);
await browser.close();
