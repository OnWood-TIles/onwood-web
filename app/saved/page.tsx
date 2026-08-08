import type { Metadata } from "next";
import MarketingNav from "../components/marketing/MarketingNav";
import MarketingFooter from "../components/marketing/MarketingFooter";
import SavedClient from "./SavedClient";

// Personalised page - no SEO value, keep it out of the index.
export const metadata: Metadata = {
  title: "Your saved tiles | OnWood Tiles",
  robots: { index: false, follow: false },
};

const eyebrow: React.CSSProperties = { fontSize: 12, fontWeight: 800, letterSpacing: ".2em", textTransform: "uppercase", color: "var(--accent)" };
const serif = (t: string) => <em style={{ fontFamily: "var(--font-newsreader)", fontStyle: "italic", fontWeight: 400, color: "var(--sea)" }}>{t}</em>;

export default function SavedPage() {
  return (
    <div data-theme="terracotta" style={{ background: "var(--bg)", color: "var(--ink)", minHeight: "100vh" }}>
      <MarketingNav />
      <main>
        <section style={{ padding: "150px 24px 8px" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            <p style={eyebrow}>Your selections</p>
            <h1 style={{ fontFamily: "var(--font-archivo)", fontWeight: 900, letterSpacing: "-.03em", fontSize: "clamp(32px,5vw,54px)", lineHeight: 1.03, margin: "14px 0 0" }}>
              The tiles you {serif("love")}.
            </h1>
            <p style={{ fontSize: 17, lineHeight: 1.7, color: "#3a444a", maxWidth: "54ch", margin: "16px 0 0" }}>
              Everything you have saved, in one place. Send it to yourself and bring it in, and we will help you get the whole room right.
            </p>
          </div>
        </section>
        <section style={{ padding: "34px 24px 90px" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            <SavedClient />
          </div>
        </section>
      </main>
      <MarketingFooter />
    </div>
  );
}
