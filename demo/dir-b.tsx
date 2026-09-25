import { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';
import '../kit/metal.css';
import './dir.css';
import { Badge, Button, Coin, EngravedText, Plate, Toaster } from '../kit/components';
import { ENTRIES } from './dir-data';

/**
 * Direction B: the Workbench.
 *
 * Night. Every component lies on one dark bench, arranged like tools rather
 * than listed, and the lamp is the star: move the pointer and the whole
 * bench catches it at once. Pick something up and an inspector slides in
 * with its code and install line; the bench stays in view behind it.
 */

// Which cells are large on the bench.
const BIG = new Set(['seal', 'card', 'engraved-text']);

function App() {
  const [open, setOpen] = useState<string | null>(null);
  const e = ENTRIES.find((x) => x.slug === open);
  return (
    <div className="cp-dark" style={{ background: 'var(--cp-paper)', minHeight: '100vh', color: 'var(--cp-ink)' }}>
      <style>{`
        .b-top { position: sticky; top: 0; z-index: 20; display: flex; justify-content: space-between; align-items: center; padding: 18px 28px; background: linear-gradient(var(--cp-paper) 60%, transparent); }
        .b-hero { display: grid; grid-template-columns: 1.1fr 0.9fr; gap: 40px; align-items: center; padding: 30px 28px 50px; }
        .b-hero p { font: 20px/1.45 var(--cp-font-body); color: var(--cp-ink-2); max-width: 34ch; margin: 18px 0 26px; }
        .b-bench { display: grid; grid-template-columns: repeat(6, 1fr); grid-auto-rows: 170px; gap: 14px; padding: 0 28px 120px; }
        .b-cell { position: relative; display: grid; place-items: center; border-radius: 4px; background: radial-gradient(120% 90% at 50% 0%, #1c1916, #110f0d); border: 1px solid #221f1b; box-shadow: inset 0 1px 0 rgb(255 240 220 / .04), 0 20px 40px -30px #000; overflow: visible; transition: border-color .3s var(--cp-ease), transform .4s var(--cp-ease); }
        .b-cell:hover { border-color: #3a332b; }
        .b-cell[data-big] { grid-column: span 2; grid-row: span 2; }
        .b-cell .b-name { position: absolute; left: 14px; bottom: 12px; }
        .b-cell .b-demo { transform: scale(.9); }
        .b-cell[data-big] .b-demo { transform: scale(1.25); }
        .b-inspect { position: absolute; right: 10px; top: 10px; opacity: 0; transition: opacity .3s var(--cp-ease); }
        .b-cell:hover .b-inspect, .b-cell:focus-within .b-inspect { opacity: 1; }
        .b-drawer { position: fixed; top: 12px; right: 12px; bottom: 12px; width: min(460px, calc(100vw - 24px)); z-index: 40; padding: 26px; background: #14120f; border: 1px solid #2c2823; border-radius: 6px; box-shadow: 0 40px 120px -20px #000; transform: translateX(110%); transition: transform .5s var(--cp-ease); overflow: auto; }
        .b-drawer[data-open] { transform: none; }
        .b-drawer h2 { font: 400 38px/1 var(--cp-font-display); margin: 10px 0 0; }
        .b-drawer p { font: 18px/1.5 var(--cp-font-body); color: var(--cp-ink-2); }
        .b-stage { display: grid; place-items: center; min-height: 220px; margin: 22px 0; border-radius: 4px; background: radial-gradient(100% 100% at 50% 0%, #1f1b17, #0f0d0b); border: 1px solid #25211d; }
        .b-dock { position: fixed; left: 50%; bottom: 18px; translate: -50% 0; z-index: 30; display: flex; gap: 10px; align-items: center; padding: 8px 8px 8px 16px; border-radius: 6px; background: #15130f; border: 1px solid #2c2823; box-shadow: 0 20px 50px -20px #000; }
        .b-dock code { font: 12.5px var(--cp-font-mono); color: var(--cp-ink-2); }
      `}</style>
      <header className="b-top">
        <span className="cp-label" style={{ color: 'var(--cp-ink)' }}>copperplate / ui</span>
        <nav className="cp-label" style={{ display: 'flex', gap: 22 }}><span>Bench</span><span>Docs</span><span>The lamp</span><span>GitHub ↗</span></nav>
      </header>
      <section className="b-hero">
        <div>
          <Badge variant="engraved" metal="verdigris" dot>{ENTRIES.length} components · v0.2</Badge>
          <EngravedText as="h1" style={{ fontSize: 84, marginTop: 18 }}>Move the lamp.</EngravedText>
          <p>A set of components struck and engraved in metal. One light falls on all of them, wherever it is, whatever they are.</p>
          <div style={{ display: 'flex', gap: 12 }}><Button size="lg">Pick one up</Button><Button size="lg" variant="engraved">Read the docs</Button></div>
        </div>
        <div style={{ justifySelf: 'center', width: 330 }}>
          <Plate src="/gallery/durer-knight.webp" alt="Dürer, Knight, Death and the Devil" style={{ width: '100%', aspectRatio: '487 / 625' }} />
        </div>
      </section>
      <section className="b-bench">
        {ENTRIES.map((x) => { const D = x.demo; return (
          <div key={x.slug} className="b-cell" data-big={BIG.has(x.slug) || undefined}>
            <div className="b-demo"><D /></div>
            <span className="cp-label b-name">{x.name}</span>
            <Button className="b-inspect" size="sm" variant="engraved" onClick={() => setOpen(x.slug)}>Inspect</Button>
          </div>
        ); })}
      </section>
      <aside className="b-drawer" data-open={e ? '' : undefined} aria-hidden={!e}>
        {e && (() => { const D = e.demo; return (<>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}><span className="cp-label">{e.group}</span><Button variant="plain" onClick={() => setOpen(null)}>Close ✕</Button></div>
          <h2>{e.name}</h2>
          <p>{e.line}</p>
          <div className="b-stage"><div style={{ transform: 'scale(1.2)' }}><D /></div></div>
          <span className="cp-label">Usage</span>
          <pre className="code cp-cut" style={{ marginTop: 10 }}>{e.code}</pre>
          <span className="cp-label" style={{ display: 'block', marginTop: 22 }}>Install</span>
          <pre className="code cp-cut" style={{ marginTop: 10 }}>npx shadcn add copperplate.anzalabidi.dev/r/{e.slug}.json</pre>
        </>); })()}
      </aside>
      <div className="b-dock">
        <Coin size={26} text="C" />
        <code>npx shadcn add copperplate.anzalabidi.dev/r/all.json</code>
        <Button size="sm">Copy</Button>
      </div>
      <Toaster />
    </div>
  );
}

createRoot(document.getElementById('root')!).render(<StrictMode><App /></StrictMode>);
