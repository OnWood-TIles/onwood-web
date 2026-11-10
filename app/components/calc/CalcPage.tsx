import Link from "next/link";
import MarketingNav from "../marketing/MarketingNav";
import MarketingFooter from "../marketing/MarketingFooter";
import { calcStyles } from "../../../lib/laticreteCalc";

// Shared shell for /grout-calculator and /adhesive-calculator.

const eyebrow: React.CSSProperties = { fontSize: 12, fontWeight: 800, letterSpacing: ".2em", textTransform: "uppercase", color: "var(--accent)", margin: 0 };
const it: React.CSSProperties = { fontFamily: "var(--font-newsreader)", fontStyle: "italic", fontWeight: 400, color: "var(--sea)" };

export default function CalcPage({ title, italic, intro, tool, faqs, other }: {
  title: string; italic: string; intro: string; tool: React.ReactNode;
  faqs: { q: string; a: string }[]; other: { href: string; label: string };
}) {
  const faqLd = { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) };
  return (
    <div data-theme="terracotta" style={{ background: "var(--bg)", color: "var(--ink)", minHeight: "100vh" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd).replace(/</g, "\\u003c") }} />
      <MarketingNav />
      <main style={{ maxWidth: 1180, margin: "0 auto", padding: "clamp(96px,16vw,150px) 24px 90px" }}>
        <p style={eyebrow}>Free tool · LATICRETE</p>
        <h1 style={{ fontFamily: "var(--font-archivo)", fontWeight: 900, letterSpacing: "-.03em", fontSize: "clamp(34px,5.4vw,58px)", lineHeight: 1.03, margin: "14px 0 0" }}>
          {title} <em style={it}>{italic}</em>
        </h1>
        <p style={{ fontSize: 17, lineHeight: 1.7, color: "#3a444a", maxWidth: "62ch", margin: "16px 0 28px" }}>{intro}</p>
        {tool}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, margin: "26px 0 0" }}>
          <Link href={other.href} className="lc-btn">{other.label}</Link>
          <Link href="/adhesive-and-grout-guide" className="lc-btn">LATICRETE adhesive & grout guide</Link>
          <Link href="/calculator" className="lc-btn">Tile calculator</Link>
          <Link href="/shop/adhesives" className="lc-btn lc-btn-dark">Shop adhesive & grout</Link>
        </div>
        <section style={{ marginTop: 56, maxWidth: 860 }}>
          <h2 style={{ fontFamily: "var(--font-archivo)", fontWeight: 800, fontSize: 28, margin: "0 0 12px" }}>Good to know</h2>
          {faqs.map((f) => (
            <details key={f.q} className="ow-faq" style={{ borderBottom: "1px solid var(--line)" }}>
              <summary style={{ listStyle: "none", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, padding: "18px 2px", fontFamily: "var(--font-archivo)", fontWeight: 700, fontSize: 17, lineHeight: 1.35 }}>
                {f.q}<span className="ow-faq-plus" aria-hidden style={{ flexShrink: 0, fontSize: 24, lineHeight: 1, color: "var(--accent)", transition: "transform .2s ease" }}>+</span>
              </summary>
              <p style={{ fontSize: 16, lineHeight: 1.7, color: "#3a444a", margin: "0 0 18px", maxWidth: "72ch" }}>{f.a}</p>
            </details>
          ))}
          <p style={{ fontSize: 13, color: "#8a8577", marginTop: 22 }}>
            Calculated with LATICRETE Australia&apos;s own coverage formulas. Estimates only: actual use depends on the site, the tile and the installer. Add the products to your quote with your area and we will check the quantities for you.
          </p>
        </section>
        <style>{`${calcStyles}
          .ow-faq > summary::-webkit-details-marker { display: none; }
          .ow-faq[open] .ow-faq-plus { transform: rotate(45deg); }
          .lc-btn { display: inline-block; padding: 11px 18px; border-radius: 99px; border: 1px solid var(--line); background: #fff; color: var(--ink); font-weight: 700; font-size: 14px; text-decoration: none; }
          .lc-btn-dark { background: var(--ink); color: #fff; border-color: var(--ink); }
        `}</style>
      </main>
      <MarketingFooter />
    </div>
  );
}
