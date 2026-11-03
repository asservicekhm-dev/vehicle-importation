export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
}

/** Smooth-scroll to a same-page hash target, respecting scroll-margin and reduced motion. */
export function smoothScrollToHash(hash: string): boolean {
  if (typeof window === 'undefined' || typeof document === 'undefined') return false;

  const id = hash.replace(/^#/, '').trim();
  if (!id) return false;

  const target = document.getElementById(id);
  if (!target) return false;

  const behavior: ScrollBehavior = prefersReducedMotion() ? 'auto' : 'smooth';
  target.scrollIntoView({ behavior, block: 'start' });

  const nextHash = `#${id}`;
  if (window.location.hash !== nextHash) {
    window.history.pushState(null, '', nextHash);
  }

  return true;
}
