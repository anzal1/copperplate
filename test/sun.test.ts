import { describe, expect, it } from 'vitest';
import { lightColor, sunPosition, tiltToLight, tintSheen } from '../src/sun';
import { parseColor } from '../src/color';

const warmth = (hex: string) => {
  const [r, , b] = parseColor(hex);
  return r - b;
};

describe('sunPosition', () => {
  it('rises low in the east', () => {
    const p = sunPosition(6);
    expect(p.x).toBeCloseTo(0.1);
    expect(p.y).toBeCloseTo(0.55);
  });
  it('is high and central at noon', () => {
    const p = sunPosition(12);
    expect(p.x).toBeCloseTo(0.5);
    expect(p.y).toBeCloseTo(0.1);
  });
  it('sets low in the west', () => {
    const p = sunPosition(18);
    expect(p.x).toBeCloseTo(0.9);
    expect(p.y).toBeCloseTo(0.55);
  });
  it('moves steadily west through the day and is highest at noon', () => {
    let lastX = -1;
    for (let h = 6; h <= 18; h += 0.5) {
      const p = sunPosition(h);
      expect(p.x).toBeGreaterThan(lastX);
      lastX = p.x;
      expect(p.y).toBeGreaterThanOrEqual(sunPosition(12).y - 1e-9);
    }
  });
  it('rests at the horizon overnight and wraps hours', () => {
    expect(sunPosition(3)).toEqual(sunPosition(6));
    expect(sunPosition(22)).toEqual(sunPosition(18));
    expect(sunPosition(36)).toEqual(sunPosition(12));
    expect(sunPosition(-12)).toEqual(sunPosition(12));
  });
  it('stays inside the viewport', () => {
    for (let h = 0; h < 24; h += 0.25) {
      const p = sunPosition(h);
      expect(p.x).toBeGreaterThanOrEqual(0);
      expect(p.x).toBeLessThanOrEqual(1);
      expect(p.y).toBeGreaterThanOrEqual(0);
      expect(p.y).toBeLessThanOrEqual(1);
    }
  });
});

describe('lightColor', () => {
  it('is the prototype warm white at noon', () => {
    expect(lightColor(12)).toBe('#fff4e6');
  });
  it('is warmer at dusk than at noon, and only slightly', () => {
    expect(warmth(lightColor(18.4))).toBeGreaterThan(warmth(lightColor(12)));
    const [, g, b] = parseColor(lightColor(18.4));
    expect(g).toBeGreaterThan(0.8);
    expect(b).toBeGreaterThan(0.6);
  });
  it('is warmer at dusk than at dawn', () => {
    expect(warmth(lightColor(18.4))).toBeGreaterThan(warmth(lightColor(6.4)));
  });
  it('is cooler at midnight than at noon', () => {
    expect(warmth(lightColor(0))).toBeLessThan(warmth(lightColor(12)));
  });
});

describe('tintSheen', () => {
  it('leaves the sheen alone under the noon light', () => {
    expect(tintSheen('#fff0da', '#fff4e6')).toBe('#fff0da');
  });
  it('warms the sheen under a dusk light', () => {
    expect(warmth(tintSheen('#ffffff', lightColor(18.4)))).toBeGreaterThan(0);
  });
});

describe('tiltToLight', () => {
  it('centres the light at a resting angle', () => {
    expect(tiltToLight(40, 0)).toEqual({ x: 0.5, y: 0.5 });
  });
  it('stays within the viewport at extreme tilts', () => {
    const a = tiltToLight(180, 90);
    const b = tiltToLight(-180, -90);
    expect([a.x, a.y, b.x, b.y].every((v) => v >= 0 && v <= 1)).toBe(true);
  });
});
