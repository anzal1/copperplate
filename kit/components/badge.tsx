import { forwardRef, useRef, type HTMLAttributes } from 'react';
import { cx, mergeRefs, useLit, type Metal } from './utils';

export type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  /** struck: a metal tag. engraved: cut into the paper. */
  variant?: 'struck' | 'engraved';
  /** The metal, which is also the meaning: verdigris for success, brass for warning, oxide for danger. */
  metal?: Metal;
  /** A stamped dot before the label. */
  dot?: boolean;
};

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(function Badge(
  { variant = 'struck', metal = 'copper', dot, className, children, ...props },
  ref,
) {
  const local = useRef<HTMLSpanElement>(null);
  useLit(local);
  return (
    <span
      ref={mergeRefs(ref, local)}
      data-variant={variant}
      data-metal={metal}
      className={cx('cp-badge', variant === 'struck' && 'cp-face cp-stamped', className)}
      {...props}
    >
      {dot && <span className="cp-dot" aria-hidden="true" />}
      {children}
    </span>
  );
});
