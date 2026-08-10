import type { Metadata } from "next";
import Link from "next/link";
import MarketingNav from "../../components/marketing/MarketingNav";
import MarketingFooter from "../../components/marketing/MarketingFooter";
import TradeLoginForm from "./TradeLoginForm";

export const metadata: Metadata = {
  title: "Trade Partners | OnWood Tiles",
  description:
    "The OnWood Tiles trade program: your own trade pricing, live stock and online ordering for Sunshine Coast builders, tilers, designers and developers. Sign in or apply for an account.",
  robots: { index: false, follow: false },
};

// Editorial accent word (italic serif) - matches the marketing hero + apply page.
const serif = (t: string) => (
  <em style={{ fontFamily: "var(--font-newsreader)", fontStyle: "italic", fontWeight: 400, color: "var(--sea)" }}>{t}</em>
);
const eyebrow: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 800,
  letterSpacing: ".2em",
  textTransform: "uppercase",
  color: "var(--accent)",
};

// The trade program's selling points, shown beside the sign-in card.
const BENEFITS: [string, string][] = [
  ["Your pricing, always visible", "Your own trade tier across the full range, shown the moment you sign in. No waiting on a quote to know your price."],
  ["Order online, anytime", "Browse the whole catalogue and build stock orders from the portal, day or night. It lands straight with our team."],
  ["Live stock, no surprises", "See what is on the floor in real time, so you can commit to your client with confidence."],
  ["Track every order", "Follow each order from request to ready, with your pricing and full order history in one place."],
  ["A local partner", "A Sunshine Coast team who knows tiles and will help you match, quote and get it on site."],
];

const STEPS: [string, string, string][] = [
  ["01", "Apply", "Tell us about your business. We set up your account and your pricing tier."],
  ["02", "Sign in", "Get instant access to trade pricing across the full OnWood range."],
  ["03", "Order anytime", "Build orders online. We confirm stock, price and lead time, then get it on site."],
];

