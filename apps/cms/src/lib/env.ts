export function requireEnv(name: string): string {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(
      `[@autosearch/cms] Missing required env var ${name}. Copy apps/cms/.env.example to apps/cms/.env. ${JSON.stringify(process.env)}`,
    );
  }

  return value;
}

export function optionalEnv(name: string): string | undefined {
  const value = process.env[name]?.trim();
  return value || undefined;
}

export function hasS3Config(): boolean {
  return Boolean(
    optionalEnv('S3_BUCKET') &&
    optionalEnv('S3_ACCESS_KEY_ID') &&
    optionalEnv('S3_SECRET_ACCESS_KEY'),
  );
}

export function getRevalidateConfig(): { webUrl: string; secret: string } | null {
  const webUrl = optionalEnv('WEB_URL');
  const secret = optionalEnv('REVALIDATE_SECRET');

  if (!webUrl || !secret) return null;

  return { webUrl: webUrl.replace(/\/$/, ''), secret };
}
