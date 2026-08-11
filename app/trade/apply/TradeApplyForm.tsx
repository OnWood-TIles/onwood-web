"use client";

import { useState } from "react";
import Link from "next/link";
import MarketingConsent, { MARKETING_CONSENT_TEXT } from "../../components/marketing/MarketingConsent";

const field: React.CSSProperties = { width: "100%", padding: "12px 14px", borderRadius: 11, border: "1px solid var(--line)", background: "#fff", fontSize: 15, fontWeight: 600, color: "var(--ink)", fontFamily: "inherit" };
const label: React.CSSProperties = { display: "block", fontSize: 12, fontWeight: 800, letterSpacing: ".06em", textTransform: "uppercase", color: "var(--muted)", margin: "0 0 7px" };
const TRADES = ["Builder", "Tiler", "Designer or Architect", "Developer", "Retailer or Reseller", "Landscaper", "Other"];

export default function TradeApplyForm() {
  const [name, setName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [abn, setAbn] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [tradeType, setTradeType] = useState("");
  const [message, setMessage] = useState("");
  const [company, setCompany] = useState(""); // honeypot — hidden from humans; bots fill it
  const [consent, setConsent] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    if (!name.trim() || !businessName.trim() || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      setErr("Please add your name, business name and a valid email."); return;
    }
    setSending(true);
    try {
      const res = await fetch("/api/trade/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, businessName, abn, email, phone, tradeType, message, company, marketingConsent: consent, consentText: MARKETING_CONSENT_TEXT }),
      });
      if (!res.ok) throw new Error();
      setSent(true);
    } catch { setErr("Something went wrong. Please try again, or email sales@onwoodtiles.com.au."); }
    finally { setSending(false); }
  }

  if (sent) {
    return (
      <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 20, padding: "40px 30px", textAlign: "center" }}>
        <div style={{ width: 58, height: 58, margin: "0 auto 16px", borderRadius: "50%", background: "color-mix(in srgb, var(--sea) 14%, var(--surface))", display: "grid", placeItems: "center" }}>
          <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="var(--sea)" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12l5 5L20 6" /></svg>
        </div>
        <h2 style={{ fontFamily: "var(--font-archivo)", fontWeight: 800, fontSize: 24, margin: "0 0 8px" }}>Application received.</h2>
        <p style={{ color: "var(--muted)", fontSize: 15.5, lineHeight: 1.6, maxWidth: 380, margin: "0 auto 18px" }}>Thanks - we&rsquo;ll be in touch shortly to get your Trade Partner account set up. Check your inbox for a confirmation.</p>
        <Link href="/shop" style={{ background: "var(--accent)", color: "#fff", fontWeight: 800, textDecoration: "none", padding: "12px 24px", borderRadius: 999 }}>Browse the range</Link>
      </div>
    );
  }

  return (
    <form onSubmit={submit} style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 20, padding: "30px 28px" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }} className="ta-row">
        <div><label style={label}>Your name</label><input value={name} onChange={(e) => setName(e.target.value)} required placeholder="First and last name" style={field} /></div>
        <div><label style={label}>Business name</label><input value={businessName} onChange={(e) => setBusinessName(e.target.value)} required placeholder="Trading name" style={field} /></div>
        <div><label style={label}>ABN <span style={{ textTransform: "none", fontWeight: 500 }}>(optional)</span></label><input value={abn} onChange={(e) => setAbn(e.target.value)} inputMode="numeric" placeholder="ABN" style={field} /></div>
        <div><label style={label}>Trade</label>
          <select value={tradeType} onChange={(e) => setTradeType(e.target.value)} style={{ ...field, cursor: "pointer" }}>
            <option value="">Select…</option>
            {TRADES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div><label style={label}>Email</label><input value={email} onChange={(e) => setEmail(e.target.value)} required type="email" placeholder="you@business.com.au" style={field} /></div>
        <div><label style={label}>Phone <span style={{ textTransform: "none", fontWeight: 500 }}>(optional)</span></label><input value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" placeholder="Best contact number" style={field} /></div>
      </div>
      <div style={{ marginTop: 16 }}>
        <label style={label}>Anything else? <span style={{ textTransform: "none", fontWeight: 500 }}>(optional)</span></label>
        <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={4} placeholder="What you do, the kind of volume you work with, or anything we should know." style={{ ...field, resize: "vertical", lineHeight: 1.5 }} />
      </div>

      {/* Honeypot: hidden from humans + assistive tech + tab order; bots fill it. */}
      <div style={{ position: "absolute", left: "-9999px", width: 1, height: 1, overflow: "hidden" }} aria-hidden="true">
        <label htmlFor="ta-company">Company</label>
        <input id="ta-company" name="company" type="text" value={company} onChange={(e) => setCompany(e.target.value)} tabIndex={-1} autoComplete="off" aria-hidden="true" />
      </div>

      <MarketingConsent checked={consent} onChange={setConsent} />
      {err && <p style={{ color: "#c14338", fontSize: 13.5, fontWeight: 600, margin: "10px 0 0" }}>{err}</p>}
      <button type="submit" disabled={sending} style={{ marginTop: 14, width: "100%", cursor: sending ? "default" : "pointer", background: "var(--accent)", color: "#fff", fontWeight: 800, fontSize: 15.5, border: "none", borderRadius: 999, padding: "14px 20px", fontFamily: "inherit", opacity: sending ? 0.7 : 1 }}>
        {sending ? "Sending…" : "Apply for a trade account"}
      </button>
      <p style={{ fontSize: 12.5, color: "var(--muted)", margin: "12px 0 0", textAlign: "center" }}>
        Already a partner? <Link href="/trade/login" style={{ color: "var(--accent)", fontWeight: 700 }}>Sign in</Link>
      </p>
      <style>{`@media(max-width:520px){.ta-row{grid-template-columns:1fr!important}}`}</style>
    </form>
  );
}
