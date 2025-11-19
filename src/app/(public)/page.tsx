import BestSelling from '@/components/BestSelling';
import Hero from '@/components/Hero';
import Newsletter from '@/components/Newsletter';
import OurSpecs from '@/components/OurSpec';
import LatestProducts from '@/components/LatestProducts';

export default function Home() {
    // api
  return (
    <>
      <Hero />
      <LatestProducts />
      <BestSelling />
      <OurSpecs />
      <Newsletter />
    </>
  );
}
