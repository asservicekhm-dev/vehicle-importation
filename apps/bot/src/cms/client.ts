import type { BotEnv } from '../env.js';
import type {
  LeadDetail,
  LeadListQuery,
  LeadListResult,
  LeadStatus,
} from './leads.js';

export type OperatorStatus = 'pending' | 'approved' | 'declined' | 'blocked';

export type OperatorInfo = {
  telegramId: string;
  status: OperatorStatus | null;
  id?: string;
  username?: string | null;
  firstName?: string | null;
  lastName?: string | null;
};

export type AccessRequestResult =
  | { ok: true; status: OperatorStatus; telegramId: string; id?: string }
  | { ok: false; error: string; status?: OperatorStatus };

export type TelegramProfile = {
  telegramId: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  languageCode?: string;
};

export class CmsBotClient {
  constructor(private readonly env: BotEnv) {}

  private headers(): Record<string, string> {
    return {
      'content-type': 'application/json',
      authorization: `Bearer ${this.env.botInternalSecret}`,
      'x-bot-secret': this.env.botInternalSecret,
    };
  }

  private url(path: string): string {
    return `${this.env.cmsInternalUrl}${path.startsWith('/') ? path : `/${path}`}`;
  }

  async getOperator(telegramId: string): Promise<OperatorInfo> {
    const res = await fetch(this.url(`/api/bot/operators/${encodeURIComponent(telegramId)}`), {
      method: 'GET',
      headers: this.headers(),
    });

    if (!res.ok) {
      const body = (await res.json().catch(() => null)) as { error?: string } | null;
      throw new Error(
        `[bot→cms] getOperator failed (${res.status}): ${body?.error ?? res.statusText}`,
      );
    }

    const data = (await res.json()) as {
      telegramId: string;
      status: OperatorStatus | null;
      id?: string;
      username?: string | null;
      firstName?: string | null;
      lastName?: string | null;
    };

    return {
      telegramId: data.telegramId,
      status: data.status,
      id: data.id,
      username: data.username,
      firstName: data.firstName,
      lastName: data.lastName,
    };
  }

  async requestAccess(profile: TelegramProfile): Promise<AccessRequestResult> {
    const res = await fetch(this.url('/api/bot/access-request'), {
      method: 'POST',
      headers: this.headers(),
      body: JSON.stringify(profile),
    });

    const data = (await res.json().catch(() => null)) as
      | {
          ok?: boolean;
          status?: OperatorStatus;
          telegramId?: string;
          id?: string;
          error?: string;
        }
      | null;

    if (res.status === 403 && data?.status === 'blocked') {
      return { ok: false, error: 'blocked', status: 'blocked' };
    }

    if (!res.ok || !data?.ok || !data.status) {
      return {
        ok: false,
        error: data?.error ?? `http_${res.status}`,
        status: data?.status,
      };
    }

    return {
      ok: true,
      status: data.status,
      telegramId: data.telegramId ?? profile.telegramId,
      id: data.id,
    };
  }

  async listLeads(query: LeadListQuery): Promise<LeadListResult> {
    const params = new URLSearchParams();
    params.set('telegramId', query.telegramId);
    params.set('page', String(query.page ?? 1));
    params.set('limit', String(query.limit ?? 5));
    if (query.q) params.set('q', query.q);
    if (query.status) params.set('status', query.status);
    if (query.type) params.set('type', query.type);
    if (query.origin) params.set('origin', query.origin);
    if (query.carBrand) params.set('carBrand', query.carBrand);
    if (query.datePreset) params.set('datePreset', query.datePreset);

    const res = await fetch(this.url(`/api/bot/leads?${params}`), {
      method: 'GET',
      headers: this.headers(),
    });

    const data = (await res.json().catch(() => null)) as
      | (Partial<LeadListResult> & { ok?: boolean; error?: string })
      | null;

    if (!res.ok || !data?.ok || !Array.isArray(data.docs)) {
      throw new Error(
        `[bot→cms] listLeads failed (${res.status}): ${data?.error ?? res.statusText}`,
      );
    }

    return {
      page: data.page ?? query.page ?? 1,
      limit: data.limit ?? query.limit ?? 5,
      totalDocs: data.totalDocs ?? data.docs.length,
      totalPages: data.totalPages ?? 1,
      hasNextPage: Boolean(data.hasNextPage),
      hasPrevPage: Boolean(data.hasPrevPage),
      docs: data.docs,
    };
  }

  async getLead(telegramId: string, id: string): Promise<LeadDetail> {
    const params = new URLSearchParams({ telegramId });
    const res = await fetch(
      this.url(`/api/bot/leads/${encodeURIComponent(id)}?${params}`),
      {
        method: 'GET',
        headers: this.headers(),
      },
    );

    const data = (await res.json().catch(() => null)) as
      | { ok?: boolean; doc?: LeadDetail; error?: string }
      | null;

    if (!res.ok || !data?.ok || !data.doc) {
      throw new Error(
        `[bot→cms] getLead failed (${res.status}): ${data?.error ?? res.statusText}`,
      );
    }

    return data.doc;
  }

  async patchLeadStatus(
    telegramId: string,
    id: string,
    status: LeadStatus,
  ): Promise<LeadDetail> {
    const res = await fetch(this.url(`/api/bot/leads/${encodeURIComponent(id)}/status`), {
      method: 'PATCH',
      headers: this.headers(),
      body: JSON.stringify({ telegramId, status }),
    });

    const data = (await res.json().catch(() => null)) as
      | { ok?: boolean; doc?: LeadDetail; error?: string }
      | null;

    if (!res.ok || !data?.ok || !data.doc) {
      throw new Error(
        `[bot→cms] patchLeadStatus failed (${res.status}): ${data?.error ?? res.statusText}`,
      );
    }

    return data.doc;
  }
}
