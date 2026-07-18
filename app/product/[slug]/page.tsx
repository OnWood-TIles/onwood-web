import type { Metadata } from "next";
import { notFound } from "next/navigation";
import MarketingNav from "../../components/marketing/MarketingNav";
import MarketingFooter from "../../components/marketing/MarketingFooter";
import { getRange, getTaxonomy, listRanges } from "../../../lib/onbase/client";
import { pickPairs } from "../../../lib/pairs";
import ProductView from "../../components/shop/ProductView";
import { PairsWellWith, TechnicalSpecs } from "../../components/shop/shared";

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
  const [range, taxonomy, allRanges] = await Promise.all([getRange(slug), getTaxonomy(), listRanges()]);
  if (!range) notFound();

  const dept = taxonomy.find((d) => d.slug === range.department);
  const catLabels = range.categories
    .map((c) => dept?.categories.find((x) => x.slug === c)?.label || c)
    .filter(Boolean);
  const labelMap: Record<string, string> = {};
  for (const d of taxonomy) for (const cat of d.categories) labelMap[cat.slug] = cat.label;
  const pairs = pickPairs(range, allRanges, dept?.label);

  return (
    <div data-theme="terracotta" style={{ background: "var(--bg)", color: "var(--ink)" }}>
      <MarketingNav />
      <main style={{ maxWidth: 1240, margin: "0 auto", padding: "140px 28px 90px" }}>
        <ProductView range={range} deptLabel={dept?.label ?? null} deptSlug={dept?.slug ?? null} catLabels={catLabels} initialColour={c ?? null} />
        <TechnicalSpecs
          specs={range.specs}
          material={range.specs.find((s) => /material|construction/i.test(s.label))?.value ?? null}
          documents={range.documents}
        />
        <PairsWellWith pairs={pairs} categoryLabels={labelMap} />
      </main>
      <MarketingFooter />
    </div>
  );
}
