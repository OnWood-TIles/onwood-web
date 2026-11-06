import { NextResponse } from "next/server";
import { tradeVanityEmail, TradeError, type BuildOptions } from "../../../../lib/onbase/trade";

export const runtime = "nodejs";
export const maxDuration = 60;

// "Email me my vanity" in the trade portal: OnBase prices the build at the partner's % off RRP,
// files it with the renders, and emails it to the address on their trade account (plus a team
// copy). Their name and email come from the session, never from here.

const str = (v: unknown, n: number) => (typeof v === "string" ? v.trim().slice(0, n) : "");

function cleanOptions(v: unknown): BuildOptions {
  const out: BuildOptions = {};
  if (!v || typeof v !== "object" || Array.isArray(v)) return out;
  for (const [k, x] of Object.entries(v as Record<string, unknown>).slice(0, 60)) {
    if (typeof x === "string") out[k.slice(0, 60)] = x.slice(0, 200);
    else if (Array.isArray(x)) out[k.slice(0, 60)] = x.filter((y): y is string => typeof y === "string").slice(0, 30).map((y) => y.slice(0, 200));
  }
  return out;
}

export async function POST(request: Request) {
  let b: Record<string, unknown>;
  try { b = (await request.json()) as Record<string, unknown>; } catch { return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 }); }
  // Four JPEG stills at most, each a modest size (the browser renders them at 1200 x 800).
  const shots = (Array.isArray(b.shots) ? b.shots.slice(0, 4) : [])
    .map((s) => s as { label?: unknown; data?: unknown })
    .filter((s) => typeof s.data === "string" && s.data.startsWith("data:image/jpeg;base64,") && s.data.length < 1_200_000)
    .map((s) => ({ label: str(s.label, 40), data: s.data as string }));
  try {
    const r = await tradeVanityEmail({ rangeId: str(b.rangeId, 80), options: cleanOptions(b.options), buildUrl: str(b.buildUrl, 2000), notes: str(b.notes, 2000) || undefined, shots });
    return NextResponse.json({ ok: true, email: r.email });
  } catch (err) {
    const status = err instanceof TradeError ? err.status : 500;
    const error = err instanceof TradeError && status === 400 ? err.message : "We could not send that just now. Please try again, or call us.";
    return NextResponse.json({ ok: false, error }, { status });
  }
}
