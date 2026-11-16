'use client';

import { type ComponentType, type ReactNode, useEffect, useRef, useState } from 'react';

type Props<P extends object> = {
  load: () => Promise<ComponentType<P>>;
  props: P;
  shell: ReactNode;
  /** How early to start the import before the shell enters the viewport. */
  rootMargin?: string;
};

/**
 * Loads a client component with a raw `import()` once the shell nears the
 * viewport. Unlike `next/dynamic`, this does not emit a head preload, so
 * below-fold libraries stay out of the LCP window.
 */
export function LazyMount<P extends object>({
  load,
  props,
  shell,
  rootMargin = '400px 0px',
}: Props<P>) {
  const [Component, setComponent] = useState<ComponentType<P> | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const startedRef = useRef(false);

  useEffect(() => {
    if (Component || startedRef.current) return undefined;

    const node = rootRef.current;
    if (!node) return undefined;

    const start = () => {
      if (startedRef.current) return;
      startedRef.current = true;
      void load().then((mod) => setComponent(() => mod));
    };

    if (typeof IntersectionObserver === 'undefined') {
      start();
      return undefined;
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          io.disconnect();
          start();
        }
      },
      { rootMargin, threshold: 0 },
    );
    io.observe(node);

    return () => io.disconnect();
  }, [Component, load, rootMargin]);

  return <div ref={rootRef}>{Component ? <Component {...props} /> : shell}</div>;
}