export default function TradeLandingPage() {
  return (
    <div data-theme="terracotta" style={{ background: "var(--bg)", color: "var(--ink)", minHeight: "100vh" }}>
      <MarketingNav />
      <main>
        {/* ── HERO ─────────────────────────────────────────────────── */}
        <section style={{ position: "relative", overflow: "hidden", padding: "clamp(96px,15vw,140px) 24px 40px" }}>
          <div className="tl-hero" style={{ maxWidth: 1160, margin: "0 auto", position: "relative", display: "grid", gridTemplateColumns: "minmax(0,1.08fr) minmax(0,0.92fr)", gap: 48, alignItems: "center" }}>
            <div>
              <p style={eyebrow}>OnWood Trade Partners</p>
              <h1 style={{ fontFamily: "var(--font-archivo)", fontWeight: 900, letterSpacing: "-.03em", fontSize: "clamp(36px,5.6vw,62px)", lineHeight: 1.02, margin: "14px 0 0", maxWidth: "15ch" }}>
                Your trade counter, {serif("always open")}.
              </h1>
              <p style={{ fontSize: 18, lineHeight: 1.7, color: "#3a444a", maxWidth: "52ch", margin: "20px 0 0" }}>
                Trade pricing, live stock and online ordering for Sunshine Coast builders, tilers, designers and developers. Sign in to your account below, or apply in minutes.
              </p>
              <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginTop: 30 }}>
                <a href="#signin" style={{ background: "var(--accent)", color: "#fff", fontWeight: 800, fontSize: 15.5, textDecoration: "none", padding: "14px 28px", borderRadius: 999 }}>
                  Sign in
                </a>
                <Link href="/trade/apply" style={{ background: "var(--surface)", color: "var(--ink)", fontWeight: 800, fontSize: 15.5, textDecoration: "none", padding: "14px 26px", borderRadius: 999, border: "1px solid var(--line)" }}>
                  Apply for an account
                </Link>
              </div>
            </div>

            {/* Trade partners at work - a real OnWood project photo, framed in an
                editorial layered style (offset accent panel + floating value chip). */}
            <div className="tl-hero-art" aria-hidden style={{ position: "relative", justifySelf: "center", width: "min(440px, 100%)" }}>
              {/* offset accent panel behind the photo for layered depth */}
              <div style={{ position: "absolute", inset: 0, transform: "translate(16px, 16px)", borderRadius: 26, background: "color-mix(in srgb, var(--accent) 15%, transparent)", border: "1px solid color-mix(in srgb, var(--accent) 28%, transparent)" }} />
              {/* framed photo */}
              <div style={{ position: "relative", borderRadius: 24, overflow: "hidden", border: "6px solid #fff", boxShadow: "0 46px 92px -40px rgba(32,48,58,.6)", aspectRatio: "1 / 1" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/images/trade-partner.webp" alt="An OnWood tradesperson laying stone pavers in a courtyard" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
              </div>
              {/* floating value chip */}
              <div style={{ position: "absolute", bottom: -16, left: -14, zIndex: 2, background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 16, padding: "12px 16px", boxShadow: "0 26px 50px -24px rgba(32,48,58,.5)", display: "flex", alignItems: "center", gap: 11 }}>
                <span style={{ width: 10, height: 10, background: "var(--accent)", transform: "rotate(45deg)", flex: "none" }} />
                <div>
                  <div style={{ fontFamily: "var(--font-archivo)", fontWeight: 800, fontSize: 14, color: "var(--ink)" }}>Trade pricing, live stock</div>
                  <div style={{ fontSize: 12.5, color: "var(--muted)" }}>Order online, anytime</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── BENEFITS + SIGN IN ───────────────────────────────────── */}
        <section id="signin" style={{ padding: "30px 24px 40px", scrollMarginTop: 90 }}>
          <div className="tl-split" style={{ maxWidth: 1160, margin: "0 auto", display: "grid", gridTemplateColumns: "minmax(0,1.05fr) minmax(0,0.95fr)", gap: 44, alignItems: "start" }}>
            {/* benefits */}
            <div>
              <p style={eyebrow}>Why partner with OnWood</p>
              <h2 style={{ fontFamily: "var(--font-archivo)", fontWeight: 900, letterSpacing: "-.02em", fontSize: "clamp(26px,3.6vw,38px)", lineHeight: 1.08, margin: "12px 0 26px", maxWidth: "18ch" }}>
                Everything you need to price, order and {serif("get it on site")}.
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
                {BENEFITS.map(([t, d]) => (
                  <div key={t} style={{ display: "flex", gap: 15, alignItems: "flex-start" }}>
                    <span style={{ width: 10, height: 10, background: "var(--accent)", transform: "rotate(45deg)", flex: "none", marginTop: 6 }} />
                    <div>
                      <div style={{ fontFamily: "var(--font-archivo)", fontWeight: 800, fontSize: 17, color: "var(--ink)" }}>{t}</div>
                      <div style={{ fontSize: 15, lineHeight: 1.6, color: "var(--muted)", marginTop: 3, maxWidth: "46ch" }}>{d}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* sign-in card (dark, so the existing white-on-dark form reads correctly) */}
            <div style={{ position: "sticky", top: 96, background: "linear-gradient(165deg,#14242e,#0b141a)", border: "1px solid rgba(255,255,255,.1)", borderRadius: 22, padding: "34px 30px", color: "#fff", boxShadow: "0 40px 80px -40px rgba(14,26,32,.7)" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/onwood-logo-white.png" alt="OnWood Tiles" style={{ height: 60, width: "auto", display: "block", marginBottom: 18 }} />
              <h3 style={{ fontFamily: "var(--font-archivo)", fontWeight: 800, fontSize: 22, margin: "0 0 6px" }}>Partner sign-in</h3>
              <p style={{ fontSize: 14, lineHeight: 1.6, color: "rgba(255,255,255,.6)", margin: "0 0 22px" }}>
                Welcome back. Sign in to see your pricing and place an order.
              </p>
              <TradeLoginForm />
              <p style={{ fontSize: 13, color: "rgba(255,255,255,.55)", margin: "20px 0 0", lineHeight: 1.6, textAlign: "center" }}>
                Not a partner yet?{" "}
                <Link href="/trade/apply" style={{ color: "#e79070", fontWeight: 700, textDecoration: "none" }}>Apply now</Link>
              </p>
            </div>
          </div>
        </section>

        {/* ── HOW IT WORKS ─────────────────────────────────────────── */}
        <section style={{ padding: "50px 24px 20px" }}>
          <div style={{ maxWidth: 1160, margin: "0 auto" }}>
            <p style={{ ...eyebrow, textAlign: "center" }}>How it works</p>
            <h2 style={{ fontFamily: "var(--font-archivo)", fontWeight: 900, letterSpacing: "-.02em", fontSize: "clamp(26px,3.6vw,38px)", textAlign: "center", margin: "12px 0 40px" }}>
              Up and ordering in {serif("three steps")}.
            </h2>
            <div className="tl-steps" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20 }}>
              {STEPS.map(([n, t, d]) => (
                <div key={n} style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 18, padding: "26px 24px" }}>
                  <div style={{ fontFamily: "var(--font-archivo)", fontWeight: 900, fontSize: 15, color: "var(--accent)", letterSpacing: ".08em" }}>{n}</div>
                  <div style={{ fontFamily: "var(--font-archivo)", fontWeight: 800, fontSize: 19, margin: "10px 0 6px" }}>{t}</div>
                  <div style={{ fontSize: 15, lineHeight: 1.6, color: "var(--muted)" }}>{d}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA BAND ─────────────────────────────────────────────── */}
        <section style={{ padding: "60px 24px 90px" }}>
          <div style={{ maxWidth: 1160, margin: "0 auto", position: "relative", overflow: "hidden", background: "linear-gradient(150deg,#14242e,#0b141a)", borderRadius: 26, padding: "clamp(38px,6vw,64px) clamp(28px,5vw,60px)", color: "#fff" }}>
            <div style={{ position: "absolute", inset: 0, background: "radial-gradient(700px 300px at 88% -20%, color-mix(in srgb, var(--accent) 30%, transparent), transparent 60%)", pointerEvents: "none" }} />
            <div style={{ position: "relative", display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 24 }}>
              <div>
                <h2 style={{ fontFamily: "var(--font-archivo)", fontWeight: 900, letterSpacing: "-.02em", fontSize: "clamp(26px,4vw,40px)", lineHeight: 1.05, margin: 0, maxWidth: "16ch" }}>
                  Not a partner yet?
                </h2>
                <p style={{ fontSize: 16.5, lineHeight: 1.6, color: "rgba(255,255,255,.68)", margin: "12px 0 0", maxWidth: "44ch" }}>
                  Join the builders, tilers and designers already ordering with OnWood. It takes a couple of minutes.
                </p>
              </div>
              <Link href="/trade/apply" style={{ flex: "none", background: "var(--accent)", color: "#fff", fontWeight: 800, fontSize: 16, textDecoration: "none", padding: "16px 32px", borderRadius: 999 }}>
                Apply for a trade account
              </Link>
            </div>
          </div>
        </section>
      </main>
      <MarketingFooter />

      <style>{`
        @media(max-width:900px){
          .tl-hero{grid-template-columns:1fr!important;gap:36px!important}
          .tl-hero-art{order:-1;margin-bottom:4px}
          .tl-split{grid-template-columns:1fr!important;gap:34px!important}
          .tl-split > div:last-child{position:static!important}
          .tl-steps{grid-template-columns:1fr!important}
        }
      `}</style>
    </div>
  );
}
