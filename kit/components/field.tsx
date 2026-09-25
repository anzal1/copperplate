import { createContext, forwardRef, useContext, useId, type HTMLAttributes, type InputHTMLAttributes, type LabelHTMLAttributes, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react';
import { cx } from './utils';

type FieldCtx = { id: string; hintId: string; invalid: boolean };
const Ctx = createContext<FieldCtx | null>(null);

/** Groups a label, a control and a hint, and wires their ids together. */
export function Field({ invalid = false, className, ...props }: HTMLAttributes<HTMLDivElement> & { invalid?: boolean }) {
  const id = useId();
  return (
    <Ctx.Provider value={{ id: `${id}-control`, hintId: `${id}-hint`, invalid }}>
      <div data-invalid={invalid || undefined} className={cx('cp-field', className)} {...props} />
    </Ctx.Provider>
  );
}

export function Label({ className, ...props }: LabelHTMLAttributes<HTMLLabelElement>) {
  const f = useContext(Ctx);
  return <label htmlFor={f?.id} className={cx('cp-label', className)} {...props} />;
}

export function Hint({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  const f = useContext(Ctx);
  return <p id={f?.hintId} className={cx('cp-hint', className)} style={{ margin: 0 }} {...props} />;
}

function useControl(id?: string) {
  const f = useContext(Ctx);
  return {
    id: id ?? f?.id,
    'aria-describedby': f ? f.hintId : undefined,
    'aria-invalid': f?.invalid || undefined,
  };
}

/** A text field, cut into the paper. */
export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(function Input({ className, id, ...props }, ref) {
  return <input ref={ref} {...useControl(id)} className={cx('cp-input cp-cut', className)} {...props} />;
});

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(function Textarea({ className, id, ...props }, ref) {
  return <textarea ref={ref} {...useControl(id)} className={cx('cp-input cp-cut', className)} {...props} />;
});

/** A native select, so it behaves right everywhere, in the same cut field. */
export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(function Select({ className, id, children, ...props }, ref) {
  return (
    <span className="cp-select">
      <select ref={ref} {...useControl(id)} className={cx('cp-input cp-cut', className)} {...props}>
        {children}
      </select>
      <svg className="cp-chevron" viewBox="0 0 12 12" aria-hidden="true">
        <path d="M2.5 4.5 6 8l3.5-3.5" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
});
