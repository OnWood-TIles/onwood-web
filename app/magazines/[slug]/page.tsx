import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import MarketingNav from "../../components/marketing/MarketingNav";
import MarketingFooter from "../../components/marketing/MarketingFooter";
import PdfMagazine from "../../components/magazine/PdfMagazine";
import { MAGAZINES, magazineBySlug } from "../../../lib/magazines";

export const dynamicParams = false;
export function generateStaticParams() {
  return MAGAZINES.map((m) => ({ slug: m.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const m = magazineBySlug((await params).slug);
  if (!m) return {};
  return {
    title: `${m.title}, ${m.issue}`,
    description: m.description,
    alternates: { canonical: `/magazines/${m.slug}` },
    openGraph: { title: `${m.title} · ${m.issue} · OnWood Tiles`, description: m.standfirst, url: `https://onwoodtiles.com.au/magazines/${m.slug}`, type: "article", images: [m.cover] },
  };
}

// One designed magazine in the flick-through reader, plus links to the other issues.
export default async function MagazineReader({ params }: { params: Promise<{ slug: string }> }) {
  const m = magazineBySlug((await params).slug);
  if (!m) notFound();
  const others = MAGAZINES.filter((o) => o.slug !== m.slug);
  return (
    <div style={{ background: "var(--bg)" }}>
      <MarketingNav />
      <PdfMagazine pages={m.pages} download={m.download} pageW={m.pageW} pageH={m.pageH} base={`/magazines/${m.slug}/pages`} />

      <section style={{ background: "var(--bg)", borderTop: "1px solid var(--line)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "64px 24px 80px" }}>
          <div style={{ textAlign: "center", maxWidth: 640, margin: "0 auto 34px" }}>
            <div style={{ fontFamily: "var(--font-archivo)", fontWeight: 800, fontSize: 12.5, letterSpacing: ".16em", textTransform: "uppercase", color: "var(--accent)" }}>Keep reading</div>
            <h2 style={{ fontFamily: "var(--font-archivo)", fontWeight: 900, letterSpacing: "-.03em", fontSize: "clamp(28px,4vw,42px)", lineHeight: 1.05, margin: "10px 0 0", color: "var(--ink)" }}>More from OnWood</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 22 }}>
            {others.map((o) => (
              <Link key={o.slug} href={`/magazines/${o.slug}`} style={{ display: "flex", gap: 18, alignItems: "center", textDecoration: "none", color: "var(--ink)", background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 12, padding: 16 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={o.cover} alt={`${o.title} cover`} loading="lazy" style={{ width: 92, height: "auto", borderRadius: 4, boxShadow: "0 14px 26px -14px rgba(0,0,0,.55)" }} />
                <span>
                  <span style={{ display: "block", fontFamily: "var(--font-archivo)", fontWeight: 900, fontSize: 19, letterSpacing: "-.01em" }}>{o.title}</span>
                  <span style={{ display: "block", fontSize: 13, color: "var(--muted)", margin: "4px 0 8px" }}>{o.issue}</span>
                  <span style={{ fontWeight: 800, fontSize: 14, color: "var(--accent)" }}>Read it →</span>
                </span>
              </Link>
            ))}
            {[
              { href: "/magazines", label: "All magazines", blurb: "Every issue in one place, to read online or download." },
              { href: "/blog", label: "Ideas & Inspiration", blurb: "Guides and stories on choosing, laying and living with tile." },
              { href: "/gallery", label: "The Gallery", blurb: "Hundreds of rooms styled around real OnWood products." },
            ].map((c) => (
              <Link key={c.href} href={c.href} style={{ display: "block", textDecoration: "none", color: "var(--ink)", background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 12, padding: "18px 20px" }}>
                <span style={{ display: "block", fontFamily: "var(--font-archivo)", fontWeight: 900, fontSize: 19 }}>{c.label}</span>
                <span style={{ display: "block", fontSize: 13.5, lineHeight: 1.5, color: "var(--muted)", margin: "6px 0 8px" }}>{c.blurb}</span>
                <span style={{ fontWeight: 800, fontSize: 14, color: "var(--accent)" }}>Explore →</span>
              </Link>
            ))}
          </div>
        </div>
      </section>
      <MarketingFooter />
    </div>
  );
}
