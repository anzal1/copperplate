import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '../../kit/components/metal.css';
import './site.css';
import { Toaster } from '../../kit/components';
import { Page } from './layout';
import { Index } from './parts';
import { InstallLine } from './code';
import { ENTRIES } from './data';

function Components() {
  return (
    <Page here="components">
      <section className="shell" style={{ paddingTop: 64 }}>
        <p className="eyebrow mono">Components</p>
        <h1 style={{ fontSize: 'clamp(2.6rem, 6vw, 3.75rem)', marginTop: 12 }}>The whole set.</h1>
        <p className="lede" style={{ marginTop: 16 }}>{ENTRIES.length} pieces, each lit by the same lamp. Add one at a time, or all of them at once.</p>
        <InstallLine slug="all" />
        <Index />
      </section>
      <Toaster />
    </Page>
  );
}

createRoot(document.getElementById('root')!).render(<StrictMode><Components /></StrictMode>);
