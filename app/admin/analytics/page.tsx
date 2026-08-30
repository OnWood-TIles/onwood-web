import type { Metadata } from "next";
import Link from "next/link";
import MarketingNav from "../../components/marketing/MarketingNav";
import MarketingFooter from "../../components/marketing/MarketingFooter";
import { getAnalytics, type TopRow } from "../../../lib/analytics";
import LiveVisitors from "./LiveVisitors";

export const metadata: Metadata = { title: "Analytics", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

const RANGES = [7, 30, 90];

// Staff-only traffic dashboard (behind the preview cookie in all modes, like the
// nav + blog editors). Reads Vercel Web Analytics server-side.
export default async function AdminAnalyticsPage({ searchParams }: { searchParams: Promise<{ days?: string }> }) {
  const { days: daysParam } = await searchParams;
  const days = RANGES.includes(Number(daysParam)) ? Number(daysParam) : 30;
  const a = await getAnalytics(days);
  const maxViews = Math.max(1, ...a.trend.map((t) => t.pageviews));

  return (
    <div data-theme="terracotta" style={{ background: "var(--bg)", color: "var(--ink)", minHeight: "100vh" }}>
      <MarketingNav />
      <main style={{ maxWidth: 1040, margin: "0 auto", padding: "150px 28px 90px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
          <div>
            <p style={eyebrow}>Site admin</p>
            <h1 style={h1}>Analytics</h1>
          </div>
          <div style={{ display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap" }}>
            <Link href="/admin" style={backLink}>← Navigation</Link>
            <Link href="/admin/blog" style={backLink}>Blog editor</Link>
          </div>
        </div>
        <p style={{ color: "#5a6067", fontSize: 15, lineHeight: 1.65, maxWidth: 680, margin: "10px 0 26px" }}>
          Live visitor traffic for onwoodtiles.com.au, straight from Vercel — the same numbers as the Vercel dashboard, without leaving your site.
        </p>

        {/* Live "visitors right now" - independent of Vercel; updates every ~10s. */}
        <LiveVisitors />

        {!a.configured ? (
          <SetupCard />
        ) : !a.ok ? (
          <Notice title="Couldn't load analytics">
            The traffic service didn&apos;t respond. Check that <Code>VERCEL_TOKEN</Code> is a valid Vercel access token and that Web Analytics is enabled for the project, then refresh.
          </Notice>
        ) : (
          <>
            {/* range selector */}
            <div style={{ display: "flex", gap: 8, marginBottom: 22 }}>
              {RANGES.map((r) => (
                <Link key={r} href={`/admin/analytics?days=${r}`} style={r === days ? chipOn : chip}>
                  Last {r} days
                </Link>
              ))}
            </div>

            {/* headline numbers */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16, marginBottom: 28 }}>
              <StatCard label="Page views" value={a.totalViews} />
              <StatCard label="Visitors" value={a.totalVisitors} />
              <StatCard label="Views / visitor" value={a.totalVisitors ? Math.round((a.totalViews / a.totalVisitors) * 10) / 10 : 0} />
            </div>

            {/* daily trend */}
            <Panel title="Daily traffic">
              {a.trend.length === 0 ? (
                <Empty />
              ) : (
                <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height: 150, padding: "8px 0" }}>
                  {a.trend.map((t) => (
                    <div key={t.day} title={`${t.day}: ${t.pageviews} views · ${t.visitors} visitors`} style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "flex-end", height: "100%" }}>
                      <div style={{ height: `${(t.pageviews / maxViews) * 100}%`, minHeight: t.pageviews ? 2 : 0, background: "var(--accent)", borderRadius: "3px 3px 0 0", opacity: 0.9 }} />
                    </div>
                  ))}
                </div>
              )}
              {a.trend.length > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#8a8577", marginTop: 6 }}>
                  <span>{a.trend[0]?.day}</span>
                  <span>{a.trend[a.trend.length - 1]?.day}</span>
                </div>
              )}
            </Panel>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 18, marginTop: 18 }}>
              <Panel title="Top pages"><TopTable rows={a.topPages} col="Page" /></Panel>
              <Panel title="Where visitors came from"><TopTable rows={a.topReferrers} col="Source" /></Panel>
            </div>

            {a.devices.length > 0 && (
              <div style={{ marginTop: 18 }}>
                <Panel title="Devices"><TopTable rows={a.devices} col="Device" /></Panel>
              </div>
            )}
          </>
        )}
      </main>
      <MarketingFooter />
    </div>
  );
}

