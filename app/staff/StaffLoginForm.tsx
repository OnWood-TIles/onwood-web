"use client";

import { useState } from "react";

// Login form with a show/hide toggle so the $ in the password is visible, and
// autofill disabled so a previously-saved password can't be submitted silently.
export default function StaffLoginForm({ next }: { next: string }) {
  const [show, setShow] = useState(false);

  return (
    <form action="/api/preview-login" method="post" autoComplete="off">
      <input type="hidden" name="next" value={next} />
      <div style={{ position: "relative", marginBottom: 12 }}>
        <input
          type={show ? "text" : "password"}
          name="password"
          required
          autoFocus
          autoComplete="off"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          placeholder="Preview password"
          aria-label="Preview password"
          style={{
            width: "100%",
            padding: "13px 48px 13px 16px",
            borderRadius: 12,
            border: "1px solid rgba(255,255,255,0.16)",
            background: "rgba(255,255,255,0.06)",
            color: "#fff",
            fontSize: 15,
          }}
        />
        <button
          type="button"
          onClick={() => setShow((v) => !v)}
          aria-label={show ? "Hide password" : "Show password"}
          style={{
            position: "absolute",
            right: 8,
            top: "50%",
            transform: "translateY(-50%)",
            background: "none",
            border: "none",
            color: "rgba(255,255,255,0.65)",
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: "0.06em",
            cursor: "pointer",
            padding: "6px 8px",
          }}
        >
          {show ? "HIDE" : "SHOW"}
        </button>
      </div>
      <button
        type="submit"
        style={{
          width: "100%",
          padding: "13px 16px",
          borderRadius: 12,
          border: "none",
          background: "var(--accent)",
          color: "#fff",
          fontSize: 15,
          fontWeight: 700,
          cursor: "pointer",
        }}
      >
        Enter preview
      </button>
    </form>
  );
}
