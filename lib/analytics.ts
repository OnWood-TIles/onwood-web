// Reads Vercel Web Analytics (the SAME data as the Vercel dashboard) so staff can
// see site traffic inside /admin without leaving the site. Server-only — the
// access token never reaches the browser. Needs one env var: VERCEL_TOKEN (a
// Vercel access token). The project + team default to OnWood's own ids.
const BASE = "https://api.vercel.com/v1/query/web-analytics";
// Sanitize: env vars set via PowerShell/CLI can pick up a BOM or trailing CR/LF,
// which would corrupt the Bearer header (and 401 the analytics API). Strip
// anything outside printable ASCII and trim - a Vercel token is plain ASCII.
const TOKEN = (process.env.VERCEL_TOKEN ?? "").replace(/[^\x20-\x7E]/g, "").trim();
const TEAM = process.env.VERCEL_TEAM_ID || "team_9BHMFJyfGE39zyKGZYcqvcvW";
const PROJECT = process.env.VERCEL_PROJECT_ID || "prj_Cr9042cHzMHWB0ftJ2tWqyAV2Adu";

/** Whether the VERCEL_TOKEN is set (so the page can show a setup hint if not). */
export const analyticsConfigured = (): boolean => Boolean(TOKEN);

type Row = { pageviews?: number; visitors?: number; timestamp?: string; [k: string]: unknown };

async function q(endpoint: string, params: Record<string, string>): Promise<Row[] | null> {
  if (!TOKEN) return null;
  const usp = new URLSearchParams({ teamId: TEAM, projectId: PROJECT, ...params });
  try {
    const r = await fetch(`${BASE}/${endpoint}?${usp.toString()}`, {
      headers: { Authorization: `Bearer ${TOKEN}` },
      cache: "no-store",
    });
    if (!r.ok) return null; // 401 (bad token) / 403 (analytics not enabled) / etc.
    const j = (await r.json()) as { data?: unknown };
    if (Array.isArray(j.data)) return j.data as Row[];
    return j.data ? [j.data as Row] : [];
  } catch {
    return null;
  }
}

export type Trend = { day: string; pageviews: number; visitors: number };
export type TopRow = { label: string; pageviews: number; visitors: number };
export type Analytics = {
  configured: boolean; // token present
  ok: boolean; // token present AND the API answered
  days: number;
  totalViews: number;
  totalVisitors: number;
  trend: Trend[];
  topPages: TopRow[];
  topReferrers: TopRow[];
  devices: TopRow[];
};

const ymd = (d: Date) => d.toISOString().slice(0, 10);
const asRows = (rows: Row[] | null, key: string, blankLabel: string): TopRow[] =>
  (rows ?? [])
    .map((r) => ({
      label: (r[key] != null && String(r[key]).trim()) || blankLabel,
      pageviews: Number(r.pageviews) || 0,
      visitors: Number(r.visitors) || 0,
    }))
    .filter((r) => r.pageviews > 0);

export async function getAnalytics(days: number): Promise<Analytics> {
  const until = new Date();
  const since = new Date(until.getTime() - days * 86_400_000);
  const range = { since: ymd(since), until: ymd(until) };

  const [byDay, routes, referrers, devices] = await Promise.all([
    q("visits/aggregate", { ...range, by: "day" }),
    q("visits/aggregate", { ...range, by: "route", limit: "10" }),
    q("visits/aggregate", { ...range, by: "referrerHostname", limit: "8" }),
    q("visits/aggregate", { ...range, by: "deviceType", limit: "6" }),
  ]);

  const trend: Trend[] = (byDay ?? []).map((r) => ({
    day: String(r.timestamp ?? "").slice(0, 10),
    pageviews: Number(r.pageviews) || 0,
    visitors: Number(r.visitors) || 0,
  }));

  return {
    configured: analyticsConfigured(),
    ok: byDay !== null,
    days,
    totalViews: trend.reduce((a, t) => a + t.pageviews, 0),
    totalVisitors: trend.reduce((a, t) => a + t.visitors, 0),
    trend,
    topPages: asRows(routes, "route", "(unknown)"),
    topReferrers: asRows(referrers, "referrerHostname", "Direct / none"),
    devices: asRows(devices, "deviceType", "Unknown"),
  };
}
