import { AboutSection } from '@/components/home/about-section';
import { Categories } from '@/components/home/categories';
import { FinalCta } from '@/components/home/final-cta';
import { Hero } from '@/components/home/hero';
import { InstagramGallery } from '@/components/home/instagram-gallery';
import { OfferBanner } from '@/components/home/offer-banner';
import { PopularFoods } from '@/components/home/popular-foods';
import { WhyUs } from '@/components/home/why-us';
export default function Home() {
  return (
    <main>
      <Hero />
      <PopularFoods />
      <Categories />
      <OfferBanner />
      <AboutSection />
      <WhyUs />
      <InstagramGallery />
      <FinalCta />
    </main>
  );
}
