import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getRange } from "../../../../../../../lib/onbase/client";
import { tradeRanges } from "../../../../../../../lib/onbase/trade";
import Vanity3DLoader from "../../../../../../components/shop/vanity3d/Vanity3DLoader";
import { tradeBuildFor } from "../../../tradeBuildFor";

export const dynamic = "force-dynamic";

type Params = { slug: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const range = await getRange(slug);
  return { title: range ? `${range.name} in 3D - Trade` : "Build it in 3D", robots: { index: false, follow: false } };
}

// The 3D builder inside the trade portal: same options as the public 3D page, priced at
// the partner's % off RRP; "Complete" returns to the trade product page to add to order.
export default async function TradeVanity3DPage({ params, searchParams }: { params: Promise<Params>; searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { slug } = await params;
  const sp = await searchParams;
  const range = await getRange(slug);
  if (!range) notFound();
  const back = `/trade/catalogue/product/${slug}`;
  if (!range.options || range.options.drawing !== "vanity") redirect(back);
  const { ranges } = await tradeRanges({ department: range.department ?? undefined }).catch(() => ({ ranges: [] as typeof range[] }));
  const trade = tradeBuildFor(ranges.find((r) => r.slug === slug));
  if (!trade) redirect(back);
  const query: Record<string, string> = {};
  for (const [k, v] of Object.entries(sp)) if (typeof v === "string") query[k] = v;
  return (
    // Inside the portal's page frame: the 3D view is a framed panel rather than full screen.
    <div style={{ borderRadius: 18, overflow: "hidden", border: "1px solid var(--line)" }}>
      <Vanity3DLoader range={range} query={query} backHref={back} trade={trade} />
    </div>
  );
}
