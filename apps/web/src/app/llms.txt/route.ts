import { getGlobals } from '@/lib/cms/getGlobals';
import { listPublicUrls } from '@/lib/seo/publicUrls';
import { defaultLocale, locales } from '@autosearch/config';

export const dynamic = 'force-dynamic';

function section(title: string, rows: { title?: string; url: string; description?: string }[]): string[] {
  if (rows.length === 0) return [];
  const lines = [`## ${title}`, ''];
  for (const row of rows) {
    const label = row.title || row.url;
    const note = row.description ? `: ${row.description}` : '';
    lines.push(`- [${label}](${row.url})${note}`);
  }
  lines.push('');
  return lines;
}

export async function GET() {
  const { siteSettings } = await getGlobals(defaultLocale);
  const name = siteSettings?.siteName?.trim() || 'AS Autosearch';
  const description = siteSettings?.defaultMetaDescription?.trim();
  const urls = await listPublicUrls();

  const lines = [`# ${name}`, ''];
  if (description) lines.push(`> ${description}`, '');

  for (const locale of locales) {
    const heading = locale === defaultLocale ? 'Pages' : 'English pages';
    const pages = urls.filter((url) => url.locale === locale && url.kind === 'page');
    const posts = urls.filter((url) => url.locale === locale && url.kind === 'post');
    lines.push(...section(heading, pages));
    lines.push(
      ...section(locale === defaultLocale ? 'Blog' : 'English blog', posts),
    );
  }

  return new Response(`${lines.join('\n').trim()}\n`, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=0, s-maxage=300, stale-while-revalidate=86400',
    },
  });
}
