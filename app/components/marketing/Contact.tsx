"use client";

// Contact section: a two-column layout with the shop's real details on the left
// (showroom address, visiting hours, email) and a "Book my free measure & quote"
// enquiry form on the right. Transcribed faithfully from
// .refwork/tiles-sections/11-section-contact.html; copy/data from lib/content.ts
// (CONTACT + SHOP). The form POSTs to the existing /api/enquiry endpoint (which
// expects {name,email,phone,message}) - suburb + interest + detail are folded
// into the message so nothing is lost. Submit button carries the magnetic lean.
import { useEffect, useRef, useState } from "react";
import { CONTACT, SHOP } from "../../../lib/content";
import styles from "./Contact.module.css";

type Status = { kind: "ok" | "error"; text: string } | null;

const field: React.CSSProperties = {
  padding: "13px 15px",
  borderRadius: 11,
  border: "1.5px solid var(--line)",
  background: "var(--surface)",
  fontFamily: "inherit",
  fontSize: 14,
  color: "var(--ink)",
  outline: "none",
};

const rowStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 12,
  fontSize: 15,
  color: "var(--ink)",
};

function chip(bg: string, color: string): React.CSSProperties {
  return {
    width: 38,
    height: 38,
    borderRadius: 10,
    background: bg,
    display: "grid",
    placeItems: "center",
    color,
    fontWeight: 800,
    flexShrink: 0,
  };
}

// Give the field a visible focus ring (reference sets outline:none) without
// losing accessibility - the border warms to the accent while focused.
function onFocusField(e: React.FocusEvent<HTMLElement>) {
  e.currentTarget.style.borderColor = "var(--accent)";
}
function onBlurField(e: React.FocusEvent<HTMLElement>) {
  e.currentTarget.style.borderColor = "var(--line)";
}

