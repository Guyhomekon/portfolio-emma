import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';
import { readdir } from 'node:fs/promises';
const base = process.env.TEST_URL || 'http://localhost:4324';
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true });
const errors = [];
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
page.on('pageerror', e => errors.push(e.message));
async function verifyIcons() {
  const result = await page.evaluate(() => {
    const text = document.body.textContent.replace(/[©®™]/g, '');
    const icons = [...document.querySelectorAll('svg.inline-icon')];
    return {
      textGlyphs: /[←↑→↓↔↕↖↗↘↙\p{Extended_Pictographic}\uFE0F]/u.test(text),
      invalid: icons.filter(icon => {
        const bounds = icon.getBoundingClientRect();
        return icon.getAttribute('aria-hidden') !== 'true' || icon.getAttribute('viewBox') !== '0 0 24 24' ||
          !icon.querySelector('path') || (bounds.width > 0 && (bounds.width < 12 || bounds.width > 48 || Math.abs(bounds.width - bounds.height) > 1));
      }).length,
      count: icons.length,
    };
  });
  assert.equal(result.textGlyphs, false, 'Site text must contain no emoji or character arrows');
  assert.equal(result.invalid, 0, 'SVG icons must have consistent dimensions and decorative semantics');
  assert.ok(result.count > 0);
}
try {
  await page.goto(base);
  assert.equal(await page.locator('html').getAttribute('lang'), 'en');
  assert.equal(await page.locator('#main-nav a').first().textContent(), 'Projects');
  await verifyIcons();
  const slugs = (await readdir('src/content/projects')).filter(file => file.endsWith('.json') && !file.endsWith(' 2.json')).map(file => file.slice(0, -5));
  for (const slug of slugs) {
    for (const locale of ['en', 'fr']) {
      const url = locale === 'en' ? `/projects/${slug}/` : `/fr/projets/${slug}/`;
      const response = await page.goto(base + url);
      assert.equal(response.status(), 200);
      assert.equal(await page.locator('html').getAttribute('lang'), locale);
      assert.equal(await page.locator('.language-switch a[lang="en"]').getAttribute('href'), `/projects/${slug}/`);
      assert.equal(await page.locator('.language-switch a[lang="fr"]').getAttribute('href'), `/fr/projets/${slug}/`);
      assert.equal(await page.locator('.back-link').getAttribute('href'), locale === 'en' ? '/projects/' : '/fr/projets/');
      await verifyIcons();
    }
  }
  await page.goto(base + '/projects/habitat-de-a-a-z/');
  assert.equal(await page.locator('h1').textContent(), 'Habitat from A to Z');
  await page.locator('.language-switch a[lang="fr"]').click();
  await page.waitForURL('**/fr/projets/habitat-de-a-a-z/');
  assert.equal(await page.locator('h1').textContent(), 'Habitat de A à Z');
  await page.locator('.language-switch a[lang="en"]').click();
  await page.waitForURL('**/projects/habitat-de-a-a-z/');
  await page.locator('[data-gallery-open]').first().click();
  assert.equal(await page.locator('dialog').evaluate(el => el.open), true);
  await page.keyboard.press('Escape');
  await page.locator('.back-link').click();
  await page.waitForURL('**/projects/');
  assert.equal(await page.locator('.project-preview').count(), 9);
  for (const locale of ['en', 'fr']) {
    const prefix = locale === 'fr' ? '/fr' : '';
    await page.goto(base + prefix + '/contact/');
    assert.equal(await page.locator('.contact-details a').getAttribute('href'), 'https://www.linkedin.com/in/emma-expert-758432247/');
    assert.equal(await page.locator('a[download]').first().getAttribute('href'), '/portfolio-emma-expert-2026.pdf');
    await page.goto(base + (locale === 'fr' ? '/fr/a-propos/' : '/about/'));
    assert.equal(await page.locator('html').getAttribute('lang'), locale);
  }
  for (const width of [320, 390]) {
    await page.setViewportSize({ width, height: 844 });
    await page.goto(base);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
    await verifyIcons();
    await page.locator('.language-switch a[lang="fr"]').click();
    await page.waitForURL('**/fr/');
    await page.locator('.menu-toggle').click();
    await page.locator('#main-nav a').first().click();
    await page.waitForURL('**/fr/projets/');
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
    await verifyIcons();
    await page.locator('.project-caption').first().screenshot({ path: `/tmp/emma-icons-project-${width}.png` });
    await page.locator('.contact-line').screenshot({ path: `/tmp/emma-icons-contact-${width}.png` });
  }
  assert.deepEqual(errors, []);
  console.log('PASS: 18 project routes, translations, language switching, gallery, localized navigation, LinkedIn, downloads, decorative SVG icons without emoji and mobile widths 320/390.');
} finally { await browser.close(); }
