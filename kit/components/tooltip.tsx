import { cloneElement, isValidElement, useId, useRef, type ReactElement, type ReactNode } from 'react';
import { useLit, type Metal } from './utils';

/**
 * A small struck tag that hangs off whatever it describes, on hover and on
 * keyboard focus. The child must be focusable (a button, a link).
 */
export function Tooltip({ content, side = 'top', metal = 'copper', children }: { content: ReactNode; side?: 'top' | 'bottom'; metal?: Metal; children: ReactElement<Record<string, unknown>> }) {
  const id = useId();
  const tag = useRef<HTMLSpanElement>(null);
  useLit(tag);
  const child = isValidElement(children) ? cloneElement(children, { 'aria-describedby': id }) : children;
  return (
    <span className="cp-tip-anchor" data-side={side}>
      {child}
      <span ref={tag} id={id} role="tooltip" data-metal={metal} className="cp-tip cp-face cp-stamped">
        {content}
      </span>
    </span>
  );
}
