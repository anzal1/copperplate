import { Fragment, StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';
import '../kit/metal.css';
import './dir.css';
import { Button, Coin, EngravedText, Input, Kbd, Toaster } from '../kit/components';
import { ENTRIES, GROUPS } from './dir-data';

/**
 * Direction C: the Ledger.
 *
 * A single ruled sheet, Swiss and quiet: every component is one line of a
 * ledger (number, name, what it is, which metals, a live miniature). Open a
 * line and it unfolds in place to the working component and its code. The
 * fastest to scan, the easiest to keep up to date, and the metal is the only
 * ornament on the page.
 */

const METALS = ['copper', 'brass', 'silver', 'verdigris', 'oxide'] as const;

function App() {
  const [open, setOpen] = useState<string>('switch');
  const [q, setQ] = useState('');
  const list = ENTRIES.filter((e) => (e.name + e.line + e.group).toLowerCase().includes(q.toLowerCase()));
  return (
    <div className="cp-light" style={{ background: 'var(--cp-paper)', minHeight: '100vh' }}>
      <style>{`
        .c-wrap { max-width: 1120px; margin: 0 auto; padding: 0 32px 120px; }
        .c-top { display: flex; justify-content: space-between; align-items: center; padding: 22px 0; }
        .c-hero { display: grid; grid-template-columns: 1fr 360px; gap: 48px; align-items: end; padding: 64px 0 40px; border-bottom: 1px solid var(--cp-ink); }
        .c-hero h1 { font: 400 64px/1.02 var(--cp-font-display); letter-spacing: -.02em; margin: 0; max-width: 14ch; }
        .c-hero p:not(.cp-label) { font: 18px/1.5 var(--cp-font-body); color: var(--cp-ink-2); margin: 0 0 16px; }
        .c-bar { display: flex; justify-content: space-between; align-items: center; gap: 20px; padding: 18px 0; }
        .c-row { display: grid; grid-template-columns: 56px 190px 1fr 150px 230px; gap: 20px; align-items: center; min-height: 76px; border-bottom: 1px solid var(--cp-rule); cursor: pointer; }
        .c-row:hover { background: color-mix(in srgb, var(--cp-accent) 4%, transparent); }
        .c-row .n { font: 12px var(--cp-font-mono); color: var(--cp-ink-3); padding-left: 4px; }
        .c-row .name { font: 400 22px var(--cp-font-display); }
        .c-row .line { font: 16px/1.4 var(--cp-font-body); color: var(--cp-ink-2); }
        .c-mini { height: 60px; display: grid; place-items: center end; overflow: hidden; padding-right: 6px; }
        .c-mini > div { transform: scale(.62); transform-origin: right center; pointer-events: none; }
        .c-open { display: grid; grid-template-columns: 1fr 1fr; gap: 28px; padding: 28px 0 36px 76px; border-bottom: 1px solid var(--cp-rule-2); }
        .c-stage { display: grid; place-items: center; min-height: 240px; border: 1px solid var(--cp-rule); border-radius: 2px; background: var(--cp-paper-2); }
        .c-group { font: 11px var(--cp-font-mono); letter-spacing: .14em; text-transform: uppercase; color: var(--cp-accent); padding: 34px 0 10px 4px; border-bottom: 1px solid var(--cp-rule-2); }
      `}</style>
      <div className="c-wrap">
        <header className="c-top">
          <span style={{ display: 'flex', gap: 10, alignItems: 'center' }}><Coin size={26} text="C" /><span className="cp-label" style={{ color: 'var(--cp-ink)' }}>Copperplate</span></span>
          <nav className="cp-label" style={{ display: 'flex', gap: 24 }}><span>Components</span><span>Install</span><span>The lamp</span><span>GitHub ↗</span></nav>
        </header>
        <section className="c-hero">
          <div>
            <p className="cp-label" style={{ marginBottom: 18 }}>Ledger of components · {ENTRIES.length} entries</p>
            <h1>Components <EngravedText style={{ fontSize: 64, verticalAlign: '-0.2em' }}>struck</EngravedText> in metal, lit by one lamp.</h1>
          </div>
          <div>
            <p>Copy them into your project with the shadcn CLI. Paper and ink everywhere, metal where it counts.</p>
            <div style={{ display: 'flex', gap: 8 }}>
              <code className="cp-cut" style={{ flex: 1, font: '12.5px var(--cp-font-mono)', padding: '11px 12px', borderRadius: 2, color: 'var(--cp-ink-2)' }}>npx shadcn add …/r/all.json</code>
              <Button size="sm">Copy</Button>
            </div>
          </div>
        </section>
        <div className="c-bar">
          <div style={{ width: 320 }}><Input placeholder="Find a component" value={q} onChange={(e) => setQ(e.target.value)} /></div>
          <span className="cp-label" style={{ display: 'flex', gap: 8, alignItems: 'center' }}>Press <Kbd>/</Kbd> to search</span>
        </div>
        {GROUPS.map((g) => (
          <Fragment key={g}>
            {list.some((e) => e.group === g) && <div className="c-group">{g}</div>}
            {list.filter((e) => e.group === g).map((e) => { const D = e.demo; const n = ENTRIES.indexOf(e) + 1; return (
              <Fragment key={e.slug}>
                <div className="c-row" onClick={() => setOpen(open === e.slug ? '' : e.slug)} aria-expanded={open === e.slug}>
                  <span className="n">{String(n).padStart(2, '0')}</span>
                  <span className="name">{e.name}</span>
                  <span className="line">{e.line}</span>
                  <span style={{ display: 'flex', gap: 4 }}>{METALS.map((m) => <Coin key={m} size={16} metal={m} />)}</span>
                  <div className="c-mini"><div><D /></div></div>
                </div>
                {open === e.slug && (
                  <div className="c-open">
                    <div className="c-stage"><div style={{ transform: 'scale(1.25)' }}><D /></div></div>
                    <div>
                      <span className="cp-label">Usage</span>
                      <pre className="code cp-cut" style={{ marginTop: 10 }}>{e.code}</pre>
                      <span className="cp-label" style={{ display: 'block', marginTop: 20 }}>Install</span>
                      <pre className="code cp-cut" style={{ marginTop: 10 }}>npx shadcn add copperplate.anzalabidi.dev/r/{e.slug}.json</pre>
                    </div>
                  </div>
                )}
              </Fragment>
            ); })}
          </Fragment>
        ))}
      </div>
      <Toaster />
    </div>
  );
}

createRoot(document.getElementById('root')!).render(<StrictMode><App /></StrictMode>);
