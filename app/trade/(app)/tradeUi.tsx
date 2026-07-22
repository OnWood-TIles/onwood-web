import type { CSSProperties } from "react";
import type { OrderStatus, PriceDisplayGst } from "../../../lib/onbase/trade";

// Shared trade-portal display helpers (server-safe, no client hooks).

export function money(n: number): string {
  return `$${(n ?? 0).toLocaleString("en-AU", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// The GST label to show beside a trade price, driven by the item's priceDisplayGst.
export function gstLabel(mode: PriceDisplayGst): string {
  if (mode === "INCLUDE_GST") return "inc GST";
  if (mode === "EXCLUDE_GST") return "ex GST";
  return ""; // NO_GST: nothing to add
}

// Friendly, customer-facing order-status labels (OnBase status -> plain English).
export const STATUS_LABEL: Record<OrderStatus, string> = {
  RECEIVED: "Order received",
  IN_PROGRESS: "In progress",
  INVOICED: "Invoiced",
  COMPLETED: "Complete",
  CANCELLED: "Cancelled",
};

// The happy-path progression (cancelled is handled separately).
export const STATUS_FLOW: OrderStatus[] = [
  "RECEIVED",
  "IN_PROGRESS",
  "INVOICED",
  "COMPLETED",
];

const STATUS_TONE: Record<OrderStatus, { bg: string; ink: string; dot: string }> = {
  RECEIVED: { bg: "rgba(32,48,58,.07)", ink: "#5a6067", dot: "#8a8577" },
  IN_PROGRESS: { bg: "rgba(183,121,31,.12)", ink: "#96621a", dot: "#b7791f" },
  INVOICED: { bg: "rgba(30,122,140,.12)", ink: "#166273", dot: "#1e7a8c" },
  COMPLETED: { bg: "rgba(31,122,84,.14)", ink: "#166b48", dot: "#1f7a54" },
  CANCELLED: { bg: "rgba(176,58,42,.1)", ink: "#a13a2c", dot: "#b03a2a" },
};

export function StatusChip({ status, size = "sm" }: { status: OrderStatus; size?: "sm" | "md" }) {
  const tone = STATUS_TONE[status] ?? STATUS_TONE.RECEIVED;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: size === "md" ? "6px 12px" : "3px 10px",
        borderRadius: 99,
        background: tone.bg,
        color: tone.ink,
        fontSize: size === "md" ? 13 : 12,
        fontWeight: 700,
        whiteSpace: "nowrap",
      }}
    >
      <span style={{ width: 7, height: 7, borderRadius: "50%", background: tone.dot }} />
      {STATUS_LABEL[status] ?? status}
    </span>
  );
}

export function formatDate(iso: string | null): string {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" });
}

export const cardStyle: CSSProperties = {
  background: "#fff",
  border: "1px solid var(--line)",
  borderRadius: 18,
  boxShadow: "0 10px 30px -22px rgba(32,48,58,.3)",
};

export function PageHeading({ title, sub }: { title: string; sub?: string }) {
  return (
    <div style={{ marginBottom: 26 }}>
      <h1
        style={{
          fontFamily: "var(--font-archivo)",
          fontWeight: 800,
          fontSize: "clamp(26px,3.4vw,40px)",
          letterSpacing: "-.02em",
          margin: 0,
        }}
      >
        {title}
        <span style={{ color: "var(--accent)" }}>.</span>
      </h1>
      {sub && <p style={{ color: "#5a6067", fontSize: 15, margin: "8px 0 0", lineHeight: 1.6 }}>{sub}</p>}
    </div>
  );
}
