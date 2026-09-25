import { useRef, type HTMLAttributes } from 'react';
import { cx, useLit, type Metal } from './utils';

/**
 * An engraved channel with metal poured to the value. With no value it is
 * indeterminate, and a bead of metal runs along the channel.
 */
export function Progress({ value, max = 100, metal = 'copper', className, style, ...props }: HTMLAttributes<HTMLDivElement> & { value?: number; max?: number; metal?: Metal }) {
  const root = useRef<HTMLDivElement>(null);
  useLit(root);
  const t = value === undefined ? undefined : Math.min(1, Math.max(0, value / max));
  return (
    <div
      ref={root}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={value}
      data-indeterminate={t === undefined || undefined}
      data-metal={metal}
      className={cx('cp-progress cp-cut', className)}
      style={{ ...style, ['--cp-v' as string]: t ?? 0 }}
      {...props}
    >
      <div className="cp-progress-fill cp-face" />
    </div>
  );
}
