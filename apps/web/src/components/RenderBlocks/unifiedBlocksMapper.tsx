import { AboutIntro } from '@/components/AboutIntro';
import { AutoHero } from '@/components/AutoHero';
import { BookingForm } from '@/components/BookingForm';
import { CarBrands } from '@/components/CarBrands';
import { Comparison } from '@/components/Comparison';
import { Directions } from '@/components/Directions';
import { DummySection } from '@/components/DummySection';
import { InspectionChecklist } from '@/components/InspectionChecklist';
import { PageBreadcrumbs } from '@/components/PageBreadcrumbs';
import { PriceListSection } from '@/components/PriceListSection';
import { ServiceFaq } from '@/components/ServiceFaq';
import { Testimonials } from '@/components/Testimonials';
import { TurnkeyRoute } from '@/components/TurnkeyRoute';
import { UkraineCoverage } from '@/components/UkraineCoverage';
import { WhyChooseUs } from '@/components/WhyChooseUs';

import type { UnifiedBlockMapper } from './blockTypes';

export const unifiedBlocksMapper = {
  'dummy-section': (block) => <DummySection {...block} />,
  'auto-hero-block': (block) => <AutoHero {...block} />,
  'directions-block': (block) => <Directions {...block} />,
  'price-list-block': (block) => <PriceListSection {...block} />,
  'inspection-checklist-block': (block) => <InspectionChecklist {...block} />,
  'turnkey-route-block': (block) => <TurnkeyRoute {...block} />,
  'testimonials-block': (block) => <Testimonials {...block} />,
  'service-faq-block': (block) => <ServiceFaq {...block} />,
  'booking-form-block': (block) => <BookingForm {...block} />,
  'about-intro-block': (block) => <AboutIntro {...block} />,
  'why-choose-us-block': (block) => <WhyChooseUs {...block} />,
  'comparison-block': (block) => <Comparison {...block} />,
  'ukraine-coverage-block': (block) => <UkraineCoverage {...block} />,
  'car-brands-block': (block) => <CarBrands {...block} />,
  'page-breadcrumbs-block': (block) => <PageBreadcrumbs {...block} />,
} satisfies UnifiedBlockMapper;
