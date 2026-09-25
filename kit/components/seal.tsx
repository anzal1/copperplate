import { useId, useRef } from 'react';
import { Relief } from './relief';
import { useTilt } from './motion';
import { playSound } from './sound';
import type { Metal } from './utils';

/** 72 beads round the rim, drawn as one round-capped dotted stroke. */
const BEAD_GAP = (2 * Math.PI * 88) / 72;

/**
 * A struck medal: a letter or mark in the field, a legend lettered round the
 * rim inside a ring of beads, the way a coin carries its inscription. For the
 * project that has no picture, the member who has no photo, the release.
 */
export function Seal({ initial, legend, metal = 'copper', className, label }: { initial: string; legend: string; metal?: Metal; className?: string; label?: string }) {
  const id = useId().replace(/[^a-zA-Z0-9]/g, '');
  const hold = useRef<HTMLSpanElement>(null);
  useTilt(hold, 14);
  return (
    <span ref={hold} className={['cp-medal', className].filter(Boolean).join(' ')} onPointerDown={() => playSound('seal')}>
    <Relief width={200} height={200} metal={metal} sweep label={label ?? `${initial}, ${legend}`} style={{ display: 'block', width: '100%', height: '100%' }}>
      <defs>
        <path id={`rim-${id}`} d="M100,100 m-72,0 a72,72 0 1,1 144,0 a72,72 0 1,1 -144,0" />
      </defs>
      <circle cx="100" cy="100" r="98" fill="#9a9a9a" />
      <circle cx="100" cy="100" r="95" fill="none" stroke="#f2f2f2" strokeWidth="5" />
      <circle cx="100" cy="100" r="88" fill="none" stroke="#e8e8e8" strokeWidth="3.8" strokeLinecap="round" strokeDasharray={`0 ${BEAD_GAP.toFixed(3)}`} />
      <circle cx="100" cy="100" r="81" fill="none" stroke="#dcdcdc" strokeWidth="1.4" />
      <text fill="#efefef" style={{ fontFamily: 'var(--cp-font-mono)', fontSize: 11.5, letterSpacing: '0.18em', textTransform: 'uppercase' }}>
        <textPath href={`#rim-${id}`} startOffset="25%" textAnchor="middle">{legend}</textPath>
      </text>
      <circle cx="100" cy="100" r="61" fill="#727272" />
      <circle cx="100" cy="100" r="61" fill="none" stroke="#e2e2e2" strokeWidth="1.8" />
      <text x="100" y="124" textAnchor="middle" fill="#fafafa" style={{ fontFamily: 'var(--cp-font-display)', fontSize: 72, fontWeight: 480 }}>{initial}</text>
    </Relief>
    </span>
  );
}
