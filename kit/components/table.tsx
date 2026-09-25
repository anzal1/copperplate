import type { HTMLAttributes, TableHTMLAttributes, TdHTMLAttributes, ThHTMLAttributes } from 'react';
import { cx } from './utils';

/** A ruled ledger: mono column heads, engraved rules between rows. */
export const Table = ({ className, ...p }: TableHTMLAttributes<HTMLTableElement>) => <table className={cx('cp-table', className)} {...p} />;
export const THead = (p: HTMLAttributes<HTMLTableSectionElement>) => <thead {...p} />;
export const TBody = (p: HTMLAttributes<HTMLTableSectionElement>) => <tbody {...p} />;
export const TR = (p: HTMLAttributes<HTMLTableRowElement>) => <tr {...p} />;
export const TH = ({ className, ...p }: ThHTMLAttributes<HTMLTableCellElement>) => <th className={cx('cp-label', className)} {...p} />;
export const TD = (p: TdHTMLAttributes<HTMLTableCellElement>) => <td {...p} />;
