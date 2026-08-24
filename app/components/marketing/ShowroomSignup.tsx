"use client";

import { useState } from "react";
import MarketingConsent, { MARKETING_CONSENT_TEXT } from "./MarketingConsent";

// Showroom interest + trade-partner early-access capture. POSTs to /api/showroom
// (adds the person to OnConnect, tagged, + emails the shop). Same consent rules as
// the other forms. Inline success card on send.

const field: React.CSSProperties = {
  width: "100%", padding: "14px 16px", borderRadius: 12, border: "1.5px solid var(--line)",
  background: "var(--surface)", fontFamily: "inherit", fontSize: 14.5, color: "var(--ink)",
  outline: "none", transition: "border-color .2s ease, box-shadow .2s ease",
};
function focusOn(e: React.FocusEvent<HTMLElement>) {
  e.currentTarget.style.borderColor = "var(--accent)";
  e.currentTarget.style.boxShadow = "0 0 0 4px color-mix(in srgb, var(--accent) 14%, transparent)";
}
function focusOff(e: React.FocusEvent<HTMLElement>) {
  e.currentTarget.style.borderColor = "var(--line)";
  e.currentTarget.style.boxShadow = "none";
}
const label: React.CSSProperties = {
  display: "block", fontSize: 12, fontWeight: 800, letterSpacing: ".06em",
  textTransform: "uppercase", color: "var(--muted)", margin: "0 0 7px",
};

