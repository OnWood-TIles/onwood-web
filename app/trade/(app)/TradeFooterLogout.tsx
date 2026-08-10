"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// Footer "log out" link for the trade portal. Mirrors the logout in TradeNav:
// best-effort POST to clear the session cookie server-side, then bounce to the
// login page. Styled as a plain footer link (via the passed-in style) so it sits
// in the Trade Partners column alongside the real <Link>s.
export default function TradeFooterLogout({ style }: { style?: React.CSSProperties }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function logout() {
    setBusy(true);
    try {
      await fetch("/api/trade/logout", { method: "POST" });
    } catch {
      // even if the call fails, the cookie clears on the server side best-effort
    }
    router.replace("/trade/login");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={logout}
      disabled={busy}
      className="owf-link"
      style={{ ...style, background: "none", border: "none", padding: 0, cursor: "pointer", textAlign: "left", fontFamily: "inherit" }}
    >
      {busy ? "Logging out..." : "Log out of Trade Partners"}
    </button>
  );
}
