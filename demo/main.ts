import { engrave, requestMotionLight, subscribeLamp, type EngraveOptions, type MaterialName } from 'copperplate';

const KNIGHT = '/img/verso-knight-day.webp';
const ADAM = '/img/creation-of-adam.jpg';
const COLONNADE = '/img/plate-colonnade-day.jpg';

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
engrave('#hero', { src: ADAM, alt: "Michelangelo's Creation of Adam, engraved in copper", position: '50% 40%', resolution: 1600 });

// ── six metals ──
const METALS: { name: MaterialName; src: string; position?: string }[] = [
  { name: 'copper', src: KNIGHT },
  { name: 'brass', src: ADAM, position: 'left' },
  { name: 'silver', src: COLONNADE, position: '20% 50%' },
  { name: 'steel', src: KNIGHT },
  { name: 'gold', src: ADAM, position: 'right' },
  { name: 'bronze', src: COLONNADE, position: '75% 50%' },
];
const grid = document.getElementById('metal-grid')!;
for (const m of METALS) {
  const fig = document.createElement('figure');
  const host = document.createElement('div');
  host.className = 'plate-host';
  const cap = document.createElement('figcaption');
  cap.className = 'mono small dim';
  cap.innerHTML = `<span>${m.name}</span><span>material: '${m.name}'</span>`;
  fig.append(host, cap);
  grid.append(fig);
  engrave(host, { src: m.src, alt: '', material: m.name, position: m.position });
}

// ── playground ──
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
