import { engrave, requestMotionLight, subscribeLamp, type EngraveOptions, type MaterialName } from 'copperplate';

import GALLERY from './gallery.json';

type Work = (typeof GALLERY)[number];
const bySlug = (slug: string): Work => GALLERY.find((w) => w.slug === slug)!;
const credit = (w: Work) => `${w.artist}, ${w.title}, ${w.date}`;

// ── theme ──
const themeBtn = document.getElementById('theme')!;
const prefersDark = matchMedia('(prefers-color-scheme: dark)');
const param = new URLSearchParams(location.search).get('theme');
let dark = param ? param === 'dark' : prefersDark.matches;
function applyTheme() {
  document.documentElement.dataset.theme = dark ? 'dark' : 'light';
  themeBtn.textContent = dark ? 'Day' : 'Night';
}
themeBtn.addEventListener('click', () => {
  dark = !dark;
  applyTheme();
});
applyTheme();

// ── hero ──
// A wide hero on a dense screen gets a finer surface than the default 800.
const wave = bySlug('hokusai-great-wave');
engrave('#hero', { src: wave.src, alt: `${credit(wave)}, engraved in copper`, position: '50% 45%', resolution: 1600 });

// ── six metals ──
// Each metal on the subject it flatters most.
const METALS: { name: MaterialName; slug: string; position?: string }[] = [
  { name: 'copper', slug: 'durer-knight' },
  { name: 'brass', slug: 'pisanello-medal' },
  { name: 'silver', slug: 'caligula-bust', position: '50% 30%' },
  { name: 'steel', slug: 'piranesi-round-tower' },
  { name: 'gold', slug: 'haeckel-cyrtoidea' },
  { name: 'bronze', slug: 'greek-grave-stele', position: '50% 35%' },
];
const grid = document.getElementById('metal-grid')!;
for (const m of METALS) {
  const fig = document.createElement('figure');
  const host = document.createElement('div');
  host.className = 'plate-host';
  const cap = document.createElement('figcaption');
  cap.className = 'mono small dim';
  const w = bySlug(m.slug);
  cap.innerHTML = `<span>${m.name}</span><span>${w.artist}</span>`;
  fig.append(host, cap);
  grid.append(fig);
  engrave(host, { src: w.src, alt: credit(w), material: m.name, position: m.position });
}

// ── gallery ──
const GROUPS: Record<string, string> = {
  all: 'All',
  engravings: 'Engravings',
  woodblock: 'Woodcuts',
  relief: 'Sculpture & coins',
  nature: 'Natural history',
  maps: 'Maps & stars',
  nasa: 'The Moon',
  photo: 'Photographs',
};
const MATERIALS: MaterialName[] = ['copper', 'brass', 'silver', 'steel', 'gold', 'bronze'];
let wallMetal: MaterialName = 'copper';
const wall = document.getElementById('wall')!;
const plates = new Map<string, ReturnType<typeof engrave>>();
const figures = new Map<string, HTMLElement>();

// Engraved only as they come near the screen: thirty-eight filters and their
// images at once would be a heavy first paint for a page about lightness.
const soon = new IntersectionObserver(
  (entries) => {
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      const host = e.target as HTMLElement;
      const w = bySlug(host.dataset.slug!);
      plates.set(w.slug, engrave(host, { src: w.src, alt: credit(w), material: wallMetal, fit: 'contain' }));
      soon.unobserve(host);
    }
  },
  { rootMargin: '900px 0px' },
);

for (const w of GALLERY) {
  const fig = document.createElement('figure');
  fig.className = 'work';
  fig.dataset.group = w.group;
  const host = document.createElement('div');
  host.className = 'plate-host';
  host.dataset.slug = w.slug;
  host.style.aspectRatio = `${w.width} / ${w.height}`;
  const cap = document.createElement('figcaption');
  cap.className = 'small';
  cap.innerHTML = `<i>${w.title}</i><span class="mono dim">${w.artist}, ${w.date}</span>`;
  fig.append(host, cap);
  wall.append(fig);
  figures.set(w.slug, fig);
  soon.observe(host);
}

