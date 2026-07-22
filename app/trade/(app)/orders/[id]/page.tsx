import Link from "next/link";
import { notFound } from "next/navigation";
import { tradeGetOrder, TradeError } from "../../../../../lib/onbase/trade";
import { StatusChip, STATUS_LABEL, STATUS_FLOW, money, formatDate, cardStyle } from "../../tradeUi";

export const dynamic = "force-dynamic";

// One order: header + status timeline + line items + totals.
export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let order;
  try {
    order = await tradeGetOrder(id);
  } catch (err) {
    if (err instanceof TradeError && err.status === 404) notFound();
    throw err;
  }

  const cancelled = order.status === "CANCELLED";
  const currentIdx = STATUS_FLOW.indexOf(order.status);

  return (
    <div>
      <Link href="/trade/orders" style={{ color: "#5a6067", fontWeight: 700, fontSize: 13.5, textDecoration: "none" }}>
        &larr; All orders
      </Link>

      <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap", margin: "12px 0 6px" }}>
        <h1 style={{ fontFamily: "var(--font-archivo)", fontWeight: 800, fontSize: "clamp(26px,3.4vw,38px)", letterSpacing: "-.02em", margin: 0 }}>
          {order.orderCode}
        </h1>
        <StatusChip status={order.status} size="md" />
      </div>
      <p style={{ color: "#8a8577", fontSize: 14, margin: "0 0 26px" }}>
        Placed {formatDate(order.createdAt)}
        {order.confirmedAt ? ` · Confirmed ${formatDate(order.confirmedAt)}` : ""}
        {order.poReference ? ` · PO ${order.poReference}` : ""}
      </p>

      {/* Status timeline */}
      {cancelled ? (
        <div
          style={{
            ...cardStyle,
            padding: "18px 22px",
            marginBottom: 26,
            background: "rgba(176,58,42,.06)",
            border: "1px solid rgba(176,58,42,.25)",
            color: "#a13a2c",
            fontSize: 14.5,
            fontWeight: 700,
          }}
        >
          This order was cancelled. Please get in touch if you have any questions.
        </div>
      ) : (
        <div style={{ ...cardStyle, padding: "22px 22px 20px", marginBottom: 26 }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 6, position: "relative" }}>
            {/* connecting line */}
            <div style={{ position: "absolute", top: 9, left: 9, right: 9, height: 2, background: "var(--line)" }} aria-hidden />
            <div
              style={{
                position: "absolute",
                top: 9,
                left: 9,
                height: 2,
                background: "var(--accent)",
                width: currentIdx <= 0 ? 0 : `calc((100% - 18px) * ${currentIdx / (STATUS_FLOW.length - 1)})`,
                transition: "width .3s ease",
              }}
              aria-hidden
            />
            {STATUS_FLOW.map((s, i) => {
              const done = i <= currentIdx;
              return (
                <div key={s} style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 8, flex: 1, textAlign: "center" }}>
                  <span
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: "50%",
                      background: done ? "var(--accent)" : "#fff",
                      border: `2px solid ${done ? "var(--accent)" : "var(--line)"}`,
                      display: "grid",
                      placeItems: "center",
                    }}
                  >
                    {done && (
                      <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="#fff6ee" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4 12l5 5L20 6" />
                      </svg>
                    )}
                  </span>
                  <span style={{ fontSize: 11.5, fontWeight: 700, color: done ? "var(--ink)" : "#a8a294", lineHeight: 1.3, maxWidth: 76 }}>
                    {STATUS_LABEL[s]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Line items */}
      <div style={{ ...cardStyle, overflow: "hidden", marginBottom: 22 }}>
        {/* header */}
        <div style={{ display: "flex", padding: "12px 20px", background: "var(--ink)", color: "#fff6ee", fontSize: 11.5, fontWeight: 700, letterSpacing: ".06em", textTransform: "uppercase" }}>
          <div style={{ flex: 1 }}>Item</div>
          <div style={{ width: 70, textAlign: "right" }}>Qty</div>
          <div style={{ width: 100, textAlign: "right" }}>Unit</div>
          <div style={{ width: 110, textAlign: "right" }}>Total</div>
        </div>
        {order.items.map((it, i) => (
          <div key={it.id} style={{ display: "flex", alignItems: "flex-start", padding: "14px 20px", borderTop: i === 0 ? "none" : "1px solid var(--line)" }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: 14.5 }}>{it.name}</div>
              {(it.variationColour || it.description1) && (
                <div style={{ color: "#8a8577", fontSize: 13, marginTop: 2 }}>
                  {[it.variationColour, it.description1].filter(Boolean).join(" · ")}
                </div>
              )}
            </div>
            <div style={{ width: 70, textAlign: "right", fontSize: 14 }}>
              {it.quantity}
              {it.unit ? <span style={{ color: "#8a8577", fontSize: 12 }}> {it.unit}</span> : null}
            </div>
            <div style={{ width: 100, textAlign: "right", fontSize: 14 }}>{money(it.unitPrice)}</div>
            <div style={{ width: 110, textAlign: "right", fontWeight: 700, fontSize: 14 }}>{money(it.lineTotal)}</div>
          </div>
        ))}
        {/* subtotal */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 40, padding: "16px 20px", borderTop: "1px solid var(--line)", background: "color-mix(in oklab, var(--accent) 6%, #fff)" }}>
          <span style={{ fontWeight: 800, fontSize: 15 }}>Subtotal</span>
          <span style={{ fontFamily: "var(--font-archivo)", fontWeight: 800, fontSize: 18, minWidth: 110, textAlign: "right" }}>
            {money(order.subtotal)}
          </span>
        </div>
      </div>

      {/* Details */}
      {(order.deliveryAddress || order.customerNote) && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
          {order.deliveryAddress && (
            <div style={{ ...cardStyle, padding: "16px 18px" }}>
              <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: ".1em", textTransform: "uppercase", color: "#8a8577", marginBottom: 6 }}>
                Delivery address
              </div>
              <div style={{ fontSize: 14, lineHeight: 1.5, whiteSpace: "pre-line" }}>{order.deliveryAddress}</div>
            </div>
          )}
          {order.customerNote && (
            <div style={{ ...cardStyle, padding: "16px 18px" }}>
              <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: ".1em", textTransform: "uppercase", color: "#8a8577", marginBottom: 6 }}>
                Your note
              </div>
              <div style={{ fontSize: 14, lineHeight: 1.5, whiteSpace: "pre-line" }}>{order.customerNote}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
