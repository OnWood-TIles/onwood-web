import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getRange } from "../../../../lib/onbase/client";
import Vanity3DLoader from "../../../components/shop/vanity3d/Vanity3DLoader";

export const dynamic = "force-dynamic";

type Params = { slug: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const range = await getRange(slug);
  return {
    title: range ? `${range.name} in 3D` : "Build it in 3D",
    // The product page is the indexed page; this is its interactive companion.
    robots: { index: false, follow: true },
    alternates: { canonical: `https://onwoodtiles.com.au/product/${slug}` },
  };
}

// Full-screen 3D builder for a vanity: same options and prices as the product page builder.
export default async function Vanity3DPage({ params, searchParams }: { params: Promise<Params>; searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { slug } = await params;
  const sp = await searchParams;
  const range = await getRange(slug);
  if (!range) notFound();
  if (!range.options || range.options.drawing !== "vanity") redirect(`/product/${slug}`);
  const query: Record<string, string> = {};
  for (const [k, v] of Object.entries(sp)) if (typeof v === "string") query[k] = v;
  return <Vanity3DLoader range={range} query={query} backHref={`/product/${slug}`} />;
}
