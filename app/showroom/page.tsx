import type { Metadata } from "next";
import Link from "next/link";
import MarketingNav from "../components/marketing/MarketingNav";
import MarketingFooter from "../components/marketing/MarketingFooter";
import ShowroomSignup from "../components/marketing/ShowroomSignup";

export const metadata: Metadata = {
  title: "Showroom coming soon",
  description:
    "Our new OnWood Tiles showroom is on the way in Baringa, Sunshine Coast. Register for opening-day access, or apply for early Trade Partner pricing. Shop the full range online now.",
  alternates: { canonical: "https://onwoodtiles.com.au/showroom" },
};

const wrap: React.CSSProperties = { maxWidth: 1120, margin: "0 auto", padding: "0 24px" };
const eyebrow: React.CSSProperties = {
  fontFamily: "var(--font-archivo)", fontSize: 12.5, fontWeight: 800, letterSpacing: ".14em",
  textTransform: "uppercase", color: "var(--accent)", margin: "0 0 14px",
};

function Perk({ title, body }: { title: string; body: string }) {
  return (
    <div style={{ display: "flex", gap: 13, alignItems: "flex-start" }}>
      <span aria-hidden style={{ marginTop: 4, width: 9, height: 9, borderRadius: "50%", background: "var(--accent)", flex: "none" }} />
      <div>
        <div style={{ fontFamily: "var(--font-archivo)", fontWeight: 800, fontSize: 16, margin: "0 0 3px" }}>{title}</div>
        <p style={{ margin: 0, color: "var(--muted)", fontSize: 14.5, lineHeight: 1.6 }}>{body}</p>
      </div>
    </div>
  );
}

export default function ShowroomPage() {
  return (
    <div data-theme="terracotta" style={{ background: "var(--bg)", color: "var(--ink)", minHeight: "100vh" }}>
      <MarketingNav />
      <main>
        {/* Hero */}
        <section style={{ ...wrap, paddingTop: 132, paddingBottom: 8 }}>
          <p style={eyebrow}>Showroom · coming soon</p>
          <h1 style={{ fontFamily: "var(--font-archivo)", fontWeight: 900, fontSize: "clamp(32px, 6vw, 56px)", letterSpacing: "-.02em", lineHeight: 1.04, margin: "0 0 18px", maxWidth: 760 }}>
            Our Sunshine Coast showroom is on the way.
          </h1>
          <p style={{ fontSize: "clamp(16px, 2.2vw, 19px)", lineHeight: 1.6, color: "var(--muted)", margin: "0 0 26px", maxWidth: 620 }}>
            We&rsquo;re building a proper home for tiles in Baringa &mdash; full-size display boards, big-format samples and honest Sunshine Coast light to choose in. The doors aren&rsquo;t open just yet, but the full range is already online.
          </p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <Link href="/shop" style={{ display: "inline-flex", alignItems: "center", padding: "14px 26px", borderRadius: 999, background: "var(--accent)", color: "#fff6ee", fontWeight: 800, fontSize: 15.5, textDecoration: "none", boxShadow: "0 14px 30px -12px rgba(208,106,69,.6)" }}>
              Shop the full range
            </Link>
            <a href="#register" style={{ display: "inline-flex", alignItems: "center", padding: "14px 26px", borderRadius: 999, background: "transparent", color: "var(--ink)", fontWeight: 800, fontSize: 15.5, textDecoration: "none", border: "1.5px solid var(--line)" }}>
              Get opening-day access
            </a>
          </div>
        </section>

        {/* Body: what's coming + the form */}
        <section style={{ ...wrap, paddingTop: 40, paddingBottom: 80 }}>
          <div className="sr-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, alignItems: "start" }}>
            <div>
              <p style={eyebrow}>What&rsquo;s coming</p>
              <h2 style={{ fontFamily: "var(--font-archivo)", fontWeight: 800, fontSize: "clamp(24px, 3.4vw, 32px)", letterSpacing: "-.01em", margin: "0 0 22px" }}>
                Worth the wait.
              </h2>
              <div style={{ display: "grid", gap: 20, marginBottom: 34 }}>
                <Perk title="See it full size" body="Large-format display boards and real tile samples you can hold, not thumbnails on a screen." />
                <Perk title="Choose in real light" body="Natural Sunshine Coast light so the colour you pick is the colour you get at home." />
                <Perk title="Expert, local help" body="Talk through floor, wall and outdoor tiles with people who know the local builds." />
              </div>

              <div style={{ background: "color-mix(in srgb, var(--accent) 8%, var(--surface))", border: "1px solid color-mix(in srgb, var(--accent) 22%, var(--line))", borderRadius: 18, padding: "22px 24px" }}>
                <p style={{ ...eyebrow, margin: "0 0 8px" }}>Trade &amp; builders</p>
                <h3 style={{ fontFamily: "var(--font-archivo)", fontWeight: 800, fontSize: 19, margin: "0 0 8px" }}>Early Trade Partner access</h3>
                <p style={{ margin: 0, color: "var(--muted)", fontSize: 14.5, lineHeight: 1.6 }}>
                  Builders, designers and tilers can register now for early Trade Partner access &mdash; trade pricing, first pick of new arrivals and a direct line to the team. Tick the box on the form and we&rsquo;ll get you set up ahead of opening.
                </p>
              </div>
            </div>

            <div id="register" style={{ scrollMarginTop: 110 }}>
              <ShowroomSignup />
            </div>
          </div>
        </section>
      </main>
      <MarketingFooter />
      <style>{`@media (max-width:820px){.sr-grid{grid-template-columns:1fr!important;gap:36px!important;}}`}</style>
    </div>
  );
}
