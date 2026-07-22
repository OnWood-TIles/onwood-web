"use client";

import type { Swatch, WebsiteRange } from "../../../../lib/onbase/client";
import type { FilterGroupVM } from "../../../../lib/shopFilters";
import { DepartmentShop } from "../../../components/shop/DepartmentShop";
import { TradeColourwayCard, TradeRangeCard } from "./TradeCards";

// Thin client wrapper: reuses the public shop's DepartmentShop (filters, search,
// colourway explode - all identical) but renders the trade cards (RRP struck /
// Your Price + add-to-order) and keeps the shareable URL under /trade/catalogue.
// A client component so it can hand render-functions to DepartmentShop (server
// components cannot pass functions to a client component).
export default function TradeDepartmentShop(props: {
  allRanges: WebsiteRange[];
  groups: FilterGroupVM[];
  labelMap: Record<string, string>;
  initialActive: Record<string, string[]>;
  deptSlug: string;
  activeCategory?: string;
}) {
  return (
    <DepartmentShop
      {...props}
      basePath="/trade/catalogue"
      renderCard={(range: WebsiteRange) => <TradeRangeCard range={range} />}
      renderColourway={(range: WebsiteRange, swatch: Swatch) => <TradeColourwayCard range={range} swatch={swatch} />}
    />
  );
}
