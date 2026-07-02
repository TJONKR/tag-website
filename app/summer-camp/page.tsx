import type { Metadata } from 'next';

import { GrainOverlay } from '@components/landing/grain-overlay';
import { Footer } from '@components/landing/footer';
import {
  CampHero,
  CampMarquee,
  WhatIsThis,
  WhoIsThisFor,
  WhatYouGet,
  HowItWorks,
  Schedule,
  Vibe,
  FinalCta,
} from '@components/summer-camp';

const title = 'TAG Startup Summer Camp';
const description =
  'Six weeks. One goal: money-making startups. Build your product to its first revenue this summer. We supply the space, the tech and the traffic.';

export const metadata: Metadata = {
  title,
  description,
  openGraph: { title, description },
  twitter: { card: 'summary_large_image', title, description },
};

export default function SummerCampPage() {
  return (
    <>
      <GrainOverlay />
      <main className="min-h-screen bg-tag-bg pt-14">
        <CampHero />
        <CampMarquee />
        <WhatIsThis />
        <WhoIsThisFor />
        <WhatYouGet />
        <HowItWorks />
        <Schedule />
        <Vibe />
        <FinalCta />
      </main>
      <Footer />
    </>
  );
}
