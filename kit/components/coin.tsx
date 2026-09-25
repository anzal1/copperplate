import type { ReactNode } from 'react';
import { Relief } from './relief';
import type { Metal } from './utils';

/**
 * A coin with a mark struck into it: a logo, an icon, a letter. Pass SVG
 * shapes drawn on a 100 x 100 grid (they are filled white, so they stand
 * proud), or a short `text`.
 */
export function Coin({ children, text, metal = 'copper', size = 40, label, className }: { children?: ReactNode; text?: string; metal?: Metal; size?: number; label?: string; className?: string }) {
  return (
    <Relief width={100} height={100} metal={metal} depth={3} soft={0.55} label={label} className={className} style={{ width: size, height: size, display: 'inline-block', verticalAlign: 'middle' }}>
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
  );
}
