import { forwardRef, useRef, type InputHTMLAttributes, type ReactNode } from 'react';
import { playSound } from './sound';
import { cx, useLit, type Metal } from './utils';

export type CheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  label?: ReactNode;
  metal?: Metal;
};

/** A socket cut into the paper; checked, a metal tile is struck into it. */
export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox({ label, metal = 'copper', className, onChange, ...props }, ref) {
  const box = useRef<HTMLSpanElement>(null);
  useLit(box);
  return (
    <label className={cx('cp-check', className)}>
      <input
        ref={ref}
        type="checkbox"
        onChange={(e) => {
          onChange?.(e);
          playSound(e.target.checked ? 'strike' : 'tick');
        }}
        {...props}
      />
      <span ref={box} className="cp-check-box cp-cut" data-metal={metal} aria-hidden="true">
        <span className="cp-check-tile cp-face">
          <svg viewBox="0 0 16 16">
            <path d="M3.5 8.5 6.5 11.5 12.5 4.5" fill="none" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" pathLength={1} />
          </svg>
        </span>
      </span>
      {label}
    </label>
  );
});
