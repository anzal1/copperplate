// Screenshots of the demo, saved to demo/shots/. Needs the dev server running
// (npm run dev) and a local Chrome. Usage: node scripts/shots.mjs [baseUrl]
import puppeteer from 'puppeteer-core';
import { mkdirSync } from 'node:fs';

const BASE = process.argv[2] ?? 'http://localhost:5178';
const CHROME = process.env.CHROME ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const OUT = new URL('../demo/shots/', import.meta.url).pathname;
mkdirSync(OUT, { recursive: true });

const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, args: ['--hide-scrollbars'] });
const page = await browser.newPage();
const settle = () => new Promise((r) => setTimeout(r, 900));

async function open(theme, viewport) {
  await page.setViewport(viewport);
  await page.goto(`${BASE}/?theme=${theme}`, { waitUntil: 'networkidle0' });
  await page.evaluate(() => document.fonts.ready);
  await settle();
}

async function shot(name, clip) {
  await page.screenshot({ path: `${OUT}${name}.png`, ...(clip ? { clip } : {}) });
  console.log('saved', name);
}

async function box(sel) {
  return page.$eval(sel, (el) => {
    const r = el.getBoundingClientRect();
    return { x: r.left + scrollX, y: r.top + scrollY, width: r.width, height: r.height };
  });
}

const desktop = { width: 1440, height: 900, deviceScaleFactor: 2 };

for (const theme of ['dark', 'light']) {
  await open(theme, desktop);
  // Pointer resting over Adam's hand, upper left of the hero.
  const hero = await box('#hero');
  await page.mouse.move(hero.x + hero.width * 0.3, hero.y - (await page.evaluate(() => scrollY)) + hero.height * 0.35);
  await settle();
  await shot(`01-hero-pointer-${theme}`);
}

await open('dark', desktop);
await page.mouse.move(5, 5);
await page.mouse.move(-1, -1); // leave: light returns to the sun
await page.evaluate(() => document.querySelector('#metals').scrollIntoView());
await settle();
{
  const g = await box('#metals');
  await shot('02-metals-sun-dark', { x: 0, y: g.y - 20, width: 1440, height: 1100 });
}
await page.evaluate(() => document.querySelector('#metal-grid').scrollIntoView({ block: 'center' }));
await settle();
{
  const cells = await page.$$eval('#metal-grid .plate-host', (els) => els.map((el) => { const r = el.getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height }; }));
  const c = cells[1];
  await page.mouse.move(c.x + c.w * 0.5, c.y + c.h * 0.45);
  await settle();
  const g = await box('#metals');
  await shot('03-metals-pointer-dark', { x: 0, y: g.y - 20, width: 1440, height: 1100 });
}

await open('light', desktop);
await page.evaluate(() => document.querySelector('#playground').scrollIntoView());
await page.evaluate(() => {
  const f = document.getElementById('controls');
  f.material.value = 'silver';
  f.relief.value = '5';
  f.shine.value = '1.6';
  f.dispatchEvent(new Event('input'));
});
{
  const p = await page.$eval('#play', (el) => { const r = el.getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height }; });
  await page.mouse.move(p.x + p.w * 0.62, p.y + p.h * 0.3);
  await settle();
  const g = await box('#playground');
  await shot('04-playground-light', { x: 0, y: g.y - 20, width: 1440, height: 1250 });
}

// Close-up of the relief at full pixel density.
await open('dark', desktop);
await page.evaluate(() => document.querySelector('#playground').scrollIntoView());
{
  const p = await page.$eval('#play', (el) => { const r = el.getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height }; });
  await page.mouse.move(p.x + p.w * 0.4, p.y + p.h * 0.35);
  await settle();
  const g = await box('#play');
  await shot('05-detail-dark', { x: g.x + g.width * 0.2, y: g.y + g.height * 0.15, width: g.width * 0.45, height: g.height * 0.4 });
}

// Phone width.
await open('dark', { width: 390, height: 844, deviceScaleFactor: 3, isMobile: true, hasTouch: true });
await shot('06-mobile-dark');
await page.evaluate(() => document.querySelector('#metals').scrollIntoView());
await settle();
await shot('07-mobile-metals-dark');

// The React entry.
await page.setViewport(desktop);
await page.goto(`${BASE}/react.html`, { waitUntil: 'networkidle0' });
await page.evaluate(() => document.fonts.ready);
await page.mouse.move(420, 380);
await settle();
await shot('08-react-light', { x: 0, y: 0, width: 1440, height: 900 });

await browser.close();
