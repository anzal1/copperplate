import { useEffect, type RefObject } from 'react';
import { playSound, type SoundName } from './sound';

const reduced = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * The strike: pressing a metal face flashes light out from the point of
 * contact, the way a die striking metal throws a spark. Writes --cp-sx and
 * --cp-sy where the press landed and restarts the flash; plays a sound if
 * sounds are on.
 */
export function useStrike(ref: RefObject<HTMLElement | null>, sound: SoundName | null = 'press') {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const down = (e: PointerEvent) => {
      if ((el as HTMLButtonElement).disabled) return;
      const r = el.getBoundingClientRect();
      el.style.setProperty('--cp-sx', `${e.clientX - r.left}px`);
      el.style.setProperty('--cp-sy', `${e.clientY - r.top}px`);
      if (!reduced()) {
        el.removeAttribute('data-strike');
        void el.offsetWidth; // restart the animation
        el.setAttribute('data-strike', '');
      }
      if (sound) playSound(sound);
    };
    const key = (e: KeyboardEvent) => {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      el.style.setProperty('--cp-sx', '50%');
      el.style.setProperty('--cp-sy', '50%');
      if (!reduced()) {
        el.removeAttribute('data-strike');
        void el.offsetWidth;
        el.setAttribute('data-strike', '');
      }
      if (sound) playSound(sound);
    };
    el.addEventListener('pointerdown', down);
    el.addEventListener('keydown', key);
    return () => {
      el.removeEventListener('pointerdown', down);
      el.removeEventListener('keydown', key);
    };
  }, [ref, sound]);
}

/**
 * Tilt toward the pointer, like picking a coin up to the light. Springs
 * back when the pointer leaves. Mouse and pen only; never on touch, never
 * with reduced motion.
 */
export function useTilt(ref: RefObject<HTMLElement | SVGElement | null>, max = 12) {
  useEffect(() => {
    const el = ref.current;
    if (!el || reduced()) return;
    const target = { x: 0, y: 0 };
    const cur = { x: 0, y: 0 };
    let raf = 0;
    const tick = () => {
      cur.x += (target.x - cur.x) * 0.14;
      cur.y += (target.y - cur.y) * 0.14;
      el.style.transform = `perspective(600px) rotateX(${cur.x.toFixed(2)}deg) rotateY(${cur.y.toFixed(2)}deg)`;
      if (Math.abs(target.x - cur.x) + Math.abs(target.y - cur.y) > 0.02) raf = requestAnimationFrame(tick);
      else {
        raf = 0;
        if (!target.x && !target.y) el.style.transform = '';
      }
    };
    const kick = () => { if (!raf) raf = requestAnimationFrame(tick); };
    const move = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return;
      const r = el.getBoundingClientRect();
      target.x = -((e.clientY - r.top) / r.height - 0.5) * max * 2;
      target.y = ((e.clientX - r.left) / r.width - 0.5) * max * 2;
      kick();
    };
    const leave = () => { target.x = 0; target.y = 0; kick(); };
    el.addEventListener('pointermove', move as EventListener);
    el.addEventListener('pointerleave', leave);
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener('pointermove', move as EventListener);
      el.removeEventListener('pointerleave', leave);
    };
  }, [ref, max]);
}

/** Run once, the first time an element scrolls into view. */
export function onFirstSight(el: Element, fn: () => void): () => void {
  if (typeof IntersectionObserver === 'undefined') { fn(); return () => {}; }
  const io = new IntersectionObserver((list) => {
    if (list.some((e) => e.isIntersecting)) { io.disconnect(); fn(); }
  }, { threshold: 0.35 });
  io.observe(el);
  return () => io.disconnect();
}

export { reduced as prefersReducedMotion };
