import type { Metadata } from "next";
import Link from "next/link";
import MarketingNav from "../components/marketing/MarketingNav";
import MarketingFooter from "../components/marketing/MarketingFooter";
import Reveal from "../components/ui/Reveal";
import FaqClient from "./FaqClient";
import { FAQ_HEAD, FAQ_CATEGORIES, allFaqItems } from "../../lib/faq";
import { stripMarkdown } from "../../lib/markdown";

export const metadata: Metadata = {
  title: "FAQ | Buying Tiles on the Sunshine Coast | OnWood Tiles",
  description:
    "Answers to the questions we get asked most: samples, trade pricing, delivery, slip ratings, measuring, returns and visiting our Sunshine Coast tile showroom.",
  keywords:
    "tile FAQ, Sunshine Coast tiles, buying tiles, tile samples, trade tile pricing, tile delivery, slip ratings, tile returns, how much tile do I need, OnWood Tiles",
  alternates: { canonical: "https://onwoodtiles.com.au/faq" },
  openGraph: {
    title: "Tile buying FAQ | OnWood Tiles",
    description:
      "Samples, trade pricing, delivery, slip ratings, measuring and returns, answered by a local Sunshine Coast tile shop.",
    url: "https://onwoodtiles.com.au/faq",
    type: "website",
  },
};

const eyebrow: React.CSSProperties = { fontSize: 12, fontWeight: 800, letterSpacing: ".2em", textTransform: "uppercase", color: "var(--accent2)", margin: 0 };
const serif = (t: string, c = "var(--sea)") => <em style={{ fontFamily: "var(--font-newsreader)", fontStyle: "italic", fontWeight: 400, letterSpacing: "-.01em", color: c }}>{t}</em>;

export default function FaqPage() {
  // FAQPage structured data (plain-text answers) for rich results.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: allFaqItems().map((it) => ({
      "@type": "Question",
      name: it.q,
      acceptedAnswer: { "@type": "Answer", text: stripMarkdown(it.a, 5000) },
    })),
  };

  return (
    <div data-theme="terracotta" style={{ background: "var(--bg)", color: "var(--ink)", minHeight: "100vh" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <MarketingNav />
      <main>
        {/* ── HERO (headline + tips sidebar) ── */}
        <section style={{ position: "relative", overflow: "hidden", padding: "clamp(92px,15vw,138px) 24px 8px" }}>
          <div style={{ position: "absolute", inset: 0, background: "radial-gradient(1200px 480px at 82% -10%, color-mix(in srgb, var(--sea) 12%, transparent), transparent 60%)", pointerEvents: "none" }} />
          <div style={{ maxWidth: 1040, margin: "0 auto", position: "relative" }}>
            <Reveal>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: 48, alignItems: "start" }}>
                <div style={{ maxWidth: 720 }}>
                  <p style={{ ...eyebrow, color: "var(--accent)" }}>{FAQ_HEAD.eyebrow}</p>
                  <h1 style={{ fontFamily: "var(--font-archivo)", fontWeight: 900, letterSpacing: "-.03em", fontSize: "clamp(32px,5.4vw,54px)", lineHeight: 1.05, margin: "16px 0 0" }}>
                    {FAQ_HEAD.headA} {serif(FAQ_HEAD.headAccent)}.
                  </h1>
                  <p style={{ fontSize: 17.5, lineHeight: 1.75, color: "#3a444a", maxWidth: "50ch", margin: "20px 0 0" }}>{FAQ_HEAD.intro}</p>
                </div>
                <aside className="faq-tips">
                  <p style={{ ...eyebrow, color: "var(--sea)", margin: "0 0 18px" }}>{FAQ_HEAD.tipsTitle}</p>
                  <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 14 }}>
                    {FAQ_HEAD.tips.map((t, i) => (
                      <li key={i} style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                        <span style={{ width: 7, height: 7, background: "var(--accent)", transform: "rotate(45deg)", flex: "none", marginTop: 9 }} />
                        <span style={{ fontSize: 15.5, lineHeight: 1.65, color: "#3a444a" }}>{t}</span>
                      </li>
                    ))}
                  </ul>
                </aside>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ── FAQ (filter + accordion) ── */}
        <section style={{ padding: "8px 0 0" }}>
          <FaqClient categories={FAQ_CATEGORIES} />
        </section>

        {/* ── PULL-QUOTE ── */}
        <section style={{ padding: "0 24px" }}>
          <div style={{ maxWidth: 1040, margin: "0 auto" }}>
            <blockquote style={{ margin: "56px 0 0", padding: "4px 0 4px 26px", borderLeft: "3px solid var(--accent)", maxWidth: 720 }}>
              <p style={{ margin: 0, fontFamily: "var(--font-newsreader)", fontStyle: "italic", fontWeight: 400, fontSize: "clamp(20px,2.4vw,24px)", lineHeight: 1.5, color: "var(--ink)" }}>
                Tiles shift in colour and scale with the light in a room. Take a full-size sample home, live with it for a day, and you will know.
              </p>
              <footer style={{ ...eyebrow, marginTop: 16, color: "var(--muted)" }}>The OnWood showroom team</footer>
            </blockquote>
          </div>
        </section>

        {/* ── CTA ── */}
        <section style={{ padding: "56px 24px 90px" }}>
          <div style={{ maxWidth: 1040, margin: "0 auto", borderRadius: 24, background: "var(--deep)", color: "#F6F1E8", padding: "clamp(30px,4vw,52px)", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 36, alignItems: "center" }} className="faq-cta">
            <div>
              <p style={{ ...eyebrow, color: "var(--accent2)" }}>Still have a question?</p>
              <h2 style={{ fontFamily: "var(--font-archivo)", fontWeight: 900, fontSize: "clamp(26px,3.4vw,36px)", letterSpacing: "-.03em", lineHeight: 1.1, margin: "16px 0 0" }}>Ask us. You will get a person, not a {serif("script", "var(--aqua)")}.</h2>
              <p style={{ color: "rgba(246,241,232,.72)", fontSize: 16.5, lineHeight: 1.7, margin: "16px 0 0", maxWidth: "44ch" }}>Send through your room sizes or plans and we will work out quantities, wastage and the bits your tiler needs.</p>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "flex-start" }}>
              <Link href="/contact" style={{ background: "var(--accent)", color: "#fff", fontWeight: 800, textDecoration: "none", padding: "15px 28px", borderRadius: 999, whiteSpace: "nowrap" }}>Send an enquiry</Link>
              <Link href="/book" style={{ background: "transparent", color: "#F6F1E8", fontWeight: 700, textDecoration: "none", padding: "15px 28px", borderRadius: 999, whiteSpace: "nowrap", border: "1px solid rgba(246,241,232,.28)" }}>Book a showroom visit</Link>
            </div>
          </div>
        </section>
      </main>
      <MarketingFooter />
      <style>{`
        .faq-tips{background:var(--surface);border:1px solid var(--line);border-radius:18px;padding:28px;transition:transform .24s ease,box-shadow .24s ease}
        .faq-tips:hover{transform:translateY(-3px);box-shadow:0 14px 34px rgba(32,48,58,.08)}
        @media(max-width:640px){.faq-cta{grid-template-columns:1fr!important}}
      `}</style>
    </div>
  );
}
