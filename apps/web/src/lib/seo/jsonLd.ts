import { getGlobals } from '@/lib/cms/getGlobals';
import { HOME_SLUG } from '@/lib/cms/constants';
import { getMediaUrl } from '@/lib/cms/resolveMediaUrl';
import { localizedPageUrl, siteOrigin } from '@/lib/seo/pageMetadata';
import type { Blog, Contact, Header, Page, SiteSetting } from '@autosearch/cms/payload-types';
import {
  defaultAddressEn,
  defaultAddressUa,
  defaultEmail,
  defaultFacebookUrl,
  defaultHoursEn,
  defaultHoursUa,
  defaultInstagramUrl,
  defaultPhoneDisplay,
  type Locale,
  localeToHreflang,
} from '@autosearch/config';

type Json = Record<string, unknown>;

const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

function organizationId(): string {
  return `${siteOrigin()}/#organization`;
}

function knownAddress(address: string): Json | null {
  const trimmed = address.trim();
  if (trimmed === defaultAddressUa) {
    return {
      '@type': 'PostalAddress',
      streetAddress: 'вул. Героя України Володимира Дудченко (Гарнізонна), буд. 28',
      addressLocality: 'Хмельницький',
      addressCountry: 'UA',
    };
  }
  if (trimmed === defaultAddressEn) {
    return {
      '@type': 'PostalAddress',
      streetAddress: 'Hero of Ukraine Volodymyr Dudchenko St. (Garnizonna), bldg. 28',
      addressLocality: 'Khmelnytskyi',
      addressCountry: 'UA',
    };
  }
  if (!trimmed) return null;
  return {
    '@type': 'PostalAddress',
    streetAddress: trimmed,
    addressCountry: 'UA',
  };
}

function visiblePhone(contacts: Contact | null, header: Header | null): string {
  return (
    contacts?.phones?.find((phone) => phone?.number?.trim())?.number?.trim() ||
    header?.phone?.trim() ||
    defaultPhoneDisplay
  );
}

function visibleEmail(contacts: Contact | null): string {
  return contacts?.email?.trim() || defaultEmail;
}

function visibleAddress(contacts: Contact | null, locale: Locale): string {
  return (
    contacts?.address?.trim() || (locale === 'en' ? defaultAddressEn : defaultAddressUa)
  );
}

function visibleHours(contacts: Contact | null, locale: Locale): string {
  return contacts?.hours?.trim() || (locale === 'en' ? defaultHoursEn : defaultHoursUa);
}

function sameAs(contacts: Contact | null): string[] {
  const fromCms =
    contacts?.socialLinks
      ?.map((item) => item?.url?.trim() || '')
      .filter((url) => url.startsWith('http://') || url.startsWith('https://')) ?? [];

  if (fromCms.length > 0) return fromCms;
  return [defaultInstagramUrl, defaultFacebookUrl];
}

function openingHours(hours: string): Json[] | undefined {
  const normalized = hours.replace(/\r\n/g, '\n').trim();
  const known = new Set([defaultHoursUa.trim(), defaultHoursEn.trim()]);
  if (!known.has(normalized)) return undefined;
  return [
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: WEEKDAYS,
      opens: '09:30',
      closes: '18:00',
    },
  ];
}

