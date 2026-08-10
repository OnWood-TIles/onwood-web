// Generic instant skeleton for the trade portal (dashboard, orders, cart, a
// department grid). Nearest Suspense fallback for any trade page that doesn't
// have its own loading.tsx, so every in-portal click shows something immediately
// instead of freezing on the previous screen. Server component, no client JS.
const SHIMMER = `
  @keyframes owsh { 0% { background-position: -200% 0 } 100% { background-position: 200% 0 } }
  .owsk { background: linear-gradient(90deg, var(--line) 25%, color-mix(in oklab, var(--line) 45%, #fff) 37%, var(--line) 63%); background-size: 200% 100%; animation: owsh 1.4s ease-in-out infinite; border-radius: 12px; }
`;

export default function TradeLoading() {
  return (
    <div>
      <style>{SHIMMER}</style>
      {/* heading */}
      <div style={{ marginBottom: 26 }}>
        <div className="owsk" style={{ height: 38, width: 260, borderRadius: 10 }} />
        <div className="owsk" style={{ height: 15, width: "min(520px, 90%)", marginTop: 14 }} />
      </div>
      {/* content cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))", gap: 18 }}>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="owsk" style={{ height: 180, borderRadius: 18 }} />
        ))}
      </div>
    </div>
  );
}
