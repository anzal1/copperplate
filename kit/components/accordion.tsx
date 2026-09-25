import type { DetailsHTMLAttributes, ReactNode } from 'react';
import { cx } from './utils';

/**
 * Sections behind engraved rules. Native <details>, so it opens with the
 * keyboard, finds in page, and prints open. Give items the same `name` to
 * let only one be open at a time.
 */
export function Accordion({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cx('cp-accordion', className)}>{children}</div>;
}

export function AccordionItem({ title, children, className, ...props }: DetailsHTMLAttributes<HTMLDetailsElement> & { title: ReactNode }) {
  return (
    <details className={cx('cp-accordion-item', className)} {...props}>
      <summary>
        <span>{title}</span>
        <svg className="cp-accordion-mark" viewBox="0 0 12 12" aria-hidden="true">
          <path d="M6 2v8M2 6h8" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      </summary>
      <div className="cp-accordion-body">{children}</div>
    </details>
  );
}
