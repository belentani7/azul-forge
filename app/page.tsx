import { Hero } from '@/components/landing/hero';
import { Features } from '@/components/landing/features';
import { Cta, SiteFooter, Steps } from '@/components/landing/steps';

export default function LandingPage() {
  return (
    <>
      <main id="contenido">
        <Hero />
        <Features />
        <Steps />
        <Cta />
      </main>
      <SiteFooter />
    </>
  );
}
