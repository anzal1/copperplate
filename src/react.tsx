import { forwardRef, useEffect, useImperativeHandle, useRef, useSyncExternalStore, type HTMLAttributes } from 'react';
import { engrave, type Engraving as Plate } from './engrave.js';
import { getLamp, subscribeLamp, type LampState } from './lamp.js';
import type { EngraveOptions } from './options.js';

export { requestMotionLight, stopMotionLight, setLamp, getLamp, subscribeLamp } from './lamp.js';
export { MATERIALS } from './materials.js';
export type { EngraveOptions } from './options.js';
export type { LampState } from './lamp.js';
export type { Material, MaterialName, MaterialColors } from './materials.js';

export type EngravingProps = EngraveOptions & Omit<HTMLAttributes<HTMLDivElement>, 'children' | keyof EngraveOptions>;

function split(props: EngravingProps) {
  const { src, alt, material, relief, shine, sharpness, fit, position, plateMark, lightHeight, static: still, resolution, ...rest } = props;
  const opts: EngraveOptions = { src, alt, material, relief, shine, sharpness, fit, position, plateMark, lightHeight, static: still, resolution };
  return { opts, rest };
}

/**
 * An engraved plate. Size it like any block element: give it a width and
 * either a height or an aspect-ratio, or let it take the image's shape.
 * On the server it renders an empty div; the plate appears on mount.
 */
export const Engraving = forwardRef<HTMLDivElement, EngravingProps>(function Engraving(props, ref) {
  const { opts, rest } = split(props);
  const host = useRef<HTMLDivElement>(null);
  const plate = useRef<Plate | null>(null);
  const latest = useRef(opts);
  latest.current = opts;
  useImperativeHandle(ref, () => host.current as HTMLDivElement);

  useEffect(() => {
    if (!host.current) return;
    const p = engrave(host.current, latest.current);
    plate.current = p;
    return () => {
      p.destroy();
      plate.current = null;
    };
  }, []);

  // Every render hands the plate its options; it only touches what changed.
  useEffect(() => {
    plate.current?.update(opts);
  });

  return <div ref={host} {...rest} />;
});

const serverSnapshot = () => null;

/**
 * The page's light, updated every frame it moves. Returns null on the
 * server and before the first frame. Handy for drawing something of your
 * own that should agree with the plates, such as a shadow or a cursor.
 */
export function useLamp(): LampState | null {
  return useSyncExternalStore(subscribeLamp, getLamp, serverSnapshot);
}
