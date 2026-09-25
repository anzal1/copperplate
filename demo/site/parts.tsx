import { ENTRIES, GROUPS } from './data';
import { useReveal } from './layout';

/** The quiet index of every component, grouped, each linking to its page. */
export function Index({ heading = true }: { heading?: boolean }) {
  return (
    <div className="groups">
      {GROUPS.map((g) => (
        <div key={g} className="group">
          {heading && <h3>{g}</h3>}
          <ul>
            {ENTRIES.filter((e) => e.group === g).map((e) => (
              <li key={e.slug}><a href={`/components/${e.slug}/`}><b>{e.name}</b><span>→</span></a></li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

/** One component, set down under the lamp with room round it. */
export function Piece({ n, slug }: { n: number; slug: string }) {
  const e = ENTRIES.find((x) => x.slug === slug)!;
  const ref = useReveal<HTMLElement>();
  return (
    <section ref={ref} className="shell piece reveal" data-flip={n % 2 === 0 || undefined} aria-labelledby={`piece-${slug}`}>
      <div className="piece-words">
        <p className="eyebrow mono">{String(n).padStart(2, '0')} · {e.name}</p>
        <h2 id={`piece-${slug}`}>{e.title}</h2>
        <div className="piece-body">
          {e.body.map((p, i) => <p key={i}>{p}</p>)}
          <a className="piece-more" href={`/components/${slug}/`}>The {e.name.toLowerCase()} <span>→</span></a>
        </div>
      </div>
      <div className="stage"><e.Demo /></div>
    </section>
  );
}
