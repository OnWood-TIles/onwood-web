import Link from "next/link";
import { tradeListOrders } from "../../../../lib/onbase/trade";
import { StatusChip, money, formatDate, cardStyle, PageHeading } from "../tradeUi";

export const dynamic = "force-dynamic";

// The customer's order history. Each row links to the order detail + timeline.
export default async function OrdersPage() {
  const orders = await tradeListOrders().catch(() => []);

  return (
    <div>
      <PageHeading title="Your orders" sub="Every order you have placed, with its current status." />

      {orders.length === 0 ? (
        <div style={{ ...cardStyle, padding: "34px 24px", color: "#5a6067", fontSize: 15, lineHeight: 1.6 }}>
          You have not placed any orders yet.{" "}
          <Link href="/trade/catalogue" style={{ color: "var(--accent)", fontWeight: 700, textDecoration: "none" }}>
            Browse the catalogue
          </Link>{" "}
          to place your first order.
        </div>
      ) : (
        <div style={{ ...cardStyle, overflow: "hidden" }}>
          {orders.map((o, i) => (
            <Link
              key={o.id}
              href={`/trade/orders/${o.id}`}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                padding: "17px 22px",
                textDecoration: "none",
                color: "inherit",
                borderTop: i === 0 ? "none" : "1px solid var(--line)",
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 800, fontSize: 15.5 }}>
                  {o.orderCode}
                  {o.poReference && <span style={{ color: "#8a8577", fontWeight: 600, fontSize: 13 }}> &middot; PO {o.poReference}</span>}
                </div>
                <div style={{ color: "#8a8577", fontSize: 13, marginTop: 3 }}>
                  {formatDate(o.createdAt)} &middot; {o.itemCount} {o.itemCount === 1 ? "item" : "items"}
                </div>
              </div>
              <div style={{ fontWeight: 800, fontSize: 15, whiteSpace: "nowrap" }}>{money(o.subtotal)}</div>
              <StatusChip status={o.status} />
              <span aria-hidden style={{ color: "#c3bfb2", fontSize: 18 }}>&rsaquo;</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
