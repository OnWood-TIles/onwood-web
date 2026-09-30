import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const BASE = process.env.ONBASE_API_URL || "https://onbasehq.com.au";
const KEY = process.env.ONBASE_API_KEY;

// Keep-warm ping (Vercel Cron, every 5 min). On a low-traffic site the serverless
// functions cold-start after a few idle minutes, stacking onwood-web + OnBase +
// Supabase cold starts onto the trade portal's uncached calls. A single cheap
// authenticated read keeps one instance of each — plus the Supabase connection
// pool — warm. Does nothing sensitive; returns fast.
//
// IMPORTANT (2026-09): this deliberately does NOT rebuild the shop-menu / catalogue
// cache anymore. Calling getShopMenu() here pulled the ENTIRE product feed out of
// Supabase every 5 minutes (~288×/day) — the bulk of our database egress. The shop
// menu now rebuilds on demand from real traffic (long TTL in lib/onbase/client.ts)
// and is busted instantly on catalogue edits, so it stays correct without the drain.
export async function GET(req: Request) {
  // If CRON_SECRET is set, require Vercel Cron's auto-added Authorization header.
  // Unset = open (the endpoint is harmless); set CRON_SECRET in Vercel to lock it.
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const t0 = Date.now();
  const out: Record<string, unknown> = {};

  // Warm OnBase's serverless function + the Supabase connection pool with a cheap
  // authenticated read of a single small record (bounded so a hiccup can't hang the
  // cron). This is enough to avoid cold starts without pulling the catalogue.
  try {
    const ctl = new AbortController();
    const timer = setTimeout(() => ctl.abort(), 6000);
    const res = await fetch(`${BASE}/api/v1/business`, {
      headers: KEY ? { Authorization: `Bearer ${KEY}` } : {},
      cache: "no-store",
      signal: ctl.signal,
    });
    clearTimeout(timer);
    out.onbase = res.ok ? "ok" : `status ${res.status}`;
  } catch (e) {
    out.onbase = `err ${(e as Error).name}`;
  }

  return NextResponse.json({ ok: true, ...out, ms: Date.now() - t0 });
}
