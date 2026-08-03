import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getRange, getTaxonomy, listPairCandidates } from "../../../../../../lib/onbase/client";
import { tradeRanges } from "../../../../../../lib/onbase/trade";
import { pickPairs } from "../../../../../../lib/pairs";
import { TechnicalSpecs } from "../../../../../components/shop/shared";
import TradeProductView from "../../TradeProductView";

export const dynamic = "force-dynamic";

type Params = { slug: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const range = await getRange(slug);
  return { title: range ? `${range.name} - Trade` : "Product not found", robots: { index: false, follow: false } };
}

// The trade product page: the SAME full product detail a public shopper sees
// (variant gallery, "see it installed" photos, description, specs, documents,
// pairs) rendered inside the trade portal, with the public CTAs replaced by the
// customer's trade price + add-to-order. Full detail comes from the public feed
// (getRange); the customer's per-colourway pricing is merged on from tradeRanges.
export default async function TradeProductPage({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams: Promise<{ c?: string }>;
}) {
  const { slug } = await params;
  const { c } = await searchParams;

  const [range, taxonomy, allRanges] = await Promise.all([getRange(slug), getTaxonomy(), listPairCandidates()]);
  if (!range) notFound();

  // Merge this customer's trade pricing onto the full product detail, matched by
  // colourway. Swatches with no trade price stay browse-only (unpriced).
  const { ranges: priced } = await tradeRanges({ department: range.department ?? undefined }).catch(() => ({
    rrpLevel: "SELL",
    ranges: [],
  }));
  const pricedRange = priced.find((r) => r.slug === slug);
  const tradeByColour = new Map((pricedRange?.swatches ?? []).map((s) => [s.colour.toLowerCase(), s.trade ?? null]));
  const merged = pricedRange
    ? { ...range, swatches: range.swatches.map((s) => ({ ...s, trade: tradeByColour.get(s.colour.toLowerCase()) ?? null })) }
    : range;

  const dept = taxonomy.find((d) => d.slug === range.department);
  const catLabels = range.categories
    .map((cat) => dept?.categories.find((x) => x.slug === cat)?.label || cat)
    .filter(Boolean);
  const pairs = pickPairs(range, allRanges, dept?.label);

  return (
    <div>
      <TradeProductView
        range={merged}
        deptLabel={dept?.label ?? null}
        deptSlug={dept?.slug ?? null}
        catLabels={catLabels}
        initialColour={c ?? null}
        pairs={pairs}
        specsSlot={
          <TechnicalSpecs
            specs={range.specs}
            material={range.specs.find((s) => /material|construction/i.test(s.label))?.value ?? null}
            documents={range.documents}
          />
        }
      />
    </div>
  );
}
