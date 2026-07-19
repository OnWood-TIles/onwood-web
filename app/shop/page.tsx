import type { Metadata } from "next";
import Link from "next/link";
import MarketingNav from "../components/marketing/MarketingNav";
import MarketingFooter from "../components/marketing/MarketingFooter";
import { getShopMenu, type ShopMenuDept } from "../../lib/onbase/client";
import { EmptyCatalogue } from "../components/shop/shared";

export const metadata: Metadata = {
  title: "Shop",
  description:
    "Choose a department - tiles, tapware and more - and browse the OnWood Tiles range live from our Baringa showroom.",
};

export const dynamic = "force-dynamic";

// Shop = a DEPARTMENT CHOOSER, not a flat product list. The customer picks a
// space (Tiles, Tapware, Carpet...) as large "tablet" cards, then continues into
// that department's filtered grid. Only populated departments show (no dead ends).
export default async function ShopPage() {
  const depts = await getShopMenu();

  return (
    <div data-theme="terracotta" style={{ background: "var(--bg)", color: "var(--ink)" }}>
      <MarketingNav />
      <main style={{ maxWidth: 1240, margin: "0 auto", padding: "150px 28px 96px" }}>
        {/* Editorial header */}
        <header style={{ textAlign: "center", maxWidth: 640, margin: "0 auto 52px" }}>
          <div
            style={{
              fontSize: 12.5,
              fontWeight: 800,
              letterSpacing: ".22em",
              textTransform: "uppercase",
              color: "var(--accent2)",
            }}
          >
            Browse the collection
          </div>
          <h1
            style={{
              fontFamily: "var(--font-archivo)",
              fontWeight: 800,
              fontSize: "clamp(38px,5.2vw,64px)",
              letterSpacing: "-.025em",
              lineHeight: 1.02,
              margin: "14px 0 0",
            }}
          >
            Where would you like to{" "}
            <em style={{ fontFamily: "var(--font-newsreader)", fontStyle: "italic", fontWeight: 500, color: "var(--accent)" }}>
              begin
            </em>
            ?
          </h1>
          <p style={{ color: "#5a6067", fontSize: 16, lineHeight: 1.65, margin: "18px auto 0", maxWidth: 500 }}>
            Pick a space to explore. Everything inside is stocked and tracked in our own system, so what you see is
            what we can actually supply.
          </p>
        </header>

        {depts.length === 0 ? (
          <EmptyCatalogue />
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 340px), 1fr))",
              gap: 24,
            }}
          >
            {depts.map((d, i) => (
              <DepartmentTablet key={d.slug} dept={d} priority={i < 3} />
            ))}
          </div>
        )}
      </main>
      <MarketingFooter />

      <style>{`
        .ow-dept { transition: transform .32s ease, box-shadow .32s ease; }
        .ow-dept:hover { transform: translateY(-6px); box-shadow: 0 30px 56px -26px rgba(32,48,58,.52); }
        .ow-dept-img { transition: transform .7s cubic-bezier(.2,.6,.2,1); }
        .ow-dept:hover .ow-dept-img { transform: scale(1.07); }
        .ow-dept-cta { transition: gap .25s ease, opacity .25s ease; opacity: .92; }
        .ow-dept:hover .ow-dept-cta { opacity: 1; gap: 12px; }
        .ow-dept-bar { transform: scaleX(0); transform-origin: left; transition: transform .4s cubic-bezier(.2,.6,.2,1); }
        .ow-dept:hover .ow-dept-bar { transform: scaleX(1); }
      `}</style>
    </div>
  );
}

// One department "tablet": full-bleed hero image (prefers an installed room shot
// for lifestyle appeal), a legibility scrim, the department name, a live product
// count, category hints and an Explore call-to-action. Links into the department.
function DepartmentTablet({ dept, priority }: { dept: ShopMenuDept; priority: boolean }) {
  const img = dept.focusImage || dept.image;
  const cats = dept.categories.slice(0, 4);
  const countLabel = `${dept.count} ${dept.count === 1 ? "product" : "products"}`;

  return (
    <Link
      href={`/shop/${dept.slug}`}
      className="ow-dept"
      style={{
        display: "block",
        textDecoration: "none",
        color: "inherit",
        borderRadius: 22,
        overflow: "hidden",
        border: "1px solid var(--line)",
        background: "#efece5",
        boxShadow: "0 14px 36px -22px rgba(32,48,58,.4)",
      }}
    >
      <div style={{ position: "relative", aspectRatio: "4 / 5", overflow: "hidden" }}>
        {img ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={img}
            alt={dept.label}
            loading={priority ? "eager" : "lazy"}
            className="ow-dept-img"
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          />
        ) : (
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(140deg, var(--accent), var(--accent2))" }} />
        )}

        {/* accent reveal bar + legibility scrim */}
        <span className="ow-dept-bar" style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, background: "var(--accent)", zIndex: 3 }} />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(to top, rgba(14,20,24,.86) 0%, rgba(14,20,24,.30) 44%, rgba(14,20,24,0) 70%)",
          }}
        />

        {/* live count pill */}
        <span
          style={{
            position: "absolute",
            top: 14,
            right: 14,
            padding: "5px 11px",
            borderRadius: 99,
            background: "rgba(255,246,238,.92)",
            color: "var(--ink)",
            fontSize: 11.5,
            fontWeight: 800,
            letterSpacing: ".01em",
            backdropFilter: "blur(4px)",
            WebkitBackdropFilter: "blur(4px)",
          }}
        >
          {countLabel}
        </span>

        {/* identity */}
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, padding: "24px 22px 20px", color: "#fff6ee" }}>
          <div style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: ".2em", textTransform: "uppercase", color: "rgba(255,246,238,.72)" }}>
            Department
          </div>
          <h2
            style={{
              fontFamily: "var(--font-archivo)",
              fontWeight: 820,
              fontSize: "clamp(25px,2.5vw,32px)",
              letterSpacing: "-.02em",
              lineHeight: 1.05,
              margin: "5px 0 0",
            }}
          >
            {dept.label}
          </h2>

          {cats.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 12 }}>
              {cats.map((c) => (
                <span
                  key={c.slug}
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    padding: "3px 9px",
                    borderRadius: 99,
                    color: "#fff6ee",
                    background: "rgba(255,246,238,.16)",
                    border: "1px solid rgba(255,246,238,.24)",
                  }}
                >
                  {c.label}
                </span>
              ))}
            </div>
          )}

          <span
            className="ow-dept-cta"
            style={{ display: "inline-flex", alignItems: "center", gap: 7, marginTop: 14, fontWeight: 800, fontSize: 13.5 }}
          >
            Explore the range
            <span aria-hidden style={{ fontSize: 15 }}>→</span>
          </span>
        </div>
      </div>
    </Link>
  );
}
