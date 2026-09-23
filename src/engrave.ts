import { invalidate, isStill, register, type ClientRect } from './lamp.js';
import { toneMatrix } from './materials.js';
import { fitRect, normalizeOptions, type EngraveOptions, type NormalizedOptions } from './options.js';
import { installStyles } from './styles.js';
import { lightColor, localHour, sunPosition, tintSheen } from './sun.js';

export interface Engraving {
  /** Change any options. Only what changed is touched; the filter is never rebuilt. */
  update(options: Partial<EngraveOptions>): void;
  /** Remove the plate and stop listening. */
  destroy(): void;
}

const SVG = 'http://www.w3.org/2000/svg';
let counter = 0;

// Fixed parts of the look, taken from the original plate.
const DIFFUSE_CONSTANT = 1.05;
const SPECULAR_CONSTANT = 1.25;
const SPECULAR_DEPTH = 1.4; // the glint reads the relief a little deeper than the shading does
const SPECULAR_MIX = 0.55;
const HEIGHT_BLUR = 0.5;
const KEY_AZIMUTH = 235; // the fixed raking light that gives the relief its shading
const KEY_ELEVATION = 58;

function el<K extends keyof SVGElementTagNameMap>(doc: Document, tag: K, attrs: Record<string, string | number>, parent?: Element) {
  const node = doc.createElementNS(SVG, tag);
  for (const k in attrs) node.setAttribute(k, String(attrs[k]));
  parent?.appendChild(node);
  return node;
}

/**
 * The size of the filter surface. Filters cost roughly one unit per device
 * pixel, so a large plate on a dense screen is drawn at `resolution` device
 * pixels along its longest side and scaled up to fill its box.
 */
export function surfaceSize(cssW: number, cssH: number, dpr: number, resolution: number) {
  const longest = Math.max(cssW, cssH) * dpr;
  const scale = longest > resolution ? resolution / longest : 1;
  return { width: cssW * scale, height: cssH * scale, scale };
}

/**
 * Render an image into `target` as an engraved metal plate lit by the page's
 * shared lamp. `target` is an element or a selector; the plate fills it.
 */
