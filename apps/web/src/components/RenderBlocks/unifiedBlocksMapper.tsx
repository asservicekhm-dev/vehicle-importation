import dynamic from 'next/dynamic';

import { AutoHero } from '@/components/AutoHero';
import { CarBrands } from '@/components/CarBrands';
import { Comparison } from '@/components/Comparison';
import { Directions } from '@/components/Directions';
import { DummySection } from '@/components/DummySection';
import { InspectionChecklist } from '@/components/InspectionChecklist';
import { PageBreadcrumbs } from '@/components/PageBreadcrumbs';
import { PriceListSection } from '@/components/PriceListSection';
import { RelatedServices } from '@/components/RelatedServices';
import { ServiceBenefits } from '@/components/ServiceBenefits';
import { ServiceFaq } from '@/components/ServiceFaq';
import { ServiceFeatureCards } from '@/components/ServiceFeatureCards';
import { ServiceHero } from '@/components/ServiceHero';
import { ServiceInfo } from '@/components/ServiceInfo';
import { UkraineCoverage } from '@/components/UkraineCoverage';
import { WhyChooseUs } from '@/components/WhyChooseUs';

import type { UnifiedBlockMapper } from './blockTypes';

/** Heavy: Swiper — keep off pages that do not render testimonials. */
const Testimonials = dynamic(() =>
  import('@/components/Testimonials').then((m) => m.Testimonials),
);

/** Heavy: Motion + react-hook-form. */
const BookingForm = dynamic(() =>
  import('@/components/BookingForm').then((m) => m.BookingForm),
);

/** Heavy: CountUp → Motion. */
const AboutIntro = dynamic(() =>
  import('@/components/AboutIntro').then((m) => m.AboutIntro),
);

/** Heavy: dedicated GSAP / ScrollTrigger timeline. */
const TurnkeyRoute = dynamic(() =>
  import('@/components/TurnkeyRoute').then((m) => m.TurnkeyRoute),
);

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
  'service-hero-block': (block) => <ServiceHero {...block} />,
  'service-info-block': (block) => <ServiceInfo {...block} />,
  'service-feature-cards-block': (block) => <ServiceFeatureCards {...block} />,
  'service-benefits-block': (block) => <ServiceBenefits {...block} />,
  'related-services-block': (block) => <RelatedServices {...block} />,
} satisfies UnifiedBlockMapper;
