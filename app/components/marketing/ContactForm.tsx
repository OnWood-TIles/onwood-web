"use client";

import { useState } from "react";

// Generic "send us a message" form. POSTs {name,email,phone,message} to the
// existing /api/enquiry endpoint (emails the shop inbox + adds to OnConnect).
// Shows an inline success card on send, a friendly error otherwise.

const field: React.CSSProperties = {
  width: "100%",
  padding: "14px 16px",
  borderRadius: 12,
  border: "1.5px solid var(--line)",
  background: "var(--surface)",
  fontFamily: "inherit",
  fontSize: 14.5,
  color: "var(--ink)",
  outline: "none",
  transition: "border-color .2s ease, box-shadow .2s ease",
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
  display: "block",
  fontSize: 12,
  fontWeight: 800,
  letterSpacing: ".06em",
  textTransform: "uppercase",
  color: "var(--muted)",
  margin: "0 0 7px",
};

export default function ContactForm() {
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError(null);
    const fd = new FormData(e.currentTarget);
    const name = String(fd.get("name") || "").trim();
    const email = String(fd.get("email") || "").trim();
    const phone = String(fd.get("phone") || "").trim();
    const message = String(fd.get("message") || "").trim();
    try {
      const res = await fetch("/api/enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, message }),
      });
      const json = await res.json();
      if (res.ok && json.ok) setDone(true);
      else setError(json.error || "Sorry, that did not send. Please email sales@onwoodtiles.com.au.");
    } catch {
      setError("Could not reach the server. Please try again, or email sales@onwoodtiles.com.au.");
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 22, padding: "44px 32px", textAlign: "center", boxShadow: "0 20px 50px -30px rgba(32,48,58,.32)" }}>
        <div style={{ width: 62, height: 62, margin: "0 auto 18px", borderRadius: "50%", background: "color-mix(in srgb, var(--sea) 14%, var(--surface))", display: "grid", placeItems: "center" }}>
          <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="var(--sea)" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12l5 5L20 6" /></svg>
        </div>
        <h3 style={{ fontFamily: "var(--font-archivo)", fontWeight: 800, fontSize: 24, letterSpacing: "-.01em", margin: "0 0 8px" }}>Message on its way.</h3>
        <p style={{ color: "var(--muted)", fontSize: 15, lineHeight: 1.6, margin: 0, maxWidth: 360, marginInline: "auto" }}>
          Thanks for reaching out. We&rsquo;ll get back to you shortly. In a hurry? Give the showroom a call or pop in and see us.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} aria-label="Send us a message" style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 22, padding: "30px 28px", boxShadow: "0 20px 50px -30px rgba(32,48,58,.3)" }}>
      <h2 style={{ fontFamily: "var(--font-archivo)", fontWeight: 800, fontSize: 24, letterSpacing: "-.01em", margin: "0 0 6px" }}>Send us a message</h2>
      <p style={{ color: "var(--muted)", fontSize: 14.5, lineHeight: 1.6, margin: "0 0 22px" }}>
        Tell us what you&rsquo;re after and we&rsquo;ll point you in the right direction.
      </p>

      <div className="cf-row">
        <div>
          <label htmlFor="cf-name" style={label}>Name</label>
          <input id="cf-name" name="name" required placeholder="Your name" autoComplete="name" onFocus={focusOn} onBlur={focusOff} style={field} />
        </div>
        <div>
          <label htmlFor="cf-phone" style={label}>Phone <span style={{ fontWeight: 500, textTransform: "none", letterSpacing: 0 }}>(optional)</span></label>
          <input id="cf-phone" name="phone" placeholder="Best number to reach you" autoComplete="tel" inputMode="tel" onFocus={focusOn} onBlur={focusOff} style={field} />
        </div>
      </div>

      <div style={{ marginTop: 16 }}>
        <label htmlFor="cf-email" style={label}>Email</label>
        <input id="cf-email" name="email" required type="email" placeholder="you@email.com" autoComplete="email" onFocus={focusOn} onBlur={focusOff} style={field} />
      </div>

      <div style={{ marginTop: 16 }}>
        <label htmlFor="cf-message" style={label}>Message</label>
        <textarea id="cf-message" name="message" required rows={5} placeholder="What can we help you with? Tiles, tapware, a room you're planning, a question about stock..." onFocus={focusOn} onBlur={focusOff} style={{ ...field, resize: "vertical", lineHeight: 1.5 }} />
      </div>

      {error && (
        <p role="alert" style={{ margin: "16px 0 0", fontSize: 13.5, lineHeight: 1.5, color: "var(--accent)" }}>{error}</p>
      )}

      <button type="submit" disabled={busy} className="cf-submit" style={{ marginTop: 20, width: "100%", padding: "15px 18px", borderRadius: 999, border: "none", background: "var(--accent)", color: "#fff6ee", fontFamily: "inherit", fontWeight: 800, fontSize: 15.5, cursor: busy ? "default" : "pointer", opacity: busy ? 0.72 : 1, boxShadow: "0 14px 30px -12px rgba(208,106,69,.6)" }}>
        {busy ? "Sending..." : "Send message"}
      </button>

      <style>{`
        .cf-row{display:grid;grid-template-columns:1fr 1fr;gap:16px;}
        @media(max-width:480px){.cf-row{grid-template-columns:1fr;gap:16px;}}
        .cf-submit{transition:transform .2s ease, box-shadow .2s ease, filter .2s ease;}
        .cf-submit:hover:not(:disabled){transform:translateY(-2px);filter:brightness(1.04);box-shadow:0 20px 40px -14px rgba(208,106,69,.7);}
      `}</style>
    </form>
  );
}
