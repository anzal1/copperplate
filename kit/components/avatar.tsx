import { useRef } from 'react';
import { Engraving } from 'copperplate/react';
import { Coin } from './coin';
import { useTilt } from './motion';
import { cx, useLit, type Metal } from './utils';

/**
 * A portrait struck as a coin: the photo engraved into the field, a rim
 * round it. With no photo, the initials are struck instead.
 */
export function Avatar({ src, name, metal = 'copper', size = 48, className }: { src?: string; name: string; metal?: Metal; size?: number; className?: string }) {
  const rim = useRef<HTMLSpanElement>(null);
  useLit(rim);
  useTilt(rim, 12);
  const initials = name.split(/\s+/).map((w) => w[0]).slice(0, 2).join('').toUpperCase();
  if (!src) return <Coin text={initials} metal={metal} size={size} label={name} className={className} />;
  const material = metal === 'verdigris' || metal === 'oxide' ? 'bronze' : metal;
  return (
    <span ref={rim} data-metal={metal} className={cx('cp-avatar cp-face', className)} style={{ width: size, height: size }}>
      <Engraving src={src} alt={name} material={material} plateMark={false} relief={2.2} style={{ width: '100%', height: '100%', borderRadius: '50%', overflow: 'hidden' }} />
    </span>
  );
}
