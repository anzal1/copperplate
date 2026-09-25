import { createContext, useContext, useId, useLayoutEffect, useRef, useState, type HTMLAttributes, type KeyboardEvent, type ReactNode } from 'react';
import { cx, useLit, type Metal } from './utils';

type Ctx = { value: string; set: (v: string) => void; base: string };
const TabsCtx = createContext<Ctx | null>(null);

export function Tabs({ value, defaultValue, onValueChange, className, children, ...props }: Omit<HTMLAttributes<HTMLDivElement>, 'defaultValue'> & {
  value?: string;
  defaultValue: string;
  onValueChange?: (v: string) => void;
}) {
  const [own, setOwn] = useState(defaultValue);
  const base = useId();
  const v = value ?? own;
  return (
    <TabsCtx.Provider value={{ value: v, base, set: (n) => { if (value === undefined) setOwn(n); onValueChange?.(n); } }}>
      <div className={className} {...props}>{children}</div>
    </TabsCtx.Provider>
  );
}

/**
 * The tray: a channel cut into the paper, with a struck plate that slides
 * under whichever tab is chosen. Arrow keys move between tabs.
 */
export function TabsList({ metal = 'copper', className, children, ...props }: HTMLAttributes<HTMLDivElement> & { metal?: Metal }) {
  const t = useContext(TabsCtx)!;
  const list = useRef<HTMLDivElement>(null);
  const plate = useRef<HTMLSpanElement>(null);
  useLit(list);

  useLayoutEffect(() => {
    const l = list.current;
    const p = plate.current;
    if (!l || !p) return;
    const place = () => {
      const on = l.querySelector<HTMLElement>('[aria-selected="true"]');
      if (!on) return;
      p.style.left = `${on.offsetLeft}px`;
      p.style.width = `${on.offsetWidth}px`;
      p.style.setProperty('--cp-px', `${on.offsetLeft}px`);
    };
    place();
    const ro = new ResizeObserver(place);
    ro.observe(l);
    return () => ro.disconnect();
  }, [t.value]);

  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const tabs = [...(list.current?.querySelectorAll<HTMLButtonElement>('[role="tab"]:not(:disabled)') ?? [])];
    const i = tabs.findIndex((x) => x === document.activeElement);
    if (i < 0) return;
    const next = e.key === 'ArrowRight' ? i + 1 : e.key === 'ArrowLeft' ? i - 1 : e.key === 'Home' ? 0 : e.key === 'End' ? tabs.length - 1 : null;
    if (next === null) return;
    e.preventDefault();
    const tab = tabs[(next + tabs.length) % tabs.length];
    tab.focus();
    tab.click();
  };

  return (
    <div ref={list} role="tablist" data-metal={metal} className={cx('cp-tabs-list cp-cut', className)} onKeyDown={onKey} {...props}>
      <span ref={plate} className="cp-tabs-plate cp-face" aria-hidden="true" />
      {children}
    </div>
  );
}

export function Tab({ value, className, children, ...props }: HTMLAttributes<HTMLButtonElement> & { value: string; disabled?: boolean }) {
  const t = useContext(TabsCtx)!;
  const on = t.value === value;
  return (
    <button
      type="button"
      role="tab"
      id={`${t.base}-tab-${value}`}
      aria-selected={on}
      aria-controls={`${t.base}-panel-${value}`}
      tabIndex={on ? 0 : -1}
      className={cx('cp-tab', className)}
      onClick={() => t.set(value)}
      {...props}
    >
      {children}
    </button>
  );
}

export function TabPanel({ value, children, ...props }: HTMLAttributes<HTMLDivElement> & { value: string; children?: ReactNode }) {
  const t = useContext(TabsCtx)!;
  if (t.value !== value) return null;
  return (
    <div role="tabpanel" id={`${t.base}-panel-${value}`} aria-labelledby={`${t.base}-tab-${value}`} tabIndex={0} {...props}>
      {children}
    </div>
  );
}
