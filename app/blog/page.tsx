import type { Metadata } from "next";
import Link from "next/link";
import MarketingNav from "../components/marketing/MarketingNav";
import MarketingFooter from "../components/marketing/MarketingFooter";
import Reveal from "../components/ui/Reveal";
import { getBlog, type BlogPost } from "../../lib/onbase/client";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Ideas & Inspiration | Tiles, Stone & Renovation | OnWood Tiles, Sunshine Coast",
  description:
    "Ideas, guides and inspiration for tiling and renovating on the Sunshine Coast. Real advice from a local Baringa showroom on tiles, stone cladding, flooring and coastal design.",
  keywords:
    "Sunshine Coast tiles, tile ideas, renovation inspiration, coastal home design, stone cladding, tile inspiration, Baringa, Caloundra, bathroom tiles, outdoor tiles",
  alternates: { canonical: "https://onwoodtiles.com.au/blog" },
  openGraph: {
    title: "Ideas & Inspiration | OnWood Tiles",
    description: "Ideas, guides and inspiration for tiling and renovating on the Sunshine Coast.",
    url: "https://onwoodtiles.com.au/blog",
    type: "website",
  },
};

const eyebrow: React.CSSProperties = { fontSize: 12.5, fontWeight: 800, letterSpacing: ".2em", textTransform: "uppercase", color: "var(--accent2)" };
const serif = (t: string) => <em style={{ fontFamily: "var(--font-newsreader)", fontStyle: "italic", fontWeight: 500, color: "var(--accent)" }}>{t}</em>;
const NICHE_BG = "linear-gradient(160deg, color-mix(in srgb, var(--accent) 16%, var(--surface)), color-mix(in srgb, var(--sea) 12%, var(--surface)))";

const fmtDate = (d: string) => {
  if (!/^\d{4}-\d{2}-\d{2}/.test(d)) return "";
  const [y, m, day] = d.slice(0, 10).split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, day)).toLocaleDateString("en-AU", { day: "numeric", month: "long", year: "numeric" });
};
const readMins = (p: BlogPost) => Math.max(2, Math.round((p.body || "").split(/\s+/).length / 200));

function Cover({ src, alt, style }: { src: string; alt: string; style?: React.CSSProperties }) {
  return (
    <div style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden", background: NICHE_BG, ...style }}>
      {src ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={src} alt={alt} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} /> : null}
    </div>
  );
}

