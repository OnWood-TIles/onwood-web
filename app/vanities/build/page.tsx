import type { Metadata } from "next";
import Link from "next/link";
import MarketingNav from "../../components/marketing/MarketingNav";
import MarketingFooter from "../../components/marketing/MarketingFooter";
import { listBuilders, type BuilderSummary } from "../../../lib/onbase/client";
import { VANITY_BUILDER_PUBLIC } from "../../../lib/flags";
import { BUILDER_CSS } from "./builderCss";
import Elevation from "./Elevation";

export const dynamic = "force-dynamic";
const PREVIEW = !VANITY_BUILDER_PUBLIC;

export const metadata: Metadata = {
  title: "Build your vanity",
  description: "Price a made-to-order Australian vanity, tallboy, mirror or shaving cabinet online: choose the size, mounting, benchtop and extras.",
  alternates: { canonical: "https://onwoodtiles.com.au/vanities/build" },
  ...(PREVIEW ? { robots: { index: false, follow: false } } : {}),
};

// Website categories (OnBase taxonomy slugs) in display order.
const GROUPS: { slug: string; label: string }[] = [
  { slug: "bathroom-vanities", label: "Bathroom vanities" },
  { slug: "coastal-collection", label: "Coastal Collection" },
  { slug: "compact-vanities", label: "Compact vanities" },
  { slug: "tallboys-and-storage", label: "Tallboys" },
  { slug: "shaving-cabinets", label: "Shaving cabinets" },
  { slug: "mirrors", label: "Mirrors" },
];
const shortName = (n: string) => n.replace(/^Marquis\s+/i, "");
const fmt = (n: number) => `$${n.toLocaleString("en-AU", { maximumFractionDigits: 0 })}`;

function Tile({ b }: { b: BuilderSummary }) {
  const kind = (b.kinds[0] ?? "vanity") as "vanity" | "tallboy" | "shaver" | "mirror";
  return (
    <Link href={`/vanities/build/${b.slug}`} className="vb-tile">
      <Elevation kind={kind} width={kind === "vanity" ? 1200 : 900} basinLayout="centre" config={kind === "vanity" ? "2 drawer" : ""} mount="wallmount" name={b.name} size={200} />
      <strong>{shortName(b.name)}</strong>
      <span>{b.models} {b.models === 1 ? "option" : "sizes & styles"}</span>
      <em>from {fmt(b.from)}</em>
    </Link>
  );
}

export default async function BuildIndex() {
  const all = await listBuilders(PREVIEW);
  const placed = new Set<string>();
  const sections = GROUPS.map((g) => {
    const items = all.filter((b) => !placed.has(b.slug) && b.categories.includes(g.slug));
    items.forEach((b) => placed.add(b.slug));
    return { ...g, items };
  }).filter((s) => s.items.length);
  const rest = all.filter((b) => !placed.has(b.slug));

  return (
    <div data-theme="terracotta" style={{ background: "var(--bg)", color: "var(--ink)" }}>
      <style>{BUILDER_CSS}</style>
      <MarketingNav />
      <main className="vb-wrap">
        {PREVIEW && <span className="vb-preview">Staff preview · not public yet</span>}
        <header className="vb-head">
          <div className="vb-eyebrow">Made to order in Australia</div>
          <h1>Build your vanity</h1>
          <p>Choose a range, then pick the size, mounting, benchtop and extras. The price updates as you go, and you can send the build to us for a quote or save it for later.</p>
        </header>
        {all.length === 0 && <p className="vb-note">The builder is being set up. Please check back soon, or <Link href="/contact">get in touch</Link>.</p>}
        {sections.map((s) => (
          <section key={s.slug}>
            <h2 className="vb-cat">{s.label}</h2>
            <div className="vb-index">{s.items.map((b) => <Tile key={b.slug} b={b} />)}</div>
          </section>
        ))}
        {rest.length > 0 && (
          <section>
            <h2 className="vb-cat">More</h2>
            <div className="vb-index">{rest.map((b) => <Tile key={b.slug} b={b} />)}</div>
          </section>
        )}
      </main>
      <MarketingFooter />
    </div>
  );
}
