"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "../CartProvider";
import { boxesFor, hasBoxes, roundUpToBox, stepQty, unitLabel } from "../../../../lib/boxQty";

function money(n: number): string {
  return `$${(n ?? 0).toLocaleString("en-AU", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function CartView() {
  const router = useRouter();
  const { lines, setQty, remove, clear, ready } = useCart();
  const [note, setNote] = useState("");
  const [poReference, setPoReference] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Avoid a hydration flash: wait for localStorage to load before deciding empty.
  if (!ready) {
    return <p style={{ color: "#8a8577" }}>Loading your order...</p>;
  }

  if (lines.length === 0) {
    return (
      <div
        style={{
          textAlign: "center",
          padding: "56px 24px",
          borderRadius: 18,
          border: "1px dashed var(--line)",
          background: "color-mix(in oklab, var(--bg) 60%, #fff)",
        }}
      >
        <p style={{ fontFamily: "var(--font-archivo)", fontWeight: 800, fontSize: 19, margin: 0 }}>
          Your order request is empty
        </p>
        <p style={{ color: "#5a6067", fontSize: 14.5, margin: "10px 0 18px" }}>Add items from the catalogue to get started.</p>
        <Link
          href="/trade/catalogue"
          style={{ textDecoration: "none", background: "var(--accent)", color: "#fff6ee", fontWeight: 700, fontSize: 15, padding: "12px 22px", borderRadius: 99 }}
        >
          Browse the catalogue &rarr;
        </Link>
      </div>
    );
  }

  const subtotal = lines.reduce((sum, l) => sum + l.unitPrice * l.quantity, 0);

  async function submit() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/trade/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: lines.map((l) => ({
            productId: l.productId,
            quantity: l.quantity,
            ...(l.colour ? { colour: l.colour } : {}),
          })),
          note: note.trim() || undefined,
          poReference: poReference.trim() || undefined,
          deliveryAddress: deliveryAddress.trim() || undefined,
        }),
      });
      const json = (await res.json().catch(() => ({}))) as { data?: { id: string }; error?: string };
      if (!res.ok || !json.data?.id) {
        setError(json.error || "We could not submit your order. Please try again.");
        setBusy(false);
        return;
      }
      clear();
      router.replace(`/trade/orders/${json.data.id}`);
      router.refresh();
    } catch {
      setError("Could not reach the server, please try again.");
      setBusy(false);
    }
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.6fr) minmax(0, 1fr)", gap: 26, alignItems: "start" }} className="ow-cart-grid">
      {/* Line items */}
      <div style={{ background: "#fff", border: "1px solid var(--line)", borderRadius: 18, overflow: "hidden" }}>
        {lines.map((l, i) => (
          <div
            key={`${l.productId}-${l.colour ?? ""}`}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              padding: "16px 18px",
              borderTop: i === 0 ? "none" : "1px solid var(--line)",
            }}
          >
            <div style={{ width: 60, height: 60, borderRadius: 10, overflow: "hidden", flexShrink: 0, background: "#f3efe6" }}>
              {l.image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={l.image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
              )}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 800, fontSize: 14.5 }}>{l.name}</div>
              {l.colour && <div style={{ color: "#8a8577", fontSize: 13, marginTop: 2 }}>{l.colour}</div>}
              <div style={{ color: "#8a8577", fontSize: 12.5, marginTop: 3 }}>
                {money(l.unitPrice)}
                {l.unit ? ` / ${unitLabel(l.unit)}` : ""} <span style={{ opacity: 0.7 }}>(indicative)</span>
                {hasBoxes(l.boxQuantity) && (
                  <span style={{ opacity: 0.9 }}> &middot; {boxesFor(l.quantity, l.boxQuantity)} box{boxesFor(l.quantity, l.boxQuantity) === 1 ? "" : "es"}</span>
                )}
              </div>
            </div>
            <div style={{ display: "inline-flex", alignItems: "center", border: "1px solid var(--line)", borderRadius: 10, overflow: "hidden" }}>
              <button type="button" onClick={() => setQty(l.productId, l.colour, stepQty(l.quantity, l.boxQuantity, -1))} aria-label="Decrease quantity" style={stepBtn}>
                &minus;
              </button>
              <input
                type="number"
                min={0}
                value={l.quantity}
                onChange={(e) => setQty(l.productId, l.colour, Math.max(0, Number(e.target.value) || 0))}
                onBlur={() => setQty(l.productId, l.colour, roundUpToBox(l.quantity, l.boxQuantity))}
                aria-label={`Quantity of ${l.name}`}
                style={{ width: 52, textAlign: "center", border: "none", fontSize: 14, fontWeight: 700, color: "var(--ink)", background: "transparent" }}
              />
              <button type="button" onClick={() => setQty(l.productId, l.colour, stepQty(l.quantity, l.boxQuantity, 1))} aria-label="Increase quantity" style={stepBtn}>
                +
              </button>
            </div>
            <div style={{ width: 84, textAlign: "right", fontWeight: 800, fontSize: 14.5 }}>{money(l.unitPrice * l.quantity)}</div>
            <button
              type="button"
              onClick={() => remove(l.productId, l.colour)}
              aria-label={`Remove ${l.name}`}
              style={{ border: "none", background: "none", cursor: "pointer", color: "#a13a2c", fontSize: 18, lineHeight: 1, padding: 6 }}
            >
              &times;
            </button>
          </div>
        ))}
      </div>

      {/* Summary + submit */}
      <div style={{ background: "#fff", border: "1px solid var(--line)", borderRadius: 18, padding: "22px 22px 24px", position: "sticky", top: 92 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <span style={{ fontSize: 14.5, color: "#5a6067", fontWeight: 700 }}>Indicative subtotal</span>
          <span style={{ fontFamily: "var(--font-archivo)", fontWeight: 800, fontSize: 22 }}>{money(subtotal)}</span>
        </div>
        <p style={{ color: "#8a8577", fontSize: 12.5, margin: "8px 0 0", lineHeight: 1.55 }}>
          This is a request, not a final invoice. We will confirm pricing, stock and any GST before processing.
        </p>

        <div style={{ marginTop: 18, display: "flex", flexDirection: "column", gap: 12 }}>
          <label style={{ fontSize: 12.5, fontWeight: 700, color: "#5a6067" }}>
            PO reference (optional)
            <input value={poReference} onChange={(e) => setPoReference(e.target.value)} placeholder="Your purchase order no." style={fieldStyle} />
          </label>
          <label style={{ fontSize: 12.5, fontWeight: 700, color: "#5a6067" }}>
            Delivery address (optional)
            <textarea value={deliveryAddress} onChange={(e) => setDeliveryAddress(e.target.value)} placeholder="Leave blank to pick up in Baringa" rows={2} style={{ ...fieldStyle, resize: "vertical" }} />
          </label>
          <label style={{ fontSize: 12.5, fontWeight: 700, color: "#5a6067" }}>
            Note (optional)
            <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Anything we should know" rows={2} style={{ ...fieldStyle, resize: "vertical" }} />
          </label>
        </div>

        {error && (
          <p role="alert" style={{ color: "#a13a2c", fontSize: 13, margin: "14px 0 0" }}>
            {error}
          </p>
        )}

        <button
          type="button"
          onClick={submit}
          disabled={busy}
          style={{
            width: "100%",
            marginTop: 18,
            padding: "14px 16px",
            borderRadius: 12,
            border: "none",
            background: "var(--accent)",
            color: "#fff6ee",
            fontSize: 15,
            fontWeight: 800,
            cursor: "pointer",
            opacity: busy ? 0.6 : 1,
          }}
        >
          {busy ? "Submitting..." : "Submit order request"}
        </button>
        <Link href="/trade/catalogue" style={{ display: "block", textAlign: "center", marginTop: 12, color: "#5a6067", fontWeight: 700, fontSize: 13.5, textDecoration: "none" }}>
          Keep shopping
        </Link>
      </div>

      <style>{`
        @media (max-width: 820px) {
          .ow-cart-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

const stepBtn: React.CSSProperties = {
  width: 32,
  height: 36,
  border: "none",
  background: "#f6f2ea",
  color: "var(--ink)",
  fontSize: 16,
  fontWeight: 700,
  cursor: "pointer",
};

const fieldStyle: React.CSSProperties = {
  width: "100%",
  marginTop: 6,
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid var(--line)",
  fontSize: 14,
  fontWeight: 500,
  color: "var(--ink)",
  background: "#fff",
  fontFamily: "inherit",
};
