import { NextResponse } from "next/server";

// Basic, permissive email shape check (the input[type=email] does the rest client-side).
const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

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

  // TODO: wire this to a real destination before launch. Options:
  //   • Mailchimp / Klaviyo audience (POST to their members API with a server-side key)
  //   • Resend audiences / a broadcast list
  //   • A Postgres table (Payload CMS "Subscribers" collection) once the CMS is set up
  //   • A Google Sheet via a service-account webhook
  // Keep the provider key in an env var (e.g. process.env.MAILCHIMP_API_KEY) — never client-side.
  // For now we just log it so nothing is lost during pre-launch testing.
  console.log(`[subscribe] ${email}`);

  return NextResponse.json({ ok: true });
}
