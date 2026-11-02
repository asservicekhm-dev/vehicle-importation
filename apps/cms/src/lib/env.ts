export function requireEnv(name: string): string {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(
      `[@autosearch/cms] Missing required env var ${name}. Copy apps/cms/.env.example to apps/cms/.env.`,
    );
  }

  return value;
}
