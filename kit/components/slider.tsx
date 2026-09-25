import { forwardRef, useRef, useState, type InputHTMLAttributes } from 'react';
import { playSound } from './sound';
import { cx, useLit, type Metal } from './utils';

export type SliderProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'value' | 'defaultValue' | 'onChange'> & {
  value?: number;
  defaultValue?: number;
  min?: number;
  max?: number;
  step?: number;
  onValueChange?: (v: number) => void;
  metal?: Metal;
  /** How the value reads on the tag that rides above the disc while you drag. */
  format?: (v: number) => string;
};

/**
 * A rule engraved with a scale, metal poured to the value, and a knurled disc
 * riding the groove. A real range input sits over it, so keyboards, screen
 * readers and touch all work as they do on any range.
 */
export const Slider = forwardRef<HTMLInputElement, SliderProps>(function Slider(
  { value, defaultValue = 50, min = 0, max = 100, step = 1, onValueChange, metal = 'copper', format = (n: number) => String(n), className, style, ...props },
  ref,
) {
  const [own, setOwn] = useState(defaultValue);
  const v = value ?? own;
  const t = (v - min) / (max - min || 1);
  const root = useRef<HTMLDivElement>(null);
  useLit(root);
  return (
    <div ref={root} className={cx('cp-slider', className)} data-metal={metal} style={{ ...style, ['--cp-v' as string]: t }}>
      <div className="cp-slider-scale" aria-hidden="true" />
      <div className="cp-slider-track cp-cut" aria-hidden="true">
        <div className="cp-slider-fill cp-face" />
      </div>
      <div className="cp-slider-thumb cp-face" aria-hidden="true" />
      <div className="cp-slider-tag cp-face cp-stamped" aria-hidden="true">{format(v)}</div>
      <input
        ref={ref}
        type="range"
        min={min}
        max={max}
        step={step}
        value={v}
        onChange={(e) => {
          const n = Number(e.target.value);
          if (value === undefined) setOwn(n);
          onValueChange?.(n);
          playSound('tick');
        }}
        {...props}
      />
    </div>
  );
});
