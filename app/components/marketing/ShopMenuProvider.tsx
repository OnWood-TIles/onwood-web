"use client";

import { createContext, useContext } from "react";
import type { ShopMenuDept } from "../../../lib/onbase/client";

// Carries the shop taxonomy (departments + counts + preview image) from the
// server layout down to the client MarketingNav / ShopMegaMenu without every
// page having to fetch it. Empty array = no published catalogue yet -> the nav
// falls back to a plain "Shop" link with no mega-menu.
const ShopMenuContext = createContext<ShopMenuDept[]>([]);

export function ShopMenuProvider({ depts, children }: { depts: ShopMenuDept[]; children: React.ReactNode }) {
  return <ShopMenuContext.Provider value={depts}>{children}</ShopMenuContext.Provider>;
}

export function useShopMenu(): ShopMenuDept[] {
  return useContext(ShopMenuContext);
}
