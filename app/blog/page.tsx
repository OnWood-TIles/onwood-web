import type { Metadata } from "next";
import Link from "next/link";
import MarketingNav from "../components/marketing/MarketingNav";
import MarketingFooter from "../components/marketing/MarketingFooter";
import Reveal from "../components/ui/Reveal";
import { getBlog, type BlogPost } from "../../lib/onbase/client";
import BlogSearch from "./BlogSearch";

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
  const eff = (p: BlogPost) => p.updatedDate || p.date || "";
  const posts = all.filter((p) => p.published).sort((a, b) => eff(b).localeCompare(eff(a)));
  // The pinned post is always the big featured slot (regardless of date). Pinned
  // by slug (the feed strips unknown fields, so a `pinned` flag would not survive);
  // falls back to a `pinned` flag, then to the newest post.
  const PINNED_SLUG = "best-floor-covering-for-every-room";
  const featured = posts.find((p) => p.slug === PINNED_SLUG) ?? posts.find((p) => p.pinned) ?? posts[0];
  const rest = posts.filter((p) => p !== featured);
  // Minimal, serialisable data for the client-side blog search (searches all posts).
  const searchData = posts.map((p) => ({ slug: p.slug, title: p.title, excerpt: p.excerpt, category: p.category, coverImage: p.coverImage, keywords: p.keywords, mins: readMins(p) }));

  return (
    <div data-theme="terracotta" style={{ background: "var(--bg)", color: "var(--ink)", minHeight: "100vh" }}>
      <MarketingNav />
      <main>
        {/* ── HERO ── */}
        <section style={{ position: "relative", overflow: "hidden", padding: "clamp(96px,16vw,150px) 24px 56px" }}>
          <div style={{ position: "absolute", inset: 0, background: "radial-gradient(1200px 480px at 78% -8%, color-mix(in srgb, var(--sea) 12%, transparent), transparent 60%)", pointerEvents: "none" }} />
          <div style={{ maxWidth: 1100, margin: "0 auto", position: "relative" }}>
            <div className="bl-hero-grid" style={{ display: "grid", gridTemplateColumns: "minmax(0,1.12fr) minmax(0,0.88fr)", gap: 44, alignItems: "center" }}>
              {/* Left: intro */}
              <Reveal>
                <div>
                  <div style={{ display: "inline-flex", alignItems: "center", gap: 9, padding: "7px 14px", borderRadius: 999, background: "color-mix(in srgb, var(--accent) 12%, var(--surface))", border: "1px solid var(--line)" }}>
                    <span style={{ width: 7, height: 7, borderRadius: 99, background: "var(--accent)" }} />
                    <span style={eyebrow}>The OnWood Journal · Ideas &amp; Inspiration</span>
                  </div>
                  <h1 style={{ fontFamily: "var(--font-archivo)", fontWeight: 900, letterSpacing: "-.03em", fontSize: "clamp(34px,5vw,62px)", lineHeight: 1.03, margin: "20px 0 0", maxWidth: 14 + "ch" }}>
                    Ideas, guides &amp; {serif("inspiration")}
                  </h1>
                  <p style={{ fontSize: "clamp(16px,2vw,20px)", lineHeight: 1.6, color: "var(--muted)", maxWidth: "52ch", margin: "20px 0 0" }}>
                    Advice, ideas and inspiration for tiling and renovating on the Sunshine Coast, straight from our Baringa showroom. Real tips on tiles, stone cladding, flooring and getting the whole room right.
                  </p>
                </div>
              </Reveal>

              {/* Right: gallery card */}
              <Reveal delay={0.12}>
                <Link href="/gallery" className="bl-gallink" style={{ position: "relative", overflow: "hidden", display: "flex", flexDirection: "column", gap: 14, minHeight: 260, textDecoration: "none", color: "#F6F1E8", background: "var(--deep)", borderRadius: 22, padding: "clamp(24px,2.6vw,32px)" }}>
                  <span aria-hidden style={{ position: "absolute", inset: 0, background: "radial-gradient(460px 220px at 92% 118%, color-mix(in srgb, var(--accent) 44%, transparent), transparent 62%)", pointerEvents: "none" }} />
                  <span style={{ position: "relative" }}>
                    <span style={{ ...eyebrow, color: "var(--accent2)" }}>The gallery</span>
                    <span style={{ display: "block", fontFamily: "var(--font-archivo)", fontWeight: 900, letterSpacing: "-.025em", fontSize: "clamp(23px,2.6vw,32px)", lineHeight: 1.08, margin: "12px 0 0" }}>
                      Our tiles &amp; stone,<br />{serif("styled to inspire")}
                    </span>
                    <span style={{ display: "block", fontSize: 15, lineHeight: 1.6, color: "rgba(246,241,232,.74)", margin: "12px 0 0" }}>
                      Browse hundreds of looks for your next project.
                    </span>
                  </span>
                  <span className="bl-gallink-cta" style={{ position: "relative", marginTop: "auto", alignSelf: "flex-start", display: "inline-flex", alignItems: "center", gap: 10, background: "var(--accent)", color: "#fff", fontWeight: 800, fontSize: 15, padding: "13px 24px", borderRadius: 999, whiteSpace: "nowrap" }}>
                    Open the gallery <span aria-hidden>→</span>
                  </span>
                </Link>
              </Reveal>
            </div>
          </div>
        </section>

        {/* ── KILN MAGAZINE ── */}
        <section style={{ padding: "28px 24px 32px" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            <div className="bl-mag" style={{ position: "relative", display: "grid", gridTemplateColumns: "minmax(0,0.86fr) minmax(0,1.14fr)", gap: "clamp(22px,4vw,52px)", alignItems: "center", color: "var(--ink)", padding: "clamp(14px,2.4vw,30px) clamp(4px,1.5vw,18px)" }}>
              {/* cover */}
              <div className="bl-mag-cov" style={{ position: "relative", justifySelf: "center" }}>
                <Link href="/magazine" aria-label="Open the Kiln magazine" style={{ display: "block" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/images/magazine/kiln-cover.webp" alt="Kiln magazine, Batch One cover" style={{ width: "min(316px,72vw)", height: "auto", borderRadius: 9, display: "block", transform: "rotate(-2.4deg)", boxShadow: "0 44px 72px -28px rgba(0,0,0,.72)" }} />
                </Link>
              </div>
              {/* copy */}
              <div style={{ position: "relative" }}>
                <span style={{ ...eyebrow, color: "var(--accent2)" }}>New · Our magazine</span>
                <h2 style={{ fontFamily: "var(--font-archivo)", fontWeight: 900, letterSpacing: "-.025em", fontSize: "clamp(28px,3.7vw,46px)", lineHeight: 1.05, margin: "12px 0 0" }}>
                  Introducing <span style={{ color: "var(--accent2)" }}>Kiln</span>, {serif("Batch One")}
                </h2>
                <p style={{ fontSize: "clamp(15px,1.7vw,18px)", lineHeight: 1.65, color: "var(--muted)", margin: "14px 0 0", maxWidth: "52ch" }}>
                  Our new magazine about inspiration, and a deeper understanding of what goes underfoot. Flick through Batch One just like a real magazine, or download a copy to keep.
                </p>
                <div className="bl-mag-btns" style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 24 }}>
                  <Link href="/magazine" className="bl-mag-cta" style={{ display: "inline-flex", alignItems: "center", gap: 10, background: "var(--accent)", color: "#fff", fontWeight: 800, fontSize: 15, textDecoration: "none", padding: "14px 27px", borderRadius: 999 }}>
                    Flip through Kiln <span aria-hidden>→</span>
                  </Link>
                  <a href="/kiln.pdf" target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 9, background: "var(--surface)", color: "var(--ink)", fontWeight: 800, fontSize: 15, textDecoration: "none", padding: "14px 24px", borderRadius: 999, border: "1px solid var(--line)" }}>
                    Download the PDF
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── FEATURED ── */}
        {featured ? (
          <section style={{ padding: "10px 24px 8px" }}>
            <div style={{ maxWidth: 1100, margin: "0 auto" }}>
              <Link href={`/blog/${featured.slug}`} style={{ textDecoration: "none", color: "inherit", display: "grid", gridTemplateColumns: "minmax(0,1.15fr) minmax(0,1fr)", gap: 0, borderRadius: 22, overflow: "hidden", border: "1px solid var(--line)", background: "var(--surface)", boxShadow: "0 40px 80px -50px rgba(16,28,30,.5)" }} className="bl-feat">
                <div className="bl-feat-img" style={{ minHeight: 340, aspectRatio: "16/11" }}><Cover src={featured.coverImage} alt={featured.title} /></div>
                <div style={{ padding: "clamp(22px,3vw,40px)", display: "flex", flexDirection: "column", justifyContent: "center" }}>
                  <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                    <span style={{ ...eyebrow, color: "var(--accent)" }}>{featured.category || "Latest"}</span>
                    <span style={{ fontSize: 12.5, color: "var(--muted)" }}>{(featured.updatedDate ? `Updated ${fmtDate(featured.updatedDate)}` : fmtDate(featured.date))} · {readMins(featured)} min read</span>
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
        {rest.length > 0 && <BlogSearch posts={searchData} featuredSlug={featured.slug} />}

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
        .bl-gallink{transition:transform .25s ease,box-shadow .25s ease;box-shadow:0 30px 70px -46px rgba(16,28,30,.7)}
        .bl-gallink:hover{transform:translateY(-3px);box-shadow:0 40px 84px -44px rgba(16,28,30,.8)}
        .bl-gallink .bl-gallink-cta{transition:transform .25s ease}
        .bl-gallink:hover .bl-gallink-cta{transform:translateX(3px)}
        .bl-mag-cov img{transition:transform .3s ease}
        .bl-mag:hover .bl-mag-cov img{transform:rotate(-1deg) translateY(-5px)}
        .bl-mag-cta{transition:transform .25s ease}
        .bl-mag:hover .bl-mag-cta{transform:translateX(3px)}
        @media(max-width:860px){.bl-hero-grid{grid-template-columns:1fr!important;gap:28px!important}}
        @media(max-width:760px){.bl-mag{grid-template-columns:1fr!important;text-align:center;gap:26px!important}.bl-mag-btns{justify-content:center}.bl-mag p{margin-left:auto!important;margin-right:auto!important}}
        @media(max-width:820px){.bl-feat{grid-template-columns:1fr!important}.bl-feat-img{min-height:0!important;aspect-ratio:16/10!important}.bl-cta{grid-template-columns:1fr!important}}
      `}</style>
    </div>
  );
}
