/**
 * Let any element catch the lamp.
 *
 * Plates run an SVG filter; most of a UI does not need one. A button, a
 * switch or a badge only needs to know where the light is relative to
 * itself, so its CSS can place a highlight there. `illuminate` registers the
 * element with the same lamp the plates use (one set of listeners, one frame,
 * only elements near the viewport) and writes, on the element itself:
 *
 *   --cp-lx, --cp-ly   the light, in px from the element's top left
 *   --cp-lu, --cp-lv   the same, as fractions of its width and height
 *   --cp-w,  --cp-h    the element's size in px
 *   --cp-light         the light's colour, warmer at dawn and dusk
 *
 * The variables are written per element, never on the root, so moving the
 * light restyles only the surfaces that are lit.
 */
import { invalidate, register } from './lamp.js';

export function illuminate(el: HTMLElement | SVGElement): () => void {
  const style = el.style;
  let last = '';
  return register({
    el,
    light(x, y, color, rect) {
      const lx = x - rect.left;
      const ly = y - rect.top;
      const key = `${lx | 0},${ly | 0},${rect.width | 0},${rect.height | 0},${color}`;
      if (key === last) return;
      last = key;
      style.setProperty('--cp-lx', `${lx.toFixed(1)}px`);
      style.setProperty('--cp-ly', `${ly.toFixed(1)}px`);
      style.setProperty('--cp-lu', (lx / (rect.width || 1)).toFixed(4));
      style.setProperty('--cp-lv', (ly / (rect.height || 1)).toFixed(4));
      style.setProperty('--cp-w', `${rect.width.toFixed(1)}px`);
      style.setProperty('--cp-h', `${rect.height.toFixed(1)}px`);
      style.setProperty('--cp-light', color);
    },
  });
}

/** Tell the lamp an illuminated element moved or changed size. */
export function relight(el: Element): void {
  invalidate(el);
}

/**
 * Be told where the lamp is relative to an element, every frame it moves,
 * while the element is near the viewport. For SVG relief of your own: map
 * the position into your viewBox and move an fePointLight there.
 */
export function followLamp(
  el: Element,
  fn: (x: number, y: number, rect: { width: number; height: number }, color: string) => void,
): () => void {
  return register({
    el,
    light(x, y, color, rect) {
      fn(x - rect.left, y - rect.top, rect, color);
    },
  });
}
