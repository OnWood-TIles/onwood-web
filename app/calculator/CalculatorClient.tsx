"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

// "How much tile do I need?" - a genuinely useful buyer tool. Add one or more
// areas (rooms), pick a wastage allowance, optionally enter box coverage and a
// $/m2 to get a rough supply cost. Results are FREE (value first); the email
// capture is an optional "send me my estimate" that also lands the lead in
// OnConnect (tagged with bucketed project context for segmentation).

type Area = { id: number; label: string; l: string; w: string };

const WASTAGE = [
  { pct: 10, label: "Standard", note: "straight lay, simple room" },
  { pct: 15, label: "Diagonal / large format", note: "diagonal, big planks, some cuts" },
  { pct: 20, label: "Complex", note: "lots of cuts, patterns, small rooms" },
];
const ROOMS = ["Bathroom", "Kitchen / splashback", "Living / hallway", "Laundry", "Outdoor / alfresco", "Pool surround", "Feature wall", "Whole home", "Other"];

const num = (s: string) => { const n = parseFloat(s); return Number.isFinite(n) && n > 0 ? n : 0; };
const fmt = (n: number, d = 2) => n.toLocaleString("en-AU", { minimumFractionDigits: d, maximumFractionDigits: d });

const card: React.CSSProperties = { background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 18, padding: "clamp(20px,3vw,28px)" };
const label: React.CSSProperties = { fontSize: 12.5, fontWeight: 800, letterSpacing: ".04em", textTransform: "uppercase", color: "var(--muted)", display: "block", marginBottom: 8 };
const input: React.CSSProperties = { width: "100%", padding: "11px 14px", borderRadius: 10, border: "1px solid var(--line)", background: "#fff", fontSize: 15, fontWeight: 600, color: "var(--ink)", fontFamily: "inherit" };
const eyebrow: React.CSSProperties = { fontSize: 12, fontWeight: 800, letterSpacing: ".2em", textTransform: "uppercase", color: "var(--accent)" };

