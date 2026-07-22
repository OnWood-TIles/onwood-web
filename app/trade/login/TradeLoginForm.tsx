"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// Trade sign-in form. Posts to /api/trade/login (which sets the httpOnly session
// cookie) then hard-navigates into the portal. Also handles "forgot password",
// which posts to /api/trade/forgot and always shows the same neutral confirmation.
const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "13px 16px",
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,0.16)",
  background: "rgba(255,255,255,0.06)",
  color: "#fff",
  fontSize: 15,
};

export default function TradeLoginForm() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "forgot">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  async function submitLogin(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      const res = await fetch("/api/trade/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const json = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setError(json.error || "Sign in failed, please try again.");
        setBusy(false);
        return;
      }
      // Session cookie is set; go to the dashboard. Refresh so the gated layout
      // re-runs server-side with the new cookie.
      router.replace("/trade");
      router.refresh();
    } catch {
      setError("Could not reach the server, please try again.");
      setBusy(false);
    }
  }

  async function submitForgot(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      await fetch("/api/trade/forgot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
    } catch {
      // Even on a network error we show the same neutral message.
    }
    setNotice("If that email is registered, we have sent a link to reset your password.");
    setBusy(false);
  }

  if (mode === "forgot") {
    return (
      <form onSubmit={submitForgot} style={{ textAlign: "left" }}>
        <label style={{ display: "block", fontSize: 12, fontWeight: 700, marginBottom: 6, color: "rgba(255,255,255,0.7)" }}>
          Email
        </label>
        <input
          type="email"
          required
          autoFocus
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@business.com.au"
          style={inputStyle}
        />
        {notice && (
          <p role="status" style={{ color: "#8fd6b0", fontSize: 13, margin: "12px 0 0" }}>
            {notice}
          </p>
        )}
        <button type="submit" disabled={busy} style={{ ...buttonStyle, marginTop: 16, opacity: busy ? 0.6 : 1 }}>
          {busy ? "Sending..." : "Send reset link"}
        </button>
        <button
          type="button"
          onClick={() => {
            setMode("login");
            setNotice(null);
            setError(null);
          }}
          style={linkButtonStyle}
        >
          Back to sign in
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={submitLogin} style={{ textAlign: "left" }}>
      <label style={{ display: "block", fontSize: 12, fontWeight: 700, marginBottom: 6, color: "rgba(255,255,255,0.7)" }}>
        Email
      </label>
      <input
        type="email"
        required
        autoFocus
        autoComplete="username"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@business.com.au"
        style={{ ...inputStyle, marginBottom: 14 }}
      />
      <label style={{ display: "block", fontSize: 12, fontWeight: 700, marginBottom: 6, color: "rgba(255,255,255,0.7)" }}>
        Password
      </label>
      <div style={{ position: "relative" }}>
        <input
          type={show ? "text" : "password"}
          required
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Your password"
          style={{ ...inputStyle, paddingRight: 52 }}
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

      {error && (
        <p role="alert" style={{ color: "#ff9b7a", fontSize: 13, margin: "12px 0 0" }}>
          {error}
        </p>
      )}

      <button type="submit" disabled={busy} style={{ ...buttonStyle, marginTop: 18, opacity: busy ? 0.6 : 1 }}>
        {busy ? "Signing in..." : "Sign in"}
      </button>
      <button type="button" onClick={() => { setMode("forgot"); setError(null); }} style={linkButtonStyle}>
        Forgot your password?
      </button>
    </form>
  );
}

const buttonStyle: React.CSSProperties = {
  width: "100%",
  padding: "13px 16px",
  borderRadius: 12,
  border: "none",
  background: "var(--accent)",
  color: "#fff",
  fontSize: 15,
  fontWeight: 700,
  cursor: "pointer",
};

const linkButtonStyle: React.CSSProperties = {
  display: "block",
  width: "100%",
  marginTop: 12,
  background: "none",
  border: "none",
  color: "rgba(255,255,255,0.6)",
  fontSize: 13,
  fontWeight: 600,
  cursor: "pointer",
  textAlign: "center",
};
