import { ContactBand } from "@/components/store/home/ContactBand";
import { FarmStory } from "@/components/store/home/FarmStory";
import { Hero } from "@/components/store/home/Hero";
import { HowToOrder } from "@/components/store/home/HowToOrder";
import { ProductsSection } from "@/components/store/home/ProductsSection";
import { PromoBanner } from "@/components/store/home/PromoBanner";
import { SapLine } from "@/components/store/home/SapLine";

export default function HomePage() {
  return (
    <main>
      <Hero />
      <ProductsSection />
      <PromoBanner />
      <SapLine />
      <FarmStory />
      <HowToOrder />
      <ContactBand />
    </main>
  );
}
