import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '../../kit/components/metal.css';
import './site.css';
import { Toaster } from '../../kit/components';
import { Page } from './layout';
import { Code, InstallLine } from './code';
import { ENTRIES, GROUPS, bySlug } from './data';

/** One page per component, all from the same template. */
function Doc({ slug }: { slug: string }) {
  const e = bySlug(slug)!;
  const i = ENTRIES.indexOf(e);
  const prev = ENTRIES[i - 1];
  const next = ENTRIES[i + 1];
  return (
    <Page here="components">
      <div className="shell docs">
        <nav className="side" aria-label="Components">
          {GROUPS.map((g) => (
            <div key={g}>
              <h4>{g}</h4>
              {ENTRIES.filter((x) => x.group === g).map((x) => (
                <a key={x.slug} href={`/components/${x.slug}/`} aria-current={x.slug === slug ? 'page' : undefined}>{x.name}</a>
              ))}
            </div>
          ))}
        </nav>
        <article className="doc">
          <p className="eyebrow mono"><a href="/components/" style={{ textDecoration: 'none' }}>Components</a> · {e.group}</p>
          <h1>{e.name}</h1>
          <p className="lede">{e.line}</p>
          <div className="doc-stage"><e.Demo /></div>
          <h2>Install</h2>
          <InstallLine slug={e.item} />
          <h2>Usage</h2>
          <Code>{e.usage}</Code>
          <h2>Props</h2>
          <table className="props">
            <thead><tr><th>Prop</th><th>Type</th><th>Default</th><th>What it does</th></tr></thead>
            <tbody>{e.props.map(([n, t, d, w]) => <tr key={n}><td>{n}</td><td>{t}</td><td>{d}</td><td>{w}</td></tr>)}</tbody>
          </table>
          <h2>How it behaves</h2>
          {e.body.map((p, k) => <p key={k}>{p}</p>)}
          <ul className="notes">{e.notes.map((n, k) => <li key={k}>{n}</li>)}</ul>
          <div className="pager">
            {prev ? <a href={`/components/${prev.slug}/`}><span className="mono dim">Previous</span><b>{prev.name}</b></a> : <span />}
            {next ? <a className="next" href={`/components/${next.slug}/`}><span className="mono dim">Next</span><b>{next.name}</b></a> : <span />}
          </div>
        </article>
      </div>
      <Toaster />
    </Page>
  );
}

const root = document.getElementById('root')!;
const slug = root.dataset.slug || location.pathname.split('/').filter(Boolean).pop() || 'button';
createRoot(root).render(<StrictMode><Doc slug={bySlug(slug) ? slug : 'button'} /></StrictMode>);
