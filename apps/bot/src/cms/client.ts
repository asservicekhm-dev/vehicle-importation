import type { BotEnv } from '../env.js';

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
}