// ── pieces ──────────────────────────────────────────────────────────────────
function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div style={{ background: "#fff", border: "1px solid var(--line)", borderRadius: 16, padding: "18px 20px" }}>
      <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: ".08em", textTransform: "uppercase", color: "#8a8577" }}>{label}</div>
      <div style={{ fontFamily: "var(--font-archivo)", fontWeight: 800, fontSize: 34, letterSpacing: "-.02em", marginTop: 4 }}>{value.toLocaleString()}</div>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ background: "#fff", border: "1px solid var(--line)", borderRadius: 16, padding: "18px 20px" }}>
      <h2 style={{ fontFamily: "var(--font-archivo)", fontWeight: 800, fontSize: 16, margin: "0 0 14px" }}>{title}</h2>
      {children}
    </section>
  );
}

function TopTable({ rows, col }: { rows: TopRow[]; col: string }) {
  if (!rows.length) return <Empty />;
  const max = Math.max(1, ...rows.map((r) => r.pageviews));
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, fontWeight: 800, letterSpacing: ".06em", textTransform: "uppercase", color: "#8a8577" }}>
        <span>{col}</span><span>Views</span>
      </div>
      {rows.map((r) => (
        <div key={r.label} style={{ position: "relative", padding: "7px 10px", borderRadius: 8, background: "#faf7f2", overflow: "hidden" }}>
          <div style={{ position: "absolute", inset: 0, width: `${(r.pageviews / max) * 100}%`, background: "color-mix(in oklab, var(--accent) 12%, transparent)" }} />
          <div style={{ position: "relative", display: "flex", justifyContent: "space-between", gap: 12, fontSize: 13.5 }}>
            <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontWeight: 600 }}>{r.label}</span>
            <span style={{ fontWeight: 700, whiteSpace: "nowrap" }}>{r.pageviews.toLocaleString()}<span style={{ color: "#8a8577", fontWeight: 600 }}> · {r.visitors.toLocaleString()} vis.</span></span>
          </div>
        </div>
      ))}
    </div>
  );
}

const Empty = () => <p style={{ color: "#8a8577", fontSize: 14, margin: 0 }}>No data for this range yet — check back once visitors have been through.</p>;
const Code = ({ children }: { children: React.ReactNode }) => <code style={{ background: "#f0ece3", padding: "2px 6px", borderRadius: 5, fontSize: 13 }}>{children}</code>;

function Notice({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: "#fff", border: "1px solid var(--line)", borderRadius: 16, padding: "22px 24px" }}>
      <h2 style={{ fontFamily: "var(--font-archivo)", fontWeight: 800, fontSize: 18, margin: "0 0 8px" }}>{title}</h2>
      <p style={{ color: "#5a6067", fontSize: 14.5, lineHeight: 1.65, margin: 0 }}>{children}</p>
    </div>
  );
}

function SetupCard() {
  return (
    <Notice title="One quick setup step">
      To show your traffic here, I need a read-only Vercel access token:
      <ol style={{ margin: "12px 0 0", paddingLeft: 20, lineHeight: 1.8 }}>
        <li>In Vercel: <strong>Account Settings → Tokens → Create Token</strong> (scope it to the OnWood team; read access is enough).</li>
        <li>Add it as an environment variable <Code>VERCEL_TOKEN</Code> on the <Code>onwood-web</Code> project (Production).</li>
        <li>Redeploy — then this page fills in automatically.</li>
      </ol>
      <span style={{ display: "block", marginTop: 12, color: "#8a8577", fontSize: 13.5 }}>Send me the token and I&apos;ll set it up and deploy for you.</span>
    </Notice>
  );
}

// ── styles ──────────────────────────────────────────────────────────────────
const eyebrow: React.CSSProperties = { fontSize: 12, fontWeight: 800, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--accent)", margin: 0 };
const h1: React.CSSProperties = { fontFamily: "var(--font-archivo)", fontWeight: 800, fontSize: "clamp(28px,4vw,42px)", letterSpacing: "-.02em", margin: "6px 0 0" };
const backLink: React.CSSProperties = { fontSize: 14, fontWeight: 700, color: "var(--accent)", textDecoration: "none" };
const chip: React.CSSProperties = { fontSize: 13.5, fontWeight: 700, color: "var(--ink)", background: "#fff", border: "1px solid var(--line)", borderRadius: 999, padding: "8px 16px", textDecoration: "none" };
const chipOn: React.CSSProperties = { ...chip, background: "var(--accent)", color: "#fff", borderColor: "var(--accent)" };
