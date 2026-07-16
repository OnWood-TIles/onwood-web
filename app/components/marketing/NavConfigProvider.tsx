"use client";

import { createContext, useContext } from "react";
import type { NavItem } from "../../../lib/onbase/client";

// Carries the /admin-designed navigation from the server layout down to the
// client MarketingNav without touching every page that renders the header.
// Empty array = nothing designed yet -> MarketingNav uses its built-in links.
const NavConfigContext = createContext<NavItem[]>([]);

export function NavConfigProvider({ items, children }: { items: NavItem[]; children: React.ReactNode }) {
  return <NavConfigContext.Provider value={items}>{children}</NavConfigContext.Provider>;
}

export function useNavConfig(): NavItem[] {
  return useContext(NavConfigContext);
}
