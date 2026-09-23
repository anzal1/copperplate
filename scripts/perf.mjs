// Rough frame-time measurement: N plates on screen at once while the mouse
// sweeps a circle across them. Needs the dev server (npm run dev) and a local
// Chrome. Usage: node scripts/perf.mjs [baseUrl] [--headful]
import puppeteer from 'puppeteer-core';

const BASE = process.argv.find((a) => a.startsWith('http')) ?? 'http://localhost:5178';
const HEADFUL = process.argv.includes('--headful');
const CHROME = process.env.CHROME ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const COUNTS = (process.env.COUNTS ?? '6,12,24,48,96').split(',').map(Number);
const RES = (process.env.RES ?? '800').split(',').map(Number);
const DPR = Number(process.env.DPR ?? 2);

const browser = await puppeteer.launch({ executablePath: CHROME, headless: !HEADFUL, args: ['--hide-scrollbars'] });
const page = await browser.newPage();
const VW = Number(process.env.VW ?? 1440);
const VH = Number(process.env.VH ?? 900);
await page.setViewport({ width: VW, height: VH, deviceScaleFactor: DPR });

const gpu = await (async () => {
  await page.goto('chrome://gpu');
  return page.evaluate(() => {
    const t = document.body.innerText;
    const m = /Canvas:\s*([^\n]+)/.exec(t) || /GPU0[^\n]*\n?([^\n]*)/.exec(t);
    return m ? m[1].trim() : 'unknown';
  }).catch(() => 'unknown');
})();
console.log(`Chrome ${await browser.version()} ${HEADFUL ? 'headful' : 'headless'}, ${VW}x${VH} at DPR ${DPR}, canvas: ${gpu}`);
console.log('plates  res   mean fps  median ms  p95 ms  frames >20ms');

for (const res of RES) {
  for (const n of COUNTS) {
    await page.goto(`${BASE}/perf.html?n=${n}&res=${res}`, { waitUntil: 'networkidle0' });
    await new Promise((r) => setTimeout(r, 800));
    let moving = true;
    const mover = (async () => {
      const t0 = Date.now();
      while (moving) {
        const a = (Date.now() - t0) / 600;
        await page.mouse.move(VW / 2 + VW * 0.39 * Math.cos(a), VH / 2 + VH * 0.4 * Math.sin(a));
        await new Promise((r) => setTimeout(r, 8));
      }
    })();
    const times = await page.evaluate(() => window.__sample(4000, 'pointer'));
    moving = false;
    await mover;
    const sorted = [...times].sort((a, b) => a - b);
    const mean = times.reduce((s, t) => s + t, 0) / times.length;
    const p = (q) => sorted[Math.min(sorted.length - 1, Math.floor(q * sorted.length))];
    const slow = times.filter((t) => t > 20).length / times.length;
    console.log(
      `${String(n).padStart(6)}  ${String(res).padStart(4)}  ${(1000 / mean).toFixed(1).padStart(8)}  ${p(0.5).toFixed(1).padStart(9)}  ${p(0.95).toFixed(1).padStart(6)}  ${(slow * 100).toFixed(1).padStart(10)}%`,
    );
  }
}
await browser.close();
