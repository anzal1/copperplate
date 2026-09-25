// Write one HTML page per component from demo/component.template.html, so
// every docs page is a real file with its own title and description (and a
// real URL for the static host), all rendered by the same demo/site/doc.tsx.
// The list comes from demo/site/data.tsx. Output is git-ignored.
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..', 'demo');
const data = fs.readFileSync(path.join(root, 'site/data.tsx'), 'utf8');
const template = fs.readFileSync(path.join(root, 'component.template.html'), 'utf8');
const esc = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

const entries = [...data.matchAll(/slug: '([^']+)', name: '([^']+)'[\s\S]*?line: '((?:\\'|[^'])+)'/g)].map((m) => ({ slug: m[1], name: m[2], line: m[3].replace(/\\'/g, "'") }));
for (const e of entries) {
  const dir = path.join(root, 'components', e.slug);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), template.replaceAll('%SLUG%', e.slug).replaceAll('%NAME%', esc(e.name)).replaceAll('%LINE%', esc(e.line)));
}
console.log(`pages: ${entries.length} component pages`);
