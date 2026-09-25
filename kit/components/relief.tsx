import { useEffect, useId, useRef, type ReactNode } from 'react';
import { followLamp, MATERIALS } from 'copperplate/react';
import { toneMatrix } from 'copperplate';
import { onFirstSight, prefersReducedMotion } from './motion';
import type { Metal } from './utils';

/**
 * Relief: draw in greys, get metal.
 *
 * The drawing's own greys are its height map, white standing proud and dark
 * sunk. The filter tones them to the metal, shades them with a fixed raking
 * light, and puts a glint where the page's lamp is. Seals, hallmarks, coins
 * and engraved type are all drawings inside one of these.
 */

const TONES: Record<Metal, { shadow: string; highlight: string; sheen: string }> = {
  copper: MATERIALS.copper,
  brass: MATERIALS.brass,
  silver: MATERIALS.silver,
  steel: MATERIALS.steel,
  verdigris: { shadow: '#10261c', highlight: '#a9d4bb', sheen: '#eafff2' },
  oxide: { shadow: '#2a0c04', highlight: '#e8a07c', sheen: '#ffe2cf' },
};

export type ReliefProps = {
  /** The drawing's coordinate space. */
  width: number;
  height: number;
  metal?: Metal;
  /** Height of the relief. */
  depth?: number;
  /** Rounds the edges of the drawing before it is lit: higher reads as cast, lower as cut. */
  soft?: number;
  /** Strength of the lamp's glint. */
  shine?: number;
  /** How high the lamp sits over the drawing, in drawing units. Lower is a tighter, brighter glint. */
  lampHeight?: number;
  /**
   * The first time it comes into view, carry a light across it from left to
   * right before handing it to the page's lamp: the moment a plate is first
   * turned to the window.
   */
  sweep?: boolean;
  /** Accessible name. Leave empty for decoration. */
  label?: string;
  className?: string;
  style?: React.CSSProperties;
  children: ReactNode;
};

export function Relief({ width, height, metal = 'copper', depth = 4, soft = 0.7, shine = 1, lampHeight, sweep = false, label, className, style, children }: ReliefProps) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const svg = useRef<SVGSVGElement>(null);
  const spot = useRef<SVGFEPointLightElement>(null);
  const tone = TONES[metal];

  useEffect(() => {
    const el = svg.current;
    if (!el) return;
    const set = (x: number, y: number) => {
      spot.current?.setAttribute('x', x.toFixed(1));
      spot.current?.setAttribute('y', y.toFixed(1));
    };
    let sweeping = false;
    let lamp = { x: width * 0.3, y: height * 0.2 };
    let raf = 0;
    const stop = followLamp(el, (x, y, r) => {
      lamp = { x: (x / (r.width || 1)) * width, y: (y / (r.height || 1)) * height };
      if (!sweeping) set(lamp.x, lamp.y);
    });
    const unsee = sweep && !prefersReducedMotion()
      ? onFirstSight(el, () => {
          sweeping = true;
          const t0 = performance.now();
          const D = 1500;
          const step = (now: number) => {
            const p = Math.min(1, (now - t0) / D);
            const e = p < 0.5 ? 4 * p * p * p : 1 - (-2 * p + 2) ** 3 / 2;
            if (p < 0.82) {
              set(-0.25 * width + e * 1.5 * width, height * (0.05 + 0.1 * Math.sin(Math.PI * e)));
              raf = requestAnimationFrame(step);
            } else {
              // Ease the last stretch onto wherever the real lamp is.
              const k = (p - 0.82) / 0.18;
              const sx = -0.25 * width + e * 1.5 * width;
              set(sx + (lamp.x - sx) * k, height * 0.1 + (lamp.y - height * 0.1) * k);
              if (p < 1) raf = requestAnimationFrame(step);
              else sweeping = false;
            }
          };
          raf = requestAnimationFrame(step);
        })
      : () => {};
    return () => {
      stop();
      unsee();
      cancelAnimationFrame(raf);
    };
  }, [width, height, sweep]);

  return (
    <svg
      ref={svg}
      viewBox={`0 0 ${width} ${height}`}
      className={className}
      style={style}
      role={label ? 'img' : undefined}
      aria-label={label || undefined}
      aria-hidden={label ? undefined : true}
    >
      <defs>
        <filter id={`relief-${uid}`} x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
          <feGaussianBlur in="SourceGraphic" stdDeviation={soft} result="soft" />
          <feColorMatrix in="soft" type="matrix" values={toneMatrix(tone.shadow, tone.highlight).join(' ')} result="tone" />
          <feColorMatrix in="soft" type="luminanceToAlpha" result="height" />
          <feDiffuseLighting in="height" surfaceScale={depth} diffuseConstant="1.1" lightingColor="#fff6ec" result="shade">
            <feDistantLight azimuth="225" elevation="52" />
          </feDiffuseLighting>
          <feSpecularLighting in="height" surfaceScale={depth * 1.25} specularConstant="1.1" specularExponent="20" lightingColor={tone.sheen} result="glint">
            <fePointLight ref={spot} x={width * 0.3} y={height * 0.2} z={lampHeight ?? Math.max(width, height) * 0.8} />
          </feSpecularLighting>
          <feComposite in="tone" in2="shade" operator="arithmetic" k1="1" k2="0" k3="0" k4="0" result="lit" />
          <feComposite in="glint" in2="lit" operator="arithmetic" k1="0" k2={0.55 * shine} k3="1" k4="0" result="face" />
          <feComposite in="face" in2="SourceAlpha" operator="in" />
        </filter>
      </defs>
      <g filter={`url(#relief-${uid})`}>{children}</g>
    </svg>
  );
}