export default function Contact() {
  const [status, setStatus] = useState<Status>(null);
  const [busy, setBusy] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);

  // Magnetic lean on the submit button (data-magnetic in the reference).
  useEffect(() => {
    const el = btnRef.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const move = (e: PointerEvent) => {
      const b = el.getBoundingClientRect();
      el.style.transition = "transform .1s ease-out";
      el.style.transform = `translate(${
        (e.clientX - (b.left + b.width / 2)) * 0.18
      }px, ${(e.clientY - (b.top + b.height / 2)) * 0.28}px)`;
    };
    const leave = () => {
      el.style.transition = "transform .4s cubic-bezier(.2,.9,.3,1.4)";
      el.style.transform = "translate(0,0)";
    };
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", leave);
    return () => {
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", leave);
    };
  }, []);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setStatus(null);

    const form = e.currentTarget;
    const fd = new FormData(form);
    const name = String(fd.get("name") || "").trim();
    const email = String(fd.get("email") || "").trim();
    const suburb = String(fd.get("suburb") || "").trim();
    const interest = String(fd.get("interest") || "").trim();
    const detail = String(fd.get("detail") || "").trim();

    // Fold the extra fields into the message the endpoint stores/emails.
    const lines: string[] = [];
    if (interest) lines.push(`Interested in: ${interest}`);
    if (suburb) lines.push(`Suburb: ${suburb}`);
    if (detail) lines.push("", detail);
    const message = lines.join("\n");

    try {
      const res = await fetch("/api/enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone: "", message }),
      });
      const json = await res.json();
      if (res.ok && json.ok) {
        setStatus({ kind: "ok", text: "Thanks - we will be in touch soon." });
        form.reset();
      } else {
        setStatus({
          kind: "error",
          text:
            json.error ||
            "Sorry, that did not send. Please email sales@onwoodtiles.com.au.",
        });
      }
    } catch {
      setStatus({
        kind: "error",
        text: "Could not reach the server, please try again or email us.",
      });
    } finally {
      setBusy(false);
    }
  }

  const address = `Showroom · ${SHOP.street}, ${SHOP.suburb} ${SHOP.state} ${SHOP.postcode}`;

  return (
    <section
      id="contact"
      style={{
        padding: "100px 40px",
        background: "var(--surface)",
        borderTop: "1px solid var(--line)",
      }}
    >
      <div className={styles.wrap}>
        {/* Left: heading + real shop details */}
        <div>
          <h2
            style={{
              fontFamily: "var(--font-archivo)",
              fontWeight: 800,
              fontSize: "clamp(32px,4.4vw,56px)",
              letterSpacing: "-.02em",
              margin: "0 0 16px",
              lineHeight: 1.02,
              color: "var(--ink)",
            }}
          >
            {CONTACT.title}
          </h2>
          <p
            style={{
              color: "var(--muted)",
              fontSize: 16,
              lineHeight: 1.6,
              margin: "0 0 26px",
            }}
          >
            {CONTACT.sub}
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={rowStyle}>
              <span style={chip("var(--accent)", "#1a1411")} aria-hidden>
                ◎
              </span>
              {address}
            </div>
            <div style={rowStyle}>
              <span style={chip("var(--accent2)", "#fff")} aria-hidden>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round">
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 7v5l3 2" />
                </svg>
              </span>
              Visit us {SHOP.hours}
            </div>
            <div style={rowStyle}>
              <span style={chip("var(--ink)", "var(--surface)")} aria-hidden>
                @
              </span>
              <a
                href={`mailto:${SHOP.email}`}
                style={{ color: "var(--ink)", textDecoration: "none" }}
              >
                {SHOP.email}
              </a>
            </div>
          </div>
        </div>

        {/* Right: enquiry form -> /api/enquiry */}
        <form
          onSubmit={onSubmit}
          aria-label="Book a free measure and quote"
          style={{
            background: "var(--bg)",
            border: "1px solid var(--line)",
            borderRadius: 20,
            padding: 26,
            display: "flex",
            flexDirection: "column",
            gap: 14,
          }}
        >
          <div className={styles.nameRow}>
            <input
              name="name"
              required
              placeholder="Name"
              aria-label="Name"
              autoComplete="name"
              onFocus={onFocusField}
              onBlur={onBlurField}
              style={field}
            />
            <input
              name="suburb"
              required
              placeholder="Suburb"
              aria-label="Suburb"
              autoComplete="address-level2"
              onFocus={onFocusField}
              onBlur={onBlurField}
              style={field}
            />
          </div>
          <input
            name="email"
            required
            type="email"
            placeholder="Email"
            aria-label="Email"
            autoComplete="email"
            onFocus={onFocusField}
            onBlur={onBlurField}
            style={field}
          />
          <select
            name="interest"
            aria-label="What you are interested in"
            defaultValue={CONTACT.interests[0]}
            onFocus={onFocusField}
            onBlur={onBlurField}
            style={field}
          >
            {CONTACT.interests.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
          <textarea
            name="detail"
            rows={3}
            placeholder="Tell us about the space"
            aria-label="Tell us about the space"
            onFocus={onFocusField}
            onBlur={onBlurField}
            style={{ ...field, resize: "vertical" }}
          />
          <button
            ref={btnRef}
            type="submit"
            disabled={busy}
            style={{
              padding: 15,
              borderRadius: 100,
              border: "none",
              background: "var(--ink)",
              color: "var(--surface)",
              fontWeight: 800,
              fontSize: 15,
              cursor: busy ? "default" : "pointer",
              fontFamily: "inherit",
              width: "100%",
              opacity: busy ? 0.72 : 1,
              willChange: "transform",
            }}
          >
            {busy ? "Sending..." : "Book my free measure & quote"}
          </button>
          {status ? (
            <p
              role="status"
              style={{
                margin: "2px 0 0",
                fontSize: 13.5,
                lineHeight: 1.5,
                color: status.kind === "error" ? "var(--accent)" : "var(--sea)",
              }}
            >
              {status.text}
            </p>
          ) : null}
        </form>
      </div>
    </section>
  );
}
