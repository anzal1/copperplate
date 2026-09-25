import { useLayoutEffect, useRef, useState, type CSSProperties } from 'react';
import { Relief } from './relief';
import type { Metal } from './utils';

/**
 * Type cut into metal: a heading or nameplate that catches the lamp. It
 * measures its own line, so it sizes like text (set font-size on it) and
 * stays selectable to screen readers through its label.
 */
export function EngravedText({
  children,
  metal = 'copper',
  as: Tag = 'span',
  weight = 480,
  italic = false,
  font = 'var(--cp-font-display)',
  className,
  style,
}: {
  children: string;
  metal?: Metal;
  as?: 'span' | 'h1' | 'h2' | 'h3' | 'p';
  weight?: number;
  italic?: boolean;
  font?: string;
  className?: string;
  style?: CSSProperties;
}) {
  const probe = useRef<SVGTextElement>(null);
  const [box, setBox] = useState({ w: children.length * 56, h: 120 });
  const size = 100;

  useLayoutEffect(() => {
    const measure = () => {
      const t = probe.current;
      if (!t) return;
      const b = t.getBBox();
      if (b.width) setBox({ w: Math.ceil(b.width + 16), h: 128 });
    };
    measure();
    document.fonts?.ready.then(measure);
  }, [children, weight, italic, font]);

  return (
    <Tag className={['cp-engraved-text', className].filter(Boolean).join(' ')} style={{ display: Tag === 'span' ? 'inline-block' : 'block', width: 'fit-content', lineHeight: 1, ...style }} aria-label={children}>
      <Relief width={box.w} height={box.h} metal={metal} depth={7} soft={1.6} shine={1.8} lampHeight={box.h * 1.4} style={{ height: '1.28em', width: 'auto', display: 'block', overflow: 'visible' }}>
        <defs>
          {/* Lighter at the top of each letter, darker at the foot: the face
              of a cut letter, before the lamp adds its glint. */}
          <linearGradient id="cp-et-face" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0.15" stopColor="#dedede" />
            <stop offset="0.95" stopColor="#8c8c8c" />
          </linearGradient>
        </defs>
        <text ref={probe} x="8" y="98" fill="url(#cp-et-face)" stroke="#6a6a6a" strokeWidth="1.2" paintOrder="stroke" style={{ fontFamily: font, fontSize: size, fontWeight: weight, fontStyle: italic ? 'italic' : 'normal', letterSpacing: '-0.01em' }}>
          {children}
        </text>
      </Relief>
    </Tag>
  );
}