/** AutoDealer + WebSite graph. NAP matches the footer (CMS value, otherwise the public defaults). */
export function siteJsonLd(input: {
  locale: Locale;
  header: Header | null;
  contacts: Contact | null;
  siteSettings: SiteSetting | null;
}): Json {
  const siteName = input.siteSettings?.siteName?.trim() || 'AS Autosearch';
  const description = input.siteSettings?.defaultMetaDescription?.trim() || undefined;
  const logo =
    getMediaUrl(input.header?.logoLight) ||
    getMediaUrl(input.header?.logoDark) ||
    undefined;
  const address = knownAddress(visibleAddress(input.contacts, input.locale));
  const hours = openingHours(visibleHours(input.contacts, input.locale));
  const origin = siteOrigin();

  const dealer: Json = {
    '@type': 'AutoDealer',
    '@id': organizationId(),
    name: siteName,
    url: `${origin}/`,
    telephone: visiblePhone(input.contacts, input.header),
    email: visibleEmail(input.contacts),
    sameAs: sameAs(input.contacts),
    areaServed: {
      '@type': 'Country',
      name: 'Ukraine',
    },
    ...(description ? { description } : {}),
    ...(logo ? { image: logo, logo } : {}),
    ...(address ? { address } : {}),
    ...(hours ? { openingHoursSpecification: hours } : {}),
  };

  const website: Json = {
    '@type': 'WebSite',
    '@id': `${origin}/#website`,
    url: `${origin}/`,
    name: siteName,
    inLanguage: ['uk', 'en'],
    publisher: { '@id': organizationId() },
    ...(description ? { description } : {}),
  };

  return {
    '@context': 'https://schema.org',
    '@graph': [dealer, website],
  };
}

export function faqJsonLd(page: Page): Json | null {
  const mainEntity: Json[] = [];

  for (const block of page.layout ?? []) {
    if (!block || block.blockType !== 'service-faq-block') continue;
    for (const item of block.items ?? []) {
      const question = item?.question?.trim();
      const answer = item?.answer?.trim();
      if (!question || !answer) continue;
      mainEntity.push({
        '@type': 'Question',
        name: question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: answer,
        },
      });
    }
  }

  if (mainEntity.length === 0) return null;

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity,
  };
}

export function breadcrumbJsonLd(input: {
  locale: Locale;
  homeName: string;
  crumbs: { name: string; slug: string }[];
}): Json | null {
  const items = [
    {
      name: input.homeName,
      slug: HOME_SLUG,
    },
    ...input.crumbs.filter((crumb) => crumb.name.trim() && crumb.slug.trim() !== HOME_SLUG),
  ];

  if (items.length < 2) return null;

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name.trim(),
      item: localizedPageUrl(input.locale, crumb.slug),
    })),
  };
}

export async function blogJsonLd(post: Blog, locale: Locale, labels: { home: string; blog: string }): Promise<Json[]> {
  const title = post.meta?.title?.trim() || post.title?.trim();
  if (!title || !post.slug?.trim()) return [];

  const { header, siteSettings } = await getGlobals(locale);
  const siteName = siteSettings?.siteName?.trim() || 'AS Autosearch';
  const logo = getMediaUrl(header?.logoLight) || getMediaUrl(header?.logoDark);
  const image = getMediaUrl(post.meta?.image) || getMediaUrl(post.thumbnail);
  const url = localizedPageUrl(locale, `blog/${post.slug.trim()}`);
  const author =
    post.author && typeof post.author === 'object' && post.author.name?.trim()
      ? {
          '@type': 'Person',
          name: post.author.name.trim(),
          ...(post.author.role?.trim() ? { jobTitle: post.author.role.trim() } : {}),
        }
      : { '@id': organizationId() };

  const article: Json = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: title,
    mainEntityOfPage: url,
    url,
    inLanguage: localeToHreflang[locale],
    datePublished: post.publishedOn || post.createdAt,
    dateModified: post.updatedAt,
    author,
    publisher: {
      '@type': 'Organization',
      '@id': organizationId(),
      name: siteName,
      ...(logo
        ? {
            logo: {
              '@type': 'ImageObject',
              url: logo,
            },
          }
        : {}),
    },
    ...(post.meta?.description?.trim() || post.excerpt?.trim()
      ? { description: post.meta?.description?.trim() || post.excerpt?.trim() }
      : {}),
    ...(image ? { image } : {}),
  };

  const crumbs = breadcrumbJsonLd({
    locale,
    homeName: labels.home,
    crumbs: [
      { name: labels.blog, slug: 'blog' },
      { name: post.title?.trim() || title, slug: `blog/${post.slug.trim()}` },
    ],
  });

  return crumbs ? [article, crumbs] : [article];
}
