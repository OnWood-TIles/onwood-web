import type { Metadata } from "next";
import MarketingNav from "../../components/marketing/MarketingNav";
import MarketingFooter from "../../components/marketing/MarketingFooter";
import TradeApplyForm from "./TradeApplyForm";

export const metadata: Metadata = {
  title: "Become a Trade Partner | OnWood Tiles",
  description:
    "Apply for a trade account with OnWood Tiles. Trade pricing, priority ordering and a Sunshine Coast partner for builders, tilers, designers and developers.",
  robots: { index: false, follow: false },
};

const eyebrow: React.CSSProperties = { fontSize: 12, fontWeight: 800, letterSpacing: ".2em", textTransform: "uppercase", color: "var(--accent)" };
const serif = (t: string) => <em style={{ fontFamily: "var(--font-newsreader)", fontStyle: "italic", fontWeight: 400, color: "var(--sea)" }}>{t}</em>;

const PERKS = [
  ["Trade pricing", "Your own pricing tier across the range, shown when you're signed in."],
  ["Order online", "Browse the full catalogue and place stock orders from the portal."],
  ["A local partner", "A Sunshine Coast team who'll help you match, quote and get it on site."],
];

export default function TradeApplyPage() {
  return (
    <div data-theme="terracotta" style={{ background: "var(--bg)", color: "var(--ink)", minHeight: "100vh" }}>
      <MarketingNav />
      <main>
        <section style={{ position: "relative", overflow: "hidden", padding: "clamp(96px,16vw,150px) 24px 8px" }}>
          <div style={{ position: "absolute", inset: 0, background: "radial-gradient(1200px 480px at 82% -10%, color-mix(in srgb, var(--sea) 12%, transparent), transparent 60%)", pointerEvents: "none" }} />
          <div style={{ maxWidth: 1080, margin: "0 auto", position: "relative" }}>
            <p style={eyebrow}>Trade partners</p>
            <h1 style={{ fontFamily: "var(--font-archivo)", fontWeight: 900, letterSpacing: "-.03em", fontSize: "clamp(34px,5.4vw,58px)", lineHeight: 1.03, margin: "14px 0 0", maxWidth: "16ch" }}>
              Build with us, {serif("partner")}.
            </h1>
            <p style={{ fontSize: 17.5, lineHeight: 1.7, color: "#3a444a", maxWidth: "54ch", margin: "18px 0 0" }}>
              Trade pricing, priority ordering and a local team who knows tiles. Apply below and we&rsquo;ll get you set up.
            </p>
          </div>
        </section>

        <section style={{ padding: "34px 24px 90px" }}>
          <div style={{ maxWidth: 1080, margin: "0 auto", display: "grid", gridTemplateColumns: "minmax(0,0.8fr) minmax(0,1.1fr)", gap: 36, alignItems: "start" }} className="ta-grid">
            <div style={{ display: "flex", flexDirection: "column", gap: 18, position: "sticky", top: 96 }}>
              {PERKS.map(([t, d]) => (
                <div key={t} style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                  <span style={{ width: 9, height: 9, background: "var(--accent)", transform: "rotate(45deg)", flex: "none", marginTop: 7 }} />
                  <div>
                    <div style={{ fontFamily: "var(--font-archivo)", fontWeight: 800, fontSize: 16.5, color: "var(--ink)" }}>{t}</div>
                    <div style={{ fontSize: 14.5, lineHeight: 1.6, color: "var(--muted)", marginTop: 3 }}>{d}</div>
                  </div>
                </div>
              ))}
            </div>
            <TradeApplyForm />
          </div>
        </section>
      </main>
      <MarketingFooter />
      <style>{`@media(max-width:820px){.ta-grid{grid-template-columns:1fr!important}}`}</style>
    </div>
  );
}
