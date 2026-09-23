import { mix, parseColor, toHex } from './color.js';

const clamp = (n: number, lo: number, hi: number) => (n < lo ? lo : n > hi ? hi : n);

/** Local hour as a fraction, e.g. 14.5 for half past two. */
export function localHour(d: Date = new Date()): number {
  return d.getHours() + d.getMinutes() / 60;
}

/**
 * Where the sun sits at a given local hour, as fractions of the viewport:
 * low in the east (left) at six, high in the middle at noon, low in the west
 * (right) at six in the evening. Through the night it rests at the horizon
 * it will rise from or has just set behind.
 */
export function sunPosition(hour: number): { x: number; y: number } {
  const h = ((hour % 24) + 24) % 24;
  const t = clamp((h - 6) / 12, 0, 1);
  return { x: 0.1 + 0.8 * t, y: 0.55 - 0.45 * Math.sin(Math.PI * t) };
}

const NOON = parseColor('#fff4e6');
const DUSK = parseColor('#ffd4a3');
const NIGHT = parseColor('#e9ecf6');

const bell = (h: number, centre: number, width: number) => Math.exp(-((h - centre) ** 2) / (2 * width * width));

/**
 * The colour of the light at a given local hour: a warm white through the
 * day, noticeably warmer around dusk, a little warmer at dawn, and a faint
 * cool cast in the small hours.
 */
export function lightColor(hour: number): string {
  const h = ((hour % 24) + 24) % 24;
  const warmth = Math.max(bell(h, 18.4, 1.3), 0.45 * bell(h, 6.4, 1));
  const fromMidnight = Math.min(h, 24 - h);
  const cool = clamp((3.5 - fromMidnight) / 2, 0, 1);
  return toHex(mix(mix(NOON, DUSK, warmth * 0.8), NIGHT, cool * 0.6));
}

/**
 * The glint colour: the material's sheen, tinted by how far the light has
 * drifted from its noon colour. At noon the sheen comes through unchanged.
 */
export function tintSheen(sheen: string, light: string): string {
  const s = parseColor(sheen);
  const l = parseColor(light);
  return toHex([s[0] * (l[0] / NOON[0]), s[1] * (l[1] / NOON[1]), s[2] * (l[2] / NOON[2])]);
}

/**
 * Map a phone's tilt (DeviceOrientationEvent beta and gamma, in degrees) to
 * a light position as fractions of the viewport. Tilting an edge up brings
 * the glint towards it, as a fixed light over a real plate would. Tuned for
 * a phone held upright in portrait at a comfortable reading angle.
 */
export function tiltToLight(beta: number, gamma: number): { x: number; y: number } {
  return {
    x: clamp(0.5 - (gamma / 45) * 0.5, 0, 1),
    y: clamp(0.5 - ((beta - 40) / 40) * 0.5, 0, 1),
  };
}
