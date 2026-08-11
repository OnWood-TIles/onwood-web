import MarketingNav from "./components/marketing/MarketingNav";
import Hero from "./components/marketing/Hero";
import FeaturedProducts from "./components/marketing/FeaturedProducts";
import SpecialsTeaser from "./components/marketing/SpecialsTeaser";
import Showroom from "./components/marketing/Showroom";
import Story from "./components/marketing/Story";
import TradeBanner from "./components/marketing/TradeBanner";
import Testimonials from "./components/marketing/Testimonials";
import Team from "./components/marketing/Team";
import Contact from "./components/marketing/Contact";
import MarketingFooter from "./components/marketing/MarketingFooter";
import { getBusiness } from "../lib/onbase/client";

// The OnWood Tiles homepage, rebuilt faithfully from the Claude Design
// reference. Sections in reference order.
export default async function Home() {
  const business = await getBusiness();
  return (
    <div data-theme="terracotta" style={{ background: "var(--bg)", color: "var(--ink)" }}>
      <MarketingNav />
      <main>
        <Hero />
        <FeaturedProducts />
        <SpecialsTeaser />
        <Showroom />
        <Story />
        <Testimonials />
        <Team />
        <TradeBanner />
        <Contact hours={business?.openHoursSummary} />
      </main>
      <MarketingFooter />
    </div>
  );
}
