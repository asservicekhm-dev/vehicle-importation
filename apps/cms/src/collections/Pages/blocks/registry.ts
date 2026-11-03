import type { Block } from 'payload';

import { AutoHeroBlock } from './home/AutoHeroBlock';
import { BookingFormBlock } from './home/BookingFormBlock';
import { ComparisonBlock } from './home/ComparisonBlock';
import { DirectionsBlock } from './home/DirectionsBlock';
import { InspectionChecklistBlock } from './home/InspectionChecklistBlock';
import { PriceListBlock } from './home/PriceListBlock';
import { ServiceFaqBlock } from './home/ServiceFaqBlock';
import { TestimonialsBlock } from './home/TestimonialsBlock';
import { TurnkeyRouteBlock } from './home/TurnkeyRouteBlock';
import { UkraineCoverageBlock } from './home/UkraineCoverageBlock';
import { WhyChooseUsBlock } from './home/WhyChooseUsBlock';
import { DummySectionBlock } from './misc/DummySectionBlock';
import { AboutIntroBlock } from './shared/AboutIntroBlock';
import { CarBrandsBlock } from './shared/CarBrandsBlock';
import { PageBreadcrumbsBlock } from './shared/PageBreadcrumbsBlock';

/** Shared page layout blocks. */
export const pageBlocks: Block[] = [
  DummySectionBlock,
  AutoHeroBlock,
  DirectionsBlock,
  PriceListBlock,
  InspectionChecklistBlock,
  TurnkeyRouteBlock,
  TestimonialsBlock,
  ServiceFaqBlock,
  BookingFormBlock,
  AboutIntroBlock,
  WhyChooseUsBlock,
  ComparisonBlock,
  UkraineCoverageBlock,
  CarBrandsBlock,
  PageBreadcrumbsBlock,
];
