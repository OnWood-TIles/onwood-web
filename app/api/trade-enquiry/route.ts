import { NextResponse } from "next/server";
import { checkRateLimit, canEmailVisitor, RL_FORM } from "../../../lib/rateLimit";
import { line, text } from "../../../lib/formInput";

export const runtime = "nodejs";

// "Send an enquiry" on /recommended-trades. OnBase does the real work (stores it for the team to pass on,
// bell + staff email with Reply-To the customer, and the "we'll pass it on" email from its editable
// template); this route spam-checks and forwards. The trade's own contact details are never sent here.

const ONBASE_API_URL = process.env.ONBASE_API_URL || "https://onbasehq.com.au";
const ONBASE_API_KEY = process.env.ONBASE_API_KEY;
const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export async function POST(request: Request) {
  const rl = checkRateLimit(request, "trade-enquiry", RL_FORM);
  if (rl) return rl;
  let b: Record<string, unknown>;
  try { b = (await request.json()) as Record<string, unknown>; } catch { return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 }); }
  if (typeof b.company === "string" && b.company.trim()) return NextResponse.json({ ok: true }); // honeypot
  if (!ONBASE_API_KEY) return NextResponse.json({ ok: false, error: "Enquiries are unavailable right now. Please call us." }, { status: 503 });

  const tradeSlug = line(b.tradeSlug, 80), name = line(b.name, 120), email = line(b.email, 160).toLowerCase(), phone = line(b.phone, 40);
  const suburb = line(b.suburb, 80), message = text(b.message, 1500);
  if (!/^[a-z0-9-]{1,80}$/.test(tradeSlug)) return NextResponse.json({ ok: false, error: "Please choose a trade." }, { status: 400 });
  if (!name) return NextResponse.json({ ok: false, error: "Please add your name." }, { status: 400 });
  if (!EMAIL_RE.test(email)) return NextResponse.json({ ok: false, error: "Please add a valid email address." }, { status: 400 });
  if (message.length < 5) return NextResponse.json({ ok: false, error: "Please tell them a little about your job." }, { status: 400 });
  if (b.consent !== true) return NextResponse.json({ ok: false, error: "Please tick the box so we can pass your details on." }, { status: 400 });
  // OnBase emails this address a copy, so cap how many enquiries one address can trigger a day.
  if (!canEmailVisitor(email, 5)) return NextResponse.json({ ok: false, error: "We already have several enquiries from this email today. Please call us." }, { status: 429 });

  try {
    const res = await fetch(`${ONBASE_API_URL}/api/v1/website/trade-enquiries`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${ONBASE_API_KEY}` },
      body: JSON.stringify({ tradeSlug, name, email, phone: phone || null, suburb: suburb || null, message, consent: true }),
    });
    if (res.ok) return NextResponse.json({ ok: true });
    const j = (await res.json().catch(() => ({}))) as { error?: string };
    if (res.status === 400 || res.status === 404) return NextResponse.json({ ok: false, error: j.error || "Please check your details." }, { status: 400 });
    console.error("[trade-enquiry] onbase", res.status);
  } catch (e) {
    console.error("[trade-enquiry] onbase failed", e instanceof Error ? e.message : e);
  }
  return NextResponse.json({ ok: false, error: "That didn't send. Please try again, or call us." }, { status: 502 });
}
