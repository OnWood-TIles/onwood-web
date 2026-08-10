import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { tradeMe } from "../../../lib/onbase/trade";
import { getShopMenu } from "../../../lib/onbase/client";
import { CartProvider } from "./CartProvider";
import TradeNav from "./TradeNav";
import TradeFooter from "./TradeFooter";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Trade Partner Portal - OnWood Tiles",
  robots: { index: false, follow: false },
};

// GATED trade shell. The proxy only checks the cookie is PRESENT; here we do the
// REAL validation by calling tradeMe() (which forwards the session token). If it
// throws/401s (expired or forged cookie), the customer is sent to /trade/login.
// The login + set-password pages live OUTSIDE this (app) group, so they never hit
// this redirect.
export default async function TradeAppLayout({ children }: { children: React.ReactNode }) {
  let name = "Trade Partner";
  try {
    const me = await tradeMe();
    name = me.preferredName || me.name || "Trade Partner";
  } catch {
    redirect("/trade/login");
  }

  // Powers the "Catalogue" hover mega-menu (same data as the public shop menu).
  const shopDepts = await getShopMenu().catch(() => []);

  return (
    <CartProvider>
      <div
        data-theme="terracotta"
        style={{ minHeight: "100dvh", background: "var(--bg)", color: "var(--ink)", display: "flex", flexDirection: "column" }}
      >
        <TradeNav customerName={name} shopDepts={shopDepts} />
        <main style={{ maxWidth: 1180, width: "100%", margin: "0 auto", padding: "34px 24px 80px", flex: 1 }}>{children}</main>
        <TradeFooter />
      </div>
    </CartProvider>
  );
}