export function engrave(target: HTMLElement | string, options: EngraveOptions): Engraving {
  if (typeof document === 'undefined') throw new Error('copperplate: engrave() needs a DOM. Call it in the browser, for example in an effect.');
  const host = typeof target === 'string' ? document.querySelector<HTMLElement>(target) : target;
  if (!host) throw new Error(`copperplate: no element matches "${String(target)}".`);
  const doc = host.ownerDocument;
  installStyles(doc);

  let o: NormalizedOptions = normalizeOptions(options);
  let raw: EngraveOptions = { ...options };
  const id = `copperplate-${++counter}`;

  // ── build once ──
  const wrap = doc.createElement('div');
  wrap.className = 'copperplate';
  const svg = el(doc, 'svg', { 'aria-hidden': 'true', focusable: 'false', preserveAspectRatio: 'none' }, wrap);
  const defs = el(doc, 'defs', {}, svg);
  const filter = el(doc, 'filter', { id, filterUnits: 'userSpaceOnUse', 'color-interpolation-filters': 'sRGB' }, defs);
  const tone = el(doc, 'feColorMatrix', { in: 'SourceGraphic', type: 'matrix', result: 'tone' }, filter);
  el(doc, 'feColorMatrix', { in: 'SourceGraphic', type: 'luminanceToAlpha', result: 'height' }, filter);
  el(doc, 'feGaussianBlur', { in: 'height', stdDeviation: HEIGHT_BLUR, result: 'relief' }, filter);
  const diffuse = el(doc, 'feDiffuseLighting', { in: 'relief', diffuseConstant: DIFFUSE_CONSTANT, result: 'shade' }, filter);
  el(doc, 'feDistantLight', { azimuth: KEY_AZIMUTH, elevation: KEY_ELEVATION }, diffuse);
  const specular = el(doc, 'feSpecularLighting', { in: 'relief', specularConstant: SPECULAR_CONSTANT, result: 'glint' }, filter);
  const point = el(doc, 'fePointLight', { x: 0, y: 0, z: 100 }, specular);
  el(doc, 'feComposite', { in: 'tone', in2: 'shade', operator: 'arithmetic', k1: 1, k2: 0, k3: 0, k4: 0, result: 'lit' }, filter);
  const mixGlint = el(doc, 'feComposite', { in: 'glint', in2: 'lit', operator: 'arithmetic', k1: 0, k3: 1, k4: 0 }, filter);
  const image = el(doc, 'image', { filter: `url(#${id})`, preserveAspectRatio: 'xMidYMid slice' }, svg);

  // ── state ──
  let natural: { w: number; h: number } | null = null;
  let box = { w: 0, h: 0 }; // content box, CSS px
  let surf = { width: 0, height: 0, scale: 1 };
  let color = '';
  let lastX = NaN;
  let lastY = NaN;
  let loadToken = 0;
  let unregister: (() => void) | null = null;

  function setAttr(node: Element, name: string, value: string | number) {
    const v = String(value);
    if (node.getAttribute(name) !== v) node.setAttribute(name, v);
  }

  function applyMaterial() {
    setAttr(tone, 'values', toneMatrix(o.material.shadow, o.material.highlight).join(' '));
    color = ''; // force the sheen colour to be re-tinted on the next light
  }
  function applyRelief() {
    setAttr(diffuse, 'surfaceScale', o.relief);
    setAttr(specular, 'surfaceScale', Math.round(o.relief * SPECULAR_DEPTH * 1000) / 1000);
  }
  function applyShine() {
    setAttr(mixGlint, 'k2', Math.round(SPECULAR_MIX * o.shine * 1000) / 1000);
    setAttr(specular, 'specularExponent', o.sharpness);
  }
  function applyAccessibility() {
    if (o.alt) {
      wrap.setAttribute('role', 'img');
      wrap.setAttribute('aria-label', o.alt);
      wrap.removeAttribute('aria-hidden');
    } else {
      wrap.removeAttribute('role');
      wrap.removeAttribute('aria-label');
      wrap.setAttribute('aria-hidden', 'true');
    }
  }
  function applyMark() {
    if (o.plateMark) wrap.setAttribute('data-plate-mark', '');
    else wrap.removeAttribute('data-plate-mark');
  }
  function applyColor(c: string) {
    if (c === color) return;
    color = c;
    setAttr(diffuse, 'lighting-color', c);
    setAttr(specular, 'lighting-color', tintSheen(o.material.sheen, c));
  }

  /** Lay the image and filter out for the current box and surface size. */
  function layout() {
    const { width: W, height: H, scale } = surf;
    if (!W || !H) return;
    setAttr(svg, 'viewBox', `0 0 ${W} ${H}`);
    if (scale < 1) {
      svg.style.width = `${W}px`;
      svg.style.height = `${H}px`;
      svg.style.transformOrigin = '0 0';
      svg.style.transform = `scale(${1 / scale})`;
      svg.style.willChange = 'transform';
    } else {
      svg.style.removeProperty('width');
      svg.style.removeProperty('height');
      svg.style.removeProperty('transform');
      svg.style.removeProperty('transform-origin');
      svg.style.removeProperty('will-change');
    }
    let r = { x: 0, y: 0, width: W, height: H };
    if (natural) {
      r = fitRect(W, H, natural.w, natural.h, o.fit, o.position);
      setAttr(image, 'preserveAspectRatio', 'none');
    } else {
      setAttr(image, 'preserveAspectRatio', o.fit === 'contain' ? 'xMidYMid meet' : 'xMidYMid slice');
    }
    setAttr(image, 'x', r.x);
    setAttr(image, 'y', r.y);
    setAttr(image, 'width', r.width);
    setAttr(image, 'height', r.height);
    // Filter only what is visible: the image, clipped to the plate.
    const fx = Math.max(0, r.x);
    const fy = Math.max(0, r.y);
    setAttr(filter, 'x', fx);
    setAttr(filter, 'y', fy);
    setAttr(filter, 'width', Math.min(W, r.x + r.width) - fx);
    setAttr(filter, 'height', Math.min(H, r.y + r.height) - fy);
    setAttr(point, 'z', Math.round(o.lightHeight * W * 100) / 100);
    lastX = lastY = NaN;
    if (o.static || isStill()) lightStill();
    else if (unregister) invalidate(svg);
  }

  /** Put the glint at a viewport position, given where the plate is. */
  function light(x: number, y: number, c: string, rect: ClientRect) {
    applyColor(c);
    const px = Math.round(((x - rect.left) / rect.width) * surf.width * 10) / 10;
    const py = Math.round(((y - rect.top) / rect.height) * surf.height * 10) / 10;
    if (px !== lastX) point.setAttribute('x', String((lastX = px)));
    if (py !== lastY) point.setAttribute('y', String((lastY = py)));
  }

  /** A plate that does not follow the light is lit from where the sun is, relative to itself. */
  function lightStill() {
    const h = localHour();
    const s = sunPosition(h);
    light(s.x, s.y, lightColor(h), { left: 0, top: 0, width: 1, height: 1 });
  }

  function follow() {
    const want = !o.static;
    if (want && !unregister) unregister = register({ el: svg, light });
    else if (!want && unregister) {
      unregister();
      unregister = null;
    }
    if (!want) lightStill();
  }

  function measureBox() {
    const cs = getComputedStyle(wrap);
    const px = (v: string) => parseFloat(v) || 0;
    const w = wrap.clientWidth - px(cs.paddingLeft) - px(cs.paddingRight);
    const h = wrap.clientHeight - px(cs.paddingTop) - px(cs.paddingBottom);
    return { w: Math.max(0, w), h: Math.max(0, h) };
  }

  function resize(w: number, h: number) {
    box = { w, h };
    const next = surfaceSize(w, h, window.devicePixelRatio || 1, o.resolution);
    if (next.width === surf.width && next.height === surf.height) return;
    surf = next;
    layout();
  }

  const ro =
    typeof ResizeObserver !== 'undefined'
      ? new ResizeObserver((list) => {
          const e = list[list.length - 1];
          const s = e.contentBoxSize?.[0];
          if (s) resize(s.inlineSize, s.blockSize);
          else resize(e.contentRect.width, e.contentRect.height);
        })
      : null;

  function loadNatural() {
    const token = ++loadToken;
    natural = null;
    const probe = new Image();
    probe.decoding = 'async';
    probe.onload = () => {
      if (token !== loadToken || !probe.naturalWidth) return;
      natural = { w: probe.naturalWidth, h: probe.naturalHeight };
      // Lets a plate in an auto-height box take the image's shape.
      wrap.style.aspectRatio = `${natural.w} / ${natural.h}`;
      layout();
    };
    probe.src = o.src;
    image.setAttribute('href', o.src);
  }

  // ── first render ──
  applyMaterial();
  applyRelief();
  applyShine();
  applyAccessibility();
  applyMark();
  host.appendChild(wrap);
  loadNatural();
  const first = measureBox();
  resize(first.w, first.h);
  ro?.observe(wrap);
  follow();

  return {
    update(next) {
      raw = { ...raw, ...next };
      const prev = o;
      o = normalizeOptions(raw);
      if (o.src !== prev.src) loadNatural();
      if (o.material.shadow !== prev.material.shadow || o.material.highlight !== prev.material.highlight || o.material.sheen !== prev.material.sheen) applyMaterial();
      if (o.relief !== prev.relief) applyRelief();
      if (o.shine !== prev.shine || o.sharpness !== prev.sharpness) applyShine();
      if (o.alt !== prev.alt) applyAccessibility();
      if (o.plateMark !== prev.plateMark) applyMark(); // the ResizeObserver picks up the new content box
      if (o.resolution !== prev.resolution) {
        surf = { width: 0, height: 0, scale: 1 };
        resize(box.w, box.h);
      } else if (o.fit !== prev.fit || o.position.x !== prev.position.x || o.position.y !== prev.position.y || o.lightHeight !== prev.lightHeight) {
        layout();
      }
      if (o.static !== prev.static) follow();
      else if (color === '') {
        if (o.static || isStill()) lightStill();
        else invalidate(svg);
      }
    },
    destroy() {
      loadToken++;
      ro?.disconnect();
      unregister?.();
      unregister = null;
      wrap.remove();
    },
  };
}
