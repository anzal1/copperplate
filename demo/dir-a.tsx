import { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';
import '../kit/metal.css';
import './dir.css';
import { Button, Card, EngravedText, Hallmark, Separator, Tab, Tabs, TabsList, Toaster } from '../kit/components';
import { ENTRIES, GROUPS } from './dir-data';

/**
 * Direction A: the Catalogue.
 *
 * An engraver's trade catalogue. Every component is a numbered plate, shown
 * large on its own sheet with a museum label under it; the index down the
 * left is the catalogue's contents. Paper, ink, and metal only where a
 * component is metal.
 */

const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII', 'XIII', 'XIV', 'XV', 'XVI', 'XVII', 'XVIII', 'XIX', 'XX', 'XXI', 'XXII', 'XXIII', 'XXIV'];

function App() {
  const [slug, setSlug] = useState('switch');
  const [tab, setTab] = useState('preview');
  const i = ENTRIES.findIndex((e) => e.slug === slug);
  const e = ENTRIES[i];
  const Demo = e.demo;
  return (
    <div className="cp-light" style={{ background: 'var(--cp-paper)', minHeight: '100vh' }}>
      <style>{`
        .a-top { display: flex; justify-content: space-between; align-items: baseline; padding: 22px 40px; border-bottom: 1px solid var(--cp-rule); }
        .a-top nav { display: flex; gap: 26px; }
        .a-mast { padding: 56px 40px 40px; display: grid; grid-template-columns: 1fr auto; align-items: end; gap: 24px; }
        .a-mast p:not(.cp-label) { font-family: var(--cp-font-body); font-size: 19px; color: var(--cp-ink-2); max-width: 36ch; margin: 14px 0 0; line-height: 1.45; }
        .a-body { display: grid; grid-template-columns: 250px 1fr; border-top: 1px solid var(--cp-rule-2); }
        .a-index { padding: 28px 24px 60px 40px; border-right: 1px solid var(--cp-rule); position: sticky; top: 0; align-self: start; max-height: 100vh; overflow: auto; }
        .a-index h4 { margin: 22px 0 8px; }
        .a-index button { display: grid; grid-template-columns: 50px 1fr; width: 100%; text-align: left; background: none; border: 0; padding: 5px 0; cursor: pointer; font: 16px var(--cp-font-body); color: var(--cp-ink-2); }
        .a-index button span:first-child { font: 11px var(--cp-font-mono); letter-spacing: .08em; color: var(--cp-ink-3); padding-top: 4px; }
        .a-index button[aria-current='true'] { color: var(--cp-ink); }
        .a-index button[aria-current='true'] span:first-child { color: var(--cp-accent); }
        .a-sheet { padding: 36px 48px 80px; }
        .a-plate { display: grid; place-items: center; min-height: 380px; }
        .a-caption { display: grid; grid-template-columns: 1fr auto; gap: 24px; align-items: start; margin-top: 22px; }
        .a-caption h2 { font: 400 40px/1.05 var(--cp-font-display); letter-spacing: -.01em; margin: 6px 0 0; }
        .a-caption p { font: italic 18px/1.5 var(--cp-font-body); color: var(--cp-ink-2); margin: 10px 0 0; max-width: 46ch; }
        .a-install { display: flex; gap: 10px; align-items: center; margin-top: 26px; }
        .a-install code { flex: 1; font: 13px var(--cp-font-mono); padding: 12px 14px; border-radius: 2px; color: var(--cp-ink-2); }
        .a-more { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-top: 54px; }
        .a-thumb { display: grid; place-items: center; height: 150px; overflow: hidden; cursor: pointer; }
        .a-thumb > div { transform: scale(.72); pointer-events: none; }
      `}</style>
      <header className="a-top">
        <span className="cp-label" style={{ color: 'var(--cp-ink)' }}>Copperplate · Catalogue of plates</span>
        <nav className="cp-label"><span>Plates</span><span>Install</span><span>The lamp</span><span>GitHub ↗</span></nav>
      </header>
      <section className="a-mast">
        <div>
          <p className="cp-label">Est. 2026 · {ENTRIES.length} plates · React</p>
          <EngravedText as="h1" style={{ fontSize: 92, marginTop: 10 }}>Copperplate</EngravedText>
          <p>Components struck and engraved in metal, every one lit by the same lamp. Copy them into your project and they are yours.</p>
        </div>
        <Hallmark initials="CP" className="demo-hallmark" />
      </section>
      <div className="a-body">
        <aside className="a-index">
          {GROUPS.map((g) => (
            <div key={g}>
              <h4 className="cp-label">{g}</h4>
              {ENTRIES.map((x, n) => x.group === g && (
                <button key={x.slug} aria-current={x.slug === slug} onClick={() => setSlug(x.slug)}><span>{ROMAN[n]}</span><span>{x.name}</span></button>
              ))}
            </div>
          ))}
        </aside>
        <main className="a-sheet">
          <Card variant="plate" style={{ padding: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '18px 22px 0' }}>
              <span className="cp-label">Plate {ROMAN[i]}</span>
              <Tabs value={tab} defaultValue="preview" onValueChange={setTab}><TabsList><Tab value="preview">Preview</Tab><Tab value="code">Code</Tab></TabsList></Tabs>
            </div>
            <div className="a-plate">
              {tab === 'preview' ? <div style={{ transform: 'scale(1.35)' }}><Demo /></div> : <pre className="code cp-cut" style={{ minWidth: 380 }}>{e.code}</pre>}
            </div>
          </Card>
          <div className="a-caption">
            <div>
              <span className="cp-label">Fig. {ROMAN[i]} · {e.group}</span>
              <h2>{e.name}</h2>
              <p>{e.line}</p>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <Button variant="engraved" size="sm" disabled={i === 0} onClick={() => setSlug(ENTRIES[i - 1].slug)}>← Prev</Button>
              <Button size="sm" disabled={i === ENTRIES.length - 1} onClick={() => setSlug(ENTRIES[i + 1].slug)}>Next →</Button>
            </div>
          </div>
          <div className="a-install">
            <code className="cp-cut">npx shadcn add copperplate.anzalabidi.dev/r/{e.slug}.json</code>
            <Button variant="engraved" size="sm">Copy</Button>
          </div>
          <Separator variant="ornament" style={{ marginTop: 54 }} />
          <div className="a-more">
            {ENTRIES.slice(0, 8).map((x, n) => { const D = x.demo; return (
              <div key={x.slug} onClick={() => setSlug(x.slug)}>
                <Card className="a-thumb" style={{ padding: 0 }}><div><D /></div></Card>
                <p className="cp-label" style={{ marginTop: 10 }}>{ROMAN[n]} · {x.name}</p>
              </div>
            ); })}
          </div>
        </main>
      </div>
      <Toaster />
    </div>
  );
}

createRoot(document.getElementById('root')!).render(<StrictMode><App /></StrictMode>);
