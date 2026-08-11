import type { Metadata } from "next";
import MarketingNav from "../components/marketing/MarketingNav";
import MarketingFooter from "../components/marketing/MarketingFooter";
import SpecialsHero from "../components/marketing/SpecialsHero";
import SpecialsGrid from "../components/marketing/SpecialsGrid";
import FreeDeliveryBand from "../components/marketing/FreeDeliveryBand";
import PackageDeal from "../components/marketing/PackageDeal";
import ReserveBand from "../components/marketing/ReserveBand";
import SpecialsTerms from "../components/marketing/SpecialsTerms";
import { SPECIALS_PAGE, type Special } from "../../lib/content";
import { listRanges, type WebsiteRange } from "../../lib/onbase/client";

export const metadata: Metadata = {
  title: "Specials",
  description:
    "This month's tile specials at OnWood Tiles - clearance runs, end-of-line stone and whole-home tile packages. While stocks last.",
  alternates: { canonical: "https://onwoodtiles.com.au/specials" },
};

// /api/tile only proxies (trims) images from these catalogue hosts; a swatch
// hosted elsewhere is shown room-only rather than broken.
const TILE_HOSTS = /^https:\/\/([a-z0-9-]+\.)?(onwoodtiles\.com\.au|onbasehq\.com\.au|abiinteriors\.com\.au)\//i;
const money = (n: number) => `$${n % 1 === 0 ? n.toFixed(0) : n.toFixed(2)}`;
const unitSuffix = (u?: string | null) =>
  u === "m2" ? "/m²" : u === "LM" ? "/lm" : u && u !== "Per Unit" ? `/${u}` : " each";
const humanizeDept = (d?: string | null) =>
  d ? d.split("-").map((w, i) => (i === 0 ? w.charAt(0).toUpperCase() + w.slice(1) : w)).join(" ") : "Special";

// Turn a live catalogue range that's on special into a specials-grid card. Returns
// null for ranges whose special data is invalid (no price, or a "special" that
// isn't actually cheaper than its was-price — a data-entry error we won't publish).
function feedToSpecial(r: WebsiteRange): Special | null {
  const sp = r.special ?? r.swatches.find((s) => s.special)?.special ?? null;
  if (!sp || sp.price == null) return null;
  const now = sp.price;
  const was = sp.was;
  if (was != null && was <= now) return null; // not actually a discount → skip
  const suffix = unitSuffix(r.unit);
  const room =
    r.swatches.find((s) => s.installedImage)?.installedImage ??
    r.heroImage ??
    r.swatches.find((s) => s.image)?.image ??
    undefined;
  const tileImg = r.swatches.find((s) => s.image)?.image ?? r.heroImage ?? undefined;
  const tile = tileImg && TILE_HOSTS.test(tileImg) ? tileImg : undefined;
  const hasDiscount = was != null && was > now;
  const desc = r.description?.trim();
  return {
    pct: hasDiscount ? `${Math.round(((was! - now) / was!) * 100)}% OFF` : "SPECIAL",
    tag: humanizeDept(r.department),
    name: r.name,
    was: hasDiscount ? `${money(was!)}${suffix}` : undefined,
    now: `${money(now)}${suffix}`,
    note: desc ? (desc.length > 140 ? `${desc.slice(0, 138)}…` : desc) : `Now ${money(now)}${suffix} — while stocks last.`,
    tile,
    room: room ?? undefined,
    slugs: [r.slug],
  };
}

export default async function SpecialsPage() {
  // Curated cards first, then every OTHER product flagged on special in OnBase —
  // so adding a special price in OnBase auto-lists it here (and on the catalogue).
  const feed = await listRanges({ specialsOnly: true });
  const curated = SPECIALS_PAGE.items;
  const claimed = new Set(curated.flatMap((i) => i.slugs ?? []));
  const auto = feed
    .filter((r) => !claimed.has(r.slug))
    .map(feedToSpecial)
    .filter((x): x is Special => x != null);
  const items: Special[] = [...curated, ...auto];

  return (
    <div data-theme="terracotta" style={{ background: "var(--bg)", color: "var(--ink)" }}>
      <MarketingNav />
      <main>
        <SpecialsHero />
        <SpecialsGrid items={items} />
        <FreeDeliveryBand />
        <PackageDeal />
        <ReserveBand />
        <SpecialsTerms />
      </main>
      <MarketingFooter />
    </div>
  );
}
