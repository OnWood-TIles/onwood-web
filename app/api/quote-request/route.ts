import { NextResponse } from "next/server";
import { checkRateLimit, canEmailVisitor, RL_FORM } from "../../../lib/rateLimit";
import { line } from "../../../lib/formInput";

export const runtime = "nodejs";

// "Send me a quote" from the quote list. OnBase does the real work (customer match /
// create, draft job sheet priced as shown, enquiry, staff bell, and the two automatic
// emails from its editable templates); this route spam-checks and forwards. NO quote is
// sent automatically - staff check the job sheet and send it.

const ONBASE_API_URL = process.env.ONBASE_API_URL || "https://onbasehq.com.au";
const ONBASE_API_KEY = process.env.ONBASE_API_KEY;

const str = line;

type InItem = { rangeId?: unknown; colour?: unknown; quantity?: unknown; areaM2?: unknown; wastePct?: unknown; options?: unknown };

export async function POST(request: Request) {
  const rl = checkRateLimit(request, "quote-request", RL_FORM);
  if (rl) return rl;
  let b: Record<string, unknown>;
  try { b = (await request.json()) as Record<string, unknown>; } catch { return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 }); }
  if (typeof b.company === "string" && b.company.trim()) return NextResponse.json({ ok: true, reference: "" }); // honeypot
  if (!ONBASE_API_KEY) return NextResponse.json({ ok: false, error: "Quotes are unavailable right now. Please call us." }, { status: 503 });

  const items = (Array.isArray(b.items) ? b.items.slice(0, 60) : []) as InItem[];
  const name = str(b.name, 120), email = str(b.email, 160), phone = str(b.phone, 40);
  const pickup = b.pickup === true;
  const addr = (b.address ?? {}) as Record<string, unknown>;
  const address = pickup ? null : { street: str(addr.street, 160), suburb: str(addr.suburb, 80), state: str(addr.state, 20), postcode: str(addr.postcode, 10) };
  const neededBy = str(b.neededBy, 40), notes = typeof b.notes === "string" ? b.notes.trim().slice(0, 2000) : "";
  // OnBase emails this address a copy, so cap how many requests one address can trigger a day.
  if (email && !canEmailVisitor(email, 5)) return NextResponse.json({ ok: false, error: "We already have several requests from this email today. Please call us or email sales@onwoodtiles.com.au." }, { status: 429 });

  // 1) OnBase: customer + draft job sheet + enquiry + bell.
  let reference = "";
  try {
    const res = await fetch(`${ONBASE_API_URL}/api/v1/website/quote-requests`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${ONBASE_API_KEY}` },
      body: JSON.stringify({ name, email, phone, pickup, address, neededBy, notes, items: items.map((i) => ({ rangeId: i.rangeId, colour: i.colour, quantity: i.quantity, areaM2: i.areaM2, wastePct: i.wastePct, options: i.options })) }),
    });
    const j = (await res.json().catch(() => null)) as { ok?: boolean; error?: string; reference?: string; jobSheetId?: string; existingCustomer?: boolean } | null;
    if (!res.ok || !j?.ok) return NextResponse.json({ ok: false, error: (res.status === 400 && j?.error) || "We could not send that just now. Please call us or email sales@onwoodtiles.com.au." }, { status: res.status === 400 ? 400 : 502 });
    reference = j.reference ?? "";
  } catch (err) {
    console.error("[quote-request] OnBase failed:", err);
    return NextResponse.json({ ok: false, error: "We could not send that just now. Please call us or email sales@onwoodtiles.com.au." }, { status: 502 });
  }

  // 2) Emails: OnBase sends both (customer acknowledgement + team alert) from the
  //    editable templates in Admin > Email templates > Website requests.

  // 3) OnConnect contact (fails open), tagged for follow-up.
  try {
    const parts = name.split(/\s+/).filter(Boolean);
    await fetch(`${ONBASE_API_URL}/api/v1/onconnect/contacts`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${ONBASE_API_KEY}` },
      body: JSON.stringify({ email, firstName: parts[0], lastName: parts.slice(1).join(" ") || undefined, phone, tags: ["Quote Request", "Website Lead", ...(b.marketingConsent === true ? ["Marketing"] : [])], marketingConsent: b.marketingConsent === true, consentText: typeof b.consentText === "string" ? b.consentText : undefined, consentSource: "Quote request (onwoodtiles.com.au/quote)" }),
    });
  } catch { /* optional */ }

  return NextResponse.json({ ok: true, reference });
}
