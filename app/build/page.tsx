import type { Metadata } from "next";
import Link from "next/link";
import MarketingNav from "../components/marketing/MarketingNav";
import MarketingFooter from "../components/marketing/MarketingFooter";
import OptionsDrawing from "../components/shop/OptionsDrawing";
import { BUILDER_CSS } from "../components/shop/builderCss";
import { getTaxonomy, listBuilders, type BuilderSummary } from "../../lib/onbase/client";
import { BUILD_PAGES_PUBLIC } from "../../lib/flags";
import type { DrawingStyle } from "../../lib/options";

export const dynamic = "force-dynamic";
const PREVIEW = !BUILD_PAGES_PUBLIC;

export const metadata: Metadata = {
  title: "Build your own",
  description: "Price made-to-order vanities, tallboys, mirrors and basins online: choose the size, mounting, benchtop, finish and extras.",
  alternates: { canonical: "https://onwoodtiles.com.au/build" },
  ...(PREVIEW ? { robots: { index: false, follow: false } } : {}),
};

const fmt = (n: number) => `$${n.toLocaleString("en-AU", { maximumFractionDigits: 0 })}`;
const shortName = (n: string) => n.replace(/^Marquis\s+/i, "");

function Tile({ b }: { b: BuilderSummary }) {
  const style = b.drawing as DrawingStyle;
  return (
    <Link href={`/${PREVIEW ? "build" : "product"}/${b.slug}`} className="vb-tile">
      {b.image ? <img src={b.image} alt="" style={{ width: "100%", aspectRatio: "4/3", objectFit: "cover", borderRadius: 12 }} />
        : style !== "none" ? <OptionsDrawing style={style} meta={b.draw ?? {}} size={200} />
        : b.department === "basins" ? (
          <svg viewBox="0 0 200 120" width={200} style={{ maxWidth: "100%", height: "auto" }} role="img" aria-label="Basin illustration">
            <line x1="20" y1="96" x2="180" y2="96" stroke="#d4d7d2" strokeWidth="2" />
            <path d="M48 58 h104 q0 38 -52 38 q-52 0 -52 -38 Z" fill="#fff" stroke="#2f3a3d" strokeWidth="2" />
            <ellipse cx="100" cy="58" rx="52" ry="9" fill="#eef3f4" stroke="#2f3a3d" strokeWidth="2" />
          </svg>
        ) : <div style={{ height: 120 }} />}
      <strong>{shortName(b.name)}</strong>
      <em>from {fmt(b.from)}</em>
    </Link>
  );
}

// Index of every product with options, grouped by website department.
export default async function BuildIndex() {
  const [all, taxonomy] = await Promise.all([listBuilders(PREVIEW), getTaxonomy()]);
  // Lead with the bathroom furniture departments, then any others in taxonomy order.
  const ORDER = ["vanities", "bathroom-storage", "mirrors", "basins"];
  const rank = (slug: string) => (ORDER.includes(slug) ? ORDER.indexOf(slug) : ORDER.length);
  const depts = taxonomy.filter((d) => all.some((b) => b.department === d.slug)).sort((x, y) => rank(x.slug) - rank(y.slug));
  const other = all.filter((b) => !depts.some((d) => d.slug === b.department));
  return (
    <div data-theme="terracotta" style={{ background: "var(--bg)", color: "var(--ink)" }}>
      <style>{BUILDER_CSS}</style>
      <MarketingNav />
      <main className="vb-wrap">
        {PREVIEW && <span className="vb-preview">Staff preview · not public yet</span>}
        <header className="vb-head">
          <div className="vb-eyebrow">Made to order</div>
          <h1>Build your own</h1>
          <p>Choose a product, then pick the size, mounting, benchtop, finish and extras. The price updates as you go, and you can send the build to us for a quote or save it for later.</p>
        </header>
        {all.length === 0 && <p className="vb-note">Nothing to build yet. Please check back soon, or <Link href="/contact">get in touch</Link>.</p>}
        {depts.map((d) => {
          const items = all.filter((b) => b.department === d.slug);
          const cats = d.categories.filter((c) => items.some((b) => b.categories.includes(c.slug)));
          const groups = cats.length ? cats.map((c) => ({ label: c.label, items: items.filter((b) => b.categories.includes(c.slug)) })) : [{ label: d.label, items }];
          const loose = cats.length ? items.filter((b) => !cats.some((c) => b.categories.includes(c.slug))) : [];
          return (
            <section key={d.slug} style={{ marginBottom: 20 }}>
              <h2 className="vb-cat" style={{ fontSize: 30 }}>{d.label}</h2>
              {groups.map((g) => (
                <div key={g.label}>
                  {cats.length > 0 && <h3 className="vb-sec-h" style={{ fontSize: 13 }}>{g.label}</h3>}
                  <div className="vb-index">{g.items.map((b) => <Tile key={b.slug} b={b} />)}</div>
                </div>
              ))}
              {loose.length > 0 && <div className="vb-index">{loose.map((b) => <Tile key={b.slug} b={b} />)}</div>}
            </section>
          );
        })}
        {other.length > 0 && <section><h2 className="vb-cat">More</h2><div className="vb-index">{other.map((b) => <Tile key={b.slug} b={b} />)}</div></section>}
      </main>
      <MarketingFooter />
    </div>
  );
}
