/** A colour as three sRGB channels in the range 0 to 1. */
export type RGB = readonly [number, number, number];

const clamp01 = (n: number) => (n < 0 ? 0 : n > 1 ? 1 : n);

/**
 * Parse a CSS colour written as #rgb, #rrggbb or rgb(r g b) / rgb(r, g, b).
 * Named colours are not supported, to keep the core free of lookup tables.
 */
export function parseColor(input: string): RGB {
  const s = input.trim().toLowerCase();
  let m = /^#([0-9a-f]{3})$/.exec(s);
  if (m) {
    const [r, g, b] = m[1].split('').map((c) => parseInt(c + c, 16) / 255);
    return [r, g, b];
  }
  m = /^#([0-9a-f]{6})$/.exec(s);
  if (m) {
    const n = parseInt(m[1], 16);
    return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
  }
  m = /^rgba?\(\s*([\d.]+%?)[\s,]+([\d.]+%?)[\s,]+([\d.]+%?)(?:[\s,/]+[\d.]+%?)?\s*\)$/.exec(s);
  if (m) {
    const ch = (v: string) => clamp01(v.endsWith('%') ? parseFloat(v) / 100 : parseFloat(v) / 255);
    return [ch(m[1]), ch(m[2]), ch(m[3])];
  }
  throw new TypeError(`copperplate: cannot parse colour "${input}". Use #rgb, #rrggbb or rgb().`);
}

export function toHex(c: RGB): string {
  return (
    '#' +
    c
      .map((v) => Math.round(clamp01(v) * 255).toString(16).padStart(2, '0'))
      .join('')
  );
}

export function mix(a: RGB, b: RGB, t: number): RGB {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
}
