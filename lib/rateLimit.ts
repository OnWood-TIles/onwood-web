import "server-only";
import { NextResponse } from "next/server";

// Lightweight in-memory rate limiter for the public API routes.
//
// SERVERLESS CAVEAT: state lives in a single warm lambda instance, not a shared
// store, so this best-effort-limits rapid abuse from one instance rather than a
// fully distributed flood. It is zero-infra and pairs with each provider's own
// quota (Cloudflare's daily neuron allocation, the Gemini per-visitor cookie cap)
// and Vercel keeping functions warm. For bulletproof distributed limits later,
// swap the Map for Upstash/Vercel KV, or add a Vercel Firewall rate-limit rule.

type Bucket = { count: number; resetAt: number };
const store = new Map<string, Bucket>();
let lastPrune = 0;

/** Fixed-window counter. ok:false with retryAfter (seconds) once `limit` is hit. */
export function rateLimit(key: string, limit: number, windowMs: number): { ok: boolean; retryAfter: number } {
  const now = Date.now();
  // Opportunistic prune so the map can't grow unbounded on a long-lived instance.
  if (now - lastPrune > 60_000) {
    for (const [k, b] of store) if (now >= b.resetAt) store.delete(k);
    lastPrune = now;
  }
  const b = store.get(key);
  if (!b || now >= b.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, retryAfter: 0 };
  }
  if (b.count >= limit) return { ok: false, retryAfter: Math.max(1, Math.ceil((b.resetAt - now) / 1000)) };
  b.count++;
  return { ok: true, retryAfter: 0 };
}

/** Best-effort client IP from the proxy headers. */
export function clientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return (req.headers.get("x-real-ip") || "unknown").trim();
}

export type RateRule = { limit: number; windowMs: number };

/** Enforce one or more per-IP windows for a scope. Returns a ready 429 response
 *  when any window is exceeded, otherwise null (carry on). */
export function checkRateLimit(req: Request, scope: string, rules: RateRule[]): NextResponse | null {
  const ip = clientIp(req);
  for (let i = 0; i < rules.length; i++) {
    const r = rateLimit(`${scope}:${i}:${ip}`, rules[i].limit, rules[i].windowMs);
    if (!r.ok) {
      return NextResponse.json(
        { ok: false, error: "You are doing that a bit too quickly. Please wait a moment and try again." },
        { status: 429, headers: { "Retry-After": String(r.retryAfter) } },
      );
    }
  }
  return null;
}

/** A shared (not per-IP) daily ceiling, for cost-bearing endpoints. Returns a 429
 *  response with `message` once the cap is reached, otherwise null. */
export function checkDailyCap(scope: string, limit: number, message: string): NextResponse | null {
  const r = rateLimit(`${scope}:global:day`, limit, 86_400_000);
  if (!r.ok) return NextResponse.json({ ok: false, error: message }, { status: 429 });
  return null;
}

// Per-endpoint window presets (per IP unless noted).
export const RL_FORM: RateRule[] = [{ limit: 5, windowMs: 60_000 }, { limit: 30, windowMs: 3_600_000 }];
export const RL_SHARE: RateRule[] = [{ limit: 3, windowMs: 60_000 }, { limit: 15, windowMs: 3_600_000 }];
export const RL_AI: RateRule[] = [{ limit: 4, windowMs: 60_000 }, { limit: 20, windowMs: 3_600_000 }];
