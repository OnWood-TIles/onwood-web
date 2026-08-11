import { NextResponse } from "next/server";

// Uptime-monitor health check. A cheap, unauthenticated GET that reports whether
// the site is up AND whether it can reach the OnBase catalogue API behind it, so
// an external monitor can alert on either the website or the backend going down.
// Returns 200 when OnBase is reachable, 503 when it is not (still valid JSON so
// the monitor can read the detail). Never caches; never leaks secrets.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BASE = process.env.ONBASE_API_URL || "https://onbasehq.com.au";
const KEY = process.env.ONBASE_API_KEY;

export async function GET() {
  let onbase = false;
  // Cheapest authenticated read (same probe the keep-warm cron uses), bounded by
  // a short timeout so a hung backend can't stall the health check itself.
  try {
    const ctl = new AbortController();
    const timer = setTimeout(() => ctl.abort(), 5000);
    const res = await fetch(`${BASE}/api/v1/business`, {
      headers: KEY ? { Authorization: `Bearer ${KEY}` } : {},
      cache: "no-store",
      signal: ctl.signal,
    });
    clearTimeout(timer);
    onbase = res.ok;
  } catch {
    // Timeout / network error / abort -> OnBase is treated as unreachable.
    onbase = false;
  }

  return NextResponse.json(
    { ok: true, onbase, time: new Date().toISOString() },
    { status: onbase ? 200 : 503 },
  );
}
