import { resolveMaterial, type Material, type MaterialColors } from './materials.js';

export type Fit = 'cover' | 'contain';

/**
 * Focal point of the image inside the plate. Accepts CSS object-position
 * style keywords and percentages ("center", "left top", "30% 60%"), SVG
 * alignment names ("xMinYMid"), or fractions ({ x: 0.3, y: 0.6 }).
 */
export type Position = string | { x: number; y: number };

export interface EngraveOptions {
  /** Image URL. Cross-origin images work; the filter never reads pixels in script. */
  src: string;
  /** Accessible description. Pass an empty string for a purely decorative plate. */
  alt: string;
  /** A preset name or custom colours. Default "copper". */
  material?: Material;
  /** Depth of the relief. Default 3.2. */
  relief?: number;
  /** Strength of the moving glint, as a multiple of the default. Default 1. */
  shine?: number;
  /** Specular exponent: higher is a tighter, harder glint. Default 26. */
  sharpness?: number;
  /** How the image fills the plate. Default "cover". */
  fit?: Fit;
  /** Focal point used when cropping or letterboxing. Default "center". */
  position?: Position;
  /** Draw the pressed plate-mark frame around the image. Default true. */
  plateMark?: boolean;
  /** Height of the light above the plate, as a multiple of the plate's width. Default 0.55. */
  lightHeight?: number;
  /** Never follow the light; lit once from where the sun is. Default false. */
  static?: boolean;
  /** Longest side of the filter surface, in device pixels. Default 800. */
  resolution?: number;
}

export interface NormalizedOptions {
  src: string;
  alt: string;
  material: MaterialColors;
  relief: number;
  shine: number;
  sharpness: number;
  fit: Fit;
  position: { x: number; y: number };
  plateMark: boolean;
  lightHeight: number;
  static: boolean;
  resolution: number;
}

export const DEFAULTS = {
  material: 'copper',
  relief: 3.2,
  shine: 1,
  sharpness: 26,
  fit: 'cover',
  position: 'center',
  plateMark: true,
  lightHeight: 0.55,
  static: false,
  resolution: 800,
} as const;

function num(v: unknown, fallback: number, lo: number, hi: number): number {
  const n = typeof v === 'number' ? v : typeof v === 'string' && v.trim() !== '' ? Number(v) : NaN;
  if (!Number.isFinite(n)) return fallback;
  return n < lo ? lo : n > hi ? hi : n;
}

const clamp01 = (n: number) => (n < 0 ? 0 : n > 1 ? 1 : n);
const X_WORDS: Record<string, number> = { left: 0, center: 0.5, right: 1 };
const Y_WORDS: Record<string, number> = { top: 0, center: 0.5, bottom: 1 };
const ALIGN: Record<string, number> = { min: 0, mid: 0.5, max: 1 };

/** Parse a focal point into fractions of the free space, 0 to 1 on each axis. */
export function parsePosition(p: Position | undefined): { x: number; y: number } {
  if (p === undefined || p === null) return { x: 0.5, y: 0.5 };
  if (typeof p === 'object') {
    return { x: clamp01(Number.isFinite(p.x) ? p.x : 0.5), y: clamp01(Number.isFinite(p.y) ? p.y : 0.5) };
  }
  const s = p.trim().toLowerCase();
  const svg = /^x(min|mid|max)y(min|mid|max)$/.exec(s);
  if (svg) return { x: ALIGN[svg[1]], y: ALIGN[svg[2]] };

  const tokens = s.split(/\s+/).filter(Boolean);
  let x: number | undefined;
  let y: number | undefined;
  const pct = (t: string) => (/^-?[\d.]+%$/.test(t) ? clamp01(parseFloat(t) / 100) : undefined);
  // Keywords can come in either order ("top left"); percentages are x then y.
  for (const t of tokens) {
    if (t in X_WORDS && t !== 'center' && x === undefined) x = X_WORDS[t];
    else if (t in Y_WORDS && t !== 'center' && y === undefined) y = Y_WORDS[t];
  }
  const numeric = tokens.map(pct);
  if (numeric[0] !== undefined && x === undefined) x = numeric[0];
  if (numeric[1] !== undefined && y === undefined) y = numeric[1];
  if (tokens.length === 1 && numeric[0] !== undefined) y = 0.5;
  return { x: x ?? 0.5, y: y ?? 0.5 };
}

/** Fill in defaults, clamp numbers to sane ranges and resolve the material. */
export function normalizeOptions(o: EngraveOptions): NormalizedOptions {
  if (!o || typeof o.src !== 'string' || o.src.trim() === '') {
    throw new TypeError('copperplate: `src` is required.');
  }
  return {
    src: o.src,
    alt: typeof o.alt === 'string' ? o.alt : '',
    material: resolveMaterial(o.material ?? DEFAULTS.material),
    relief: num(o.relief, DEFAULTS.relief, 0, 20),
    shine: num(o.shine, DEFAULTS.shine, 0, 4),
    sharpness: num(o.sharpness, DEFAULTS.sharpness, 1, 128),
    fit: o.fit === 'contain' ? 'contain' : 'cover',
    position: parsePosition(o.position ?? DEFAULTS.position),
    plateMark: o.plateMark ?? DEFAULTS.plateMark,
    lightHeight: num(o.lightHeight, DEFAULTS.lightHeight, 0.05, 5),
    static: Boolean(o.static),
    resolution: num(o.resolution, DEFAULTS.resolution, 64, 4096),
  };
}

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Where to draw an image of natural size imgW x imgH inside a box so that it
 * covers or fits the box, with the free space split according to `pos`.
 */
export function fitRect(boxW: number, boxH: number, imgW: number, imgH: number, fit: Fit, pos: { x: number; y: number }): Rect {
  if (!(imgW > 0 && imgH > 0 && boxW > 0 && boxH > 0)) return { x: 0, y: 0, width: boxW, height: boxH };
  const scale = fit === 'cover' ? Math.max(boxW / imgW, boxH / imgH) : Math.min(boxW / imgW, boxH / imgH);
  const width = imgW * scale;
  const height = imgH * scale;
  // `+ 0` turns a negative zero into a plain one.
  return { x: (boxW - width) * pos.x + 0, y: (boxH - height) * pos.y + 0, width, height };
}
