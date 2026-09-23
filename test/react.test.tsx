import { describe, expect, it } from 'vitest';
import { renderToString } from 'react-dom/server';
import { Engraving, useLamp } from '../src/react';

function Readout() {
  const lamp = useLamp();
  return <span>{lamp === null ? 'none' : lamp.source}</span>;
}

describe('React entry on the server', () => {
  it('renders an empty host div with the given attributes', () => {
    const html = renderToString(<Engraving src="/a.jpg" alt="A plate" material="gold" className="art" style={{ width: 200 }} />);
    expect(html).toBe('<div class="art" style="width:200px"></div>');
  });
  it('useLamp is null on the server', () => {
    expect(renderToString(<Readout />)).toBe('<span>none</span>');
  });
});
