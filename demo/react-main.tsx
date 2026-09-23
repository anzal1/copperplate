import { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Engraving, useLamp, type MaterialName } from 'copperplate/react';

const METALS: MaterialName[] = ['copper', 'brass', 'silver', 'steel', 'gold', 'bronze'];

function App() {
  const lamp = useLamp();
  const [material, setMaterial] = useState<MaterialName>('copper');
  return (
    <main className="shell intro">
      <h1>React</h1>
      <p className="mono small dim" id="lamp">
        {lamp ? `light ${lamp.source} at ${Math.round(lamp.x)}, ${Math.round(lamp.y)} in ${lamp.color}` : 'no light yet'}
      </p>
      <p className="mono small">
        {METALS.map((m) => (
          <button key={m} type="button" className="link" style={{ marginRight: 14, color: m === material ? 'var(--accent)' : undefined }} onClick={() => setMaterial(m)}>
            {m}
          </button>
        ))}
      </p>
      <Engraving id="react-plate" src="/gallery/durer-knight.webp" alt="Dürer, Knight, Death and the Devil" material={material} className="plate-host" style={{ width: 'min(100%, 420px)', aspectRatio: '1', marginTop: 24 }} />
    </main>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
