"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";

// Fires a lightweight "I'm here" heartbeat so staff can see live visitors on
// /admin/analytics. One random id per tab (sessionStorage), a ping on every
// route change and every 15s while the tab is visible. Internal areas are
// skipped so the count reflects real customers, not staff / trade partners.

const SKIP = ["/admin", "/staff", "/trade", "/debug", "/kitchen-sink", "/floor-scores-editor"];

function getSessionId(): string {
  try {
    const k = "ow_presence";
    let v = sessionStorage.getItem(k);
    if (!v) {
      v = crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2) + Date.now().toString(36);
      sessionStorage.setItem(k, v);
    }
    return v;
  } catch {
    return "anon";
  }
}

export default function PresenceBeacon() {
  const pathname = usePathname();

  useEffect(() => {
    if (SKIP.some((p) => pathname === p || pathname.startsWith(p + "/"))) return;
    const id = getSessionId();

    const ping = () => {
      if (typeof document !== "undefined" && document.visibilityState !== "visible") return;
      // keepalive lets the last ping survive a navigation/unload.
      fetch("/api/presence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: id, path: pathname }),
        keepalive: true,
      }).catch(() => {});
    };

    ping(); // immediately on mount / route change
    const timer = setInterval(ping, 15_000);
    const onVisible = () => {
      if (document.visibilityState === "visible") ping();
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [pathname]);

  return null;
}
