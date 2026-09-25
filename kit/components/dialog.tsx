import { useEffect, useRef, type ReactNode } from 'react';
import { cx } from './utils';

/**
 * A plate laid over the page. Built on the native <dialog>, so focus is
 * trapped, Escape closes it and the page behind is inert, as the browser
 * already does it right.
 */
export function Dialog({ open, onOpenChange, title, description, children, footer, className }: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) {
      d.removeAttribute('data-closing');
      d.showModal();
    }
    if (!open && d.open) {
      // Lift the plate off before the dialog goes, rather than cutting it.
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return d.close();
      d.setAttribute('data-closing', '');
      const done = () => { d.removeAttribute('data-closing'); d.close(); };
      const t = setTimeout(done, 320);
      return () => clearTimeout(t);
    }
  }, [open]);
  return (
    <dialog
      ref={ref}
      className={cx('cp-dialog', className)}
      aria-labelledby="cp-dialog-title"
      onClose={() => onOpenChange(false)}
      onCancel={(e) => { e.preventDefault(); onOpenChange(false); }}
      onClick={(e) => {
        // A click on the backdrop lands on the dialog element itself.
        if (e.target === ref.current) onOpenChange(false);
      }}
    >
      <div className="cp-dialog-plate">
        <h2 id="cp-dialog-title" className="cp-card-title">{title}</h2>
        {description && <p className="cp-card-body">{description}</p>}
        {children}
        {footer && <div className="cp-dialog-footer">{footer}</div>}
      </div>
    </dialog>
  );
}
