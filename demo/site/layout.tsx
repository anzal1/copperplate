import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Coin, Hallmark } from '../../kit/components';

export const VERSION = '0.2';

type Theme = 'dark' | 'light';
const KEY = 'copperplate-theme';

/** Night by default; the choice is remembered per browser. */
export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    try { return (localStorage.getItem(KEY) as Theme) || 'dark'; } catch { return 'dark'; }
  });
  useEffect(() => {
    // On the root element, where the inline script in the page's head put it
    // before first paint, so there is no flash of the other theme.
    const root = document.documentElement;
    root.classList.toggle('cp-dark', theme === 'dark');
    root.classList.toggle('cp-light', theme === 'light');
    root.style.colorScheme = theme;
    try { localStorage.setItem(KEY, theme); } catch { /* per-visit only */ }
  }, [theme]);
  return { theme, toggle: () => setTheme((t) => (t === 'dark' ? 'light' : 'dark')) };
}

/** Fade a section up the first time it is scrolled into view. */
export function useReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver((l) => { if (l.some((e) => e.isIntersecting)) { el.dataset.in = ''; io.disconnect(); } }, { threshold: 0.25 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return ref;
}

export function Top({ here }: { here?: 'home' | 'components' | 'plates' | 'lamp' }) {
  const { theme, toggle } = useTheme();
  const cur = (k: typeof here) => (here === k ? 'page' : undefined);
  return (
    <div className="top-wrap">
      <header className="shell top mono">
        <a className="brand" href="/" aria-label="Copperplate, home">
          <Coin text="C" size={24} flip={false} />
          <span>copperplate <span className="dim">{VERSION}</span></span>
        </a>
        <nav aria-label="Site">
          <a href="/components/" aria-current={cur('components')}>Components</a>
          <a className="opt" href="/lamp/" aria-current={cur('lamp')}>The lamp</a>
          <a className="opt" href="/plates/" aria-current={cur('plates')}>Plates</a>
          <a className="opt" href="https://github.com/anzal1/copperplate">GitHub</a>
          <button type="button" className="theme mono" onClick={toggle} aria-label={`Switch to ${theme === 'dark' ? 'day' : 'night'}`}>
            {theme === 'dark' ? 'Day' : 'Night'}
          </button>
        </nav>
      </header>
    </div>
  );
}

export function Foot() {
  return (
    <footer className="shell foot mono">
      <p>MIT licence. Every surface is CSS and SVG, with no canvas and no WebGL.</p>
      <Hallmark initials="CP" className="mark" />
    </footer>
  );
}

export function Page({ here, children }: { here?: 'home' | 'components' | 'plates' | 'lamp'; children: ReactNode }) {
  return (
    <>
      <Top here={here} />
      <main>{children}</main>
      <Foot />
    </>
  );
}
