"use client";

import type { ReactNode } from "react";
import type { WebsiteRange } from "../../../../lib/onbase/client";
import ProductView from "../../../components/shop/ProductView";
import TradeProductActions from "./TradeProductActions";

// The trade portal's product page body. It reuses the public ProductView whole
// (gallery, "See it installed" toggle, colourway selector, description) and only
// swaps the public enquire/showroom CTAs for the trade price + add-to-order block
// via ProductView's renderActions slot. This client wrapper exists so the render
// prop (a function) is passed client -> client, never across the RSC boundary.
export default function TradeProductView({
  range,
  deptLabel,
  deptSlug,
  catLabels,
  initialColour,
  pairs,
  specsSlot,
}: {
  range: WebsiteRange;
  deptLabel: string | null;
  deptSlug: string | null;
  catLabels: string[];
  initialColour?: string | null;
  pairs?: { range: WebsiteRange; reason: string }[];
  specsSlot?: ReactNode;
}) {
  return (
    <ProductView
      range={range}
      deptLabel={deptLabel}
      deptSlug={deptSlug}
      catLabels={catLabels}
      initialColour={initialColour}
      shopBase="/trade/catalogue"
      shopLabel="Catalogue"
      showAvailability
      pairs={pairs}
      specsSlot={specsSlot}
      productBase="/trade/catalogue/product"
      renderActions={({ range: r, swatch }) => <TradeProductActions range={r} swatch={swatch} />}
    />
  );
}
