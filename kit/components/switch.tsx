import { forwardRef, useRef, useState, type ButtonHTMLAttributes } from 'react';
import { playSound } from './sound';
import { cx, mergeRefs, useLit, type Metal } from './utils';

export type SwitchProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onChange'> & {
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  metal?: Metal;
};

/**
 * A slide bolt. The slot is cut into the paper and the bolt is a metal slug;
 * shot home, the slot behind it shows the inlay.
 */
export const Switch = forwardRef<HTMLButtonElement, SwitchProps>(function Switch(
  { checked, defaultChecked = false, onCheckedChange, metal = 'copper', className, onClick, ...props },
  ref,
) {
  const [own, setOwn] = useState(defaultChecked);
  const [moved, setMoved] = useState(false);
  const on = checked ?? own;
  const local = useRef<HTMLButtonElement>(null);
  useLit(local);
  return (
    <button
      ref={mergeRefs(ref, local)}
      type="button"
      role="switch"
      aria-checked={on}
      data-metal={metal}
      data-moved={moved || undefined}
      className={cx('cp-switch cp-cut', className)}
      onClick={(e) => {
        onClick?.(e);
        if (e.defaultPrevented) return;
        setMoved(true);
        if (checked === undefined) setOwn(!on);
        onCheckedChange?.(!on);
        playSound('bolt');
      }}
      {...props}
    >
      <span className="cp-switch-inlay" aria-hidden="true" />
      <span className="cp-switch-thumb cp-face" aria-hidden="true" />
    </button>
  );
});
