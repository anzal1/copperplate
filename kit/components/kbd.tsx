import { useRef, type HTMLAttributes } from 'react';
import { cx, useLit, type Metal } from './utils';

/** A key, struck in metal. */
export function Kbd({ metal = 'silver', className, ...props }: HTMLAttributes<HTMLElement> & { metal?: Metal }) {
  const local = useRef<HTMLElement>(null);
  useLit(local);
  return <kbd ref={local} data-metal={metal} className={cx('cp-kbd cp-face cp-stamped', className)} {...props} />;
}
