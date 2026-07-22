import MarketingNav from "./components/marketing/MarketingNav";
import Hero from "./components/marketing/Hero";
import Marquee from "./components/marketing/Marquee";
import TileGrid from "./components/marketing/TileGrid";
import FeaturedProducts from "./components/marketing/FeaturedProducts";
import SpecialsTeaser from "./components/marketing/SpecialsTeaser";
import Visualiser from "./components/marketing/Visualiser";
import Showroom from "./components/marketing/Showroom";
import Story from "./components/marketing/Story";
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
        <Marquee />
        <TileGrid />
        <FeaturedProducts />
        <SpecialsTeaser />
        <Visualiser />
        <Showroom />
        <Story />
        <Testimonials />
        <Team />
        <Contact hours={business?.openHoursSummary} />
      </main>
      <MarketingFooter />
    </div>
  );
}
