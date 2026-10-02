import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';
const base = process.env.TEST_URL || 'http://localhost:4324';
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true });
const errors = [];
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
const page = await context.newPage();
page.on('pageerror', error => errors.push(error.message));
page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
try {
  await page.goto(base, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  assert.equal(await page.locator('#hero-title').evaluate(el => getComputedStyle(el).opacity), '1');
  assert.equal(await page.locator('[data-reveal]').count(), 0);
  assert.equal(await page.locator('.subtle-parallax').count(), 0);
  const heading = page.locator('#selection .section-heading');
  await heading.scrollIntoViewIfNeeded();
  await page.waitForTimeout(900);
  assert.equal(await heading.locator('h2').evaluate(el => getComputedStyle(el).opacity), '1');
  assert.equal(await heading.evaluate(el => getComputedStyle(el).transform), 'none');
  await page.locator('#selection .project-image').first().scrollIntoViewIfNeeded();
  await page.waitForTimeout(900);
  await page.locator('#selection .project-image').first().hover();
  await page.waitForTimeout(550);
  const scale = await page.locator('#selection .project-image img').first().evaluate(el => new DOMMatrixReadOnly(getComputedStyle(el).transform).a);
  assert.equal(scale, 1, 'Hover must leave project images fixed');
  assert.equal(await page.locator('#selection .project-image img').first().evaluate(el => getComputedStyle(el).transitionDuration), '0s');
  await page.locator('#selection .project-image').first().click();
  await page.waitForURL('**/projects/habitat-de-a-a-z/');
  await page.waitForTimeout(1000);
  assert.equal(await page.locator('h1').textContent(), 'Habitat from A to Z');
  const gallery = page.getByRole('button', { name: 'Enlarge : Site analysis', exact: true });
  await gallery.scrollIntoViewIfNeeded(); await page.waitForTimeout(900); await gallery.click();
  await page.waitForFunction(() => document.querySelector('dialog')?.open);
  await page.keyboard.press('Escape'); assert.equal(await page.locator('dialog').evaluate(el => el.open), false);
  await page.locator('.back-link').click(); await page.waitForURL('**/projects/');
  await page.goto(base, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  await page.locator('.hero-visual').click(); await page.waitForURL('**/projects/habitat-de-a-a-z/');
  await page.waitForTimeout(900);
  assert.equal(await page.locator('.detail-hero img').evaluate(el => getComputedStyle(el).viewTransitionName === 'selected-project-image'), false);
  console.log('Desktop: static content, fixed hover, direct page navigation and gallery PASS');

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(base, { waitUntil: 'networkidle' });
  await page.waitForTimeout(600);
  assert.equal(await page.locator('.subtle-parallax').count(), 0);
  await page.locator('.menu-toggle').click();
  assert.equal(await page.locator('.menu-toggle').getAttribute('aria-expanded'), 'true');
  assert.equal(await page.locator('#main-nav').evaluate(el => getComputedStyle(el).animationName), 'none');
  await page.locator('#main-nav').click({ position: { x: 8, y: 8 } });
  assert.equal(await page.locator('.menu-toggle').getAttribute('aria-expanded'), 'true', 'Tapping inside the menu keeps it open');
  await page.mouse.click(8, 700);
  assert.equal(await page.locator('.menu-toggle').getAttribute('aria-expanded'), 'false', 'An outside click closes the mobile menu');
  assert.equal(await page.locator('#main-nav').isVisible(), false);
  await page.locator('.menu-toggle svg').click();
  assert.equal(await page.locator('.menu-toggle').getAttribute('aria-expanded'), 'true', 'The nested icon still opens the menu');
  await page.keyboard.press('Escape'); assert.equal(await page.locator('.menu-toggle').getAttribute('aria-expanded'), 'false');
  await page.locator('.menu-toggle').click();
  await page.locator('#main-nav a[href="/contact/"]').click(); await page.waitForURL('**/contact/');
  await page.waitForTimeout(600);
  await page.locator('.menu-toggle').click(); assert.equal(await page.locator('.menu-toggle').getAttribute('aria-expanded'), 'true');
  await page.mouse.click(8, 700);
  assert.equal(await page.locator('.menu-toggle').getAttribute('aria-expanded'), 'false', 'Outside clicks still work after Astro navigation');
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
  console.log('Mobile: immediate menu, inside/outside clicks, nested icon, repeated SPA setup, Escape and no parallax PASS');

  const touchContext = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  try {
    const touchPage = await touchContext.newPage();
    touchPage.on('pageerror', error => errors.push(error.message));
    for (const [home, projects] of [['/', '/projects/'], ['/fr/', '/fr/projets/']]) {
      await touchPage.goto(base + home);
      const toggle = touchPage.locator('.menu-toggle');
      await toggle.tap();
      await touchPage.locator('#main-nav').tap({ position: { x: 8, y: 8 } });
      assert.equal(await toggle.getAttribute('aria-expanded'), 'true');
      await touchPage.touchscreen.tap(8, 700);
      assert.equal(await toggle.getAttribute('aria-expanded'), 'false', 'An outside touch closes the menu');
      await touchPage.locator('.menu-toggle svg').tap();
      assert.equal(await toggle.getAttribute('aria-expanded'), 'true');
      await toggle.tap();
      assert.equal(await toggle.getAttribute('aria-expanded'), 'false', 'The button closes without reopening on touch');
      await toggle.tap();
      await touchPage.locator('#main-nav a').first().tap();
      await touchPage.waitForURL(base + projects);
      await toggle.tap();
      await touchPage.touchscreen.tap(8, 700);
      assert.equal(await toggle.getAttribute('aria-expanded'), 'false', 'Outside touch works after page navigation');
    }
    console.log('Mobile touch: EN/FR, outside dismissal, inside taps, button toggle and navigation PASS');
  } finally { await touchContext.close(); }

  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(base, { waitUntil: 'networkidle' });
  assert.equal(await page.locator('.subtle-parallax').count(), 0);
  const hidden = await page.locator('.cover-line > *, .project-image, .gallery-section figure').evaluateAll(elements => elements.filter(el => {
    const style = getComputedStyle(el); return style.opacity !== '1' || style.transform !== 'none' || style.clipPath !== 'none';
  }).length);
  assert.equal(hidden, 0);
  assert.equal(await page.evaluate(() => document.getAnimations().filter(animation => animation.playState === 'running').length), 0);
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(base, { waitUntil: 'networkidle' });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.waitForTimeout(100);
  assert.equal(await page.locator('.subtle-parallax').count(), 0);
  assert.equal(await page.locator('[data-reveal]:not(.is-visible)').count(), 0);
  assert.deepEqual(errors, []);
  console.log('Reduced motion on load and live change: all content immediate, no animation, no console errors PASS');

  const plain = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 1440, height: 1000 } });
  const noJS = await plain.newPage(); await noJS.goto(base);
  assert.equal(await noJS.locator('#hero-title').evaluate(el => getComputedStyle(el).opacity), '1');
  assert.equal(await noJS.locator('.project-image').first().evaluate(el => getComputedStyle(el).opacity), '1');
  await plain.close(); console.log('Content remains visible without JavaScript PASS');
} finally { await browser.close(); }
