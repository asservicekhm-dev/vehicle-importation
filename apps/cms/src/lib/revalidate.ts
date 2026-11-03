import { getRevalidateConfig } from './env';

export type RevalidatePayload = {
  paths?: string[];
  tags?: string[];
};

type RevalidateContext = {
  skipRevalidate?: boolean;
};

export async function triggerWebRevalidate(
  payload: RevalidatePayload,
  context?: RevalidateContext,
): Promise<void> {
  if (context?.skipRevalidate) return;

  const config = getRevalidateConfig();
  if (!config) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(
        '[@autosearch/cms] Skipping revalidate: set WEB_URL and REVALIDATE_SECRET to notify the web app.',
      );
    }
    return;
  }

  try {
    const res = await fetch(`${config.webUrl}/api/revalidate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-revalidate-secret': config.secret,
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      console.error(`[@autosearch/cms] Revalidate failed: ${res.status} ${await res.text()}`);
    }
  } catch (err) {
    console.error('[@autosearch/cms] Revalidate request error', err);
  }
}
