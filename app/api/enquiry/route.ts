import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

// Contact-form handler. Unlike signups, an enquiry must NEVER be silently lost
// (red-team B9): we DOUBLE-WRITE - email the enquiry to the shop inbox (the
// reliable backstop) AND add the person to OnConnect. We only return an error
// if BOTH channels fail, so the visitor knows to call instead.
export const runtime = "nodejs";

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

const ONBASE_API_URL = process.env.ONBASE_API_URL || "https://onbasehq.com.au";
const ONBASE_API_KEY = process.env.ONBASE_API_KEY;
const ENQUIRY_TAG = process.env.ONBASE_ENQUIRY_TAG || "Website Enquiry";

const ZOHO_USER = process.env.ZOHO_SMTP_USER || "sales@onwoodtiles.com.au";
const ZOHO_PASS = process.env.ZOHO_SMTP_PASS;
const ZOHO_HOST = process.env.ZOHO_SMTP_HOST || "smtp.zoho.com.au";
const ZOHO_PORT = Number(process.env.ZOHO_SMTP_PORT) || 465;
const MAIL_FROM = process.env.MAIL_FROM || `OnWood Tiles <${ZOHO_USER}>`;
const ENQUIRY_TO = process.env.ENQUIRY_TO || "sales@onwoodtiles.com.au";

function esc(s: string): string {
  return s.replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ]!,
  );
}

export async function POST(request: Request) {
  let name = "",
    email = "",
    phone = "",
    message = "";
  try {
    const b = (await request.json()) as Record<string, unknown>;
    name = typeof b.name === "string" ? b.name.trim() : "";
    email = typeof b.email === "string" ? b.email.trim() : "";
    phone = typeof b.phone === "string" ? b.phone.trim() : "";
    message = typeof b.message === "string" ? b.message.trim() : "";
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  if (!name || !email || !EMAIL_RE.test(email) || !message) {
    return NextResponse.json(
      { ok: false, error: "Please add your name, a valid email, and a message." },
      { status: 400 },
    );
  }

  const parts = name.split(/\s+/).filter(Boolean);
  const firstName = parts[0] || undefined;
  const lastName = parts.length > 1 ? parts.slice(1).join(" ") : undefined;

  let emailed = false;
  let crmed = false;

  // 1) Email the shop inbox (primary, reliable backstop).
  if (ZOHO_PASS) {
    try {
      const transporter = nodemailer.createTransport({
        host: ZOHO_HOST,
        port: ZOHO_PORT,
        secure: ZOHO_PORT === 465,
        auth: { user: ZOHO_USER, pass: ZOHO_PASS },
      });
      await transporter.sendMail({
        from: MAIL_FROM,
        to: ENQUIRY_TO,
        replyTo: email,
        subject: `Website enquiry - ${name}`,
        html: `<h2>New website enquiry</h2>
<p><strong>Name:</strong> ${esc(name)}</p>
<p><strong>Email:</strong> ${esc(email)}</p>
${phone ? `<p><strong>Phone:</strong> ${esc(phone)}</p>` : ""}
<p><strong>Message:</strong></p>
<p>${esc(message).replace(/\n/g, "<br>")}</p>`,
      });
      emailed = true;
    } catch (err) {
      console.error(`[enquiry] email failed for ${email}:`, err);
    }
  }

  // 2) Add to OnConnect (secondary; fails-open).
  if (ONBASE_API_KEY) {
    try {
      const res = await fetch(`${ONBASE_API_URL}/api/v1/onconnect/contacts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${ONBASE_API_KEY}`,
        },
        body: JSON.stringify({ email, firstName, lastName, phone, tags: [ENQUIRY_TAG] }),
      });
      crmed = res.ok;
      if (!res.ok) {
        console.error(`[enquiry] OnConnect ${res.status} for ${email}`);
      }
    } catch (err) {
      console.error(`[enquiry] OnConnect failed for ${email}:`, err);
    }
  }

  if (!emailed && !crmed) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Sorry - we could not send that just now. Please call us or email sales@onwoodtiles.com.au.",
      },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true });
}
