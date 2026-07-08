import type { Metadata } from "next";
import Image from "next/image";
import StaffLoginForm from "./StaffLoginForm";

export const metadata: Metadata = {
  title: "Staff Preview - OnWood Tiles",
  robots: { index: false, follow: false },
};

// Lightweight construction-preview login. Enters a shared password, which the
// /api/preview-login handler swaps for the proxy-gate cookie. This is NOT the
// eventual Payload CMS admin - just a gate to view the site while it is built.
export default async function StaffLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const { error, next } = await searchParams;

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
          maxWidth: 380,
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
            fontSize: 20,
            fontWeight: 800,
            margin: "0 0 6px",
          }}
        >
          Site preview
        </h1>
        <p
          style={{
            fontSize: 14,
            lineHeight: 1.6,
            color: "rgba(255,255,255,0.6)",
            margin: "0 0 22px",
          }}
        >
          Staff access to the site under construction.
        </p>

        <StaffLoginForm next={next || "/"} />

        {error ? (
          <p
            role="alert"
            style={{ color: "#ff9b7a", fontSize: 13, margin: "14px 0 0" }}
          >
            Incorrect password, please try again.
          </p>
        ) : null}
      </div>
    </main>
  );
}
