// Build the shadcn registry: one JSON item per component in demo/public/r/,
// served at https://copperplate.anzalabidi.dev/r/<name>.json, so
//
//   npx shadcn@latest add https://copperplate.anzalabidi.dev/r/switch.json
//
// copies the component's source into the project. Every item depends on
// `metal` (the stylesheet and the shared helpers) and on the copperplate
// package, which does the lighting.
import fs from 'node:fs';
import path from 'node:path';

const here = path.resolve(import.meta.dirname, '..');
const src = path.join(here, 'kit/components');
const out = path.join(here, 'demo/public/r');
const BASE = process.env.REGISTRY_URL ?? 'https://copperplate.anzalabidi.dev/r';
const pkg = JSON.parse(fs.readFileSync(path.join(here, 'package.json'), 'utf8'));
// COPPERPLATE_DEP lets a local test install the package from a folder
// before it is published.
const DEP = process.env.COPPERPLATE_DEP ?? `copperplate@^${pkg.version}`;
const TARGET = 'components/copperplate';

const file = (name, type = 'registry:ui') => ({
  path: `registry/copperplate/${name}`,
  type,
  target: `${TARGET}/${name}`,
  content: fs.readFileSync(path.join(src, name), 'utf8'),
});

const ITEMS = {
  button: 'A struck copper button that presses in, and a quiet engraved one.',
  badge: 'A small struck tag, whose metal carries the meaning.',
  kbd: 'Keyboard keys, struck like keycaps.',
  field: 'Input, Textarea and Select cut into the paper, with Label and Hint wired to them.',
  checkbox: 'A socket with a copper tile struck in when checked.',
  radio: 'Round sockets; the chosen one takes a domed rivet.',
  switch: 'A copper slide bolt that stretches as it travels.',
  slider: 'An engraved scale with copper poured to the value and a knurled disc.',
  tabs: 'A tray with a struck plate dragged under the chosen tab.',
  card: 'A plaque, a plate mark, or a card struck in metal.',
  alert: 'A notice marked by a struck strip down its edge.',
  table: 'A ruled ledger.',
  progress: 'Copper poured along an engraved channel.',
  separator: 'An engraved rule, or a printer’s rule with a struck lozenge.',
  skeleton: 'Placeholders cut into the paper.',
  tooltip: 'A struck tag that swings in off what it names.',
  menu: 'A menu on a small plate.',
  dialog: 'A plate laid over the page, on the native dialog.',
  toast: 'A deck of small plates that fans out and can be flicked away.',
  accordion: 'Sections behind engraved rules.',
  plate: 'Any image, engraved.',
  seal: 'A medal with a letter in the field and a legend round the rim.',
  coin: 'A mark struck into a coin that tilts and spins.',
  hallmark: 'A maker’s mark for footers and signatures.',
  avatar: 'A portrait struck as a coin.',
  'engraved-text': 'Type cut into metal, catching the lamp.',
};
const EXTRA = { seal: ['relief'], coin: ['relief'], hallmark: ['relief'], 'engraved-text': ['relief'], avatar: ['coin'] };
const title = (n) => n.split('-').map((w) => w[0].toUpperCase() + w.slice(1)).join(' ');
const schema = 'https://ui.shadcn.com/schema/registry-item.json';

fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(out, { recursive: true });
const write = (item) => fs.writeFileSync(path.join(out, `${item.name}.json`), JSON.stringify({ $schema: schema, ...item }, null, 2));

write({
  name: 'metal',
  type: 'registry:lib',
  title: 'Metal',
  description: 'The copperplate stylesheet and the helpers every component shares: lighting, motion and sound.',
  dependencies: [DEP],
  files: [file('metal.css', 'registry:file'), file('utils.ts', 'registry:lib'), file('motion.ts', 'registry:lib'), file('sound.ts', 'registry:lib')],
  docs: `Components are added to ${TARGET}. They import their own stylesheet, so there is nothing to wire up. Set your fonts with --cp-font-display, --cp-font-body and --cp-font-mono, and theme with the cp-light and cp-dark classes.`,
});
write({
  name: 'relief',
  type: 'registry:lib',
  title: 'Relief',
  description: 'Draw in greys, get metal: the SVG relief the struck pieces are made with.',
  dependencies: [DEP],
  registryDependencies: [`${BASE}/metal.json`],
  files: [file('relief.tsx', 'registry:lib')],
});
for (const [name, description] of Object.entries(ITEMS)) {
  write({
    name,
    type: 'registry:ui',
    title: title(name),
    description,
    dependencies: [DEP],
    registryDependencies: [`${BASE}/metal.json`, ...(EXTRA[name] ?? []).map((d) => `${BASE}/${d}.json`)],
    files: [file(`${name}.tsx`)],
  });
}
write({
  name: 'all',
  type: 'registry:block',
  title: 'Every component',
  description: 'The whole copperplate set.',
  dependencies: [DEP],
  registryDependencies: Object.keys(ITEMS).map((n) => `${BASE}/${n}.json`),
  files: [file('index.ts', 'registry:lib')],
});
fs.writeFileSync(path.join(out, 'index.json'), JSON.stringify({ name: 'copperplate', homepage: 'https://copperplate.anzalabidi.dev', items: ['metal', 'relief', ...Object.keys(ITEMS), 'all'] }, null, 2));
console.log(`registry: ${Object.keys(ITEMS).length + 3} items in demo/public/r`);
