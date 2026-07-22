import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import TradeLoginForm from "./TradeLoginForm";

export const metadata: Metadata = {
  title: "Trade Partner Login - OnWood Tiles",
  robots: { index: false, follow: false },
};

// Public trade sign-in. Sits OUTSIDE the gated (app) layout so it never triggers
// the tradeMe() redirect. Mirrors the staff login shell (deep glass card) but
// with the trade copy and the OnBase-backed form.
export default function TradeLoginPage() {
  return (
    <main
      style={{
        minHeight: "100dvh",
        display: "grid",
        placeItems: "center",
        background: "var(--deep)",
        color: "#fff",
        padding: "24px",
        fontFamily: "var(--font-manrope), system-ui, sans-serif",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 400,
          background: "rgba(11,20,26,0.62)",
          border: "1px solid rgba(255,255,255,0.12)",
          borderRadius: 20,
          padding: "36px 32px",
          textAlign: "center",
          backdropFilter: "blur(10px)",
        }}
      >
        <Image
          src="/onwood-logo-white.png"
          alt="OnWood Tiles"
          width={124}
          height={45}
          priority
          style={{ margin: "0 auto 22px", height: "auto", width: 124 }}
        />
        <h1
          style={{
            fontFamily: "var(--font-archivo), sans-serif",
            fontSize: 22,
            fontWeight: 800,
            margin: "0 0 6px",
          }}
        >
          Trade Partner login
        </h1>
        <p
          style={{
            fontSize: 14,
            lineHeight: 1.6,
            color: "rgba(255,255,255,0.6)",
            margin: "0 0 24px",
          }}
        >
          Welcome back, partner. Sign in to see your pricing, order stock and track your orders.
        </p>

        <TradeLoginForm />

        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", margin: "20px 0 0", lineHeight: 1.6 }}>
          Want to become a Trade Partner?{" "}
          <Link href="/#contact" style={{ color: "#e79070", fontWeight: 700, textDecoration: "none" }}>
            Talk to us
          </Link>
        </p>
      </div>
    </main>
  );
}
