export { engrave, type Engraving } from './engrave.js';
export { getLamp, subscribeLamp, setLamp, requestMotionLight, stopMotionLight, type LampState, type LampSource, type MotionPermission } from './lamp.js';
export { MATERIALS, resolveMaterial, toneMatrix, type Material, type MaterialName, type MaterialColors } from './materials.js';
export { normalizeOptions, parsePosition, fitRect, DEFAULTS, type EngraveOptions, type NormalizedOptions, type Fit, type Position } from './options.js';
export { sunPosition, lightColor, tiltToLight } from './sun.js';
export { illuminate, relight, followLamp } from './surface.js';
