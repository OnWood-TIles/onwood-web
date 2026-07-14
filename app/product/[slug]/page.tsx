import type { Metadata } from "next";
import { notFound } from "next/navigation";
import MarketingNav from "../../components/marketing/MarketingNav";
import MarketingFooter from "../../components/marketing/MarketingFooter";
import { getRange, getTaxonomy } from "../../../lib/onbase/client";
import ProductView from "../../components/shop/ProductView";

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

export default async function ProductPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const [range, taxonomy] = await Promise.all([getRange(slug), getTaxonomy()]);
  if (!range) notFound();

  const dept = taxonomy.find((d) => d.slug === range.department);
  const catLabels = range.categories
    .map((c) => dept?.categories.find((x) => x.slug === c)?.label || c)
    .filter(Boolean);

  return (
    <div data-theme="terracotta" style={{ background: "var(--bg)", color: "var(--ink)" }}>
      <MarketingNav />
      <main style={{ maxWidth: 1240, margin: "0 auto", padding: "140px 28px 90px" }}>
        <ProductView range={range} deptLabel={dept?.label ?? null} deptSlug={dept?.slug ?? null} catLabels={catLabels} />
      </main>
      <MarketingFooter />
    </div>
  );
}
