import {
  type BookingServiceMode,
  isBookingServiceMode,
} from '@autosearch/config';

type Listener = (mode: BookingServiceMode) => void;

const listeners = new Set<Listener>();

/** Last mode emitted — replayed on subscribe so remounts don't miss the first click. */
let lastMode: BookingServiceMode | undefined;

/** Subscribe to same-page `?service=` deep-link activations (no full navigation). */
export function subscribeBookingServiceDeepLink(listener: Listener): () => void {
  listeners.add(listener);
  if (lastMode) listener(lastMode);
  return () => {
    listeners.delete(listener);
  };
}

export function emitBookingServiceDeepLink(mode: BookingServiceMode): void {
  lastMode = mode;
  listeners.forEach((listener) => listener(mode));
}

export function readServiceFromHref(href: string): BookingServiceMode | undefined {
  try {
    const url = new URL(href, 'http://local.invalid');
    const raw = url.searchParams.get('service');
    return isBookingServiceMode(raw) ? raw : undefined;
  } catch {
    return undefined;
  }
}
