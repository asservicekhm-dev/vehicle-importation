import { PayloadApiClient } from '@payload-enchants/sdk';

import { getCmsBaseUrl } from '@/lib/cmsBaseUrl';
import type { Config } from '@autosearch/cms/payload-types';

type PayloadClient = PayloadApiClient<Config>;

let client: PayloadClient | undefined;

function payloadFetcher(input: URL | RequestInfo, init?: RequestInit) {
  return fetch(input, init);
}

function getClient(): PayloadClient {
  if (!client) {
    client = new PayloadApiClient<Config>({
      apiURL: `${getCmsBaseUrl()}/api`,
      fetcher: payloadFetcher,
    });
  }
  return client;
}

export const payload = new Proxy({} as PayloadClient, {
  get(_target, prop) {
    const c = getClient();
    const value = Reflect.get(c, prop as keyof PayloadClient);
    return typeof value === 'function' ? (value as (...a: unknown[]) => unknown).bind(c) : value;
  },
});
