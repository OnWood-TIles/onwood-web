import MarketingNav from "../components/marketing/MarketingNav";

// Instant skeleton while the gallery fetches its feed (taxonomy + ranges). Mirrors
// the Pinterest grid's varied tile sizes so the layout doesn't jump when it loads.
export default function GalleryLoading() {
  return (
    <div data-theme="terracotta" style={{ background: "var(--bg)", color: "var(--ink)", minHeight: "100vh" }}>
      <MarketingNav />
      <main>
        <section style={{ padding: "clamp(104px,18vw,150px) 24px 20px", textAlign: "center" }}>
          <div style={{ maxWidth: 1040, margin: "0 auto" }}>
            <div className="sk" style={{ width: 110, height: 13, borderRadius: 8, margin: "0 auto" }} />
            <div className="sk" style={{ width: "min(60%,420px)", height: 46, borderRadius: 10, margin: "18px auto 0" }} />
            <div className="sk" style={{ width: "min(80%,520px)", height: 16, borderRadius: 8, margin: "18px auto 0" }} />
          </div>
        </section>
        <section style={{ padding: "22px 20px 90px" }}>
          <div className="sk-grid" style={{ maxWidth: 1240, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(210px,1fr))", gridAutoRows: 216, gridAutoFlow: "dense", gap: 14 }}>
            {Array.from({ length: 14 }).map((_, i) => {
              const m = (i * 5 + 2) % 17;
              const span = m === 0 ? { gridRow: "span 2", gridColumn: "span 2" } : m === 6 || m === 12 ? { gridColumn: "span 2" } : m === 3 || m === 8 || m === 14 ? { gridRow: "span 2" } : {};
              return <div key={i} className="sk" style={{ borderRadius: 16, ...span }} />;
            })}
          </div>
        </section>
      </main>
      <style>{`
        .sk{background:linear-gradient(100deg,var(--surface) 30%,color-mix(in oklab,var(--surface) 55%,#fff) 50%,var(--surface) 70%);background-size:200% 100%;animation:owsk 1.3s ease-in-out infinite;border:1px solid var(--line)}
        @keyframes owsk{0%{background-position:200% 0}100%{background-position:-200% 0}}
        @media(max-width:760px){.sk-grid{grid-template-columns:repeat(auto-fill,minmax(150px,1fr))!important;grid-auto-rows:150px!important;gap:10px!important}}
      `}</style>
    </div>
  );
}
