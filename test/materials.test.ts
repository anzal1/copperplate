import { describe, expect, it } from 'vitest';
import { MATERIALS, resolveMaterial, toneMatrix } from '../src/materials';
import { parseColor, toHex } from '../src/color';

// The matrix the original prototype used for copper, written out by hand.
const PROTOTYPE_COPPER = [
  0.2126 * 0.772, 0.7152 * 0.772, 0.0722 * 0.772, 0, 0.169,
  0.2126 * 0.682, 0.7152 * 0.682, 0.0722 * 0.682, 0, 0.09,
  0.2126 * 0.557, 0.7152 * 0.557, 0.0722 * 0.557, 0, 0.051,
  0, 0, 0, 1, 0,
];

/** Apply a 4x5 colour matrix to an opaque sRGB colour. */
function apply(m: number[], [r, g, b]: readonly number[]) {
  return [0, 1, 2].map((row) => m[row * 5] * r + m[row * 5 + 1] * g + m[row * 5 + 2] * b + m[row * 5 + 4]);
}

describe('toneMatrix', () => {
  it('reproduces the prototype copper matrix', () => {
    const m = toneMatrix(MATERIALS.copper.shadow, MATERIALS.copper.highlight);
    expect(m).toHaveLength(20);
    m.forEach((v, i) => expect(v).toBeCloseTo(PROTOTYPE_COPPER[i], 2));
  });

  it.each(Object.keys(MATERIALS) as (keyof typeof MATERIALS)[])('maps black to shadow and white to highlight for %s', (name) => {
    const { shadow, highlight } = MATERIALS[name];
    const m = toneMatrix(shadow, highlight);
    const black = apply(m, [0, 0, 0]);
    const white = apply(m, [1, 1, 1]);
    parseColor(shadow).forEach((v, i) => expect(black[i]).toBeCloseTo(v, 3));
    parseColor(highlight).forEach((v, i) => expect(white[i]).toBeCloseTo(v, 3));
  });

  it('keeps alpha untouched', () => {
    expect(toneMatrix('#000', '#fff').slice(15)).toEqual([0, 0, 0, 1, 0]);
  });

  it('is monotonic in luminance: brighter input gives brighter output', () => {
    const m = toneMatrix(MATERIALS.gold.shadow, MATERIALS.gold.highlight);
    const dark = apply(m, [0.2, 0.2, 0.2]);
    const light = apply(m, [0.8, 0.8, 0.8]);
    dark.forEach((v, i) => expect(light[i]).toBeGreaterThan(v));
  });
});

describe('resolveMaterial', () => {
  it('defaults to copper', () => {
    expect(resolveMaterial(undefined)).toEqual(MATERIALS.copper);
  });
  it('returns a copy of a preset', () => {
    const m = resolveMaterial('steel');
    expect(m).toEqual(MATERIALS.steel);
    expect(m).not.toBe(MATERIALS.steel);
  });
  it('normalises custom colours to hex', () => {
    expect(resolveMaterial({ shadow: '#123', highlight: 'rgb(255, 128, 0)', sheen: 'rgb(100% 100% 100%)' })).toEqual({
      shadow: '#112233',
      highlight: '#ff8000',
      sheen: '#ffffff',
    });
  });
  it('rejects unknown presets and unparseable colours', () => {
    expect(() => resolveMaterial('tin' as never)).toThrow(/unknown material/);
    expect(() => resolveMaterial({ shadow: 'red', highlight: '#fff', sheen: '#fff' })).toThrow(/cannot parse/);
  });
});

describe('colour helpers', () => {
  it('round-trips hex', () => {
    for (const hex of ['#000000', '#ffffff', '#2b170d', '#efc59b']) expect(toHex(parseColor(hex))).toBe(hex);
  });
});
