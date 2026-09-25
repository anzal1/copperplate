import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '../../kit/components/metal.css';
import './site.css';
import { Button, EngravedText, Plate, Toaster } from '../../kit/components';
import { Page, useReveal } from './layout';
import { Index, Piece } from './parts';
import { Code, InstallLine } from './code';
import { ENTRIES } from './data';

const PIECES = ['button', 'switch', 'slider', 'checkbox', 'tabs', 'toast', 'seal'];

function Start() {
  const ref = useReveal<HTMLElement>();
  return (
    <section ref={ref} className="shell piece reveal" id="start" aria-labelledby="start-h">
      <div className="piece-words">
        <p className="eyebrow mono">Start</p>
        <h2 id="start-h">Copy them in, and they are yours.</h2>
        <div className="piece-body">
          <p>Each component is added to your project as source with the shadcn command line, so you can change anything. The lighting itself comes from the copperplate package, which is installed for you.</p>
          <p>React and any bundler that imports CSS. No Tailwind needed, and no canvas or WebGL anywhere.</p>
        </div>
      </div>
      <div style={{ display: 'grid', gap: 14, alignContent: 'center' }}>
        <InstallLine slug="all" />
        <Code>{`import { Button } from '@/components/copperplate/button';\n\nexport function Proof() {\n  return <Button>Strike a proof</Button>;\n}`}</Code>
      </div>
    </section>
  );
}

function Home() {
  const all = useReveal<HTMLElement>();
  return (
    <Page here="home">
      <section className="shell hero">
        <div>
          <p className="eyebrow mono">{ENTRIES.length} components, struck and engraved in metal</p>
          <EngravedText as="h1" style={{ fontSize: 'clamp(3.2rem, 7.4vw, 5.6rem)', marginTop: 14 }}>Move the lamp.</EngravedText>
          <p className="lede">Every piece here is lit by the same light. Sweep the pointer across the page and all of them catch it at once.</p>
          <div className="actions">
            <Button size="lg" onClick={() => { location.href = '/components/'; }}>Browse the components</Button>
            <Button size="lg" variant="engraved" onClick={() => { location.href = '/lamp/'; }}>How the lamp works</Button>
          </div>
        </div>
        <figure>
          <Plate className="knight" src="/gallery/durer-knight.webp" alt="Albrecht Dürer, Knight, Death and the Devil, engraved in copper" />
          <figcaption className="mono dim">Albrecht Dürer, Knight, Death and the Devil, 1513</figcaption>
        </figure>
      </section>

      {PIECES.map((slug, i) => <Piece key={slug} n={i + 1} slug={slug} />)}

      <section ref={all} className="shell index reveal" aria-labelledby="all-h">
        <div>
          <p className="eyebrow mono">Everything</p>
          <h2 id="all-h">The whole set.</h2>
        </div>
        <Index />
      </section>

      <Start />
      <Toaster />
    </Page>
  );
}

createRoot(document.getElementById('root')!).render(<StrictMode><Home /></StrictMode>);
