import { NextResponse } from "next/server";

// Basic, permissive email shape check (the input[type=email] does the rest client-side).
const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

// OnBase / OnConnect integration. Set these in Vercel (and .env.local for dev):
//   ONBASE_API_KEY   — an API key generated in the OnWood OnBase tenant (Admin → API keys)
//   ONBASE_API_URL   — OnBase base URL (defaults to production)
//   ONBASE_SIGNUP_TAG — the tag applied to every website signup (defaults to "Coming Soon")
const ONBASE_API_URL = process.env.ONBASE_API_URL || "https://onbasehq.com.au";
const ONBASE_API_KEY = process.env.ONBASE_API_KEY;
const SIGNUP_TAG = process.env.ONBASE_SIGNUP_TAG || "Coming Soon";

export async function POST(request: Request) {
  let email = "";
  try {
    const body = (await request.json()) as { email?: unknown };
    email = typeof body.email === "string" ? body.email.trim() : "";
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid request." },
      { status: 400 },
    );
  }

  if (!email || !EMAIL_RE.test(email)) {
    return NextResponse.json(
      { ok: false, error: "Please enter a valid email address." },
      { status: 400 },
    );
  }

  // Forward the signup to OnConnect as a tagged contact. We deliberately still
  // return success to the visitor even if this fails — a CRM hiccup should never
  // block a signup — and log the address so nothing is ever lost.
  if (!ONBASE_API_KEY) {
    console.error(
      `[subscribe] ONBASE_API_KEY not set — signup not forwarded to OnConnect. Email: ${email}`,
    );
    return NextResponse.json({ ok: true });
  }

  try {
    const res = await fetch(`${ONBASE_API_URL}/api/v1/onconnect/contacts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${ONBASE_API_KEY}`,
      },
      body: JSON.stringify({ email, tags: [SIGNUP_TAG] }),
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      console.error(
        `[subscribe] OnConnect responded ${res.status} for ${email}: ${detail}`,
      );
    }
  } catch (err) {
    console.error(`[subscribe] OnConnect request failed for ${email}:`, err);
  }

  return NextResponse.json({ ok: true });
}
