/**
 * The lamp: one light for the whole page.
 *
 * Every plate is lit from the same point, so sweeping the pointer across a
 * row of plates reads as one lamp moving. There is one set of listeners no
 * matter how many plates exist, work is batched into a single animation
 * frame, and only plates near the viewport are told about the light.
 *
 * Nothing here runs at import time, so the module is safe to import during
 * server rendering. Listeners attach when the first plate or subscriber
 * arrives and detach when the last one leaves.
 */
import { lightColor, localHour, sunPosition, tiltToLight } from './sun.js';

export type LampSource = 'pointer' | 'motion' | 'sun' | 'manual';

export interface LampState {
  /** Light position in viewport (client) pixels. */
  readonly x: number;
  readonly y: number;
  /** Light colour as #rrggbb. */
  readonly color: string;
  /** What is driving the light right now. */
  readonly source: LampSource;
  /** True when the visitor prefers reduced motion and the light is held still. */
  readonly still: boolean;
}

export type MotionPermission = 'granted' | 'denied' | 'unsupported';

/** A viewport rectangle. */
export interface ClientRect {
  left: number;
  top: number;
  width: number;
  height: number;
}

/** @internal What a plate hands the lamp. */
export interface LampClient {
  readonly el: Element;
  light(x: number, y: number, color: string, rect: ClientRect): void;
}

interface Entry {
  client: LampClient;
  visible: boolean;
  dirty: boolean;
  // Cached in page coordinates so plain page scrolling needs no re-measure.
  left: number;
  top: number;
  width: number;
  height: number;
}

const GLIDE_MS = 650;
const REMEASURE_MS = 500;

const entries = new Map<Element, Entry>();
const subscribers = new Set<(s: LampState) => void>();

let started = false;
let raf = 0;
let hour = 12;
let state: LampState | null = null;
let pointer: { x: number; y: number } | null = null;
let motion: { x: number; y: number } | null = null;
let motionListening = false;
let manual: { x: number; y: number } | null = null;
let reduced = false;
let glide: { x: number; y: number; t0: number } | null = null;
let lastMeasure = 0;
let io: IntersectionObserver | null = null;
let mq: MediaQueryList | null = null;
let clock: ReturnType<typeof setInterval> | undefined;

const hasDOM = () => typeof window !== 'undefined' && typeof document !== 'undefined';

function schedule() {
  if (!raf && hasDOM()) raf = requestAnimationFrame(frame);
}

function target(): { x: number; y: number; source: LampSource } {
  const w = window.innerWidth;
  const h = window.innerHeight;
  if (manual) return { ...manual, source: 'manual' };
  if (!reduced && motion) return { x: motion.x * w, y: motion.y * h, source: 'motion' };
  if (!reduced && pointer) return { ...pointer, source: 'pointer' };
  const sun = sunPosition(hour);
  return { x: sun.x * w, y: sun.y * h, source: 'sun' };
}

function measure(e: Entry, sx: number, sy: number) {
  const r = e.client.el.getBoundingClientRect();
  e.left = r.left + sx;
  e.top = r.top + sy;
  e.width = r.width;
  e.height = r.height;
  e.dirty = false;
}

function frame(now: number) {
  raf = 0;
  const t = target();
  let x = t.x;
  let y = t.y;
  let again = false;

  // A change of source (pointer arrives or leaves) glides rather than jumps.
  if (state && state.source !== t.source && !reduced) glide = { x: state.x, y: state.y, t0: now };
  if (glide) {
    const p = Math.min(1, (now - glide.t0) / GLIDE_MS);
    const e = 1 - (1 - p) ** 3;
    x = glide.x + (x - glide.x) * e;
    y = glide.y + (y - glide.y) * e;
    if (p < 1) again = true;
    else glide = null;
  }

  const color = lightColor(hour);
  if (!state || state.x !== x || state.y !== y || state.color !== color || state.source !== t.source || state.still !== reduced) {
    state = { x, y, color, source: t.source, still: reduced };
    subscribers.forEach((f) => f(state!));
  }

  const sx = window.scrollX;
  const sy = window.scrollY;
  if (now - lastMeasure > REMEASURE_MS) {
    // Cheap insurance against layout shifts nothing told us about.
    lastMeasure = now;
    entries.forEach((e) => (e.dirty = true));
  }

  // All reads first, then all writes: no forced layout between plates.
  entries.forEach((e) => {
    if (e.visible && e.dirty) measure(e, sx, sy);
  });
  const sun = reduced ? sunPosition(hour) : null;
  entries.forEach((e) => {
    if (!e.visible || e.width === 0 || e.height === 0) return;
    const rect = { left: e.left - sx, top: e.top - sy, width: e.width, height: e.height };
    if (sun) {
      // Held still: every plate lit from the same spot relative to itself,
      // so nothing changes as the page scrolls.
      e.client.light(rect.left + sun.x * rect.width, rect.top + sun.y * rect.height, color, rect);
    } else {
      e.client.light(state!.x, state!.y, color, rect);
    }
  });

  if (again) schedule();
}

// ── listeners ───────────────────────────────────────────────────────────

