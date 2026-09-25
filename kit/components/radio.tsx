import { createContext, forwardRef, useContext, useId, useRef, type HTMLAttributes, type InputHTMLAttributes, type ReactNode } from 'react';
import { playSound } from './sound';
import { cx, useLit, type Metal } from './utils';

type Group = { name: string; value?: string; onValueChange?: (v: string) => void; metal: Metal };
const Ctx = createContext<Group | null>(null);

export function RadioGroup({ name, value, defaultValue, onValueChange, metal = 'copper', className, children, ...props }: Omit<HTMLAttributes<HTMLDivElement>, 'defaultValue'> & {
  name?: string;
  value?: string;
  defaultValue?: string;
  onValueChange?: (v: string) => void;
  metal?: Metal;
}) {
  const auto = useId();
  return (
    <Ctx.Provider value={{ name: name ?? auto, value: value ?? defaultValue, onValueChange, metal }}>
      <div role="radiogroup" className={cx('cp-radio-group', className)} {...props}>
        {children}
      </div>
    </Ctx.Provider>
  );
}

export type RadioProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'value'> & { value: string; label?: ReactNode };

/** A round socket; the chosen one takes a domed rivet. */
export const Radio = forwardRef<HTMLInputElement, RadioProps>(function Radio({ value, label, className, onChange, ...props }, ref) {
  const g = useContext(Ctx);
  const box = useRef<HTMLSpanElement>(null);
  useLit(box);
  const controlled = g?.value !== undefined && g.onValueChange !== undefined;
  return (
    <label className={cx('cp-check cp-radio', className)}>
      <input
        ref={ref}
        type="radio"
        name={g?.name}
        value={value}
        {...(controlled ? { checked: g!.value === value } : { defaultChecked: g?.value === value })}
        onChange={(e) => {
          onChange?.(e);
          if (e.target.checked) {
            g?.onValueChange?.(value);
            playSound('strike');
          }
        }}
        {...props}
      />
      <span ref={box} className="cp-check-box cp-cut" data-metal={g?.metal ?? 'copper'} aria-hidden="true">
        <span className="cp-check-tile" />
      </span>
      {label}
    </label>
  );
});
