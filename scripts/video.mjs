// The launch clip: one continuous take in the copperplate playground: a natural hover over
// one plate, then the settings changing under the same cursor. Frame by
// frame, so the motion is even however heavy the filters are.
//
//   npm run demo:build && npx vite preview demo    (in another terminal)
//   node scripts/video.mjs                          16:9, 1920x1080
//   W=864 H=1080 DPR=1.25 TAG=4x5 node scripts/video.mjs    4:5, 1080x1350
//
// Needs puppeteer-core ad hoc (npm i --no-save puppeteer-core) and ffmpeg.
import puppeteer from 'puppeteer-core';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const W = +(process.env.W ?? 1280), H = +(process.env.H ?? 720), DPR = +(process.env.DPR ?? 1.5);
const TAG = process.env.TAG ?? '16x9';
const FPS = 30;
const DIR = join(tmpdir(), `copperplate-take-${TAG}`);
const SLUG = process.env.SLUG ?? 'haeckel-prosobranchia';
fs.rmSync(DIR, { recursive: true, force: true });
fs.mkdirSync(DIR, { recursive: true });

const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
const lerp = (a, b, t) => a + (b - a) * t;
// A hand is never perfectly smooth: two slow, incommensurate wobbles.
const wobble = (t, amp) => ({ x: Math.sin(t * 7.3) * amp + Math.sin(t * 2.1) * amp * 0.6, y: Math.cos(t * 5.9) * amp * 0.8 + Math.sin(t * 1.7) * amp * 0.5 });

const browser = await puppeteer.launch({
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  headless: 'new',
  args: ['--hide-scrollbars', '--force-color-profile=srgb'],
});
const pg = await browser.newPage();
await pg.setViewport({ width: W, height: H, deviceScaleFactor: DPR });
await pg.goto('http://localhost:5178/?theme=dark', { waitUntil: 'networkidle0' });
await pg.evaluate(() => document.fonts.ready);

// Frame the playground, pick the plate, and draw a visible pointer.
const src = `/gallery/${SLUG}.webp`;
const L = await pg.evaluate((src) => {
  const sec = document.getElementById('playground');
  const sel = document.querySelector('select[name="src"]');
  sel.value = src;
  sel.dispatchEvent(new Event('input', { bubbles: true }));
  // Hide the page chrome around the playground so only it is in shot.
  document.querySelector('header')?.style.setProperty('visibility', 'hidden');
  sec.querySelector('h2').style.visibility = 'hidden';
  document.getElementById('snippet').style.visibility = 'hidden';
  // Only what the take uses: the other controls are noise in a 15 second clip.
  document.querySelectorAll('main > section:not(#playground), footer').forEach((el) => { el.style.visibility = 'hidden'; });
  document.querySelectorAll('#controls label').forEach((l) => {
    if (!/^(material|image|relief|shine)/.test(l.textContent.trim())) l.style.display = 'none';
  });
  if (innerHeight > innerWidth) {
    // Vertical: the plate above its controls, both at one width.
    const play = sec.querySelector('.play');
    Object.assign(play.style, { display: 'grid', gridTemplateColumns: '1fr', justifyItems: 'center', gap: '28px' });
    const size = Math.min(innerWidth - 96, innerHeight * 0.62) + 'px';
    Object.assign(document.getElementById('play').style, { width: size, height: size });
    document.getElementById('controls').style.width = size;
  }
  const plate = document.getElementById('play').getBoundingClientRect();
  const form = document.getElementById('controls').getBoundingClientRect();
  const block = { top: Math.min(plate.top, form.top), bottom: Math.max(plate.bottom, form.bottom) };
  window.scrollTo(0, scrollY + block.top - (innerHeight - (block.bottom - block.top)) / 2);
  const c = document.createElement('div');
  c.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24"><path d="M4 2l14 9.5-6.2 1.3L8.6 20z" fill="#fff" stroke="#111" stroke-width="1.3" stroke-linejoin="round"/></svg>';
  Object.assign(c.style, { position: 'fixed', left: 0, top: 0, zIndex: 2147483647, pointerEvents: 'none', filter: 'drop-shadow(0 2px 3px rgb(0 0 0 / .55))' });
  document.documentElement.append(c);
  window.__cur = (x, y) => { c.style.transform = `translate(${x - 4}px, ${y - 2}px)`; };
  const r = (el) => { const b = el.getBoundingClientRect(); return { x: b.left, y: b.top, w: b.width, h: b.height }; };
  const range = (name) => { const el = document.querySelector(`input[name="${name}"]`); return { ...r(el), min: +el.min, max: +el.max }; };
  return { plate: r(document.getElementById('play')), material: r(document.querySelector('select[name="material"]')), relief: range('relief'), shine: range('shine') };
}, src);
await new Promise((r) => setTimeout(r, 2200));

