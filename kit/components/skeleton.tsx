import type { HTMLAttributes } from 'react';
import { cx } from './utils';

/** A shape cut into the paper, with light passing slowly over it while content loads. */
export function Skeleton({ className, ...p }: HTMLAttributes<HTMLDivElement>) {
  return <div aria-hidden="true" className={cx('cp-skeleton cp-cut', className)} {...p} />;
}
