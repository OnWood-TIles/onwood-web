import type { WebsiteRange } from "../../../../lib/onbase/client";
import type { TradeBuild } from "../../../../lib/tradeBuild";

/** The trade builder's pricing context for a made-to-order range, from the customer's
 *  trade feed (each swatch carries the product it orders + their % off RRP). Null when
 *  the range isn't in their feed. */
export function tradeBuildFor(priced: WebsiteRange | undefined): TradeBuild | null {
  const t = priced?.swatches.find((s) => s.trade)?.trade;
  if (!t) return null;
  return { productId: t.productId, pct: t.tradePrice != null ? t.rrpDiscount ?? null : null, base: "/trade/catalogue/product" };
}
