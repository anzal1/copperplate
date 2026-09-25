import { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { setLamp } from 'copperplate';
import '../../kit/components/metal.css';
import './site.css';
import { Button, Coin, EngravedText, Seal, Slider, Tab, Tabs, TabsList, Toaster } from '../../kit/components';
import { Page } from './layout';
import { Code } from './code';

/** The lamp, explained with the lamp. */
function Lamp() {
  const [source, setSource] = useState('pointer');
  const [hour, setHour] = useState(15);
  const place = (h: number) => {
    // The same path the library's sun takes: low in the east at six, high at
    // noon, low in the west at six in the evening.
    const t = Math.min(1, Math.max(0, (h - 6) / 12));
    setLamp({ x: innerWidth * (0.1 + 0.8 * t), y: innerHeight * (0.55 - 0.45 * Math.sin(Math.PI * t)) });
  };
  return (
    <Page here="lamp">
      <section className="shell" style={{ paddingTop: 64 }}>
        <div className="essay">
          <p className="eyebrow mono">The lamp</p>
          <EngravedText as="h1" style={{ fontSize: 'clamp(2.8rem, 6.4vw, 4.4rem)', marginTop: 12 }}>One light for the page.</EngravedText>
          <p className="lede" style={{ marginTop: 18 }}>Every metal surface on this site is lit from the same point. That is why a row of them reads as one object under a lamp, not a set of effects each chasing the cursor.</p>
        </div>

        <div className="doc-stage" style={{ marginTop: 44 }}>
          <div style={{ display: 'grid', gap: 30, justifyItems: 'center' }}>
            <Tabs value={source} defaultValue="pointer" onValueChange={(v) => { setSource(v); if (v === 'pointer') setLamp(null); else place(hour); }}>
              <TabsList><Tab value="pointer">Follow the pointer</Tab><Tab value="sun">Set the hour</Tab></TabsList>
            </Tabs>
            <div className="lamp-demo">
              <Seal initial="L" legend="One lamp · every plate" className="seal-lg" />
              <div style={{ display: 'grid', gap: 12 }}>
                <Button size="lg">Strike a proof</Button>
                <Button size="lg" variant="engraved">Keep the plate</Button>
              </div>
              <div style={{ display: 'flex', gap: 10 }}><Coin size={56} text="Cu" /><Coin size={56} metal="brass" text="Zn" /><Coin size={56} metal="silver" text="Ag" /></div>
            </div>
            {source === 'sun' && (
              <div style={{ width: 'min(100%, 24rem)' }}>
                <Slider value={hour} min={6} max={18} step={0.25} format={(h) => `${Math.floor(h)}:${String(Math.round((h % 1) * 60)).padStart(2, '0')}`} onValueChange={(h) => { setHour(h); place(h); }} aria-label="Hour of the day" />
              </div>
            )}
          </div>
        </div>

        <div className="essay doc">
          <h2>Where the light is</h2>
          <p>With a mouse, the lamp is the pointer. On a phone, or when the pointer leaves the page, it sits where the sun would be at the visitor’s hour, low in the east in the morning, high at noon, low in the west by evening. On a phone it can follow the tilt of the device instead, once they allow it. When someone prefers less motion it holds still.</p>
          <h2>How a surface catches it</h2>
          <p>There is one set of listeners and one animation frame for the whole page, however many surfaces there are, and only surfaces near the viewport are told about the light. Each one is handed the light’s position relative to itself.</p>
          <p>Plates and struck pieces use it to place an SVG point light over real relief. Controls use it to place a CSS highlight on their copper. You can light your own elements the same way.</p>
          <Code>{`import { useIlluminate } from 'copperplate/react';\n\nfunction Plaque() {\n  const ref = useRef(null);\n  useIlluminate(ref); // writes --cp-lx and --cp-ly on it\n  return <div ref={ref} className="my-plaque" />;\n}`}</Code>
          <Code>{`.my-plaque {\n  background: radial-gradient(14rem circle at var(--cp-lx) var(--cp-ly), #ffe8ce, transparent 60%), #aa6a3f;\n}`}</Code>
          <h2>Holding it still</h2>
          <p>For a screenshot, a test, or a scripted demo, put the light exactly where you want it, and let go again with null.</p>
          <Code>{`import { setLamp } from 'copperplate';\n\nsetLamp({ x: 320, y: 120 });\nsetLamp(null);`}</Code>
        </div>
      </section>
      <Toaster />
    </Page>
  );
}

createRoot(document.getElementById('root')!).render(<StrictMode><Lamp /></StrictMode>);