function chips(el: HTMLElement, items: [string, string][], current: string, pick: (v: string) => void) {
  el.innerHTML = '';
  for (const [value, label] of items) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'chip';
    b.textContent = label;
    b.setAttribute('aria-pressed', String(value === current));
    b.addEventListener('click', () => {
      el.querySelectorAll('button').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
      pick(value);
    });
    el.append(b);
  }
}
chips(document.getElementById('groups')!, Object.entries(GROUPS).map(([k, v]) => [k, `${v} ${k === 'all' ? GALLERY.length : GALLERY.filter((w) => w.group === k).length}`]), 'all', (g) => {
  for (const [slug, fig] of figures) fig.hidden = g !== 'all' && bySlug(slug).group !== g;
});
chips(document.getElementById('wall-metal')!, MATERIALS.map((m) => [m, m]), wallMetal, (m) => {
  wallMetal = m as MaterialName;
  for (const plate of plates.values()) plate.update({ material: wallMetal });
});

// ── credits ──
const credits = document.getElementById('credits')!;
for (const w of GALLERY) {
  const li = document.createElement('li');
  li.innerHTML = `${w.artist}, <i>${w.title}</i>, ${w.date}. <a href="${w.page}" target="_blank" rel="noreferrer">${w.source}</a>, ${w.license}.`;
  credits.append(li);
}

// ── playground ──
const playSrc = document.getElementById('play-src') as HTMLSelectElement;
for (const w of GALLERY) playSrc.add(new Option(`${w.artist}, ${w.title}`, w.src, w.slug === 'durer-knight', w.slug === 'durer-knight'));
const form = document.getElementById('controls') as HTMLFormElement;
const snippet = document.getElementById('snippet')!;
const read = (): EngraveOptions => {
  const f = new FormData(form);
  return {
    src: String(f.get('src')),
    alt: 'Playground plate',
    material: f.get('material') as MaterialName,
    relief: Number(f.get('relief')),
    shine: Number(f.get('shine')),
    sharpness: Number(f.get('sharpness')),
    lightHeight: Number(f.get('lightHeight')),
    fit: f.get('fit') as 'cover' | 'contain',
    plateMark: f.get('plateMark') === 'on',
    static: f.get('static') === 'on',
  };
};
const play = engrave('#play', read());
function render() {
  const o = read();
  play.update(o);
  for (const k of ['relief', 'shine', 'sharpness', 'lightHeight'] as const) {
    (form.elements.namedItem(`${k}Out`) as HTMLOutputElement).value = String(o[k]);
  }
  const lines = [
    `  src: '${o.src.split('/').pop()}',`,
    `  alt: '...',`,
    o.material !== 'copper' && `  material: '${o.material}',`,
    o.relief !== 3.2 && `  relief: ${o.relief},`,
    o.shine !== 1 && `  shine: ${o.shine},`,
    o.sharpness !== 26 && `  sharpness: ${o.sharpness},`,
    o.lightHeight !== 0.55 && `  lightHeight: ${o.lightHeight},`,
    o.fit !== 'cover' && `  fit: '${o.fit}',`,
    !o.plateMark && `  plateMark: false,`,
    o.static && `  static: true,`,
  ].filter(Boolean);
  snippet.textContent = `engrave('#plate', {\n${lines.join('\n')}\n});`;
}
form.addEventListener('input', render);
render();

// ── status line ──
const touch = matchMedia('(hover: none)').matches;
const status = document.getElementById('status')!;
const pad = (n: number) => String(n).padStart(2, '0');
let lastText = '';
subscribeLamp((s) => {
  const d = new Date();
  const time = `${pad(d.getHours())}:${pad(d.getMinutes())}`;
  const text = s.still
    ? `Reduced motion is on, so every plate is lit from a fixed sun for ${time}.`
    : s.source === 'sun'
      ? `No pointer, so the light sits where the sun is at ${time}. ${touch ? 'Touch and drag across a plate.' : 'Move the pointer over the plates.'}`
      : s.source === 'motion'
        ? 'The light follows the tilt of your phone.'
        : touch
          ? 'The light follows your finger, and returns to the sun when you lift it.'
          : 'The light follows your pointer. Let it leave the window to return the light to the sun.';
  if (text !== lastText) status.textContent = lastText = text;
});

// ── tilt, offered only where it can work ──
const tilt = document.getElementById('tilt') as HTMLButtonElement;
if (matchMedia('(hover: none) and (pointer: coarse)').matches && 'DeviceOrientationEvent' in window) {
  tilt.hidden = false;
  tilt.addEventListener('click', async () => {
    const r = await requestMotionLight();
    tilt.textContent = r === 'granted' ? 'Tilt the phone to move the light' : 'Motion is not available here';
    tilt.disabled = true;
  });
}
