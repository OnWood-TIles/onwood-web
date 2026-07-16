import type { Metadata } from "next";
import MarketingNav from "../components/marketing/MarketingNav";
import MarketingFooter from "../components/marketing/MarketingFooter";
import { getNav, getTaxonomy } from "../../lib/onbase/client";
import NavDesigner from "./NavDesigner";

export const metadata: Metadata = { title: "Site Admin", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

// Staff-only site admin (the proxy keeps /admin behind the preview cookie in
// ALL modes, including after launch). v1: the navigation designer.
export default async function AdminPage() {
  const [items, taxonomy] = await Promise.all([getNav(), getTaxonomy()]);
  return (
    <div data-theme="terracotta" style={{ background: "var(--bg)", color: "var(--ink)", minHeight: "100vh" }}>
      <MarketingNav />
      <main style={{ maxWidth: 980, margin: "0 auto", padding: "150px 28px 90px" }}>
        <p style={{ fontSize: 12, fontWeight: 800, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--accent)", margin: 0 }}>
          Site admin
        </p>
        <h1 style={{ fontFamily: "var(--font-archivo)", fontWeight: 800, fontSize: "clamp(28px,4vw,42px)", letterSpacing: "-.02em", margin: "6px 0 10px" }}>
          Navigation designer
        </h1>
        <p style={{ color: "#5a6067", fontSize: 15, lineHeight: 1.65, maxWidth: 640, margin: "0 0 30px" }}>
          Design the site&apos;s main menu. An item can be a simple link, or a popup with entries built from your
          OnBase shop departments and categories. Changes go live the moment you save.
        </p>
        <NavDesigner initialItems={items} taxonomy={taxonomy} />
      </main>
      <MarketingFooter />
    </div>
  );
}
