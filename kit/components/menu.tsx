import { createContext, useContext, useEffect, useId, useRef, useState, type HTMLAttributes, type KeyboardEvent, type ReactNode } from 'react';
import { cx, useLit, type Metal } from './utils';

type Ctx = { close: () => void };
const MenuCtx = createContext<Ctx | null>(null);

/**
 * A menu on a small plate. The trigger is any element you pass (it gets the
 * button role wired for you); arrow keys walk the items, Escape closes and
 * hands focus back.
 */
export function Menu({ trigger, children, align = 'start', metal = 'copper' }: { trigger: (props: Record<string, unknown>) => ReactNode; children: ReactNode; align?: 'start' | 'end'; metal?: Metal }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const wrap = useRef<HTMLSpanElement>(null);
  const list = useRef<HTMLDivElement>(null);
  const focusFirst = useRef(false);

  useEffect(() => {
    if (!open) return;
    if (focusFirst.current) list.current?.querySelector<HTMLElement>('[role="menuitem"]')?.focus();
    const onDown = (e: PointerEvent) => {
      if (!wrap.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', onDown);
    return () => document.removeEventListener('pointerdown', onDown);
  }, [open]);

  const close = () => {
    setOpen(false);
    wrap.current?.querySelector<HTMLElement>('[aria-haspopup]')?.focus();
  };

  const onKey = (e: KeyboardEvent) => {
    const items = [...(list.current?.querySelectorAll<HTMLElement>('[role="menuitem"]:not([aria-disabled="true"])') ?? [])];
    const i = items.indexOf(document.activeElement as HTMLElement);
    if (e.key === 'Escape') { e.preventDefault(); close(); }
    else if (e.key === 'ArrowDown') { e.preventDefault(); items[(i + 1) % items.length]?.focus(); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); items[(i - 1 + items.length) % items.length]?.focus(); }
    else if (e.key === 'Home') { e.preventDefault(); items[0]?.focus(); }
    else if (e.key === 'End') { e.preventDefault(); items[items.length - 1]?.focus(); }
    else if (e.key === 'Tab') setOpen(false);
  };

  return (
    <MenuCtx.Provider value={{ close }}>
      <span ref={wrap} className="cp-menu" onKeyDown={onKey}>
        {trigger({
          'aria-haspopup': 'menu',
          'aria-expanded': open,
          'aria-controls': id,
          onClick: () => { focusFirst.current = false; setOpen((o) => !o); },
          onKeyDown: (e: KeyboardEvent) => {
            if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') { e.preventDefault(); focusFirst.current = true; setOpen(true); }
          },
        })}
        {open && (
          <div ref={list} id={id} role="menu" data-align={align} data-metal={metal} className="cp-menu-plate">
            {Array.isArray(children)
              ? children.map((c, i) => <span key={i} className="cp-menu-row" style={{ ['--cp-i' as string]: i }}>{c}</span>)
              : children}
          </div>
        )}
      </span>
    </MenuCtx.Provider>
  );
}

export function MenuItem({ onSelect, disabled, className, children, ...props }: HTMLAttributes<HTMLDivElement> & { onSelect?: () => void; disabled?: boolean }) {
  const m = useContext(MenuCtx)!;
  const run = () => { if (disabled) return; onSelect?.(); m.close(); };
  const ref = useRef<HTMLDivElement>(null);
  useLit(ref);
  return (
    <div
      ref={ref}
      role="menuitem"
      tabIndex={-1}
      aria-disabled={disabled || undefined}
      className={cx('cp-menu-item', className)}
      onClick={run}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); run(); } }}
      {...props}
    >
      {children}
    </div>
  );
}

export const MenuLabel = ({ className, ...p }: HTMLAttributes<HTMLDivElement>) => <div className={cx('cp-label cp-menu-label', className)} {...p} />;
export const MenuRule = () => <div role="separator" className="cp-menu-rule" />;
