import { useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from 'react';
import { playSound } from './sound';
import { useLit, type Metal } from './utils';

type Toast = { id: number; title: ReactNode; body?: ReactNode; metal: Metal; duration: number; leaving?: boolean };
let toasts: Toast[] = [];
let seq = 0;
const subs = new Set<() => void>();
const emit = () => subs.forEach((f) => f());

function dismiss(id: number) {
  if (!toasts.some((t) => t.id === id && !t.leaving)) return;
  toasts = toasts.map((t) => (t.id === id ? { ...t, leaving: true } : t));
  emit();
  setTimeout(() => {
    toasts = toasts.filter((t) => t.id !== id);
    emit();
  }, 340);
}

/** Show a toast. Returns a function that dismisses it early. */
export function toast(title: ReactNode, opts: { body?: ReactNode; metal?: Metal; duration?: number } = {}) {
  const id = ++seq;
  toasts = [...toasts, { id, title, body: opts.body, metal: opts.metal ?? 'copper', duration: opts.duration ?? 4600 }].slice(-5);
  emit();
  playSound('chime');
  return () => dismiss(id);
}

/**
 * One plate. Its timer runs out along an engraved line at its foot, pauses
 * while the deck is open, and it can be flicked away to the right.
 */
function Plate({ t, index, open }: { t: Toast; index: number; open: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  useLit(ref);
  const left = useRef(t.duration);
  const drag = useRef<{ x: number; dx: number } | null>(null);
  const [dx, setDx] = useState(0);

  useEffect(() => {
    if (open || t.leaving) return;
    const started = performance.now();
    const timer = setTimeout(() => dismiss(t.id), left.current);
    return () => {
      clearTimeout(timer);
      left.current -= performance.now() - started;
    };
  }, [open, t.id, t.leaving]);

  return (
    <div
      ref={ref}
      data-metal={t.metal}
      data-leaving={t.leaving || undefined}
      data-front={index === 0 || undefined}
      className="cp-toast cp-face"
      style={{ ['--cp-i' as string]: index, ['--cp-dx' as string]: `${dx}px`, ['--cp-life' as string]: `${t.duration}ms`, animationPlayState: open ? 'paused' : 'running' }}
      onPointerDown={(e) => { drag.current = { x: e.clientX, dx: 0 }; (e.target as Element).setPointerCapture?.(e.pointerId); }}
      onPointerMove={(e) => { if (drag.current) { const d = Math.max(0, e.clientX - drag.current.x); drag.current.dx = d; setDx(d); } }}
      onPointerUp={() => { if (drag.current && drag.current.dx > 90) dismiss(t.id); setDx(0); drag.current = null; }}
    >
      <p className="cp-toast-title">{t.title}</p>
      {t.body && <p className="cp-toast-body">{t.body}</p>}
      <span className="cp-toast-life" style={{ animationPlayState: open ? 'paused' : 'running' }} aria-hidden="true" />
    </div>
  );
}

/**
 * Render once, near the root. Toasts stack into a small deck; hover or
 * focus it and it fans out so each can be read, with their timers paused.
 */
export function Toaster() {
  const list = useSyncExternalStore((f) => { subs.add(f); return () => subs.delete(f); }, () => toasts, () => toasts);
  const [open, setOpen] = useState(false);
  const newest = [...list].reverse();
  return (
    <section
      className="cp-toaster"
      data-open={open || undefined}
      aria-label="Notifications"
      onPointerEnter={() => setOpen(true)}
      onPointerLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
    >
      <div role="status" aria-live="polite" className="cp-toaster-deck" style={{ ['--cp-n' as string]: list.length }}>
        {newest.map((t, i) => <Plate key={t.id} t={t} index={i} open={open} />)}
      </div>
    </section>
  );
}
