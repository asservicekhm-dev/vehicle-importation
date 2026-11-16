export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
}

type SmoothScrollOptions = {
  /** When false, only scrolls — caller already updated the URL. Default true. */
  updateUrl?: boolean;
  /**
   * Delay before scrolling. Use after `history.pushState`: Next.js patches history
   * and can reset scroll in the same turn, which is why the first CTA click only
   * updated the URL.
   */
  deferMs?: number;
  /** Default is smooth, or `auto` when the user prefers reduced motion. */
  behavior?: ScrollBehavior;
};

function scrollToId(id: string, behavior: ScrollBehavior): boolean {
  const target = document.getElementById(id);
  if (!target) return false;

  target.scrollIntoView({ behavior, block: 'start' });
  return true;
}

function syncHashUrl(id: string): void {
  // Keep pathname + search — a bare `#hash` pushState can drop `?service=`.
  const nextUrl = `${window.location.pathname}${window.location.search}#${id}`;
  const currentUrl = `${window.location.pathname}${window.location.search}${window.location.hash}`;
  if (currentUrl !== nextUrl) {
    window.history.pushState(null, '', nextUrl);
  }
}

/** Smooth-scroll to a same-page hash target, respecting scroll-margin and reduced motion. */
export function smoothScrollToHash(hash: string, options: SmoothScrollOptions = {}): boolean {
  if (typeof window === 'undefined' || typeof document === 'undefined') return false;

  const id = hash.replace(/^#/, '').trim();
  if (!id) return false;

  const behavior: ScrollBehavior =
    options.behavior ?? (prefersReducedMotion() ? 'auto' : 'smooth');

  const run = () => {
    const found = scrollToId(id, behavior);
    if (found && options.updateUrl !== false) {
      syncHashUrl(id);
    }
    return found;
  };

  const deferMs = options.deferMs ?? 0;
  if (deferMs > 0) {
    window.setTimeout(() => {
      run();
    }, deferMs);
    // Optimistic: element is expected to exist; caller still proceeds.
    return Boolean(document.getElementById(id));
  }

  return run();
}