function onPointerMove(e: PointerEvent) {
  pointer = { x: e.clientX, y: e.clientY };
  schedule();
}
function onPointerEnd(e: PointerEvent) {
  // A finger has no hover: once it lifts, the light goes back to the sun.
  if (e.pointerType === 'touch' || e.type === 'pointercancel') {
    pointer = null;
    schedule();
  }
}
function onPointerOut(e: PointerEvent) {
  if (!e.relatedTarget) {
    pointer = null;
    schedule();
  }
}
function onScroll(e: Event) {
  // The page itself scrolled: cached page coordinates are still right.
  // Something nested scrolled: plates inside it may have moved.
  if (e.target !== document && e.target !== document.documentElement) entries.forEach((x) => (x.dirty = true));
  schedule();
}
function onResize() {
  entries.forEach((x) => (x.dirty = true));
  schedule();
}
function onVisibility() {
  if (document.visibilityState === 'visible') {
    hour = localHour();
    schedule();
  }
}
function onReducedChange() {
  reduced = !!mq?.matches;
  glide = null;
  bindPointer();
  schedule();
}
function onOrientation(e: DeviceOrientationEvent) {
  if (e.beta === null || e.gamma === null) return;
  motion = tiltToLight(e.beta, e.gamma);
  schedule();
}

let pointerBound = false;
function bindPointer() {
  const want = started && !reduced;
  if (want === pointerBound) return;
  pointerBound = want;
  const m = want ? 'addEventListener' : 'removeEventListener';
  const opts = { passive: true } as AddEventListenerOptions;
  window[m]('pointermove', onPointerMove as EventListener, opts);
  window[m]('pointerdown', onPointerMove as EventListener, opts);
  window[m]('pointerup', onPointerEnd as EventListener, opts);
  window[m]('pointercancel', onPointerEnd as EventListener, opts);
  window[m]('pointerout', onPointerOut as EventListener, opts);
  if (!want) pointer = null;
}

function start() {
  if (started || !hasDOM()) return;
  started = true;
  hour = localHour();
  mq = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
  reduced = !!mq?.matches;
  mq?.addEventListener?.('change', onReducedChange);
  bindPointer();
  window.addEventListener('scroll', onScroll, { passive: true, capture: true });
  window.addEventListener('resize', onResize, { passive: true });
  document.addEventListener('visibilitychange', onVisibility);
  clock = setInterval(() => {
    hour = localHour();
    schedule();
  }, 60_000);
  if (typeof IntersectionObserver !== 'undefined') {
    io = new IntersectionObserver(
      (list) => {
        const sx = window.scrollX;
        const sy = window.scrollY;
        for (const it of list) {
          const e = entries.get(it.target);
          if (!e) continue;
          e.visible = it.isIntersecting;
          const r = it.boundingClientRect;
          e.left = r.left + sx;
          e.top = r.top + sy;
          e.width = r.width;
          e.height = r.height;
          e.dirty = false;
        }
        schedule();
      },
      { rootMargin: '64px' },
    );
    entries.forEach((e) => io!.observe(e.client.el));
  }
  schedule();
}

function stop() {
  if (!started || entries.size > 0 || subscribers.size > 0) return;
  started = false;
  bindPointer();
  mq?.removeEventListener?.('change', onReducedChange);
  window.removeEventListener('scroll', onScroll, { capture: true });
  window.removeEventListener('resize', onResize);
  document.removeEventListener('visibilitychange', onVisibility);
  clearInterval(clock);
  io?.disconnect();
  io = null;
  if (raf) cancelAnimationFrame(raf);
  raf = 0;
  state = null;
  glide = null;
}

// ── internal API for plates ─────────────────────────────────────────────

/** @internal */
export function register(client: LampClient): () => void {
  const e: Entry = { client, visible: typeof IntersectionObserver === 'undefined', dirty: true, left: 0, top: 0, width: 0, height: 0 };
  entries.set(client.el, e);
  start();
  io?.observe(client.el);
  schedule();
  return () => {
    io?.unobserve(client.el);
    entries.delete(client.el);
    stop();
  };
}

/** @internal Tell the lamp a plate changed size or needs relighting. */
export function invalidate(el: Element) {
  const e = entries.get(el);
  if (e) e.dirty = true;
  schedule();
}

/** @internal */
export function isStill(): boolean {
  if (started) return reduced;
  return hasDOM() && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
}

// ── public API ──────────────────────────────────────────────────────────

/**
 * The current light, or null before the lamp has run (and always on the
 * server). The same object is returned until the light changes.
 */
export function getLamp(): LampState | null {
  return state;
}

/**
 * Be told whenever the light moves. Starts the lamp if nothing else has.
 * Returns an unsubscribe function.
 */
export function subscribeLamp(fn: (s: LampState) => void): () => void {
  subscribers.add(fn);
  start();
  if (state) fn(state);
  return () => {
    subscribers.delete(fn);
    stop();
  };
}

/**
 * Hold the light at a viewport position, overriding pointer, tilt and sun.
 * Pass null to let go. Useful for scripted demos and tests.
 */
export function setLamp(pos: { x: number; y: number } | null): void {
  manual = pos ? { x: pos.x, y: pos.y } : null;
  schedule();
}

/**
 * Let the phone's tilt move the light. Call it from a user gesture such as a
 * tap: iOS only asks for motion permission in response to one. Does nothing
 * useful on devices without an orientation sensor, and is ignored while the
 * visitor prefers reduced motion.
 */
export async function requestMotionLight(): Promise<MotionPermission> {
  if (!hasDOM() || typeof DeviceOrientationEvent === 'undefined') return 'unsupported';
  const DOE = DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<'granted' | 'denied'> };
  if (typeof DOE.requestPermission === 'function') {
    try {
      if ((await DOE.requestPermission()) !== 'granted') return 'denied';
    } catch {
      return 'denied';
    }
  }
  if (!motionListening) {
    motionListening = true;
    window.addEventListener('deviceorientation', onOrientation, { passive: true });
  }
  return 'granted';
}

/** Stop following the phone's tilt. */
export function stopMotionLight(): void {
  if (!hasDOM()) return;
  motionListening = false;
  motion = null;
  window.removeEventListener('deviceorientation', onOrientation);
  schedule();
}