export default function ShowroomSignup() {
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [sentEmail, setSentEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [consent, setConsent] = useState(false);
  const [trade, setTrade] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (busy) return;
    setBusy(true); setError(null);
    const fd = new FormData(e.currentTarget);
    const payload = {
      name: String(fd.get("name") || "").trim(),
      email: String(fd.get("email") || "").trim(),
      phone: String(fd.get("phone") || "").trim(),
      businessName: String(fd.get("businessName") || "").trim(),
      trade,
      company: String(fd.get("company") || ""), // honeypot
      marketingConsent: consent,
      consentText: MARKETING_CONSENT_TEXT,
    };
    try {
      const res = await fetch("/api/showroom", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (res.ok && json.ok) { setSentEmail(payload.email); setDone(true); }
      else setError(json.error || "Sorry - that didn't send. Please email sales@onwoodtiles.com.au and we'll add you straight away.");
    } catch {
      setError("We couldn't reach the server just now. Please email sales@onwoodtiles.com.au - we don't want to miss you.");
    } finally { setBusy(false); }
  }

  if (done) {
    return (
      <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 22, padding: "44px 32px", textAlign: "center", boxShadow: "0 20px 50px -30px rgba(32,48,58,.32)" }}>
        <div style={{ width: 62, height: 62, margin: "0 auto 18px", borderRadius: "50%", background: "color-mix(in srgb, var(--sea) 14%, var(--surface))", display: "grid", placeItems: "center" }}>
          <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="var(--sea)" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12l5 5L20 6" /></svg>
        </div>
        <h3 style={{ fontFamily: "var(--font-archivo)", fontWeight: 800, fontSize: 24, letterSpacing: "-.01em", margin: "0 0 8px" }}>You&rsquo;re on the list.</h3>
        <p style={{ color: "var(--muted)", fontSize: 15, lineHeight: 1.6, margin: 0, maxWidth: 400, marginInline: "auto" }}>
          Thanks{trade ? " — we&rsquo;ll be in touch about early Trade Partner access" : ""}. We&rsquo;ll email{" "}
          <strong style={{ color: "var(--ink)", fontWeight: 700, wordBreak: "break-all" }}>{sentEmail}</strong>{" "}
          the moment the showroom doors open.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} aria-label="Register your interest in the showroom" style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 22, padding: "30px 28px", boxShadow: "0 20px 50px -30px rgba(32,48,58,.3)" }}>
      <h2 style={{ fontFamily: "var(--font-archivo)", fontWeight: 800, fontSize: 24, letterSpacing: "-.01em", margin: "0 0 6px" }}>Be first through the doors</h2>
      <p style={{ color: "var(--muted)", fontSize: 14.5, lineHeight: 1.6, margin: "0 0 22px" }}>
        Register your interest and we&rsquo;ll let you know the moment our Sunshine Coast showroom opens.
      </p>

      <div className="sf-row">
        <div>
          <label htmlFor="sf-name" style={label}>Name</label>
          <input id="sf-name" name="name" required placeholder="Your name" autoComplete="name" onFocus={focusOn} onBlur={focusOff} style={field} />
        </div>
        <div>
          <label htmlFor="sf-phone" style={label}>Phone <span style={{ fontWeight: 500, textTransform: "none", letterSpacing: 0 }}>(optional)</span></label>
          <input id="sf-phone" name="phone" placeholder="Best number to reach you" autoComplete="tel" inputMode="tel" onFocus={focusOn} onBlur={focusOff} style={field} />
        </div>
      </div>

      {/* Honeypot */}
      <div style={{ position: "absolute", left: "-9999px", width: 1, height: 1, overflow: "hidden" }} aria-hidden="true">
        <label htmlFor="sf-company">Company</label>
        <input id="sf-company" name="company" type="text" tabIndex={-1} autoComplete="off" aria-hidden="true" />
      </div>

      <div style={{ marginTop: 16 }}>
        <label htmlFor="sf-email" style={label}>Email</label>
        <input id="sf-email" name="email" required type="email" placeholder="you@email.com" autoComplete="email" onFocus={focusOn} onBlur={focusOff} style={field} />
      </div>

      <label htmlFor="sf-trade" style={{ display: "flex", alignItems: "flex-start", gap: 10, marginTop: 18, cursor: "pointer" }}>
        <input id="sf-trade" type="checkbox" checked={trade} onChange={(e) => setTrade(e.target.checked)} style={{ marginTop: 3, width: 17, height: 17, accentColor: "var(--accent)", flex: "none" }} />
        <span style={{ fontSize: 13.5, lineHeight: 1.5, color: "var(--ink)" }}>
          I&rsquo;m a builder, designer or tiler and want <strong>early access to become a Trade Partner</strong> (trade pricing + first pick).
        </span>
      </label>

      {trade && (
        <div style={{ marginTop: 14 }}>
          <label htmlFor="sf-business" style={label}>Business name</label>
          <input id="sf-business" name="businessName" placeholder="Your business" autoComplete="organization" onFocus={focusOn} onBlur={focusOff} style={field} />
        </div>
      )}

      {error && <p role="alert" style={{ margin: "16px 0 0", fontSize: 13.5, lineHeight: 1.5, color: "var(--accent)" }}>{error}</p>}

      <MarketingConsent checked={consent} onChange={setConsent} style={{ marginTop: 18 }} />

      <button type="submit" disabled={busy} className="sf-submit" style={{ marginTop: 14, width: "100%", padding: "15px 18px", borderRadius: 999, border: "none", background: "var(--accent)", color: "#fff6ee", fontFamily: "inherit", fontWeight: 800, fontSize: 15.5, cursor: busy ? "default" : "pointer", opacity: busy ? 0.72 : 1, boxShadow: "0 14px 30px -12px rgba(208,106,69,.6)" }}>
        {busy ? "Sending..." : trade ? "Register + request trade access" : "Notify me when you open"}
      </button>

      <style>{`
        .sf-row{display:grid;grid-template-columns:1fr 1fr;gap:16px;}
        @media(max-width:480px){.sf-row{grid-template-columns:1fr;gap:16px;}}
        .sf-submit{transition:transform .2s ease, box-shadow .2s ease, filter .2s ease;}
        .sf-submit:hover:not(:disabled){transform:translateY(-2px);filter:brightness(1.04);box-shadow:0 20px 40px -14px rgba(208,106,69,.7);}
      `}</style>
    </form>
  );
}
