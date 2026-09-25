import { useRef, type HTMLAttributes } from 'react';
import { cx, useLit, type Metal } from './utils';

/** An engraved rule. The ornament variant sets a struck lozenge in the middle. */
export function Separator({ variant = 'rule', metal = 'copper', className, ...props }: HTMLAttributes<HTMLDivElement> & { variant?: 'rule' | 'ornament'; metal?: Metal }) {
  const gem = useRef<HTMLSpanElement>(null);
  useLit(gem);
  return (
    <div role="separator" data-variant={variant} className={cx('cp-separator', className)} {...props}>
      {variant === 'ornament' && <span ref={gem} className="cp-lozenge cp-face" data-metal={metal} aria-hidden="true" />}
    </div>
  );
}
