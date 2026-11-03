'use client';

import { useState } from 'react';

import type { PriceList as PriceListGlobal } from '@autosearch/cms/payload-types';
import type { Locale } from '@autosearch/config';

import { designSeedContent, type OriginId } from './content';
import { FaqCallback } from './sections/FaqCallback';
import { Hero } from './sections/Hero';
import { InspectionSheet } from './sections/InspectionSheet';
import { PriceListSection } from './sections/PriceList';
import { Services } from './sections/Services';
import { SystemSheet } from './sections/SystemSheet';
import { TurnkeyRoute } from './sections/TurnkeyRoute';

type Props = {
  locale: Locale;
  priceList: PriceListGlobal | null;
};

export function DesignSeedPage({ locale, priceList }: Props) {
  const content = designSeedContent[locale];
  const [origin, setOrigin] = useState<OriginId>('usa');

  return (
    <>
      <Hero content={content.hero} origin={origin} onOriginChange={setOrigin} />
      <Services content={content.services} />
      <PriceListSection content={content.prices} priceList={priceList} locale={locale} />
      <InspectionSheet content={content.inspection} />
      <TurnkeyRoute content={content.route} origin={origin} />
      <FaqCallback faq={content.faq} callback={content.callback} />
      <SystemSheet content={content.system} />
    </>
  );
}
