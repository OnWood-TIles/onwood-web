"use client";

import { useState } from "react";
import Link from "next/link";
import type { CSSProperties } from "react";
import { MAX_SAMPLES, useSamples } from "../SamplesProvider";

export default function SamplesView() {
  const { samples, remove, clear, ready } = useSamples();
  const [stand, setStand] = useState(false);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState<number | null>(null);

  if (!ready) return <p style={{ color: "#8a8577" }}>Loading your samples...</p>;

  if (sent != null) {
    return (
      <div style={emptyBox}>
        <p style={{ fontFamily: "var(--font-archivo)", fontWeight: 800, fontSize: 19, margin: 0 }}>Thanks, your sample request is in</p>
        <p style={{ color: "#5a6067", fontSize: 14.5, margin: "10px auto 18px", maxWidth: 460, lineHeight: 1.55 }}>
          We have received your request for {sent} sample{sent === 1 ? "" : "s"} and will be in contact shortly to discuss it. A copy is on its way to your inbox.
        </p>
        <Link href="/trade/catalogue" style={primaryLink}>Back to the catalogue &rarr;</Link>
      </div>
    );
  }

  if (samples.length === 0) {
    return (
      <div style={emptyBox}>
        <p style={{ fontFamily: "var(--font-archivo)", fontWeight: 800, fontSize: 19, margin: 0 }}>No samples picked yet</p>
        <p style={{ color: "#5a6067", fontSize: 14.5, margin: "10px 0 18px" }}>Use &ldquo;Add sample&rdquo; on any tile in the catalogue, then send your request from here.</p>
        <Link href="/trade/catalogue" style={primaryLink}>Browse the catalogue &rarr;</Link>
      </div>
    );
  }

  async function submit() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/trade/samples", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: samples.map((s) => ({ productId: s.productId, colour: s.colour })),
          stand,
          note: note.trim() || undefined,
        }),
      });
      const json = (await res.json().catch(() => ({}))) as { data?: { count: number }; error?: string };
      if (!res.ok || !json.data) {
        setError(json.error || "We could not send your sample request. Please try again.");
        setBusy(false);
        return;
      }
      clear();
      setSent(json.data.count);
    } catch {
      setError("Could not reach the server, please try again.");
      setBusy(false);
    }
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.6fr) minmax(0, 1fr)", gap: 26, alignItems: "start" }} className="ow-cart-grid">
      <div style={{ background: "#fff", border: "1px solid var(--line)", borderRadius: 18, overflow: "hidden" }}>
        {samples.map((s, i) => (
          <div key={`${s.productId}-${s.colour}`} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 18px", borderTop: i === 0 ? "none" : "1px solid var(--line)" }}>
            <div style={{ width: 56, height: 56, borderRadius: 10, overflow: "hidden", flexShrink: 0, background: "#f3efe6" }}>
              {s.image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={s.image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
              )}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <Link href={s.href} style={{ fontWeight: 800, fontSize: 14.5, color: "inherit", textDecoration: "none" }}>{s.name}</Link>
              <div style={{ color: "#8a8577", fontSize: 13, marginTop: 2 }}>{s.colour}</div>
            </div>
            <span style={{ fontSize: 12.5, fontWeight: 700, color: "#5a6067", whiteSpace: "nowrap" }}>1 sample</span>
            <button type="button" onClick={() => remove(s.productId, s.colour)} aria-label={`Remove ${s.name} ${s.colour}`} style={{ border: "none", background: "none", cursor: "pointer", color: "#a13a2c", fontSize: 18, lineHeight: 1, padding: 6 }}>
              &times;
            </button>
          </div>
        ))}
      </div>

      <div style={{ background: "#fff", border: "1px solid var(--line)", borderRadius: 18, padding: "22px 22px 24px", position: "sticky", top: 92 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <span style={{ fontSize: 14.5, color: "#5a6067", fontWeight: 700 }}>Samples</span>
          <span style={{ fontFamily: "var(--font-archivo)", fontWeight: 800, fontSize: 22 }}>{samples.length}</span>
        </div>
        <p style={{ color: "#8a8577", fontSize: 12.5, margin: "8px 0 0", lineHeight: 1.55 }}>
          Samples are free. Send your request and we will be in contact shortly to discuss it. Up to {MAX_SAMPLES} samples per request.
        </p>

        <label style={{ display: "flex", gap: 10, alignItems: "flex-start", marginTop: 18, fontSize: 14, fontWeight: 700, color: "var(--ink)", cursor: "pointer" }}>
          <input type="checkbox" checked={stand} onChange={(e) => setStand(e.target.checked)} style={{ width: 18, height: 18, marginTop: 1, accentColor: "var(--accent)" }} />
          <span>
            I&rsquo;m interested in a sample stand
            <span style={{ display: "block", fontSize: 12.5, fontWeight: 500, color: "#8a8577", marginTop: 3 }}>We will talk you through the options.</span>
          </span>
        </label>

        <label style={{ display: "block", marginTop: 16, fontSize: 12.5, fontWeight: 700, color: "#5a6067" }}>
          Note (optional)
          <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Anything we should know, e.g. where to send them" rows={3} maxLength={1500} style={field} />
        </label>

        {error && <p role="alert" style={{ color: "#a13a2c", fontSize: 13, margin: "14px 0 0" }}>{error}</p>}

        <button type="button" onClick={submit} disabled={busy} style={{ width: "100%", marginTop: 18, padding: "14px 16px", borderRadius: 12, border: "none", background: "var(--accent)", color: "#fff6ee", fontSize: 15, fontWeight: 800, cursor: "pointer", opacity: busy ? 0.6 : 1 }}>
          {busy ? "Sending..." : "Send sample request"}
        </button>
        <Link href="/trade/catalogue" style={{ display: "block", textAlign: "center", marginTop: 12, color: "#5a6067", fontWeight: 700, fontSize: 13.5, textDecoration: "none" }}>
          Add more samples
        </Link>
      </div>

      <style>{`
        @media (max-width: 820px) {
          .ow-cart-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

const emptyBox: CSSProperties = {
  textAlign: "center",
  padding: "56px 24px",
  borderRadius: 18,
  border: "1px dashed var(--line)",
  background: "color-mix(in oklab, var(--bg) 60%, #fff)",
};

const primaryLink: CSSProperties = { textDecoration: "none", background: "var(--accent)", color: "#fff6ee", fontWeight: 700, fontSize: 15, padding: "12px 22px", borderRadius: 99 };

const field: CSSProperties = {
  width: "100%",
  marginTop: 6,
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid var(--line)",
  fontSize: 14,
  fontWeight: 500,
  color: "var(--ink)",
  background: "#fff",
  fontFamily: "inherit",
  resize: "vertical",
};
