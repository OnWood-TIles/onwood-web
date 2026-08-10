import { NextResponse } from "next/server";
import { getShopMenu } from "../../../lib/onbase/client";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const BASE = process.env.ONBASE_API_URL || "https://onbasehq.com.au";
const KEY = process.env.ONBASE_API_KEY;

// Keep-warm ping (Vercel Cron, every 5 min). On a low-traffic site the serverless
// functions cold-start after a few idle minutes, stacking onwood-web + OnBase +
// Supabase cold starts onto the trade portal's uncached calls. Hitting this on a
// schedule keeps one instance of each warm and refreshes the cached shop menu so
// a real click rarely has to rebuild it. Does nothing sensitive; returns fast.
export async function GET(req: Request) {
  // If CRON_SECRET is set, require Vercel Cron's auto-added Authorization header.
  // Unset = open (the endpoint is harmless); set CRON_SECRET in Vercel to lock it.
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const t0 = Date.now();
  const out: Record<string, unknown> = {};

  // 1) Warm OnBase's serverless function + the Supabase connection pool with a
  //    cheap authenticated read (bounded so a hiccup can't hang the cron).
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

  // 2) Keep the storefront shop-menu cache warm so navigations rarely rebuild it.
  try {
    const menu = await getShopMenu();
    out.shopMenu = `${menu.length} depts`;
  } catch {
    out.shopMenu = "err";
  }

  return NextResponse.json({ ok: true, ...out, ms: Date.now() - t0 });
}
