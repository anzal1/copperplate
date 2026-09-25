import { useEffect, useRef, useSyncExternalStore, type ReactNode } from 'react';
import { useLit, type Metal } from './utils';

type Toast = { id: number; title: ReactNode; body?: ReactNode; metal: Metal; leaving?: boolean };
let toasts: Toast[] = [];
let seq = 0;
const subs = new Set<() => void>();
const emit = () => subs.forEach((f) => f());

/** Show a toast. Returns a function that dismisses it early. */
export function toast(title: ReactNode, opts: { body?: ReactNode; metal?: Metal; duration?: number } = {}) {
  const id = ++seq;
  toasts = [...toasts, { id, title, body: opts.body, metal: opts.metal ?? 'copper' }];
  emit();
  const dismiss = () => {
    toasts = toasts.map((t) => (t.id === id ? { ...t, leaving: true } : t));
    emit();
    setTimeout(() => { toasts = toasts.filter((t) => t.id !== id); emit(); }, 320);
  };
  setTimeout(dismiss, opts.duration ?? 4200);
  return dismiss;
}

function Plate({ t }: { t: Toast }) {
  const ref = useRef<HTMLDivElement>(null);
  useLit(ref);
  return (
    <div ref={ref} data-metal={t.metal} data-leaving={t.leaving || undefined} className="cp-toast cp-face">
      <p className="cp-toast-title">{t.title}</p>
      {t.body && <p className="cp-toast-body">{t.body}</p>}
    </div>
  );
}

/** Render once, near the root of the app. Toasts are announced politely. */
export function Toaster() {
  const list = useSyncExternalStore((f) => { subs.add(f); return () => subs.delete(f); }, () => toasts, () => toasts);
  useEffect(() => () => { toasts = []; }, []);
  return (
    <div className="cp-toaster" role="status" aria-live="polite">
      {list.map((t) => <Plate key={t.id} t={t} />)}
    </div>
  );
}