export default async function BlogIndex() {
  const all = await getBlog();
  const posts = all.filter((p) => p.published).sort((a, b) => (b.date || "").localeCompare(a.date || ""));
  const featured = posts[0];
  const rest = posts.slice(1);

  return (
    <div data-theme="terracotta" style={{ background: "var(--bg)", color: "var(--ink)", minHeight: "100vh" }}>
      <MarketingNav />
      <main>
        {/* ── HERO ── */}
        <section style={{ position: "relative", overflow: "hidden", padding: "150px 24px 56px" }}>
          <div style={{ position: "absolute", inset: 0, background: "radial-gradient(1200px 480px at 78% -8%, color-mix(in srgb, var(--sea) 12%, transparent), transparent 60%)", pointerEvents: "none" }} />
          <div style={{ maxWidth: 1100, margin: "0 auto", position: "relative" }}>
            <Reveal>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 9, padding: "7px 14px", borderRadius: 999, background: "color-mix(in srgb, var(--accent) 12%, var(--surface))", border: "1px solid var(--line)" }}>
                <span style={{ width: 7, height: 7, borderRadius: 99, background: "var(--accent)" }} />
                <span style={eyebrow}>The OnWood Journal · Ideas &amp; Inspiration</span>
              </div>
              <h1 style={{ fontFamily: "var(--font-archivo)", fontWeight: 900, letterSpacing: "-.03em", fontSize: "clamp(38px,6.4vw,76px)", lineHeight: 1.02, margin: "20px 0 0", maxWidth: 14 + "ch" }}>
                Ideas, guides &amp; {serif("inspiration")}
              </h1>
              <p style={{ fontSize: "clamp(16px,2vw,20px)", lineHeight: 1.6, color: "var(--muted)", maxWidth: "52ch", margin: "20px 0 0" }}>
                Advice, ideas and inspiration for tiling and renovating on the Sunshine Coast, straight from our Baringa showroom. Real tips on tiles, stone cladding, flooring and getting the whole room right.
              </p>
            </Reveal>
          </div>
        </section>

        {/* ── FEATURED ── */}
        {featured ? (
          <section style={{ padding: "10px 24px 8px" }}>
            <div style={{ maxWidth: 1100, margin: "0 auto" }}>
              <Link href={`/blog/${featured.slug}`} style={{ textDecoration: "none", color: "inherit", display: "grid", gridTemplateColumns: "minmax(0,1.15fr) minmax(0,1fr)", gap: 0, borderRadius: 22, overflow: "hidden", border: "1px solid var(--line)", background: "var(--surface)", boxShadow: "0 40px 80px -50px rgba(16,28,30,.5)" }} className="bl-feat">
                <div style={{ minHeight: 340, aspectRatio: "16/11" }}><Cover src={featured.coverImage} alt={featured.title} /></div>
                <div style={{ padding: "clamp(22px,3vw,40px)", display: "flex", flexDirection: "column", justifyContent: "center" }}>
                  <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                    <span style={{ ...eyebrow, color: "var(--accent)" }}>{featured.category || "Latest"}</span>
                    <span style={{ fontSize: 12.5, color: "var(--muted)" }}>{fmtDate(featured.date)} · {readMins(featured)} min read</span>
                  </div>
                  <h2 style={{ fontFamily: "var(--font-archivo)", fontWeight: 800, letterSpacing: "-.02em", fontSize: "clamp(26px,3.2vw,40px)", lineHeight: 1.08, margin: "12px 0 0" }}>{featured.title}</h2>
                  <p style={{ fontSize: 16, lineHeight: 1.65, color: "var(--muted)", margin: "14px 0 0" }}>{featured.excerpt}</p>
                  <span style={{ marginTop: 22, display: "inline-flex", alignItems: "center", gap: 8, fontWeight: 800, color: "var(--accent)", fontSize: 15 }}>Read the guide <span aria-hidden>→</span></span>
                </div>
              </Link>
            </div>
          </section>
        ) : (
          <section style={{ padding: "40px 24px 80px" }}>
            <div style={{ maxWidth: 720, margin: "0 auto", textAlign: "center", border: "1px dashed var(--line)", borderRadius: 20, padding: "60px 28px", background: "var(--surface)" }}>
              <p style={eyebrow}>Coming soon</p>
              <h2 style={{ fontFamily: "var(--font-archivo)", fontWeight: 800, fontSize: 28, margin: "8px 0 10px" }}>Our first guides are on the way</h2>
              <p style={{ color: "var(--muted)", fontSize: 16, lineHeight: 1.6, maxWidth: "46ch", margin: "0 auto" }}>Fresh ideas and inspiration for your next project, landing here shortly. In the meantime, come and see us in the showroom.</p>
              <Link href="/book" style={{ display: "inline-block", marginTop: 22, background: "var(--accent)", color: "#fff", fontWeight: 800, textDecoration: "none", padding: "13px 26px", borderRadius: 999 }}>Book a showroom visit</Link>
            </div>
          </section>
        )}

        {/* ── GRID ── */}
        {rest.length > 0 && (
          <section style={{ padding: "40px 24px 20px" }}>
            <div style={{ maxWidth: 1100, margin: "0 auto" }}>
              <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 16, marginBottom: 22 }}>
                <h2 style={{ fontFamily: "var(--font-archivo)", fontWeight: 800, letterSpacing: "-.02em", fontSize: "clamp(22px,2.6vw,30px)", margin: 0 }}>More {serif("reads")}</h2>
                <span style={{ fontSize: 13, color: "var(--muted)" }}>{rest.length} more guide{rest.length === 1 ? "" : "s"}</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: 22 }}>
                {rest.map((p) => (
                  <Link key={p.slug} href={`/blog/${p.slug}`} style={{ textDecoration: "none", color: "inherit", display: "flex", flexDirection: "column", borderRadius: 18, overflow: "hidden", border: "1px solid var(--line)", background: "var(--surface)", height: "100%" }} className="bl-card">
                    <div style={{ aspectRatio: "16/10" }}><Cover src={p.coverImage} alt={p.title} /></div>
                    <div style={{ padding: 20, display: "flex", flexDirection: "column", flex: 1 }}>
                      <div style={{ display: "flex", gap: 9, alignItems: "center", flexWrap: "wrap" }}>
                        <span style={{ ...eyebrow, fontSize: 11, color: "var(--accent)" }}>{p.category || "Guide"}</span>
                        <span style={{ fontSize: 12, color: "var(--muted)" }}>{readMins(p)} min</span>
                      </div>
                      <h3 style={{ fontFamily: "var(--font-archivo)", fontWeight: 800, letterSpacing: "-.015em", fontSize: 20, lineHeight: 1.16, margin: "10px 0 0" }}>{p.title}</h3>
                      <p style={{ fontSize: 14.5, lineHeight: 1.6, color: "var(--muted)", margin: "10px 0 0" }}>{p.excerpt}</p>
                      <span style={{ marginTop: "auto", paddingTop: 16, fontWeight: 800, color: "var(--accent)", fontSize: 14 }}>Read →</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── CTA ── */}
        <section style={{ padding: "70px 24px 90px" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto", borderRadius: 24, background: "var(--deep)", color: "#F6F1E8", padding: "clamp(30px,4vw,54px)", display: "grid", gridTemplateColumns: "minmax(0,1fr) auto", gap: 24, alignItems: "center" }} className="bl-cta">
            <div>
              <p style={{ ...eyebrow, color: "var(--accent2)" }}>Sunshine Coast showroom</p>
              <h2 style={{ fontFamily: "var(--font-archivo)", fontWeight: 800, fontSize: "clamp(24px,3vw,36px)", letterSpacing: "-.02em", margin: "8px 0 0" }}>Ready to see it in person?</h2>
              <p style={{ color: "rgba(246,241,232,.72)", fontSize: 16, lineHeight: 1.6, margin: "12px 0 0", maxWidth: "48ch" }}>Bring your photos or plans to our Baringa showroom and we&apos;ll help you get the whole room right.</p>
            </div>
            <Link href="/book" style={{ justifySelf: "start", background: "var(--accent)", color: "#fff", fontWeight: 800, textDecoration: "none", padding: "15px 30px", borderRadius: 999, whiteSpace: "nowrap" }}>Book a visit</Link>
          </div>
        </section>
      </main>
      <MarketingFooter />
      <style>{`
        .bl-feat:hover,.bl-card:hover{transform:translateY(-3px);box-shadow:0 34px 70px -46px rgba(16,28,30,.55)}
        .bl-feat,.bl-card{transition:transform .25s ease,box-shadow .25s ease}
        @media(max-width:820px){.bl-feat{grid-template-columns:1fr!important}.bl-cta{grid-template-columns:1fr!important}}
      `}</style>
    </div>
  );
}
