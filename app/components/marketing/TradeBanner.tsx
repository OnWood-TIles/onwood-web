import Link from "next/link";

// Homepage prompt for the Trade Partner program. A dark premium band (stands out
// against the cream page) with a compact material peek and a CTA into /trade.
// Matches the marketing design language: Archivo display + Newsreader italic
// accent, terracotta. No em-dashes in customer copy.
export default function TradeBanner() {
  return (
    <section style={{ padding: "40px 24px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", position: "relative", overflow: "hidden", background: "linear-gradient(150deg,#14242e,#0b141a)", borderRadius: 28, color: "#fff" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(680px 300px at 92% -20%, color-mix(in srgb, var(--accent) 32%, transparent), transparent 62%)", pointerEvents: "none" }} />
        <div className="tb-grid" style={{ position: "relative", display: "grid", gridTemplateColumns: "1.25fr 0.75fr", gap: 30, alignItems: "center", padding: "clamp(40px,6vw,58px) clamp(28px,5vw,58px)" }}>
          <div>
            <p style={{ fontSize: 12, fontWeight: 800, letterSpacing: ".2em", textTransform: "uppercase", color: "#e79070" }}>For the trade</p>
            <h2 style={{ fontFamily: "var(--font-archivo)", fontWeight: 900, letterSpacing: "-.02em", fontSize: "clamp(28px,4.2vw,44px)", lineHeight: 1.05, margin: "12px 0 0", maxWidth: "19ch" }}>
              Builder, tiler or designer? Order on{" "}
              <em style={{ fontFamily: "var(--font-newsreader)", fontStyle: "italic", fontWeight: 400, color: "var(--aqua)" }}>trade terms</em>.
            </h2>
            <p style={{ fontSize: 16.5, lineHeight: 1.65, color: "rgba(255,255,255,.7)", margin: "16px 0 0", maxWidth: "48ch" }}>
              Your own trade pricing across the full range, live stock and online ordering, with a local Sunshine Coast team behind every job.
            </p>
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "center", marginTop: 26 }}>
              <Link href="/trade" style={{ background: "var(--accent)", color: "#fff", fontWeight: 800, fontSize: 15.5, textDecoration: "none", padding: "14px 28px", borderRadius: 999 }}>
                Explore Trade Partners
              </Link>
              <Link href="/trade/apply" style={{ color: "#fff", fontWeight: 700, fontSize: 15, textDecoration: "none", opacity: 0.85 }}>
                or apply for an account &rarr;
              </Link>
            </div>
          </div>

          {/* Trade partners at work - the real OnWood project photo, framed. */}
          <div className="tb-art" aria-hidden style={{ position: "relative", justifySelf: "center", width: "100%", maxWidth: 320 }}>
            <div style={{ borderRadius: 20, overflow: "hidden", border: "5px solid #fff", boxShadow: "0 40px 74px -34px rgba(0,0,0,.7)", aspectRatio: "1 / 1" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/trade-partner.webp" alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
            </div>
          </div>
        </div>
      </div>
      {/* On mobile: stack, and KEEP the framed project photo (shown below the copy). */}
      <style>{`@media(max-width:760px){.tb-grid{grid-template-columns:1fr!important}.tb-art{margin:6px auto 0!important;max-width:360px!important}}`}</style>
    </section>
  );
}
