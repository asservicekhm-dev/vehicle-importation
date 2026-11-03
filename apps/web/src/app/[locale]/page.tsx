import { getTranslations, setRequestLocale } from 'next-intl/server';

import { RenderBlocks } from '@/components/RenderBlocks';
import type { UnifiedBlockStub } from '@/types/cms';
import { isLocale } from '@autosearch/config';

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function HomePage({ params }: Props) {
  const { locale } = await params;

  if (isLocale(locale)) setRequestLocale(locale);

  const t = await getTranslations('Home');

  const blocks: UnifiedBlockStub[] = [
    {
      blockType: 'dummy-section',
      id: 'home-dummy',
      blockName: 'intro',
      eyebrow: t('eyebrow'),
      title: t('title'),
      description: t('description'),
      ctaLabel: t('cta'),
    },
  ];

  return <RenderBlocks blocks={blocks} mapperKey='unified' />;
}
