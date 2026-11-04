import type { Metadata } from "next";
import MarketingNav from "../components/marketing/MarketingNav";
import MarketingFooter from "../components/marketing/MarketingFooter";
import { SHOP } from "../../lib/content";
import QuoteClient from "./QuoteClient";

// Personalised page - no SEO value, keep it out of the index.
export const metadata: Metadata = {
  title: "Your quote list | OnWood Tiles",
  robots: { index: false, follow: false },
};

const eyebrow: React.CSSProperties = { fontSize: 12, fontWeight: 800, letterSpacing: ".2em", textTransform: "uppercase", color: "var(--accent)" };

export default function QuotePage() {
  return (
    <div data-theme="terracotta" style={{ background: "var(--bg)", color: "var(--ink)", minHeight: "100vh" }}>
      <MarketingNav />
      <main>
        <section style={{ padding: "clamp(96px,16vw,150px) 24px 8px" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            <p style={eyebrow}>Your quote list</p>
            <h1 style={{ fontFamily: "var(--font-archivo)", fontWeight: 900, letterSpacing: "-.03em", fontSize: "clamp(32px,5vw,54px)", lineHeight: 1.03, margin: "14px 0 0" }}>
              Get a quote
            </h1>
            <p style={{ fontSize: 17, lineHeight: 1.7, color: "#3a444a", maxWidth: "58ch", margin: "16px 0 0" }}>
              Set your quantities, tell us where it is going, and we will check stock and batch numbers and send you a proper quote, usually within one business day.
            </p>
          </div>
        </section>
        <QuoteClient pickupAddress={`${SHOP.street}, Baringa`} />
      </main>
      <MarketingFooter />
    </div>
  );
}
