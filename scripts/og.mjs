/**
 * Captures the share card (demo/og-card.html) to demo/public/og.jpg.
 *
 *   npm run demo:build && npx vite preview demo    (in another terminal)
 *   node scripts/og.mjs
 *
 * The card is drawn by the library itself, lit by a lamp placed top left.
 * Captured at 2x and downsampled to 1200x630. Needs puppeteer-core and
 * sharp, installed ad hoc (npm i --no-save puppeteer-core sharp).
 */
import puppeteer from 'puppeteer-core';
import sharp from 'sharp';

const CHROME = process.env.CHROME ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new' });
const page = await browser.newPage();
await page.setViewport({ width: 1200, height: 630, deviceScaleFactor: 2 });
await page.goto(process.env.OG_URL ?? 'http://localhost:5178/og-card.html', { waitUntil: 'networkidle0' });
await page.evaluate(() => document.fonts.ready);
await page.mouse.move(170, 140);
await new Promise((r) => setTimeout(r, 1200));
const shot = await page.screenshot({ type: 'png' });
await browser.close();
const info = await sharp(shot).resize(1200, 630).jpeg({ quality: 88, mozjpeg: true }).toFile('demo/public/og.jpg');
console.log(`og: wrote demo/public/og.jpg (${Math.round(info.size / 1024)} KB)`);
