"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuoteCart, updateQuote, removeQuote, clearQuote, type QuoteItem } from "../../lib/quoteCart";
import { coveragePerUnit, hasBoxes, roundUpToBox, stepQty, unitLabel, unitsForArea, boxesFor } from "../../lib/boxQty";
import MarketingConsent, { MARKETING_CONSENT_TEXT } from "../components/marketing/MarketingConsent";

const card: React.CSSProperties = { background: "var(--surface, #fff)", border: "1px solid var(--line)", borderRadius: 18, padding: "clamp(16px,3vw,24px)" };
const label: React.CSSProperties = { fontSize: 12.5, fontWeight: 800, letterSpacing: ".04em", textTransform: "uppercase", color: "var(--muted, #6a7075)", display: "block", marginBottom: 6 };
const input: React.CSSProperties = { width: "100%", padding: "11px 14px", borderRadius: 10, border: "1px solid var(--line)", background: "#fff", fontSize: 15, fontWeight: 600, color: "var(--ink)", fontFamily: "inherit" };
const small: React.CSSProperties = { ...input, width: 110, padding: "9px 10px" };
const stepBtn: React.CSSProperties = { width: 38, height: 38, borderRadius: 10, border: "1px solid var(--line)", background: "#fff", fontSize: 18, fontWeight: 700, cursor: "pointer", color: "var(--ink)" };
const fmt = (n: number) => `$${n.toLocaleString("en-AU", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const WASTE = [0, 5, 10, 15];

function Line({ it }: { it: QuoteItem }) {
  const [areaText, setAreaText] = useState(it.areaM2 ? String(it.areaM2) : "");
  const canArea = it.kind === "standard" && !!coveragePerUnit(it.unit, it.coverageM2);
  const waste = it.wastePct ?? 10;
  const applyArea = (a: number, w: number) => {
    const q = unitsForArea(a * (1 + w / 100), it.unit, it.coverageM2, it.boxQuantity);
    if (q) updateQuote(it.id, { quantity: q, areaM2: a, wastePct: w });
  };
  const unit = unitLabel(it.unit, it.quantity);
  const boxes = hasBoxes(it.boxQuantity) ? boxesFor(it.quantity, it.boxQuantity) : null;
  const line = it.unitPrice != null ? it.unitPrice * it.quantity : null;

  return (
    <div style={{ ...card, display: "grid", gridTemplateColumns: "72px minmax(0,1fr)", gap: 16 }}>
      <div style={{ width: 72, height: 72, borderRadius: 12, background: "var(--bg)", overflow: "hidden" }}>
        {it.image && <img src={it.image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
      </div>
      <div style={{ minWidth: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start" }}>
          <div style={{ minWidth: 0 }}>
            <Link href={it.href} style={{ fontWeight: 800, fontSize: 16.5, color: "var(--ink)", textDecoration: "none", overflowWrap: "anywhere" }}>{it.name}</Link>
            {it.colour && it.colour !== it.name && <div style={{ fontSize: 14, color: "#5a6067" }}>{it.colour}</div>}
            {it.spec?.length ? <ul style={{ margin: "6px 0 0", paddingLeft: 18, fontSize: 13.5, color: "#5a6067", lineHeight: 1.55 }}>{it.spec.map((s) => <li key={s}>{s}</li>)}</ul> : null}
          </div>
          <button type="button" onClick={() => removeQuote(it.id)} style={{ background: "none", border: "none", color: "#9a3b2b", fontWeight: 700, cursor: "pointer", fontSize: 13.5, flex: "none" }}>Remove</button>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 18, alignItems: "flex-end", marginTop: 14 }}>
          {canArea && (
            <>
              <label style={{ fontSize: 13.5 }}><span style={label}>Area (m²)</span>
                <input inputMode="decimal" value={areaText} placeholder="e.g. 12.5" style={small}
                  onChange={(e) => setAreaText(e.target.value)}
                  onBlur={() => { const a = parseFloat(areaText); if (a > 0) applyArea(a, waste); }} />
              </label>
              <label style={{ fontSize: 13.5 }}><span style={label}>Add for waste</span>
                <select value={waste} style={{ ...small, width: 120 }} onChange={(e) => { const w = Number(e.target.value); const a = parseFloat(areaText); if (a > 0) applyArea(a, w); else updateQuote(it.id, { wastePct: w }); }}>
                  {WASTE.map((w) => <option key={w} value={w}>{w === 0 ? "None" : `${w}%`}</option>)}
                </select>
              </label>
            </>
          )}
          <div>
            <span style={label}>Quantity</span>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <button type="button" aria-label="Less" style={stepBtn} onClick={() => updateQuote(it.id, { quantity: it.kind === "options" ? Math.max(1, it.quantity - 1) : stepQty(it.quantity, it.boxQuantity, -1), areaM2: null })}>−</button>
              <span style={{ minWidth: 86, textAlign: "center", fontWeight: 800 }}>{it.quantity} {unit}</span>
              <button type="button" aria-label="More" style={stepBtn} onClick={() => updateQuote(it.id, { quantity: it.kind === "options" ? it.quantity + 1 : stepQty(it.quantity, it.boxQuantity, 1), areaM2: null })}>+</button>
            </div>
          </div>
          <div style={{ marginLeft: "auto", textAlign: "right" }}>
            <span style={label}>Estimate</span>
            <strong style={{ fontSize: 17 }}>{line != null ? fmt(line) : "Price on request"}</strong>
          </div>
        </div>
        {(boxes || it.areaM2) && (
          <p style={{ margin: "8px 0 0", fontSize: 13, color: "#5a6067" }}>
            {boxes ? `${boxes} box${boxes === 1 ? "" : "es"} (sold in multiples of ${it.boxQuantity} ${unitLabel(it.unit, it.boxQuantity)})` : ""}
            {it.areaM2 ? `${boxes ? " · " : ""}for ${it.areaM2} m²${it.wastePct ? ` + ${it.wastePct}% waste` : ""}, rounded up to whole boxes` : ""}
          </p>
        )}
        {it.kind === "options" && <Link href={it.href} style={{ display: "inline-block", marginTop: 8, fontSize: 13.5, fontWeight: 700, color: "var(--accent)" }}>Change this build</Link>}
      </div>
    </div>
  );
}

export default function QuoteClient({ pickupAddress }: { pickupAddress: string }) {
  const items = useQuoteCart();
  const [f, setF] = useState({ name: "", email: "", phone: "", street: "", suburb: "", state: "QLD", postcode: "", neededBy: "", notes: "", company: "" });
  const [pickup, setPickup] = useState(false);
  const [consent, setConsent] = useState(false);
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState<string | null>(null);
  const [err, setErr] = useState("");
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setF((x) => ({ ...x, [k]: e.target.value }));

  const priced = items.filter((i) => i.unitPrice != null);
  const total = priced.reduce((s, i) => s + (i.unitPrice ?? 0) * i.quantity, 0);
  const onRequest = items.length - priced.length;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    if (!f.name.trim()) return setErr("Please add your name.");
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(f.email)) return setErr("Please enter a valid email address.");
    if (!pickup && (!f.street.trim() || !f.suburb.trim() || !f.postcode.trim())) return setErr("Please add the delivery address, or tick pick-up.");
    setSending(true);
    try {
      const res = await fetch("/api/quote-request", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: f.name, email: f.email, phone: f.phone, company: f.company, pickup,
          address: pickup ? null : { street: f.street, suburb: f.suburb, state: f.state, postcode: f.postcode },
          neededBy: f.neededBy, notes: f.notes, marketingConsent: consent, consentText: MARKETING_CONSENT_TEXT,
          items: items.map((i) => ({ rangeId: i.rangeId, colour: i.colour, quantity: i.kind === "standard" ? roundUpToBox(i.quantity, i.boxQuantity) : i.quantity, areaM2: i.areaM2, wastePct: i.areaM2 ? i.wastePct : null, options: i.options, name: i.name, unit: i.unit, unitPrice: i.unitPrice, spec: i.spec })),
        }),
      });
      const j = await res.json().catch(() => null);
      if (!res.ok || !j?.ok) throw new Error(j?.error || "send");
      clearQuote();
      setDone(j.reference ?? "");
    } catch (e2) {
      setErr(e2 instanceof Error && e2.message !== "send" ? e2.message : "Something went wrong. Please try again, or call the showroom.");
    } finally { setSending(false); }
  }

  if (done !== null) {
    return (
      <section style={{ padding: "26px 24px 90px" }}>
        <div style={{ maxWidth: 760, margin: "0 auto", ...card, textAlign: "center" }}>
          <h2 style={{ fontFamily: "var(--font-archivo)", fontWeight: 900, fontSize: 30, margin: 0 }}>Thanks, your request is in.</h2>
          <p style={{ fontSize: 16, lineHeight: 1.7, color: "#3a444a" }}>
            We have emailed you a copy{done ? ` (reference ${done})` : ""}. Our team will check stock, batches and freight and send your quote, usually within one business day.
          </p>
          <Link href="/shop" style={{ fontWeight: 700, color: "var(--accent)" }}>Keep browsing</Link>
        </div>
      </section>
    );
  }

  if (!items.length) {
    return (
      <section style={{ padding: "26px 24px 90px" }}>
        <div style={{ maxWidth: 760, margin: "0 auto", ...card, textAlign: "center" }}>
          <p style={{ fontSize: 16, color: "#3a444a" }}>Your quote list is empty. Tap <strong>Add to quote</strong> on any product to start one.</p>
          <Link href="/shop" style={{ fontWeight: 700, color: "var(--accent)" }}>Browse the shop</Link>
        </div>
      </section>
    );
  }

  return (
    <section style={{ padding: "26px 24px 90px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gap: 14 }}>
        {items.map((it) => <Line key={it.id} it={it} />)}

        <div style={{ ...card, display: "flex", flexWrap: "wrap", gap: 16, alignItems: "baseline", justifyContent: "space-between" }}>
          <div>
            <span style={label}>Estimated total</span>
            <strong style={{ fontFamily: "var(--font-archivo)", fontSize: 30, fontWeight: 900 }}>{fmt(total)}</strong>
            <span style={{ fontSize: 13.5, color: "#5a6067", marginLeft: 8 }}>incl. GST{onRequest ? `, plus ${onRequest} item${onRequest === 1 ? "" : "s"} priced on request` : ""}</span>
          </div>
        </div>
        <div style={{ ...card, background: "#fff8ec", borderColor: "#f0d9a8" }}>
          <p style={{ margin: 0, fontSize: 15, lineHeight: 1.65, color: "#5a4a26" }}>
            <strong>This is an estimate, not a final price.</strong> Freight charges may apply, whether your order is delivered to our Baringa store for collection or delivered direct to your site. Your quote will confirm freight, stock and batch before you commit to anything.
          </p>
        </div>

        <form onSubmit={submit} style={{ ...card, display: "grid", gap: 14 }}>
          <h2 style={{ fontFamily: "var(--font-archivo)", fontWeight: 900, fontSize: 24, margin: 0 }}>Send me a quote</h2>
          <div style={{ display: "grid", gap: 14, gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))" }}>
            <label><span style={label}>Name</span><input style={input} value={f.name} onChange={set("name")} autoComplete="name" required /></label>
            <label><span style={label}>Email</span><input style={input} type="email" value={f.email} onChange={set("email")} autoComplete="email" required /></label>
            <label><span style={label}>Phone</span><input style={input} type="tel" value={f.phone} onChange={set("phone")} autoComplete="tel" /></label>
          </div>

          <label style={{ display: "flex", gap: 12, alignItems: "flex-start", padding: "14px 16px", borderRadius: 12, border: `1.5px solid ${pickup ? "var(--accent)" : "var(--line)"}`, cursor: "pointer", background: "#fff" }}>
            <input type="checkbox" checked={pickup} onChange={(e) => setPickup(e.target.checked)} style={{ width: 20, height: 20, marginTop: 2, accentColor: "var(--accent)" }} />
            <span><strong>I will pick up from the OnWood Tiles warehouse in Baringa</strong><br /><span style={{ fontSize: 14, color: "#5a6067" }}>{pickupAddress}. We will let you know when your order is ready to collect.</span></span>
          </label>

          {!pickup && (
            <div style={{ display: "grid", gap: 14, gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))" }}>
              <label style={{ gridColumn: "1 / -1" }}><span style={label}>Delivery address</span><input style={input} value={f.street} onChange={set("street")} autoComplete="street-address" placeholder="Street address" /></label>
              <label><span style={label}>Suburb</span><input style={input} value={f.suburb} onChange={set("suburb")} autoComplete="address-level2" /></label>
              <label><span style={label}>State</span><input style={input} value={f.state} onChange={set("state")} autoComplete="address-level1" /></label>
              <label><span style={label}>Postcode</span><input style={input} value={f.postcode} onChange={set("postcode")} autoComplete="postal-code" inputMode="numeric" /></label>
            </div>
          )}

          <div style={{ display: "grid", gap: 14, gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))" }}>
            <label><span style={label}>Needed by (optional)</span><input style={input} type="date" value={f.neededBy} onChange={set("neededBy")} /></label>
          </div>
          <label><span style={label}>Anything else we should know? (optional)</span><textarea style={{ ...input, minHeight: 90, resize: "vertical" }} value={f.notes} onChange={set("notes")} placeholder="Site access, stairs, a rough laying date, questions..." /></label>
          {/* Honeypot: hidden from people, filled by bots. */}
          <input tabIndex={-1} autoComplete="off" value={f.company} onChange={set("company")} aria-hidden="true" style={{ position: "absolute", left: -9999, width: 1, height: 1, opacity: 0 }} />
          <p style={{ margin: 0, fontSize: 13, color: "#5a6067" }}>We only use your details to prepare and follow up this quote. See our <Link href="/privacy-policy" style={{ color: "inherit" }}>privacy policy</Link>.</p>
          <MarketingConsent checked={consent} onChange={setConsent} />
          {err && <p style={{ margin: 0, color: "#b42318", fontWeight: 600 }}>{err}</p>}
          <div><button type="submit" disabled={sending} style={{ background: "var(--accent)", color: "#fff6ee", fontWeight: 800, fontSize: 16, padding: "15px 30px", borderRadius: 99, border: "none", cursor: "pointer", fontFamily: "inherit" }}>{sending ? "Sending..." : "Send me a quote"}</button></div>
        </form>
      </div>
    </section>
  );
}
