import { describe, expect, it } from 'vitest';
import { DEFAULTS, fitRect, normalizeOptions, parsePosition } from '../src/options';
import { MATERIALS } from '../src/materials';
import { surfaceSize } from '../src/engrave';

describe('normalizeOptions', () => {
  it('fills in defaults', () => {
    const o = normalizeOptions({ src: 'a.jpg', alt: 'A plate' });
    expect(o).toEqual({
      src: 'a.jpg',
      alt: 'A plate',
      material: MATERIALS.copper,
      relief: DEFAULTS.relief,
      shine: DEFAULTS.shine,
      sharpness: DEFAULTS.sharpness,
      fit: 'cover',
      position: { x: 0.5, y: 0.5 },
      plateMark: true,
      lightHeight: DEFAULTS.lightHeight,
      static: false,
      resolution: DEFAULTS.resolution,
    });
  });
  it('clamps numbers and ignores junk', () => {
    const o = normalizeOptions({ src: 'a.jpg', alt: '', relief: 999, shine: -1, sharpness: NaN, lightHeight: 0, resolution: 10 });
    expect(o.relief).toBe(20);
    expect(o.shine).toBe(0);
    expect(o.sharpness).toBe(DEFAULTS.sharpness);
    expect(o.lightHeight).toBe(0.05);
    expect(o.resolution).toBe(64);
  });
  it('accepts numeric strings, as from a range input', () => {
    expect(normalizeOptions({ src: 'a', alt: '', relief: '5.5' as unknown as number }).relief).toBe(5.5);
  });
  it('treats a missing alt as decorative and unknown fit as cover', () => {
    const o = normalizeOptions({ src: 'a', fit: 'fill' } as never);
    expect(o.alt).toBe('');
    expect(o.fit).toBe('cover');
  });
  it('requires src', () => {
    expect(() => normalizeOptions({ src: '', alt: '' })).toThrow(/src/);
    expect(() => normalizeOptions(undefined as never)).toThrow(/src/);
  });
  it('resolves material presets and custom colours', () => {
    expect(normalizeOptions({ src: 'a', alt: '', material: 'gold' }).material).toEqual(MATERIALS.gold);
    expect(normalizeOptions({ src: 'a', alt: '', material: { shadow: '#000', highlight: '#fff', sheen: '#fff' } }).material.highlight).toBe('#ffffff');
  });
});

describe('parsePosition', () => {
  it.each([
    [undefined, 0.5, 0.5],
    ['center', 0.5, 0.5],
    ['left', 0, 0.5],
    ['top', 0.5, 0],
    ['right bottom', 1, 1],
    ['top left', 0, 0],
    ['30% 70%', 0.3, 0.7],
    ['25%', 0.25, 0.5],
    ['left 20%', 0, 0.2],
    ['xMinYMax', 0, 1],
    ['xMaxYMid', 1, 0.5],
  ])('%s', (input, x, y) => {
    expect(parsePosition(input as string | undefined)).toEqual({ x, y });
  });
  it('clamps fractions', () => {
    expect(parsePosition({ x: -1, y: 2 })).toEqual({ x: 0, y: 1 });
  });
});

describe('fitRect', () => {
  it('covers a portrait box with a landscape image, cropping the sides', () => {
    const r = fitRect(400, 500, 1000, 500, 'cover', { x: 0.5, y: 0.5 });
    expect(r.height).toBe(500);
    expect(r.width).toBe(1000);
    expect(r.x).toBe(-300);
    expect(r.y).toBe(0);
  });
  it('moves the crop with the focal point', () => {
    expect(fitRect(400, 500, 1000, 500, 'cover', { x: 0, y: 0.5 }).x).toBe(0);
    expect(fitRect(400, 500, 1000, 500, 'cover', { x: 1, y: 0.5 }).x).toBe(-600);
  });
  it('contains, letterboxing along the short side', () => {
    const r = fitRect(400, 500, 1000, 500, 'contain', { x: 0.5, y: 0.5 });
    expect(r).toEqual({ x: 0, y: 150, width: 400, height: 200 });
  });
  it('falls back to the box when sizes are unknown', () => {
    expect(fitRect(400, 500, 0, 0, 'cover', { x: 0.5, y: 0.5 })).toEqual({ x: 0, y: 0, width: 400, height: 500 });
  });
});

describe('surfaceSize', () => {
  it('leaves small plates alone', () => {
    expect(surfaceSize(300, 200, 2, 800)).toEqual({ width: 300, height: 200, scale: 1 });
  });
  it('caps the longest side in device pixels', () => {
    const s = surfaceSize(800, 400, 2, 800);
    expect(s.scale).toBe(0.5);
    expect(s.width * 2).toBe(800);
  });
});
