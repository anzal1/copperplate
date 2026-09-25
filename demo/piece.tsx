import { StrictMode, useEffect, useRef, useState, type ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import '../kit/metal.css';
import { Button, EngravedText, Plate, Slider, Switch } from '../kit/components';

/**
 * The set-piece trial: the Workbench rebuilt as a sequence, in the gallery's
 * manner. One component per section, shown large with room round it, the
 * words on the left and the object on the right.
 */

function useReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver((l) => { if (l.some((e) => e.isIntersecting)) { el.dataset.in = ''; io.disconnect(); } }, { threshold: 0.3 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return ref;
}

function Piece({ n, name, title, children, stage }: { n: string; name: string; title: string; children: ReactNode; stage: ReactNode }) {
  const ref = useReveal<HTMLElement>();
  return (
    <section ref={ref} className="shell piece">
      <div className="piece-words">
        <p className="cp-label">{n} · {name}</p>
        <h2>{title}</h2>
        <div className="piece-body">{children}</div>
      </div>
      <div className="piece-stage">{stage}</div>
    </section>
  );
}

function SwitchStage() {
  const [on, setOn] = useState(true);
  return (
    <div style={{ display: 'grid', justifyItems: 'center', gap: 22 }}>
      <Switch checked={on} onCheckedChange={setOn} aria-label="Follow the lamp" style={{ ['--cp-sw' as string]: '6.5rem', ['--cp-sh' as string]: '3.4rem' }} />
      <p className="cp-label" style={{ margin: 0 }}>{on ? 'following the lamp' : 'held still'}</p>
    </div>
  );
}

function SliderStage() {
  const [v, setV] = useState(58);
  return (
    <div style={{ width: 'min(100%, 26rem)' }}>
      <div className="readout"><span>{v}</span><span className="cp-label">relief</span></div>
      <Slider value={v} onValueChange={setV} aria-label="Relief" />
    </div>
  );
}

function App() {
  return (
    <>
      <style>{`
        body { margin: 0; background: var(--cp-paper); color: var(--cp-ink); -webkit-font-smoothing: antialiased; font-family: var(--cp-font-body); }
        .shell { width: 100%; max-width: 68rem; margin: 0 auto; padding: 0 32px; box-sizing: border-box; }
        .top { display: flex; justify-content: space-between; align-items: baseline; padding-top: 20px; padding-bottom: 20px; border-bottom: 1px solid var(--cp-rule); }
        .top nav { display: flex; gap: 20px; }
        .top a { color: var(--cp-ink-2); text-decoration: none; }
        .top a:hover { color: var(--cp-accent); }
        .hero { display: grid; grid-template-columns: minmax(0, 1.15fr) minmax(0, 0.85fr); gap: 56px; align-items: center; padding-top: 72px; padding-bottom: 96px; }
        .hero .lede { font-size: 1.25rem; line-height: 1.55; color: var(--cp-ink-2); max-width: 30rem; margin: 22px 0 32px; }
        .hero .actions { display: flex; gap: 12px; flex-wrap: wrap; }
        .hero figure { margin: 0; }
        .hero figcaption { margin-top: 10px; color: var(--cp-ink-3); }
        .knight { width: 100%; aspect-ratio: 487 / 625; --copperplate-mark-bg: var(--cp-paper-2); --copperplate-mark-line: var(--cp-rule-2); }
        .piece { display: grid; grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.1fr); gap: 56px; align-items: center; padding-top: 28px; padding-bottom: 28px; border-top: 1px solid var(--cp-rule); min-height: 26rem; }
        .piece h2 { font-family: var(--cp-font-display); font-weight: 420; font-size: 2.25rem; line-height: 1.1; letter-spacing: -0.015em; margin: 14px 0 0; }
        .piece-body { color: var(--cp-ink-2); font-size: 1.0625rem; line-height: 1.6; max-width: 26rem; margin-top: 16px; }
        .piece-body p { margin: 0 0 16px; }
        .piece-body code { font-family: var(--cp-font-mono); font-size: 0.8125rem; color: var(--cp-ink); }
        .piece-body a { color: var(--cp-ink); text-underline-offset: 3px; text-decoration-color: var(--cp-rule-2); }
        .piece-body a:hover { color: var(--cp-accent); }
        /* The stage: no box, just a pool of warm light on the page, as if
           the object were set down under the lamp. */
        .piece-stage { position: relative; display: grid; place-items: center; min-height: 22rem; }
        .piece-stage::before { content: ''; position: absolute; inset: 8% 4%; background: radial-gradient(50% 50% at 50% 55%, color-mix(in srgb, var(--cp-accent) 9%, transparent), transparent 70%); pointer-events: none; }
        .piece-stage > * { position: relative; }
        .readout { display: flex; align-items: baseline; justify-content: space-between; margin-bottom: 22px; }
        .readout span:first-child { font-family: var(--cp-font-display); font-size: 4.5rem; font-weight: 380; line-height: 1; letter-spacing: -0.03em; font-variant-numeric: tabular-nums; }
        .piece-words, .piece-stage { opacity: 0; translate: 0 14px; transition: opacity 0.9s var(--cp-ease), translate 1.1s var(--cp-ease); }
        .piece-stage { transition-delay: 0.12s; }
        .piece[data-in] .piece-words, .piece[data-in] .piece-stage { opacity: 1; translate: 0 0; }
        @media (prefers-reduced-motion: reduce) { .piece-words, .piece-stage { opacity: 1; translate: none; transition: none; } }
        @media (max-width: 820px) { .hero, .piece { grid-template-columns: 1fr; gap: 32px; } .shell { padding: 0 16px; } }
        .foot { padding-top: 24px; padding-bottom: 64px; border-top: 1px solid var(--cp-rule); color: var(--cp-ink-3); }
      `}</style>
      <header className="shell top cp-label">
        <span style={{ color: 'var(--cp-ink)' }}>copperplate ui <span style={{ color: 'var(--cp-ink-3)' }}>0.2</span></span>
        <nav><a href="#">Components</a><a href="#">The lamp</a><a href="#">Playground</a><a href="#">GitHub</a></nav>
      </header>

      <section className="shell hero">
        <div>
          <p className="cp-label">Components struck and engraved in metal</p>
          <EngravedText as="h1" style={{ fontSize: 'clamp(3.4rem, 7.4vw, 5.6rem)', marginTop: 14 }}>Move the lamp.</EngravedText>
          <p className="lede">Every piece here is lit by the same light. Sweep the pointer across the page and all of them catch it at once.</p>
          <div className="actions">
            <Button size="lg">Browse the components</Button>
            <Button size="lg" variant="engraved">How the lamp works</Button>
          </div>
        </div>
        <figure>
          <Plate className="knight" src="/gallery/durer-knight.webp" alt="Albrecht Dürer, Knight, Death and the Devil, engraved in copper" />
          <figcaption className="cp-label">Albrecht Dürer, Knight, Death and the Devil, 1513</figcaption>
        </figure>
      </section>

      <Piece n="01" name="Button" title="Struck for the one thing that matters." stage={
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
          <Button size="lg">Strike a proof</Button>
          <Button size="lg" variant="engraved">Keep the plate</Button>
        </div>
      }>
        <p>The loud action is a plate of brushed copper, lettered in and bevelled at the edge. Everything else is engraved into the paper around its label.</p>
        <p>Press it and it goes down, then springs back, and a little light comes off it where you struck.</p>
        <p><code>{'<Button>Strike a proof</Button>'}</code></p>
      </Piece>

      <Piece n="02" name="Switch" title="A slide bolt, shot home." stage={<SwitchStage />}>
        <p>The slot is cut into the paper and the bolt is a copper slug with grip lines. It stretches as it travels and settles into place; the inlay shows behind it once it is home.</p>
        <p><code>{'<Switch checked={on} onCheckedChange={setOn} />'}</code></p>
      </Piece>

      <Piece n="03" name="Slider" title="An engraved scale, and a disc riding the groove." stage={<SliderStage />}>
        <p>Copper is poured along the channel to the value. The knurled disc lifts when you take hold of it, and the scale lights up around it as it moves.</p>
        <p>Underneath it is a real range input, so keys, screen readers and touch work as they always do.</p>
      </Piece>

      <footer className="shell foot cp-label">MIT licence. Every surface here is CSS and SVG; no canvas, no WebGL.</footer>
    </>
  );
}

createRoot(document.getElementById('root')!).render(<StrictMode><App /></StrictMode>);
