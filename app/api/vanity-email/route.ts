import { NextResponse } from "next/server";
import { checkRateLimit, canEmailVisitor, RL_FORM } from "../../../lib/rateLimit";
import { line } from "../../../lib/formInput";

export const runtime = "nodejs";
export const maxDuration = 60;

// "Email me my vanity" from the 3D builder. OnBase does the real work (re-price the build,
// customer match / create, enquiry with the vanity + renders, history, staff bell, and the
// two automatic emails from its editable templates); this route spam-checks and forwards.

const ONBASE_API_URL = process.env.ONBASE_API_URL || "https://onbasehq.com.au";
const ONBASE_API_KEY = process.env.ONBASE_API_KEY;
const FAIL = "We could not send that just now. Please try again, or call us.";

const str = line;

export async function POST(request: Request) {
  const rl = checkRateLimit(request, "vanity-email", RL_FORM);
  if (rl) return rl;
  let b: Record<string, unknown>;
  try { b = (await request.json()) as Record<string, unknown>; } catch { return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 }); }
  if (typeof b.company === "string" && b.company.trim()) return NextResponse.json({ ok: true }); // honeypot
  if (!ONBASE_API_KEY) return NextResponse.json({ ok: false, error: FAIL }, { status: 503 });

  const name = str(b.name, 120), email = str(b.email, 160), phone = str(b.phone, 40), suburb = str(b.suburb, 80), notes = typeof b.notes === "string" ? b.notes.trim().slice(0, 2000) : "";
  // OnBase emails this address the build, so cap how many one address can trigger a day.
  if (email && !canEmailVisitor(email, 5)) return NextResponse.json({ ok: false, error: "We already have several builds from this email today. Please call us." }, { status: 429 });
  // Four JPEG stills at most, each a modest size (the browser renders them at 1200 x 800).
  const shots = (Array.isArray(b.shots) ? b.shots.slice(0, 4) : [])
    .map((s) => s as { label?: unknown; data?: unknown })
    .filter((s) => typeof s.data === "string" && s.data.startsWith("data:image/jpeg;base64,") && s.data.length < 1_200_000)
    .map((s) => ({ label: str(s.label, 40), data: s.data as string }));

  try {
    const res = await fetch(`${ONBASE_API_URL}/api/v1/website/vanity-builds`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${ONBASE_API_KEY}` },
      body: JSON.stringify({ name, email, phone, suburb, notes, rangeId: str(b.rangeId, 80), options: b.options, buildUrl: str(b.buildUrl, 2000), shots }),
    });
    const j = (await res.json().catch(() => null)) as { ok?: boolean; error?: string } | null;
    if (!res.ok || !j?.ok) return NextResponse.json({ ok: false, error: res.status === 400 && j?.error ? j.error : FAIL }, { status: res.status === 400 ? 400 : 502 });
  } catch (err) {
    console.error("[vanity-email] OnBase failed:", err);
    return NextResponse.json({ ok: false, error: FAIL }, { status: 502 });
  }

  // OnConnect contact (fails open), tagged for follow-up.
  try {
    const parts = name.split(/\s+/).filter(Boolean);
    await fetch(`${ONBASE_API_URL}/api/v1/onconnect/contacts`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${ONBASE_API_KEY}` },
      body: JSON.stringify({ email, firstName: parts[0], lastName: parts.slice(1).join(" ") || undefined, phone, tags: ["Vanity Build", "Website Lead", ...(b.marketingConsent === true ? ["Marketing"] : [])], marketingConsent: b.marketingConsent === true, consentText: typeof b.consentText === "string" ? b.consentText : undefined, consentSource: "Email me my vanity (onwoodtiles.com.au 3D builder)" }),
    });
  } catch { /* optional */ }

  return NextResponse.json({ ok: true });
}
