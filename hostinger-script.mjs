import { chromium } from 'playwright';
import { writeFileSync } from 'fs';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();

// Go to Hostinger login
await page.goto('https://hpanel.hostinger.com', { waitUntil: 'networkidle', timeout: 20000 });
console.log("URL:", page.url());
await page.screenshot({ path: '/tmp/hostinger-1.png' });

// Check for login forms and buttons
const buttons = await page.locator('button, a[href*="login"], a[href*="sign-in"]').all();
console.log("Buttons:", buttons.length);
for (const btn of buttons) {
  const text = await btn.textContent();
  const href = await btn.getAttribute('href');
  console.log(" -", text?.trim().substring(0,40), href?.substring(0,50));
}

// Try clicking sign-in if there
const signInBtn = page.locator('a[href*="login"], a[href*="sign-in"], button:has-text("Sign in"), button:has-text("Log in")').first();
if (await signInBtn.count() > 0) {
  await signInBtn.click();
  await page.waitForTimeout(3000);
  console.log("Clicked sign in, URL:", page.url());
  await page.screenshot({ path: '/tmp/hostinger-2.png' });
}

// Fill credentials
const emailInput = page.locator('input[type="email"], input[name="email"], input[autocomplete="username"]').first();
if (await emailInput.count() > 0) {
  console.log("Email input found");
  await emailInput.fill('jetlee.agent@gmail.com');
  const passInput = page.locator('input[type="password"]').first();
  if (await passInput.count() > 0) {
    await passInput.fill('Jetlee413943$$');
    console.log("Password filled");
    await page.screenshot({ path: '/tmp/hostinger-3.png' });
    
    // Click submit
    const submitBtn = page.locator('button[type="submit"], button:has-text("Sign in"), button:has-text("Log in"), button:has-text("Continue")').first();
    if (await submitBtn.count() > 0) {
      await submitBtn.click();
      await page.waitForTimeout(5000);
      console.log("Submitted, URL:", page.url());
      await page.screenshot({ path: '/tmp/hostinger-4.png' });
    }
  }
} else {
  console.log("No email input - checking page content");
  const html = await page.content();
  writeFileSync('/tmp/hostinger-html.txt', html.substring(0, 5000));
  console.log("HTML saved");
}

await browser.close();
