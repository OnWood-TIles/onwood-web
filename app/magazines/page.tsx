import type { Metadata } from "next";
import Link from "next/link";
import MarketingNav from "../components/marketing/MarketingNav";
import MarketingFooter from "../components/marketing/MarketingFooter";
import { MAGAZINES } from "../../lib/magazines";

export const metadata: Metadata = {
  title: "Magazines",
  description: "Read OnWood's magazines online or download a copy: Kiln, about tiles and the homes they belong in, and Kiln: The Vanity Edition, a guide to Marquis vanities.",
  alternates: { canonical: "/magazines" },
  openGraph: { title: "Magazines · OnWood Tiles", description: "Kiln and Kiln: The Vanity Edition. Flick through online, or download a copy to keep.", url: "https://onwoodtiles.com.au/magazines", type: "website", images: [MAGAZINES[0].cover] },
};

// Landing page for every OnWood magazine: a big cover card per issue, each opening its flip reader.
export default function MagazinesPage() {
  return (
    <div data-theme="terracotta" style={{ background: "var(--bg)", color: "var(--ink)" }}>
      <MarketingNav />
      <style>{`.mz-card{display:grid;grid-template-columns:minmax(0,.8fr) minmax(0,1.2fr);gap:clamp(22px,4vw,48px);align-items:center;background:var(--surface);border:1px solid var(--line);border-radius:16px;padding:clamp(20px,3vw,36px)}
.mz-cover{display:block;justify-self:center;transition:transform .5s ease}
.mz-cover:hover{transform:rotate(-1deg) translateY(-4px)}
@media (max-width:760px){.mz-card{grid-template-columns:1fr;text-align:center}.mz-btns{justify-content:center}.mz-list{text-align:left;display:inline-block}}`}</style>
      <section style={{ padding: "128px 24px 40px", textAlign: "center" }}>
        <div style={{ fontFamily: "var(--font-archivo)", fontWeight: 800, fontSize: 12.5, letterSpacing: ".16em", textTransform: "uppercase", color: "var(--accent)" }}>Read online or download</div>
        <h1 style={{ fontFamily: "var(--font-archivo)", fontWeight: 900, letterSpacing: "-.035em", fontSize: "clamp(40px,7vw,76px)", lineHeight: 0.95, margin: "12px 0 0" }}>
          Our <span style={{ fontFamily: "var(--font-newsreader)", fontStyle: "italic", fontWeight: 400 }}>magazines</span>
        </h1>
        <p style={{ fontSize: "clamp(16px,1.8vw,19px)", lineHeight: 1.6, color: "var(--muted)", maxWidth: "56ch", margin: "16px auto 0" }}>
          Real pages, designed to print. Flick through them here just like the copy on the showroom table, or download one to keep.
        </p>
      </section>
      <section style={{ padding: "16px 24px 90px" }}>
        <div style={{ maxWidth: 1080, margin: "0 auto", display: "flex", flexDirection: "column", gap: 28 }}>
          {MAGAZINES.map((m) => (
            <article key={m.slug} className="mz-card">
              <Link href={`/magazines/${m.slug}`} className="mz-cover" aria-label={`Read ${m.title}`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={m.cover} alt={`${m.title}, ${m.issue} cover`} style={{ width: "min(320px,70vw)", height: "auto", borderRadius: 8, display: "block", transform: "rotate(-2deg)", boxShadow: "0 40px 70px -28px rgba(0,0,0,.6)" }} />
              </Link>
              <div>
                <div style={{ fontFamily: "var(--font-archivo)", fontWeight: 800, fontSize: 12, letterSpacing: ".16em", textTransform: "uppercase", color: "var(--accent2)" }}>{m.issue} · {m.pages} pages</div>
                <h2 style={{ fontFamily: "var(--font-archivo)", fontWeight: 900, letterSpacing: "-.03em", fontSize: "clamp(30px,4vw,46px)", lineHeight: 1.02, margin: "10px 0 0" }}>{m.title}</h2>
                <p style={{ fontSize: 17, lineHeight: 1.6, color: "var(--muted)", margin: "12px 0 0" }}>{m.standfirst}</p>
                <ul className="mz-list" style={{ margin: "16px 0 0", padding: "0 0 0 18px", fontSize: 15, lineHeight: 1.75 }}>
                  {m.inside.map((t) => <li key={t}>{t}</li>)}
                </ul>
                <div className="mz-btns" style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 24 }}>
                  <Link href={`/magazines/${m.slug}`} style={{ display: "inline-flex", alignItems: "center", gap: 10, background: "var(--accent)", color: "#fff", fontWeight: 800, fontSize: 15, textDecoration: "none", padding: "14px 27px", borderRadius: 999 }}>
                    Flip through it <span aria-hidden>→</span>
                  </Link>
                  <a href={m.download} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 9, background: "var(--bg)", color: "var(--ink)", fontWeight: 800, fontSize: 15, textDecoration: "none", padding: "14px 24px", borderRadius: 999, border: "1px solid var(--line)" }}>
                    Download the PDF
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
      <MarketingFooter />
    </div>
  );
}
