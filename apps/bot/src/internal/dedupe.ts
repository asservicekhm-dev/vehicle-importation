/** In-memory dedupe for lead notify retries (single bot replica). */
const recent = new Map<string, number>();
const TTL_MS = 10 * 60 * 1000;

export function shouldSkipLeadNotify(leadId: string): boolean {
  prune();
  if (recent.has(leadId)) return true;
  recent.set(leadId, Date.now());
  return false;
}

function prune(): void {
  const cutoff = Date.now() - TTL_MS;
  for (const [id, at] of recent) {
    if (at < cutoff) recent.delete(id);
  }
}
