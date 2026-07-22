"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "13px 16px",
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,0.16)",
  background: "rgba(255,255,255,0.06)",
  color: "#fff",
  fontSize: 15,
};

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
  marginTop: 18,
};

export default function SetPasswordForm({ token }: { token: string }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  if (!token) {
    return (
      <p role="alert" style={{ color: "#ff9b7a", fontSize: 14, lineHeight: 1.6 }}>
        This reset link is missing its token. Please request a new one from the{" "}
        <Link href="/trade/login" style={{ color: "#e79070", fontWeight: 700 }}>
          sign in page
        </Link>
        .
      </p>
    );
  }

  if (done) {
    return (
      <div>
        <p style={{ color: "#8fd6b0", fontSize: 14.5, lineHeight: 1.6, margin: "0 0 18px" }}>
          Your password has been set. You can now sign in.
        </p>
        <Link
          href="/trade/login"
          style={{ ...buttonStyle, display: "block", textDecoration: "none", textAlign: "center", marginTop: 0 }}
        >
          Go to sign in
        </Link>
      </div>
    );
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError("Please choose a password of at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Those passwords do not match.");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/trade/set-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resetToken: token, password }),
      });
      const json = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setError(json.error || "This reset link is invalid or has expired.");
        setBusy(false);
        return;
      }
      setDone(true);
      // Also route them along in case they miss the button.
      setTimeout(() => router.replace("/trade/login"), 2500);
    } catch {
      setError("Could not reach the server, please try again.");
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} style={{ textAlign: "left" }}>
      <label style={{ display: "block", fontSize: 12, fontWeight: 700, marginBottom: 6, color: "rgba(255,255,255,0.7)" }}>
        New password
      </label>
      <input
        type="password"
        required
        autoFocus
        autoComplete="new-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="At least 8 characters"
        style={{ ...inputStyle, marginBottom: 14 }}
      />
      <label style={{ display: "block", fontSize: 12, fontWeight: 700, marginBottom: 6, color: "rgba(255,255,255,0.7)" }}>
        Confirm password
      </label>
      <input
        type="password"
        required
        autoComplete="new-password"
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
        placeholder="Re-enter your password"
        style={inputStyle}
      />
      {error && (
        <p role="alert" style={{ color: "#ff9b7a", fontSize: 13, margin: "12px 0 0" }}>
          {error}
        </p>
      )}
      <button type="submit" disabled={busy} style={{ ...buttonStyle, opacity: busy ? 0.6 : 1 }}>
        {busy ? "Saving..." : "Set password"}
      </button>
    </form>
  );
}
