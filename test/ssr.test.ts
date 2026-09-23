import { describe, expect, it } from 'vitest';

describe('server rendering', () => {
  it('imports without a DOM and reports no lamp', async () => {
    expect(typeof window).toBe('undefined');
    const mod = await import('../src/index');
    expect(mod.getLamp()).toBeNull();
    expect(typeof mod.engrave).toBe('function');
    await expect(mod.requestMotionLight()).resolves.toBe('unsupported');
    expect(() => mod.engrave('#x', { src: 'a', alt: '' })).toThrow(/needs a DOM/);
  });
  it('imports the React entry without a DOM', async () => {
    const mod = await import('../src/react');
    expect(typeof mod.Engraving).toBe('object');
    expect(typeof mod.useLamp).toBe('function');
  });
});
