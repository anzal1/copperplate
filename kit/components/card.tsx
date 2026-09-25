import { forwardRef, useRef, type HTMLAttributes } from 'react';
import { useTilt } from './motion';
import { cx, mergeRefs, useLit, type Metal } from './utils';

export type CardProps = HTMLAttributes<HTMLDivElement> & {
  /** plaque: paper with an engraved double rule. plate: the bevel a press leaves. struck: the whole card in metal. */
  variant?: 'plaque' | 'plate' | 'struck';
  metal?: Metal;
};

export const Card = forwardRef<HTMLDivElement, CardProps>(function Card({ variant = 'plaque', metal = 'copper', className, ...props }, ref) {
  const local = useRef<HTMLDivElement>(null);
  const tilt = useRef<HTMLDivElement>(null);
  useLit(local);
  // Only the metal card is an object you might pick up; paper cards stay flat.
  useTilt(variant === 'struck' ? local : tilt, 4);
  return (
    <div
      ref={mergeRefs(ref, local)}
      data-variant={variant}
      data-metal={variant === 'struck' ? metal : undefined}
      className={cx('cp-card', variant === 'struck' && 'cp-face', className)}
      {...props}
    />
  );
});

export const CardEyebrow = ({ className, ...p }: HTMLAttributes<HTMLParagraphElement>) => <p className={cx('cp-label cp-card-eyebrow', className)} {...p} />;
export const CardTitle = ({ className, ...p }: HTMLAttributes<HTMLHeadingElement>) => <h3 className={cx('cp-card-title', className)} {...p} />;
export const CardBody = ({ className, ...p }: HTMLAttributes<HTMLParagraphElement>) => <p className={cx('cp-card-body', className)} {...p} />;
export const CardFooter = ({ className, ...p }: HTMLAttributes<HTMLDivElement>) => <div className={cx('cp-card-footer', className)} {...p} />;
