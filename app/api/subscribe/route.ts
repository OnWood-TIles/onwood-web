import { NextResponse } from "next/server";

// Basic, permissive email shape check (the input[type=email] does the rest client-side).
const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

// OnBase / OnConnect integration. Set in Vercel (and .env.local for dev):
//   ONBASE_API_KEY    — API key from the OnWood OnBase tenant (Admin → API keys)
//   ONBASE_API_URL    — OnBase base URL (defaults to production)
//   ONBASE_SIGNUP_TAG — tag applied to every website signup (defaults to "Coming Soon")
const ONBASE_API_URL = process.env.ONBASE_API_URL || "https://onbasehq.com.au";
const ONBASE_API_KEY = process.env.ONBASE_API_KEY;
const SIGNUP_TAG = process.env.ONBASE_SIGNUP_TAG || "Coming Soon";

// Optional welcome email — DORMANT until OnWood's own Resend is set up.
// When ready: create a Resend account under admin@onwoodtiles.com.au, verify the
// onwoodtiles.com.au domain, then set these in Vercel:
//   RESEND_API_KEY  — the Resend API key
//   RESEND_FROM     — e.g. "OnWood Tiles <sales@onwoodtiles.com.au>"
// Until RESEND_API_KEY exists, the welcome email is simply skipped.
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const RESEND_FROM =
  process.env.RESEND_FROM || "OnWood Tiles <sales@onwoodtiles.com.au>";

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!,
  );
}

export async function POST(request: Request) {
  let email = "";
  let name = "";
  try {
    const body = (await request.json()) as { email?: unknown; name?: unknown };
    email = typeof body.email === "string" ? body.email.trim() : "";
    name = typeof body.name === "string" ? body.name.trim() : "";
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

  // Split "First Last" into first / last name for OnConnect.
  const parts = name.split(/\s+/).filter(Boolean);
  const firstName = parts[0] || undefined;
  const lastName = parts.length > 1 ? parts.slice(1).join(" ") : undefined;

  // 1) Add to OnConnect as a tagged contact. Fails-open — a CRM hiccup must never
  //    block a signup — and logs the address so nothing is lost.
  if (ONBASE_API_KEY) {
    try {
      const res = await fetch(`${ONBASE_API_URL}/api/v1/onconnect/contacts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${ONBASE_API_KEY}`,
        },
        body: JSON.stringify({ email, firstName, lastName, tags: [SIGNUP_TAG] }),
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
  } else {
    console.error(
      `[subscribe] ONBASE_API_KEY not set — signup not forwarded. Email: ${email}`,
    );
  }

  // 2) Send a welcome email — only once OnWood's Resend is configured. Fails-open.
  if (RESEND_API_KEY) {
    try {
      const r = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: RESEND_FROM,
          to: email,
          subject: "You're on the list — OnWood Tiles",
          html: welcomeEmailHtml(firstName),
        }),
      });
      if (!r.ok) {
        const detail = await r.text().catch(() => "");
        console.error(
          `[subscribe] Resend welcome failed ${r.status} for ${email}: ${detail}`,
        );
      }
    } catch (err) {
      console.error(`[subscribe] Resend welcome request failed for ${email}:`, err);
    }
  }

  return NextResponse.json({ ok: true });
}

function welcomeEmailHtml(firstName?: string): string {
  const hi = firstName ? `Hi ${escapeHtml(firstName)},` : "Hi there,";
  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8" /><meta name="viewport" content="width=device-width,initial-scale=1" /></head>
<body style="margin:0;padding:0;background:#0e1a20;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#0e1a20;padding:40px 16px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;width:100%;background:#fbfaf6;border-radius:20px;overflow:hidden;">
        <tr><td style="background:#20303a;padding:34px 40px;">
          <span style="font-size:20px;font-weight:800;letter-spacing:2px;color:#ffffff;">ONWOOD</span>
          <span style="font-size:13px;color:#4cb0c0;letter-spacing:1px;"> &nbsp;FLOORING &amp; TILES</span>
        </td></tr>
        <tr><td style="padding:40px;">
          <h1 style="margin:0 0 16px;font-size:24px;font-weight:800;color:#20303a;">${hi}</h1>
          <p style="margin:0 0 18px;font-size:16px;line-height:1.7;color:#3a4b54;">
            Thanks for signing up &mdash; you&rsquo;re officially on the list for <strong style="color:#d06a45;">first access</strong> to OnWood Tiles.
          </p>
          <p style="margin:0 0 18px;font-size:16px;line-height:1.7;color:#3a4b54;">
            We&rsquo;re building the Sunshine Coast&rsquo;s new home for all things tiles &mdash; a brand-new showroom and website. We&rsquo;ll be in touch the moment the doors open, and you&rsquo;ll be first to know.
          </p>
          <p style="margin:0;font-size:16px;line-height:1.7;color:#3a4b54;">Talk soon,<br /><strong style="color:#20303a;">The OnWood Tiles team</strong></p>
        </td></tr>
        <tr><td style="padding:22px 40px;border-top:1px solid #e6e2d8;">
          <p style="margin:0;font-size:12px;color:#8a959b;">
            2/11 Packer Road, Baringa &middot; <a href="mailto:sales@onwoodtiles.com.au" style="color:#1e7a8c;text-decoration:none;">sales@onwoodtiles.com.au</a>
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}
