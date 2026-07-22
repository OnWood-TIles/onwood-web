import Link from "next/link";
import MarketingNav from "./MarketingNav";
import MarketingFooter from "./MarketingFooter";
import Reveal from "../ui/Reveal";
import { LEGAL_BUSINESS, type LegalDoc, type LegalBlock } from "../../../lib/legal";

// Shared renderer for the Terms of Service + Terms of Website Use pages. Clean,
// readable legal layout: hero, sticky table of contents (desktop), numbered
// sections, and a "questions?" contact callout. On-brand but restrained.

const paragraph: React.CSSProperties = {
  color: "#4a5560",
  fontSize: 16,
  lineHeight: 1.78,
  margin: "0 0 14px",
};

function Block({ block }: { block: LegalBlock }) {
  if (block.type === "sub") {
    return <h3 style={{ fontFamily: "var(--font-archivo)", fontWeight: 800, fontSize: 17, letterSpacing: "-.01em", margin: "20px 0 8px", color: "var(--ink)" }}>{block.text}</h3>;
  }
  if (block.type === "list") {
    return (
      <ul style={{ margin: "4px 0 16px", padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 10 }}>
        {block.items.map((it, i) => (
          <li key={i} style={{ position: "relative", paddingLeft: 22, color: "#4a5560", fontSize: 16, lineHeight: 1.7 }}>
            <span aria-hidden style={{ position: "absolute", left: 0, top: 9, width: 7, height: 7, borderRadius: 2, background: "var(--accent)" }} />
            {it}
          </li>
        ))}
      </ul>
    );
  }
  return <p style={paragraph}>{block.text}</p>;
}

export default function LegalPage({ doc, updated }: { doc: LegalDoc; updated: string }) {
  return (
    <div data-theme="terracotta" style={{ background: "var(--bg)", color: "var(--ink)" }}>
      <MarketingNav />
      <main>
        {/* Hero */}
        <section style={{ maxWidth: 1100, margin: "0 auto", padding: "140px 40px 8px" }}>
          <Reveal>
            <div style={{ fontSize: 12.5, fontWeight: 800, letterSpacing: ".2em", textTransform: "uppercase", color: "var(--accent2)" }}>{doc.eyebrow}</div>
          </Reveal>
          <Reveal delay={0.06}>
            <h1 style={{ fontFamily: "var(--font-archivo)", fontWeight: 800, fontSize: "clamp(36px,5vw,60px)", letterSpacing: "-.025em", lineHeight: 1.03, margin: "14px 0 0" }}>{doc.title}</h1>
          </Reveal>
          <Reveal delay={0.1}>
            <div style={{ display: "inline-block", marginTop: 16, fontSize: 12.5, fontWeight: 700, color: "var(--muted)", background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 999, padding: "5px 14px" }}>
              Last updated {updated}
            </div>
          </Reveal>
          <Reveal delay={0.14}>
            <p style={{ color: "#5a6067", fontSize: 17, lineHeight: 1.7, margin: "22px 0 0", maxWidth: 720 }}>{doc.intro}</p>
          </Reveal>
        </section>

        {/* TOC + body */}
        <section style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 40px 100px" }}>
          <div className="lg-grid">
            {/* Sticky table of contents (desktop) */}
            <aside className="lg-toc">
              <div style={{ position: "sticky", top: 100 }}>
                <div style={{ fontSize: 11.5, fontWeight: 800, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 12 }}>On this page</div>
                <nav style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  {doc.sections.map((s, i) => (
                    <a key={s.id} href={`#${s.id}`} className="lg-toc-link">
                      <span style={{ color: "var(--accent)", fontWeight: 800, fontSize: 12, minWidth: 18 }}>{i + 1}</span>
                      {s.heading}
                    </a>
                  ))}
                </nav>
              </div>
            </aside>

            {/* Article */}
            <article style={{ maxWidth: 720 }}>
              {doc.sections.map((s, i) => (
                <section key={s.id} id={s.id} style={{ marginBottom: 40, scrollMarginTop: 96 }}>
                  <h2 style={{ fontFamily: "var(--font-archivo)", fontWeight: 800, fontSize: "clamp(21px,2.4vw,26px)", letterSpacing: "-.015em", margin: "0 0 14px", lineHeight: 1.2 }}>
                    <span style={{ color: "var(--accent)" }}>{i + 1}.</span> {s.heading}
                  </h2>
                  {s.blocks.map((b, bi) => <Block key={bi} block={b} />)}
                </section>
              ))}

              {/* Questions callout */}
              <div style={{ marginTop: 8, background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 20, padding: "26px 26px", boxShadow: "0 18px 44px -28px rgba(32,48,58,.3)" }}>
                <h3 style={{ fontFamily: "var(--font-archivo)", fontWeight: 800, fontSize: 19, letterSpacing: "-.01em", margin: "0 0 8px" }}>Questions about these terms?</h3>
                <p style={{ ...paragraph, margin: "0 0 16px" }}>
                  We&rsquo;re happy to talk anything through. Get in touch and we&rsquo;ll help.
                </p>
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                  <Link href="/contact" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "var(--accent)", color: "#fff6ee", fontWeight: 800, fontSize: 14.5, padding: "12px 22px", borderRadius: 999, textDecoration: "none" }}>
                    Contact us <span aria-hidden>&rarr;</span>
                  </Link>
                  <a href={`mailto:${LEGAL_BUSINESS.email}`} style={{ display: "inline-flex", alignItems: "center", gap: 8, color: "var(--ink)", fontWeight: 800, fontSize: 14.5, padding: "12px 20px", borderRadius: 999, textDecoration: "none", border: "1.5px solid var(--line)" }}>
                    {LEGAL_BUSINESS.email}
                  </a>
                </div>
              </div>
            </article>
          </div>
        </section>
      </main>
      <MarketingFooter />

      <style>{`
        .lg-grid{display:grid;grid-template-columns:240px minmax(0,1fr);gap:52px;align-items:start;}
        .lg-toc{display:block;}
        .lg-toc-link{display:flex;gap:9px;align-items:baseline;padding:6px 8px;border-radius:8px;font-size:13.5px;line-height:1.4;color:var(--muted);text-decoration:none;transition:color .2s ease, background .2s ease;}
        .lg-toc-link:hover{color:var(--ink);background:color-mix(in srgb, var(--accent) 8%, transparent);}
        @media(max-width:900px){
          .lg-grid{grid-template-columns:1fr;gap:0;}
          .lg-toc{display:none;}
        }
      `}</style>
    </div>
  );
}
