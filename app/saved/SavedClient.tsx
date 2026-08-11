"use client";

import { useState } from "react";
import Link from "next/link";
import { useWishlist, removeWish, clearWish } from "../../lib/wishlist";
import MarketingConsent, { MARKETING_CONSENT_TEXT } from "../components/marketing/MarketingConsent";

const card: React.CSSProperties = { background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 18, padding: "clamp(20px,3vw,26px)" };
const label: React.CSSProperties = { fontSize: 12.5, fontWeight: 800, letterSpacing: ".04em", textTransform: "uppercase", color: "var(--muted)", display: "block", marginBottom: 8 };
const input: React.CSSProperties = { width: "100%", padding: "11px 14px", borderRadius: 10, border: "1px solid var(--line)", background: "#fff", fontSize: 15, fontWeight: 600, color: "var(--ink)", fontFamily: "inherit" };

export default function SavedClient() {
  const items = useWishlist();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState(""); // honeypot — hidden from humans; bots fill it
  const [consent, setConsent] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) { setErr("Please enter a valid email address."); return; }
    setSending(true);
    try {
      const res = await fetch("/api/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, company, items: items.map((i) => ({ name: i.name, colour: i.colour, href: i.href })), marketingConsent: consent, consentText: MARKETING_CONSENT_TEXT }),
      });
      if (!res.ok) throw new Error();
      setSent(true);
    } catch { setErr("Something went wrong. Please try again, or call the showroom."); }
    finally { setSending(false); }
  }

  if (!items.length && !sent) {
    return (
      <div style={{ maxWidth: 620, margin: "10px auto", textAlign: "center", border: "1px dashed var(--line)", borderRadius: 20, padding: "56px 28px", background: "var(--surface)" }}>
        <svg viewBox="0 0 24 24" width="34" height="34" fill="none" stroke="var(--accent)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ margin: "0 auto 14px", display: "block" }}>
          <path d="M12 20s-7-4.6-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.4-7 10-7 10z" />
        </svg>
        <h2 style={{ fontFamily: "var(--font-archivo)", fontWeight: 800, fontSize: 24, margin: "0 0 10px" }}>Nothing saved yet</h2>
        <p style={{ color: "var(--muted)", fontSize: 16, lineHeight: 1.6, maxWidth: "42ch", margin: "0 auto 22px" }}>Tap the heart on any tile in the gallery or the shop and it will land here, ready to send to yourself or bring to the showroom.</p>
        <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/gallery" style={{ background: "var(--accent)", color: "#fff", fontWeight: 800, textDecoration: "none", padding: "12px 24px", borderRadius: 999 }}>Browse the gallery</Link>
          <Link href="/shop" style={{ border: "1px solid var(--line)", color: "var(--ink)", fontWeight: 800, textDecoration: "none", padding: "12px 24px", borderRadius: 999 }}>Shop tiles</Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1.5fr) minmax(0,0.85fr)", gap: 28, alignItems: "start" }} className="saved-grid">
      {/* Saved items */}
      <div>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 16 }}>
          <span style={{ fontSize: 14, color: "var(--muted)", fontWeight: 700 }}>{items.length} saved</span>
          {items.length > 0 && <button type="button" onClick={clearWish} style={{ appearance: "none", border: "none", background: "none", cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: 700, color: "var(--accent)" }}>Clear all</button>}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(190px,1fr))", gap: 16 }}>
          {items.map((it) => (
            <div key={it.href} style={{ position: "relative", borderRadius: 16, overflow: "hidden", border: "1px solid var(--line)", background: "#fff" }}>
              <Link href={it.href} style={{ display: "block", textDecoration: "none", color: "inherit" }}>
                <div style={{ aspectRatio: "1 / 1", background: "var(--surface)" }}>
                  {it.image ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={it.image} alt={it.name} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} /> : null}
                </div>
                <div style={{ padding: "12px 14px" }}>
                  <div style={{ fontFamily: "var(--font-archivo)", fontWeight: 800, fontSize: 14.5, lineHeight: 1.2, color: "var(--ink)" }}>{it.name}</div>
                  {it.colour ? <div style={{ fontSize: 12.5, fontWeight: 700, color: "var(--accent)", marginTop: 4 }}>{it.colour}</div> : null}
                </div>
              </Link>
              <button type="button" onClick={() => removeWish(it.href)} aria-label={`Remove ${it.name}`} style={{ position: "absolute", top: 8, right: 8, width: 30, height: 30, borderRadius: 999, border: "none", background: "rgba(255,255,255,.92)", color: "#3a444a", cursor: "pointer", display: "grid", placeItems: "center", boxShadow: "0 4px 12px -4px rgba(16,28,30,.4)" }}>
                <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Capture */}
      <div style={{ ...card, position: "sticky", top: 96 }}>
        {sent ? (
          <div>
            <div style={{ fontFamily: "var(--font-archivo)", fontWeight: 800, fontSize: 19, color: "var(--ink)" }}>Sent - check your inbox.</div>
            <p style={{ fontSize: 14.5, lineHeight: 1.6, color: "var(--muted)", margin: "10px 0 16px" }}>Your saved tiles are on their way. Bring them to the showroom and we will help you pull the room together.</p>
            <Link href="/book" style={{ display: "inline-block", background: "var(--accent)", color: "#fff", fontWeight: 800, fontSize: 14, textDecoration: "none", padding: "11px 22px", borderRadius: 999 }}>Book a visit</Link>
          </div>
        ) : (
          <form onSubmit={submit}>
            <span style={label}>Email me my selections</span>
            <p style={{ fontSize: 13.5, lineHeight: 1.55, color: "var(--muted)", margin: "0 0 14px" }}>Keep your saved tiles and let us help you match quantities and finishes. No spam.</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <input aria-label="Your name" placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} style={input} />
              <input aria-label="Email" type="email" required placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} style={input} />
              <input aria-label="Phone (optional)" placeholder="Phone (optional)" value={phone} onChange={(e) => setPhone(e.target.value)} style={input} />
            </div>
            {/* Honeypot: hidden from humans + assistive tech + tab order; bots fill it. */}
            <div style={{ position: "absolute", left: "-9999px", width: 1, height: 1, overflow: "hidden" }} aria-hidden="true">
              <label htmlFor="saved-company">Company</label>
              <input id="saved-company" name="company" type="text" value={company} onChange={(e) => setCompany(e.target.value)} tabIndex={-1} autoComplete="off" aria-hidden="true" />
            </div>
            <MarketingConsent checked={consent} onChange={setConsent} />
            {err && <p style={{ color: "#c14338", fontSize: 13.5, fontWeight: 600, margin: "10px 0 0" }}>{err}</p>}
            <button type="submit" disabled={sending} style={{ marginTop: 14, width: "100%", cursor: sending ? "default" : "pointer", background: "var(--accent)", color: "#fff", fontWeight: 800, fontSize: 15, border: "none", borderRadius: 999, padding: "13px 20px", fontFamily: "inherit", opacity: sending ? 0.7 : 1 }}>
              {sending ? "Sending…" : "Email me my selections"}
            </button>
          </form>
        )}
      </div>

      <style>{`@media(max-width:820px){.saved-grid{grid-template-columns:1fr!important}.saved-grid > div:last-child{position:static!important}}`}</style>
    </div>
  );
}
