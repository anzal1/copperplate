import { useRef, type ReactNode } from 'react';
import { Relief } from './relief';
import { prefersReducedMotion, useTilt } from './motion';
import { playSound } from './sound';
import type { Metal } from './utils';

/**
 * A coin with a mark struck into it: a logo, an icon, a letter. Pass SVG
 * shapes drawn on a 100 x 100 grid (they are filled white, so they stand
 * proud), or a short `text`. It tilts toward the pointer, and flipped (click
 * it) it spins once and rings.
 */
export function Coin({ children, text, metal = 'copper', size = 40, label, flip = true, className }: { children?: ReactNode; text?: string; metal?: Metal; size?: number; label?: string; flip?: boolean; className?: string }) {
  const hold = useRef<HTMLSpanElement>(null);
  const face = useRef<HTMLSpanElement>(null);
  useTilt(hold, 16);
  const spin = () => {
    if (!flip) return;
    playSound('coin');
    if (prefersReducedMotion() || !face.current) return;
    face.current.animate(
      [{ transform: 'rotateY(0) translateY(0)' }, { transform: 'rotateY(200deg) translateY(-18%)', offset: 0.45 }, { transform: 'rotateY(360deg) translateY(0)' }],
      { duration: 820, easing: 'cubic-bezier(0.3, 0.7, 0.2, 1)' },
    );
  };
  return (
    <span ref={hold} className={['cp-medal cp-coin', className].filter(Boolean).join(' ')} style={{ width: size, height: size }} onPointerDown={spin}>
      <span ref={face} className="cp-coin-face">
        <Relief width={100} height={100} metal={metal} depth={3} soft={0.55} label={label} style={{ width: '100%', height: '100%', display: 'block' }}>
          <circle cx="50" cy="50" r="49" fill="#8e8e8e" />
          <circle cx="50" cy="50" r="46.5" fill="none" stroke="#e9e9e9" strokeWidth="3" />
          <circle cx="50" cy="50" r="42" fill="#6c6c6c" />
          <g fill="#f4f4f4" color="#f4f4f4">
            {text ? (
              <text x="50" y="50" dominantBaseline="central" textAnchor="middle" style={{ fontFamily: 'var(--cp-font-display)', fontSize: text.length > 2 ? 30 : 44, fontWeight: 560 }}>{text}</text>
            ) : (
              <g transform="translate(22 22) scale(0.56)">{children}</g>
            )}
          </g>
        </Relief>
      </span>
    </span>
  );
}
