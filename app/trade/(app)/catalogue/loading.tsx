// Instant skeleton for the trade catalogue. Because the portal is force-dynamic,
// a click used to hang on the previous screen until the server render finished;
// this Suspense fallback shows immediately so navigation feels responsive while
// the (cached) menu resolves. Server component, no client JS.
const SHIMMER = `
  @keyframes owsh { 0% { background-position: -200% 0 } 100% { background-position: 200% 0 } }
  .owsk { background: linear-gradient(90deg, var(--line) 25%, color-mix(in oklab, var(--line) 45%, #fff) 37%, var(--line) 63%); background-size: 200% 100%; animation: owsh 1.4s ease-in-out infinite; border-radius: 12px; }
`;

export default function CatalogueLoading() {
  return (
    <div>
      <style>{SHIMMER}</style>
      {/* heading */}
      <div style={{ marginBottom: 26 }}>
        <div className="owsk" style={{ height: 38, width: 240, borderRadius: 10 }} />
        <div className="owsk" style={{ height: 15, width: "min(560px, 90%)", marginTop: 14 }} />
      </div>
      {/* department tablets */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 300px), 1fr))", gap: 22 }}>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="owsk" style={{ height: 320, borderRadius: 18 }} />
        ))}
      </div>
    </div>
  );
}