const P = L.plate;
const onPlate = (u, v) => ({ x: P.x + P.w * u, y: P.y + P.h * v });
const knob = (s, value) => ({ x: s.x + 8 + (s.w - 16) * ((value - s.min) / (s.max - s.min)), y: s.y + s.h / 2 });
const matAt = { x: L.material.x + L.material.w * 0.3, y: L.material.y + L.material.h / 2 };

let pos = { x: W + 40, y: H * 0.8 };
let frame = 0;
async function shoot(p) {
  pos = p;
  await pg.mouse.move(p.x, p.y);
  await pg.evaluate((x, y) => window.__cur(x, y), p.x, p.y);
  await pg.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
  await pg.screenshot({ path: `${DIR}/${String(frame++).padStart(4, '0')}.jpg`, type: 'jpeg', quality: 93 });
}
/** Travel from wherever the pointer is to `to`, along a gentle arc. */
async function travel(to, seconds, arc = -40) {
  const from = { ...pos }, n = Math.round(seconds * FPS);
  for (let i = 1; i <= n; i++) {
    const k = ease(i / n);
    await shoot({ x: lerp(from.x, to.x, k), y: lerp(from.y, to.y, k) + Math.sin(k * Math.PI) * arc });
  }
}
/** Drift over the plate along a loose loop, the way a curious hand does. */
async function hover(seconds, path) {
  const n = Math.round(seconds * FPS), start = { ...pos };
  for (let i = 1; i <= n; i++) {
    const t = i / n, w = wobble(frame / FPS, 6);
    const p = path(t);
    const k = Math.min(1, t * 4); // ease in from where the pointer was
    await shoot({ x: lerp(start.x, p.x, ease(k)) + w.x, y: lerp(start.y, p.y, ease(k)) + w.y });
  }
}
async function hold(seconds) { for (let i = 0; i < Math.round(seconds * FPS); i++) await shoot(pos); }
async function pickMaterial(name) {
  await travel(matAt, 0.7, -30);
  await hold(0.15);
  await pg.select('select[name="material"]', name);
  await hold(0.35);
}
async function drag(slider, from, to, seconds) {
  const a = knob(slider, from), b = knob(slider, to);
  await travel(a, 0.6, -24);
  await pg.mouse.down();
  const n = Math.round(seconds * FPS);
  for (let i = 1; i <= n; i++) await shoot({ x: lerp(a.x, b.x, ease(i / n)), y: a.y });
  await pg.mouse.up();
  await hold(0.2);
}

// The take.
await travel(onPlate(0.7, 0.35), 1.0, -30);
await hover(2.3, (t) => onPlate(0.5 + Math.cos(t * Math.PI * 1.6 + 0.4) * 0.3, 0.5 + Math.sin(t * Math.PI * 1.6 + 0.4) * 0.28));
await pickMaterial('silver');
await travel(onPlate(0.4, 0.4), 0.6);
await hover(1.0, (t) => onPlate(0.35 + t * 0.35, 0.4 + Math.sin(t * Math.PI) * 0.18));
await pickMaterial('gold');
await drag(L.relief, 3.2, 6.4, 1.1);
await drag(L.shine, 1, 1.7, 0.9);
await travel(onPlate(0.65, 0.3), 0.7);
await hover(1.2, (t) => onPlate(0.62 - t * 0.3, 0.3 + t * 0.35));
await pickMaterial('copper');
await travel(onPlate(0.3, 0.6), 0.7);
await hover(2.0, (t) => onPlate(0.3 + Math.sin(t * Math.PI) * 0.4, 0.6 - t * 0.3));
await browser.close();

const out = `copperplate-demo-${TAG}.mp4`;
execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-framerate', String(FPS), '-i', `${DIR}/%04d.jpg`,
  '-vf', `scale=${Math.round(W * DPR)}:${Math.round(H * DPR)}:flags=lanczos,fade=t=in:st=0:d=0.3,fade=t=out:st=${(frame / FPS - 0.4).toFixed(2)}:d=0.4,format=yuv420p`,
  '-c:v', 'libx264', '-crf', '20', '-preset', 'slow', '-movflags', '+faststart', out]);
console.log('take', out, frame, 'frames', (frame / FPS).toFixed(1) + 's');
