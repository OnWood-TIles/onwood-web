import MarketingNav from "../../components/marketing/MarketingNav";
import MarketingFooter from "../../components/marketing/MarketingFooter";

// Instant loading skeleton for the product page. Next renders this the moment a
// shop card is clicked - so the click always produces immediate feedback while
// the (dynamic) product data streams in from OnBase. Mirrors ProductView's
// layout (sticky 7/5 gallery + identity column) so there's no jump on swap-in.
// The real nav + footer render straight from context (no fetch), so only the
// product body shimmers.

const SK = "#e9e4da";

function Block({
  w,
  h,
  r = 8,
  style,
}: {
  w?: number | string;
  h: number | string;
  r?: number;
  style?: React.CSSProperties;
}) {
  return <div className="ow-sk" style={{ width: w ?? "100%", height: h, borderRadius: r, ...style }} />;
}

export default function ProductLoading() {
  return (
    <div data-theme="terracotta" style={{ background: "var(--bg)", color: "var(--ink)" }}>
      <MarketingNav />
      <main style={{ maxWidth: 1240, margin: "0 auto", padding: "clamp(92px,15vw,140px) 28px 90px" }}>
        {/* breadcrumb */}
        <Block w={280} h={13} r={6} style={{ marginBottom: 22 }} />

        <div
          style={{ display: "grid", gridTemplateColumns: "minmax(0, 7fr) minmax(0, 5fr)", gap: 44, alignItems: "start" }}
          className="ow-product-grid"
        >
          {/* gallery */}
          <div className="ow-product-gallery">
            <Block h="" r={22} style={{ aspectRatio: "4 / 3", border: "1px solid var(--line)" }} />
          </div>

          {/* identity + options */}
          <div>
            <Block w={150} h={12} r={6} style={{ marginBottom: 14 }} />
            <Block w="80%" h={40} r={10} />
            <Block w="55%" h={40} r={10} style={{ marginTop: 8 }} />

            <Block w={110} h={30} r={99} style={{ marginTop: 20 }} />

            {/* description lines */}
            <div style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 10 }}>
              <Block h={14} r={6} />
              <Block h={14} r={6} />
              <Block w="70%" h={14} r={6} />
            </div>

            {/* option swatches */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 30 }}>
              {Array.from({ length: 5 }).map((_, i) => (
                <Block key={i} w={84} h={82} r={12} />
              ))}
            </div>

            {/* CTAs */}
            <div style={{ display: "flex", gap: 12, marginTop: 34, flexWrap: "wrap" }}>
              <Block w={220} h={50} r={99} />
              <Block w={180} h={50} r={99} />
            </div>
          </div>
        </div>
      </main>
      <MarketingFooter />

      <style>{`
        .ow-sk {
          position: relative;
          overflow: hidden;
          background: ${SK};
        }
        .ow-sk::after {
          content: "";
          position: absolute;
          inset: 0;
          transform: translateX(-100%);
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.65), transparent);
          animation: ow-sk-sheen 1.5s infinite;
        }
        @keyframes ow-sk-sheen {
          100% { transform: translateX(100%); }
        }
        @media (prefers-reduced-motion: reduce) {
          .ow-sk::after { animation: none; }
        }
        @media (max-width: 900px) {
          .ow-product-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
