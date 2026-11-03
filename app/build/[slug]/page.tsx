import type { Metadata } from "next";
import { notFound } from "next/navigation";
import MarketingNav from "../../components/marketing/MarketingNav";
import MarketingFooter from "../../components/marketing/MarketingFooter";
import OptionsProductView from "../../components/shop/OptionsProductView";
import { TechnicalSpecs } from "../../components/shop/shared";
import { getBuilder, getTaxonomy } from "../../../lib/onbase/client";
import { BUILD_PAGES_PUBLIC } from "../../../lib/flags";

export const dynamic = "force-dynamic";

// Until launch these are staff-only (proxy.ts) and include unpublished products.
const PREVIEW = !BUILD_PAGES_PUBLIC;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const r = await getBuilder(slug, PREVIEW);
  if (!r) return { title: "Build your own" };
  return {
    title: `Build your ${r.name}`,
    description: `Choose your options for the ${r.name} and see the price as you go.`,
    alternates: { canonical: `https://onwoodtiles.com.au/product/${r.slug}` },
    ...(PREVIEW ? { robots: { index: false, follow: false } } : {}),
  };
}

export default async function BuildPage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const [{ slug }, sp, taxonomy] = await Promise.all([params, searchParams, getTaxonomy()]);
  const range = await getBuilder(slug, PREVIEW);
  if (!range?.options) notFound();
  const dept = taxonomy.find((d) => d.slug === range.department);
  const query = Object.fromEntries(Object.entries(sp).flatMap(([k, v]) => (typeof v === "string" ? [[k, v]] : [])));
  return (
    <div data-theme="terracotta" style={{ background: "var(--bg)", color: "var(--ink)" }}>
      <MarketingNav />
      <main style={{ maxWidth: 1240, margin: "0 auto", padding: "clamp(92px,15vw,140px) 28px 90px" }}>
        <OptionsProductView range={range} deptLabel={dept?.label ?? null} deptSlug={dept?.slug ?? null} query={query} preview={PREVIEW}
          specsSlot={<TechnicalSpecs specs={range.specs} material={null} documents={range.documents} />} />
      </main>
      <MarketingFooter />
    </div>
  );
}
