import { useRef, useState, type ReactNode } from 'react';
import { Button } from '../../kit/components';

/**
 * Just enough colour to read TSX by: tags in copper, strings and numbers in
 * two muted metals, keywords set back. No highlighter library.
 */
const RULES: [RegExp, string][] = [
  [/^\/\/[^\n]*/, 'com'],
  [/^\{\/\*[\s\S]*?\*\/\}/, 'com'],
  [/^(['"`])(?:\\.|(?!\1)[^\\])*\1/, 'str'],
  [/^<\/?[A-Za-z][\w.]*/, 'tag'],
  [/^\/?>/, 'tag'],
  [/^\b(import|from|export|const|let|function|return|type|interface|true|false|null|undefined|new|await|async)\b/, 'kw'],
  [/^\b\d+(\.\d+)?\b/, 'num'],
  [/^[A-Za-z_][\w-]*(?==)/, 'attr'],
];

export function highlight(src: string): ReactNode[] {
  const out: ReactNode[] = [];
  let i = 0;
  let plain = '';
  let k = 0;
  while (i < src.length) {
    const rest = src.slice(i);
    let hit: [string, string] | null = null;
    for (const [re, cls] of RULES) {
      const m = rest.match(re);
      if (m) { hit = [m[0], cls]; break; }
    }
    if (hit) {
      if (plain) { out.push(plain); plain = ''; }
      out.push(<span key={k++} className={`tok-${hit[1]}`}>{hit[0]}</span>);
      i += hit[0].length;
    } else {
      plain += src[i];
      i++;
    }
  }
  if (plain) out.push(plain);
  return out;
}

/** Copy, then say so for a moment. */
export function CopyButton({ text, label = 'Copy' }: { text: string; label?: string }) {
  const [done, setDone] = useState(false);
  const t = useRef(0);
  return (
    <Button
      size="sm"
      variant="engraved"
      className="copy"
      aria-live="polite"
      onClick={async () => {
        try { await navigator.clipboard.writeText(text); } catch { /* clipboard blocked */ }
        setDone(true);
        clearTimeout(t.current);
        t.current = window.setTimeout(() => setDone(false), 1600);
      }}
    >
      {done ? 'Copied' : label}
    </Button>
  );
}

export function Code({ children, copy = true }: { children: string; copy?: boolean }) {
  return (
    <div className="code">
      <pre className="cp-cut"><code>{highlight(children)}</code></pre>
      {copy && <CopyButton text={children} />}
    </div>
  );
}

export function InstallLine({ slug }: { slug: string }) {
  const cmd = `npx shadcn@latest add https://copperplate.anzalabidi.dev/r/${slug}.json`;
  return (
    <div className="install-line">
      <code className="cp-cut">{cmd}</code>
      <CopyButton text={cmd} />
    </div>
  );
}
