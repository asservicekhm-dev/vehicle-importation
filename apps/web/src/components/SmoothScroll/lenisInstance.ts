import type Lenis from 'lenis';

let instance: Lenis | null = null;
const pendingScroll = new Set<(lenis: Lenis) => void>();

export function setLenisInstance(lenis: Lenis | null): void {
  instance = lenis;
  if (!lenis) return;
  pendingScroll.forEach((attach) => attach(lenis));
  pendingScroll.clear();
}

export function getLenisInstance(): Lenis | null {
  return instance;
}

/**
 * Runs on every Lenis frame (the position `window` scroll events can lag).
 * Attaches immediately, or once `SmoothScroll` creates the instance.
 */
export function onLenisScroll(listener: () => void): () => void {
  let unsubscribe: (() => void) | undefined;
  let cancelled = false;

  const attach = (lenis: Lenis) => {
    if (cancelled) return;
    unsubscribe = lenis.on('scroll', listener);
  };

  if (instance) attach(instance);
  else pendingScroll.add(attach);

  return () => {
    cancelled = true;
    pendingScroll.delete(attach);
    unsubscribe?.();
  };
}
