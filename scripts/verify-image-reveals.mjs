import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';

const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true });
const base = process.env.TEST_URL || 'http://localhost:4324';
const errors = [];
try {
  for (const [path, width, selector] of [
    ['/projects/', 1440, '.project-image'],
    ['/fr/projets/', 390, '.project-image'],
    ['/projects/habitat-de-a-a-z/', 1440, '.gallery-section figure'],
    ['/fr/projets/habitat-de-a-a-z/', 390, '.gallery-section figure'],
  ]) {
    const context = await browser.newContext({ viewport: { width, height: 844 } });
    const page = await context.newPage();
    page.on('pageerror', error => errors.push(error.message));
    let releaseImages;
    const imagesHeld = new Promise(resolve => { releaseImages = resolve; });
    await page.route('**/*', async route => {
      if (route.request().resourceType() === 'image') await imagesHeld;
      await route.continue();
    });
    await page.goto(base + path, { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => document.documentElement.classList.contains('motion-ready'));
    const visual = page.locator(selector).first();
    await visual.evaluate(el => {
      document.documentElement.style.scrollBehavior = 'auto';
      scrollTo(0, el.getBoundingClientRect().top + scrollY - 180);
    });
    await page.waitForTimeout(950);
    assert.equal(await visual.evaluate(el => el.classList.contains('is-visible')), false, 'Loading must not consume the reveal animation');
    assert.equal(await visual.evaluate(el => getComputedStyle(el).opacity), '0');
    const before = await visual.boundingBox();
    releaseImages();
    await visual.evaluate(el => {
      window.revealSamples = [];
      const sample = () => {
        const style = getComputedStyle(el);
        window.revealSamples.push({ opacity: Number(style.opacity), mask: style.clipPath, visible: el.classList.contains('is-visible') });
        if (window.revealSamples.length < 120) requestAnimationFrame(sample);
      };
      requestAnimationFrame(sample);
    });
    await page.waitForFunction(selector => {
      const el = document.querySelector(selector);
      const img = el?.querySelector('img');
      return el?.classList.contains('is-visible') && img?.complete && img.naturalWidth > 0;
    }, selector);
    await page.waitForTimeout(1250);
    const samples = await page.evaluate(() => window.revealSamples);
    const intermediate = samples.filter(sample => sample.visible && sample.opacity > 0 && sample.opacity < 1);
    assert.ok(intermediate.length > 3, 'Image opacity must fade over several frames');
    assert.ok(new Set(intermediate.map(sample => sample.mask)).size > 3, 'Mask must interpolate instead of popping from inset to none');
    assert.ok(intermediate.every(sample => sample.mask.startsWith('inset(')));
    assert.equal(await visual.evaluate(el => getComputedStyle(el).opacity), '1');
    const after = await visual.boundingBox();
    assert.ok(Math.abs(before.height - after.height) < 1, 'The image frame must reserve its height');
    await page.evaluate(() => scrollTo(0, 0));
    await visual.scrollIntoViewIfNeeded();
    assert.equal(await visual.evaluate(el => el.classList.contains('is-visible')), true, 'Returning to an image must not replay the reveal');
    await page.emulateMedia({ reducedMotion: 'reduce' });
    assert.equal(await visual.evaluate(el => getComputedStyle(el).clipPath), 'none');
    console.log(`PASS: delayed image, continuous fade and mask, stable frame, one reveal and reduced motion: ${path} (${width}px)`);
    await context.close();
  }
  assert.deepEqual(errors, []);
} finally { await browser.close(); }
