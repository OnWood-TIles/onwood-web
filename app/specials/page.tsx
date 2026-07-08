import type { Metadata } from "next";
import MarketingNav from "../components/marketing/MarketingNav";
import MarketingFooter from "../components/marketing/MarketingFooter";
import SpecialsHero from "../components/marketing/SpecialsHero";
import SpecialsGrid from "../components/marketing/SpecialsGrid";
import PackageDeal from "../components/marketing/PackageDeal";
import ReserveBand from "../components/marketing/ReserveBand";

export const metadata: Metadata = {
  title: "Specials",
  description:
    "This month's tile specials at OnWood Tiles - clearance runs, end-of-line stone and whole-home tile packages. While stocks last.",
};

export default function SpecialsPage() {
  return (
    <div data-theme="terracotta" style={{ background: "var(--bg)", color: "var(--ink)" }}>
      <MarketingNav />
      <main>
        <SpecialsHero />
        <SpecialsGrid />
        <PackageDeal />
        <ReserveBand />
      </main>
      <MarketingFooter />
    </div>
  );
}
