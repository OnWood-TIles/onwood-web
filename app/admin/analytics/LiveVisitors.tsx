"use client";
import { useEffect, useState } from "react";

// Live "visitors right now" card for the staff analytics dashboard. Polls the
// staff-gated /api/admin/presence every 10s (and on tab re-focus). Independent of
// Vercel Web Analytics / VERCEL_TOKEN - it reads OnBase's live presence snapshot,
// so it works even before the historical dashboard is configured.

type Now = { active: number; pages: { path: string; count: number }[] };

const prettyPath = (p: string) => {
  if (!p || p === "/") return "Home";
  const clean = p.split("?")[0].replace(/\/$/, "");
  return clean || "Home";
};

export default function LiveVisitors() {
  const [now, setNow] = useState<Now | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        const r = await fetch("/api/admin/presence", { cache: "no-store" });
        if (!r.ok) throw new Error(String(r.status));
        const j = (await r.json()) as Now;
        if (alive) {
          setNow({ active: Number(j.active) || 0, pages: Array.isArray(j.pages) ? j.pages : [] });
          setFailed(false);
        }
      } catch {
        if (alive) setFailed(true);
      }
    };
    load();
    const timer = setInterval(load, 10_000);
    const onVisible = () => {
      if (document.visibilityState === "visible") load();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      alive = false;
      clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  const count = now?.active ?? 0;
  const loading = now === null && !failed;

  return (
    <section
      style={{
        background: "#fff",
        border: "1px solid var(--line)",
        borderRadius: 16,
        padding: "20px 22px",
        marginBottom: 22,
        display: "flex",
        gap: 24,
        alignItems: "center",
        flexWrap: "wrap",
      }}
    >
      <style>{`@keyframes owpulse{0%{transform:scale(1);opacity:.7}70%{transform:scale(2.4);opacity:0}100%{opacity:0}}`}</style>

      <div style={{ display: "flex", alignItems: "center", gap: 14, minWidth: 220 }}>
        {/* pulsing live dot (grey when nobody's on / errored) */}
        <span style={{ position: "relative", width: 12, height: 12, flexShrink: 0 }}>
          {count > 0 && !failed && (
            <span
              style={{
                position: "absolute",
                inset: 0,
                borderRadius: "50%",
                background: "#22c55e",
                animation: "owpulse 1.8s ease-out infinite",
              }}
            />
          )}
          <span
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: "50%",
              background: count > 0 && !failed ? "#22c55e" : "#c7c2b8",
            }}
          />
        </span>
        <div>
          <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: ".08em", textTransform: "uppercase", color: "#8a8577" }}>
            On the site now
          </div>
          <div style={{ fontFamily: "var(--font-archivo)", fontWeight: 800, fontSize: 40, letterSpacing: "-.02em", lineHeight: 1.05, marginTop: 2 }}>
            {failed ? "—" : loading ? "…" : count}
          </div>
        </div>
      </div>

      {/* what the active visitors are viewing */}
      <div style={{ flex: 1, minWidth: 200 }}>
        {failed ? (
          <p style={{ color: "#8a8577", fontSize: 13.5, margin: 0 }}>Live count unavailable just now — it&apos;ll reconnect automatically.</p>
        ) : count === 0 ? (
          <p style={{ color: "#8a8577", fontSize: 13.5, margin: 0 }}>
            No visitors on the site at this moment. This updates automatically every few seconds.
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: ".06em", textTransform: "uppercase", color: "#8a8577" }}>
              Currently viewing
            </div>
            {(now?.pages ?? []).map((p) => (
              <div key={p.path} style={{ display: "flex", justifyContent: "space-between", gap: 12, fontSize: 13.5 }}>
                <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontWeight: 600 }}>{prettyPath(p.path)}</span>
                <span style={{ color: "#8a8577", fontWeight: 700, whiteSpace: "nowrap" }}>{p.count}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
