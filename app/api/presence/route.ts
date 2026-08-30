import { NextResponse } from "next/server";
import { rateLimit, clientIp } from "../../../lib/rateLimit";
import { pingPresence } from "../../../lib/onbase/client";

// Public visitor heartbeat. The client beacon POSTs a random session id every
// ~15s while a tab is visible; we forward it to OnBase (which upserts the live
// presence row). No honeypot / auth - this is anonymous traffic by design. A
// generous per-IP ceiling blunts a flood without ever blocking a real heartbeat
// (many tabs/visitors can share one NAT). Always answers 204 - a beacon should
// never see an error, and we never want to leak whether a limit was hit.
export const runtime = "nodejs";

const clip = (v: unknown, n: number) => (typeof v === "string" ? v.trim().slice(0, n) : "");
const NO_CONTENT = () => new NextResponse(null, { status: 204 });

export async function POST(request: Request) {
  // ~1 ping / 2.5s sustained per IP - well above a real tab's 4/min, room for
  // plenty of simultaneous visitors behind one address.
  const rl = rateLimit(`presence:${clientIp(request)}`, 240, 600_000);
  if (!rl.ok) return NO_CONTENT();

  let b: Record<string, unknown> = {};
  try {
    b = (await request.json()) as Record<string, unknown>;
  } catch {
    return NO_CONTENT(); // sendBeacon / malformed body - nothing to record
  }

  const sessionId = clip(b.sessionId, 40);
  const path = clip(b.path, 200);
  if (sessionId) await pingPresence(sessionId, path || undefined);
  return NO_CONTENT();
}
