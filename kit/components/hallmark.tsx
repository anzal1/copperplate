import { Relief } from './relief';
import type { Metal } from './utils';

// An octagonal cartouche: a rectangle with its corners cut, as punches are.
const SHAPE = 'M14 2H106L118 14V50L106 62H14L2 50V14Z';

/** A maker's mark: initials punched into a cut cartouche. For footers and signatures. */
export function Hallmark({ initials, metal = 'copper', className }: { initials: string; metal?: Metal; className?: string }) {
  return (
    <Relief width={120} height={64} metal={metal} depth={3.2} soft={0.6} className={className} label={`Maker's mark, ${initials}`}>
      <path d={SHAPE} fill="#e6e6e6" />
      <path d={SHAPE} transform="translate(6 5) scale(0.9 0.844)" fill="#7a7a7a" />
      <text x="60" y="44" textAnchor="middle" fill="#fafafa" style={{ fontFamily: 'var(--cp-font-display)', fontSize: 34, fontWeight: 560, letterSpacing: '0.04em' }}>{initials}</text>
    </Relief>
  );
}
