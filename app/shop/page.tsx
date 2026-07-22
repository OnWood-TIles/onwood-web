import type { Metadata } from "next";
import MarketingNav from "../components/marketing/MarketingNav";
import MarketingFooter from "../components/marketing/MarketingFooter";
import { getShopMenu } from "../../lib/onbase/client";
import { DepartmentTablet, DEPT_TABLET_CSS, EmptyCatalogue } from "../components/shop/shared";

export const metadata: Metadata = {
  title: "Shop",
  description:
    "Choose a department - tiles, tapware and more - and browse the OnWood Tiles range live from our Baringa showroom.",
};

export const dynamic = "force-dynamic";

// Shop = a DEPARTMENT CHOOSER, not a flat product list. The customer picks a
// space (Tiles, Tapware, Carpet...) as large "tablet" cards, then continues into
// that department's filtered grid. Only populated departments show (no dead ends).
export default async function ShopPage() {
  const depts = await getShopMenu();

  return (
    <div data-theme="terracotta" style={{ background: "var(--bg)", color: "var(--ink)" }}>
      <MarketingNav />
      <main style={{ maxWidth: 1240, margin: "0 auto", padding: "150px 28px 96px" }}>
        {/* Editorial header */}
        <header style={{ textAlign: "center", maxWidth: 640, margin: "0 auto 52px" }}>
          <div
            style={{
              fontSize: 12.5,
              fontWeight: 800,
              letterSpacing: ".22em",
              textTransform: "uppercase",
              color: "var(--accent2)",
            }}
          >
            Browse the collection
          </div>
          <h1
            style={{
              fontFamily: "var(--font-archivo)",
              fontWeight: 800,
              fontSize: "clamp(38px,5.2vw,64px)",
              letterSpacing: "-.025em",
              lineHeight: 1.02,
              margin: "14px 0 0",
            }}
          >
            Where would you like to{" "}
            <em style={{ fontFamily: "var(--font-newsreader)", fontStyle: "italic", fontWeight: 500, color: "var(--accent)" }}>
              begin
            </em>
            ?
          </h1>
          <p style={{ color: "#5a6067", fontSize: 16, lineHeight: 1.65, margin: "18px auto 0", maxWidth: 500 }}>
            Pick a space to explore. Everything inside is stocked and tracked in our own system, so what you see is
            what we can actually supply.
          </p>
        </header>

        {depts.length === 0 ? (
          <EmptyCatalogue />
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 340px), 1fr))",
              gap: 24,
            }}
          >
            {depts.map((d, i) => (
              <DepartmentTablet key={d.slug} dept={d} priority={i < 3} />
            ))}
          </div>
        )}
      </main>
      <MarketingFooter />

      <style>{DEPT_TABLET_CSS}</style>
    </div>
  );
}
