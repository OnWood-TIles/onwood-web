import Link from "next/link";
import { tradeMe, tradeListOrders } from "../../../lib/onbase/trade";
import { StatusChip, money, formatDate, cardStyle, PageHeading } from "./tradeUi";

export const dynamic = "force-dynamic";

// Trade dashboard: a greeting, quick links into the portal, and a snapshot of the
// customer's most recent orders. Reads are server-side via lib/onbase/trade.ts.
export default async function TradeDashboard() {
  // The layout has already validated the session; if these throw, the layout's
  // redirect would have fired first. Guard anyway so a transient hiccup renders.
  const [me, orders] = await Promise.all([
    tradeMe().catch(() => null),
    tradeListOrders().catch(() => []),
  ]);

  const firstName = (me?.preferredName || me?.name || "there").split(/\s+/)[0];
  const recent = orders.slice(0, 4);

  const quickLinks = [
    { href: "/trade/catalogue", title: "Browse the catalogue", note: "Your pricing and live stock", accent: true },
    { href: "/trade/orders", title: "Your orders", note: "Track what is on the way" },
    { href: "/trade/pricelist", title: "Price list", note: "Your full trade price list" },
  ];

  return (
    <div>
      <PageHeading title={`Welcome back, ${firstName}`} sub="Order stock, check your pricing and track your orders, all in one place." />

      {/* Quick links */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
        {quickLinks.map((q) => (
          <Link
            key={q.href}
            href={q.href}
            style={{
              ...cardStyle,
              textDecoration: "none",
              color: "inherit",
              padding: "22px 22px 20px",
              display: "block",
              background: q.accent ? "color-mix(in oklab, var(--accent) 8%, #fff)" : "#fff",
              border: q.accent ? "1px solid color-mix(in oklab, var(--accent) 35%, var(--line))" : "1px solid var(--line)",
            }}
          >
            <div style={{ fontFamily: "var(--font-archivo)", fontWeight: 800, fontSize: 18 }}>{q.title}</div>
            <div style={{ color: "#5a6067", fontSize: 13.5, marginTop: 5 }}>{q.note}</div>
            <div style={{ color: "var(--accent)", fontSize: 13.5, fontWeight: 700, marginTop: 14 }}>Open &rarr;</div>
          </Link>
        ))}
      </div>

      {/* Recent orders */}
      <section style={{ marginTop: 40 }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 14 }}>
          <h2 style={{ fontFamily: "var(--font-archivo)", fontWeight: 800, fontSize: 22, margin: 0 }}>Recent orders</h2>
          {orders.length > 0 && (
            <Link href="/trade/orders" style={{ color: "var(--accent)", fontWeight: 700, fontSize: 14, textDecoration: "none" }}>
              View all &rarr;
            </Link>
          )}
        </div>

        {recent.length === 0 ? (
          <div style={{ ...cardStyle, padding: "30px 24px", color: "#5a6067", fontSize: 14.5, lineHeight: 1.6 }}>
            You have not placed any orders yet.{" "}
            <Link href="/trade/catalogue" style={{ color: "var(--accent)", fontWeight: 700, textDecoration: "none" }}>
              Browse the catalogue
            </Link>{" "}
            to get started.
          </div>
        ) : (
          <div style={{ ...cardStyle, overflow: "hidden" }}>
            {recent.map((o, i) => (
              <Link
                key={o.id}
                href={`/trade/orders/${o.id}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  padding: "16px 20px",
                  textDecoration: "none",
                  color: "inherit",
                  borderTop: i === 0 ? "none" : "1px solid var(--line)",
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 800, fontSize: 15 }}>{o.orderCode}</div>
                  <div style={{ color: "#8a8577", fontSize: 13, marginTop: 2 }}>
                    {formatDate(o.createdAt)} &middot; {o.itemCount} {o.itemCount === 1 ? "item" : "items"}
                  </div>
                </div>
                <div style={{ fontWeight: 800, fontSize: 15, whiteSpace: "nowrap" }}>{money(o.subtotal)}</div>
                <StatusChip status={o.status} />
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
