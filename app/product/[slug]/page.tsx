import type { Metadata } from "next";
import { notFound } from "next/navigation";
import MarketingNav from "../../components/marketing/MarketingNav";
import MarketingFooter from "../../components/marketing/MarketingFooter";
import { getRange, getTaxonomy, listPairCandidates } from "../../../lib/onbase/client";
import { pickPairs } from "../../../lib/pairs";
import ProductView from "../../components/shop/ProductView";
import { TechnicalSpecs } from "../../components/shop/shared";

export const dynamic = "force-dynamic";

type Params = { slug: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const range = await getRange(slug);
  if (!range) return { title: "Product not found" };
  return {
    title: range.name,
    description:
      range.description?.slice(0, 155) ||
      `${range.name} at OnWood Tiles - see it in our Sunshine Coast showroom.`,
  };
}

export default async function ProductPage({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams: Promise<{ c?: string }>;
}) {
  const { slug } = await params;
  const { c } = await searchParams;
  // Fetch the range first, then the taxonomy + its department's ranges in
  // parallel. "Pairs well with" only ever suggests within/near the same
  // department, so we no longer pull the WHOLE catalogue (~100 ranges) on every
  // product open - just this department's, which also shares the department
  // shop's cache entry. Big cut to the per-click payload.
  // Fetch everything in PARALLEL (getRange no longer blocks the rest). allRanges is
  // the long-cached pairing candidate list (every department, so "Pairs well with"
  // can suggest cross-department complements). pickPairs handles the scoring.
  const [range, taxonomy, allRanges] = await Promise.all([
    getRange(slug),
    getTaxonomy(),
    listPairCandidates(),
  ]);
  if (!range) notFound();

  const dept = taxonomy.find((d) => d.slug === range.department);
  const catLabels = range.categories
    .map((c) => dept?.categories.find((x) => x.slug === c)?.label || c)
    .filter(Boolean);
  const pairs = pickPairs(range, allRanges, dept?.label);

  // schema.org/Product structured data (rich results). Deliberately price-free:
  // the owner never publishes prices, so we emit NO offers/price/availability -
  // only descriptive fields. Any field that isn't available is omitted rather
  // than sent as null/empty. Same in-page <script> technique as app/layout.tsx.
  const SITE = "https://onwoodtiles.com.au";
  // Pick a representative product image: the range hero, else the first
  // colourway's swatch photo, else the first gallery image. normalizeRange has
  // already absolutized OnBase-relative paths, but if a bare relative path ever
  // slips through, prefix the public site origin so the URL is always absolute.
  const rawImage =
    range.heroImage ||
    range.swatches.find((s) => s.image)?.image ||
    range.images.find(Boolean) ||
    null;
  const image = rawImage ? (rawImage.startsWith("/") ? `${SITE}${rawImage}` : rawImage) : null;
  const description = range.description?.trim() || null;
  const category = dept?.label || catLabels[0] || null;
  const productLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: range.name,
    ...(image ? { image } : {}),
    ...(description ? { description } : {}),
    brand: { "@type": "Brand", name: "OnWood Tiles" },
    ...(category ? { category } : {}),
    url: `${SITE}/product/${slug}`,
  };

  return (
    <div data-theme="terracotta" style={{ background: "var(--bg)", color: "var(--ink)" }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productLd) }}
      />
      <MarketingNav />
      <main style={{ maxWidth: 1240, margin: "0 auto", padding: "clamp(92px,15vw,140px) 28px 90px" }}>
        <ProductView
          range={range}
          deptLabel={dept?.label ?? null}
          deptSlug={dept?.slug ?? null}
          catLabels={catLabels}
          initialColour={c ?? null}
          pairs={pairs}
          productBase="/product"
          specsSlot={
            <TechnicalSpecs
              specs={range.specs}
              material={range.specs.find((s) => /material|construction/i.test(s.label))?.value ?? null}
              documents={range.documents}
            />
          }
        />
      </main>
      <MarketingFooter />
    </div>
  );
}
