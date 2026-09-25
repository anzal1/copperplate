import { forwardRef, useRef, type ButtonHTMLAttributes } from 'react';
import { cx, mergeRefs, useLit, type Metal } from './utils';

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  /** struck: metal, the one loud action. engraved: a double rule cut in the paper. plain: a label that underlines. */
  variant?: 'struck' | 'engraved' | 'plain';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  metal?: Metal;
};

/**
 * A button. Struck in metal it catches the page's lamp and presses in when
 * clicked; engraved it is cut into the paper round its label.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'struck', size = 'md', metal = 'copper', className, type = 'button', ...props },
  ref,
) {
  const local = useRef<HTMLButtonElement>(null);
  useLit(local);
  return (
    <button
      ref={mergeRefs(ref, local)}
      type={type}
      data-variant={variant}
      data-size={size}
      data-metal={variant === 'struck' ? metal : undefined}
      className={cx('cp-button cp-focus', variant === 'struck' && 'cp-face', className)}
      {...props}
    />
  );
});
