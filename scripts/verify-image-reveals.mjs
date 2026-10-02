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
    const visual = page.locator(selector).first();
    await visual.evaluate(el => {
      document.documentElement.style.scrollBehavior = 'auto';
      scrollTo(0, el.getBoundingClientRect().top + scrollY - 180);
    });
    await page.waitForTimeout(950);
    const appearance = el => {
      const style = getComputedStyle(el);
      return { opacity: style.opacity, mask: style.clipPath, transform: style.transform, transition: style.transitionDuration, animation: style.animationName };
    };
    const fixed = { opacity: '1', mask: 'none', transform: 'none', transition: '0s', animation: 'none' };
    assert.deepEqual(await visual.evaluate(appearance), fixed, 'The frame stays visible even before the image loads');
    const before = await visual.boundingBox();
    releaseImages();
    await visual.evaluate(el => {
      window.appearanceSamples = [];
      const sample = () => {
        const style = getComputedStyle(el);
        window.appearanceSamples.push({ opacity: style.opacity, mask: style.clipPath, transform: style.transform, transition: style.transitionDuration, animation: style.animationName });
        if (window.appearanceSamples.length < 120) requestAnimationFrame(sample);
      };
      requestAnimationFrame(sample);
    });
    await page.waitForFunction(selector => {
      const el = document.querySelector(selector);
      const img = el?.querySelector('img');
      return img?.complete && img.naturalWidth > 0;
    }, selector);
    await page.waitForTimeout(1250);
    const samples = await page.evaluate(() => window.appearanceSamples);
    assert.ok(samples.length > 3);
    assert.ok(samples.every(sample => JSON.stringify(sample) === JSON.stringify(fixed)), 'Loading must not trigger a fade, mask or translation');
    assert.deepEqual(await visual.evaluate(appearance), fixed);
    const after = await visual.boundingBox();
    assert.ok(Math.abs(before.height - after.height) < 1, 'The image frame must reserve its height');
    await page.evaluate(() => scrollTo(0, 0));
    await visual.scrollIntoViewIfNeeded();
    assert.deepEqual(await visual.evaluate(appearance), fixed, 'Returning to an image must keep it fixed');
    await page.emulateMedia({ reducedMotion: 'reduce' });
    assert.equal(await visual.evaluate(el => getComputedStyle(el).clipPath), 'none');
    console.log(`PASS: delayed image, immediately visible stable frame, no reveal, scroll return and reduced motion: ${path} (${width}px)`);
    await context.close();
  }
  assert.deepEqual(errors, []);
} finally { await browser.close(); }
