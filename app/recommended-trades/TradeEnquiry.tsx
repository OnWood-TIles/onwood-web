"use client";

import { useEffect, useRef, useState } from "react";

// "Send an enquiry" for one recommended trade: a small dialog that posts to /api/trade-enquiry (OnBase stores
// it, emails the team and sends the customer a confirmation). The team passes the details on to the trade.

const field: React.CSSProperties = {
  width: "100%", padding: "13px 15px", borderRadius: 12, border: "1.5px solid var(--line)", background: "var(--surface)",
  fontFamily: "inherit", fontSize: 15, color: "var(--ink)", outline: "none", boxSizing: "border-box",
};
const label: React.CSSProperties = { display: "block", fontSize: 11.5, fontWeight: 800, letterSpacing: ".08em", textTransform: "uppercase", color: "var(--muted)", margin: "0 0 6px" };

export default function TradeEnquiry({ slug, name }: { slug: string; name: string }) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [f, setF] = useState({ name: "", email: "", phone: "", suburb: "", message: "", consent: false, company: "" });
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const d = dialogRef.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    if (!f.consent) return setErr(`Please tick the box so we can pass your details to ${name}.`);
    setBusy(true);
    try {
      const r = await fetch("/api/trade-enquiry", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...f, tradeSlug: slug }) });
      const j = await r.json().catch(() => ({}));
      if (!r.ok || !j.ok) setErr(j.error || "That didn't send. Please try again, or call us.");
      else setDone(true);
    } catch {
      setErr("That didn't send. Please check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setF({ ...f, [k]: e.target.value });

  return (
    <>
      <button type="button" className="rt-btn rt-btn-outline" onClick={() => { setOpen(true); setDone(false); setErr(null); }}>Send an enquiry</button>
      <dialog ref={dialogRef} className="rt-dialog" onClose={() => setOpen(false)} onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }} aria-labelledby={`rt-enq-${slug}`}>
        <div className="rt-dialog-inner">
          <button type="button" aria-label="Close" onClick={() => setOpen(false)} className="rt-close">×</button>
          {done ? (
            <div style={{ padding: "8px 0" }}>
              <p className="rt-eyebrow">Enquiry sent</p>
              <h3 style={{ fontFamily: "var(--font-archivo)", fontWeight: 800, fontSize: 24, margin: "8px 0 10px" }}>Thanks, we&apos;ve got it</h3>
              <p style={{ fontSize: 15.5, lineHeight: 1.6, color: "#3a444a", margin: 0 }}>We&apos;ll pass your details on to {name}, and they&apos;ll be in touch with you directly. We&apos;ve emailed you a copy.</p>
            </div>
          ) : (
            <form onSubmit={send}>
              <p className="rt-eyebrow">Send an enquiry</p>
              <h3 id={`rt-enq-${slug}`} style={{ fontFamily: "var(--font-archivo)", fontWeight: 800, fontSize: 22, margin: "6px 0 6px", lineHeight: 1.2 }}>{name}</h3>
              <p style={{ fontSize: 14, color: "var(--muted)", margin: "0 0 16px", lineHeight: 1.5 }}>Tell us about your job. We&apos;ll pass your details on and they&apos;ll contact you directly.</p>
              <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}>
                <label><span style={label}>Your name</span><input style={field} value={f.name} onChange={set("name")} required maxLength={120} autoComplete="name" /></label>
                <label><span style={label}>Phone</span><input style={field} value={f.phone} onChange={set("phone")} maxLength={40} type="tel" autoComplete="tel" /></label>
                <label><span style={label}>Email</span><input style={field} value={f.email} onChange={set("email")} required maxLength={160} type="email" autoComplete="email" /></label>
                <label><span style={label}>Suburb</span><input style={field} value={f.suburb} onChange={set("suburb")} maxLength={80} autoComplete="address-level2" /></label>
              </div>
              <label style={{ display: "block", marginTop: 12 }}><span style={label}>About your job</span>
                <textarea style={{ ...field, minHeight: 110, resize: "vertical" }} value={f.message} onChange={set("message")} required maxLength={1500} placeholder="e.g. Bathroom renovation, about 12 m² of floor and wall tiles, starting in March." />
              </label>
              {/* Honeypot: hidden from people, bots fill it in. */}
              <input name="company" tabIndex={-1} aria-hidden autoComplete="off" value={f.company} onChange={set("company")} style={{ position: "absolute", left: -9999, width: 1, height: 1, opacity: 0 }} />
              <label style={{ display: "flex", gap: 10, alignItems: "flex-start", marginTop: 14, fontSize: 13.5, lineHeight: 1.5, color: "#3a444a", cursor: "pointer" }}>
                <input type="checkbox" checked={f.consent} onChange={(e) => setF({ ...f, consent: e.target.checked })} style={{ width: 18, height: 18, marginTop: 1, accentColor: "var(--accent)", flexShrink: 0 }} />
                <span>I agree to OnWood Tiles passing my name, contact details and message to {name} so they can contact me about my job.</span>
              </label>
              {err && <p role="alert" style={{ color: "#b4232c", fontSize: 14, margin: "12px 0 0" }}>{err}</p>}
              <button type="submit" disabled={busy} className="rt-btn rt-btn-solid" style={{ marginTop: 16, width: "100%" }}>{busy ? "Sending…" : "Send enquiry"}</button>
            </form>
          )}
        </div>
      </dialog>
    </>
  );
}
