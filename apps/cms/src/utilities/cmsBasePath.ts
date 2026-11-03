export function getCmsBasePath(): string {
  const raw = (process.env.CMS_BASE_PATH || '').trim();
  if (!raw || raw === '/') return '';
  return (raw.startsWith('/') ? raw : `/${raw}`).replace(/\/$/, '');
}
