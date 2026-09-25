import type { MutableRefObject, Ref, RefCallback } from 'react';
import { useIlluminate } from 'copperplate/react';

export type Metal = 'copper' | 'brass' | 'silver' | 'steel' | 'verdigris' | 'oxide';

/** Join class names, skipping empty ones. */
export function cx(...parts: (string | false | null | undefined)[]): string {
  return parts.filter(Boolean).join(' ');
}

/** Let an element catch the page's lamp (writes --cp-lx/--cp-ly on it). */
export const useLit = useIlluminate;

/** Merge a forwarded ref with a local one. */
export function mergeRefs<T>(...refs: (Ref<T> | undefined)[]): RefCallback<T> {
  return (node) => {
    for (const r of refs) {
      if (typeof r === 'function') r(node);
      else if (r) (r as MutableRefObject<T | null>).current = node;
    }
  };
}
