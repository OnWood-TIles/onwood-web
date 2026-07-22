import type { Metadata } from "next";
import Image from "next/image";
import SetPasswordForm from "./SetPasswordForm";

export const metadata: Metadata = {
  title: "Set your password - OnWood Tiles",
  robots: { index: false, follow: false },
};

// Public "set a new password" page reached from the emailed reset link
// (/trade/set-password?token=...). Reads the token, posts to
// /api/trade/set-password, then sends the user to /trade/login.
export default async function SetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

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
          Set your password
        </h1>
        <p
          style={{
            fontSize: 14,
            lineHeight: 1.6,
            color: "rgba(255,255,255,0.6)",
            margin: "0 0 24px",
          }}
        >
          Choose a password of at least 8 characters to finish setting up your Trade Partner account.
        </p>

        <SetPasswordForm token={token ?? ""} />
      </div>
    </main>
  );
}
