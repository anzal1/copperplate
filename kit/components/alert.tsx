import { useRef, type HTMLAttributes, type ReactNode } from 'react';
import { cx, useLit, type Metal } from './utils';

/**
 * A notice on a plaque, marked by a struck strip down its edge. The metal is
 * the meaning: copper to note, verdigris for done, brass to warn, oxide when
 * something failed.
 */
export function Alert({ metal = 'copper', title, children, className, role, ...props }: HTMLAttributes<HTMLDivElement> & { metal?: Metal; title?: ReactNode }) {
  const strip = useRef<HTMLSpanElement>(null);
  useLit(strip);
  return (
    <div role={role ?? (metal === 'oxide' ? 'alert' : 'status')} data-metal={metal} className={cx('cp-alert', className)} {...props}>
      <span ref={strip} className="cp-alert-strip cp-face" aria-hidden="true" />
      <div>
        {title && <p className="cp-alert-title">{title}</p>}
        {children && <div className="cp-alert-body">{children}</div>}
      </div>
    </div>
  );
}