export default function CalculatorClient() {
  const [areas, setAreas] = useState<Area[]>([{ id: 1, label: "Area 1", l: "", w: "" }]);
  const [wastage, setWastage] = useState(10);
  const [boxCoverage, setBoxCoverage] = useState("");
  const [pricePerM2, setPricePerM2] = useState("");
  const [roomType, setRoomType] = useState("");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState("");

  const totalArea = useMemo(() => areas.reduce((s, a) => s + num(a.l) * num(a.w), 0), [areas]);
  const toOrder = totalArea * (1 + wastage / 100);
  const boxes = num(boxCoverage) > 0 ? Math.ceil(toOrder / num(boxCoverage)) : null;
  const cost = num(pricePerM2) > 0 ? toOrder * num(pricePerM2) : null;
  const hasResult = totalArea > 0;

  const addArea = () => setAreas((a) => [...a, { id: Date.now(), label: `Area ${a.length + 1}`, l: "", w: "" }]);
  const rmArea = (id: number) => setAreas((a) => (a.length > 1 ? a.filter((x) => x.id !== id) : a));
  const setArea = (id: number, k: "l" | "w", v: string) => setAreas((a) => a.map((x) => (x.id === id ? { ...x, [k]: v.replace(/[^0-9.]/g, "") } : x)));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) { setErr("Please enter a valid email address."); return; }
    setSending(true);
    try {
      const res = await fetch("/api/calculator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name, email, phone, roomType,
          totalArea: +totalArea.toFixed(2), wastage, toOrder: +toOrder.toFixed(2), boxes, cost: cost ? +cost.toFixed(2) : null,
        }),
      });
      if (!res.ok) throw new Error();
      setSent(true);
    } catch { setErr("Something went wrong. Please try again, or call the showroom."); }
    finally { setSending(false); }
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1.15fr) minmax(0,0.85fr)", gap: 28, alignItems: "start" }} className="calc-grid">
      {/* ── Inputs ── */}
      <div style={{ ...card }}>
        <span style={label}>Your areas (metres)</span>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {areas.map((a, i) => (
            <div key={a.id} style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: "var(--muted)", width: 58, flexShrink: 0 }}>Area {i + 1}</span>
              <input aria-label={`Area ${i + 1} length in metres`} inputMode="decimal" placeholder="Length" value={a.l} onChange={(e) => setArea(a.id, "l", e.target.value)} style={input} />
              <span style={{ color: "var(--muted)", fontWeight: 700 }}>×</span>
              <input aria-label={`Area ${i + 1} width in metres`} inputMode="decimal" placeholder="Width" value={a.w} onChange={(e) => setArea(a.id, "w", e.target.value)} style={input} />
              <span style={{ fontSize: 13, color: "var(--muted)", width: 62, textAlign: "right", flexShrink: 0 }}>{num(a.l) * num(a.w) > 0 ? `${fmt(num(a.l) * num(a.w))} m²` : ""}</span>
              <button type="button" onClick={() => rmArea(a.id)} aria-label="Remove area" disabled={areas.length <= 1} style={{ appearance: "none", border: "none", background: "none", cursor: areas.length <= 1 ? "default" : "pointer", color: areas.length <= 1 ? "var(--line)" : "var(--muted)", fontSize: 20, lineHeight: 1, padding: 4 }}>×</button>
            </div>
          ))}
        </div>
        <button type="button" onClick={addArea} style={{ marginTop: 14, appearance: "none", cursor: "pointer", background: "none", border: "1px dashed var(--line)", borderRadius: 10, padding: "10px 16px", fontSize: 13.5, fontWeight: 700, color: "var(--accent)", fontFamily: "inherit" }}>+ Add another area</button>

        <div style={{ marginTop: 24 }}>
          <span style={label}>Wastage allowance</span>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {WASTAGE.map((w) => {
              const on = wastage === w.pct;
              return (
                <button key={w.pct} type="button" onClick={() => setWastage(w.pct)} style={{ textAlign: "left", cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 12, padding: "11px 14px", borderRadius: 10, border: `1px solid ${on ? "var(--accent)" : "var(--line)"}`, background: on ? "color-mix(in oklab, var(--accent) 10%, #fff)" : "#fff" }}>
                  <span style={{ fontWeight: 800, fontSize: 15, color: on ? "var(--accent)" : "var(--ink)", width: 42 }}>{w.pct}%</span>
                  <span><span style={{ fontWeight: 700, fontSize: 14, color: "var(--ink)" }}>{w.label}</span><br /><span style={{ fontSize: 12.5, color: "var(--muted)" }}>{w.note}</span></span>
                </button>
              );
            })}
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginTop: 24 }}>
          <div>
            <span style={label}>Box coverage <span style={{ textTransform: "none", fontWeight: 600 }}>(optional)</span></span>
            <input inputMode="decimal" placeholder="m² per box" value={boxCoverage} onChange={(e) => setBoxCoverage(e.target.value.replace(/[^0-9.]/g, ""))} style={input} />
          </div>
          <div>
            <span style={label}>Price <span style={{ textTransform: "none", fontWeight: 600 }}>(optional)</span></span>
            <input inputMode="decimal" placeholder="$ per m²" value={pricePerM2} onChange={(e) => setPricePerM2(e.target.value.replace(/[^0-9.]/g, ""))} style={input} />
          </div>
        </div>
      </div>

      {/* ── Results + capture ── */}
      <div style={{ display: "flex", flexDirection: "column", gap: 18, position: "sticky", top: 96 }}>
        <div style={{ ...card, background: "var(--deep)", color: "#F6F1E8", border: "none" }}>
          <span style={{ ...eyebrow, color: "var(--accent2)" }}>Your estimate</span>
          {hasResult ? (
            <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 14 }}>
              <Row k="Total area" v={`${fmt(totalArea)} m²`} />
              <Row k={`With ${wastage}% wastage`} v={`${fmt(toOrder)} m²`} big />
              {boxes != null && <Row k="Boxes to order" v={`${boxes}`} />}
              {cost != null && <Row k="Rough supply cost" v={`$${fmt(cost, 0)}`} />}
              <p style={{ fontSize: 12, lineHeight: 1.5, color: "rgba(246,241,232,.55)", margin: "6px 0 0" }}>An estimate only. Bring your plans in and we will confirm exact quantities, box multiples and price for your chosen tile.</p>
            </div>
          ) : (
            <p style={{ marginTop: 14, fontSize: 15, lineHeight: 1.6, color: "rgba(246,241,232,.72)" }}>Enter your room sizes and your estimate appears here instantly.</p>
          )}
        </div>

        {/* Capture */}
        <div style={{ ...card }}>
          {sent ? (
            <div>
              <div style={{ fontFamily: "var(--font-archivo)", fontWeight: 800, fontSize: 19, color: "var(--ink)" }}>Sent - check your inbox.</div>
              <p style={{ fontSize: 14.5, lineHeight: 1.6, color: "var(--muted)", margin: "10px 0 16px" }}>Your estimate is on its way. When you are ready, browse the range or come and see us with your plans.</p>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <Link href="/shop" style={{ background: "var(--accent)", color: "#fff", fontWeight: 800, fontSize: 14, textDecoration: "none", padding: "11px 20px", borderRadius: 999 }}>Browse tiles</Link>
                <Link href="/book" style={{ border: "1px solid var(--line)", color: "var(--ink)", fontWeight: 800, fontSize: 14, textDecoration: "none", padding: "11px 20px", borderRadius: 999 }}>Book a visit</Link>
              </div>
            </div>
          ) : (
            <form onSubmit={submit}>
              <span style={label}>Email me my estimate</span>
              <p style={{ fontSize: 13.5, lineHeight: 1.55, color: "var(--muted)", margin: "0 0 14px" }}>Save your numbers and we will help you get the quantities and tile right. No spam.</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <input aria-label="Your name" placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} style={input} />
                <input aria-label="Email" type="email" required placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} style={input} />
                <input aria-label="Phone (optional)" placeholder="Phone (optional)" value={phone} onChange={(e) => setPhone(e.target.value)} style={input} />
                <select aria-label="What are you tiling? (optional)" value={roomType} onChange={(e) => setRoomType(e.target.value)} style={{ ...input, cursor: "pointer" }}>
                  <option value="">What are you tiling? (optional)</option>
                  {ROOMS.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              {err && <p style={{ color: "#c14338", fontSize: 13.5, fontWeight: 600, margin: "10px 0 0" }}>{err}</p>}
              <button type="submit" disabled={sending || !hasResult} style={{ marginTop: 14, width: "100%", cursor: sending || !hasResult ? "default" : "pointer", background: hasResult ? "var(--accent)" : "var(--line)", color: "#fff", fontWeight: 800, fontSize: 15, border: "none", borderRadius: 999, padding: "13px 20px", fontFamily: "inherit", opacity: sending ? 0.7 : 1 }}>
                {sending ? "Sending…" : hasResult ? "Email me my estimate" : "Enter your sizes first"}
              </button>
            </form>
          )}
        </div>
      </div>

      <style>{`@media(max-width:820px){.calc-grid{grid-template-columns:1fr!important}}`}</style>
    </div>
  );
}

function Row({ k, v, big }: { k: string; v: string; big?: boolean }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12, ...(big ? { paddingTop: 12, borderTop: "1px solid rgba(246,241,232,.18)" } : {}) }}>
      <span style={{ fontSize: 14, color: "rgba(246,241,232,.72)" }}>{k}</span>
      <span style={{ fontFamily: "var(--font-archivo)", fontWeight: 800, fontSize: big ? 26 : 18, color: big ? "var(--accent2)" : "#F6F1E8" }}>{v}</span>
    </div>
  );
}
