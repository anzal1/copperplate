import { parseColor, toHex, type RGB } from './color.js';

/** The three colours that define a metal. */
export interface MaterialColors {
  /** Colour of the deepest cut lines. */
  shadow: string;
  /** Colour of the raised, brightest areas. */
  highlight: string;
  /** Colour of the specular glint under a neutral light. */
  sheen: string;
}

export type MaterialName = 'copper' | 'brass' | 'silver' | 'steel' | 'gold' | 'bronze';
export type Material = MaterialName | MaterialColors;

export const MATERIALS: Readonly<Record<MaterialName, Readonly<MaterialColors>>> = {
  copper: { shadow: '#2b170d', highlight: '#efc59b', sheen: '#fff0da' },
  brass: { shadow: '#261c08', highlight: '#e8d49a', sheen: '#fff5d6' },
  silver: { shadow: '#1c1e21', highlight: '#e4e6e8', sheen: '#ffffff' },
  steel: { shadow: '#13171b', highlight: '#b4bec8', sheen: '#eef5ff' },
  gold: { shadow: '#2d1c03', highlight: '#f3d27a', sheen: '#fff2c2' },
  bronze: { shadow: '#20130a', highlight: '#c4955f', sheen: '#ffe4c0' },
};

export function isMaterialName(m: unknown): m is MaterialName {
  return typeof m === 'string' && Object.prototype.hasOwnProperty.call(MATERIALS, m);
}

/** Resolve a preset name or custom colours to a validated set of hex colours. */
export function resolveMaterial(m: Material | undefined): MaterialColors {
  if (m === undefined) return { ...MATERIALS.copper };
  if (typeof m === 'string') {
    if (!isMaterialName(m)) {
      throw new TypeError(`copperplate: unknown material "${m}". Use one of ${Object.keys(MATERIALS).join(', ')}, or { shadow, highlight, sheen }.`);
    }
    return { ...MATERIALS[m] };
  }
  return {
    shadow: toHex(parseColor(m.shadow)),
    highlight: toHex(parseColor(m.highlight)),
    sheen: toHex(parseColor(m.sheen ?? m.highlight)),
  };
}

// Rec. 709 luma weights, the same ones luminanceToAlpha uses.
const LUMA: RGB = [0.2126, 0.7152, 0.0722];
const round = (n: number) => Math.round(n * 10000) / 10000;

/**
 * The feColorMatrix that maps an image's luminance onto a metal: black lands
 * on `shadow`, white on `highlight`, and every grey on the straight line
 * between them. Returns the 20 matrix values, row by row.
 */
export function toneMatrix(shadow: string, highlight: string): number[] {
  const s = parseColor(shadow);
  const h = parseColor(highlight);
  const out: number[] = [];
  for (let c = 0; c < 3; c++) {
    const d = h[c] - s[c];
    out.push(round(LUMA[0] * d), round(LUMA[1] * d), round(LUMA[2] * d), 0, round(s[c]));
  }
  out.push(0, 0, 0, 1, 0);
  return out;
}
