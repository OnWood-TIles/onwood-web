import { NextResponse } from "next/server";
import { checkRateLimit, RL_FORM } from "../../../lib/rateLimit";
import nodemailer from "nodemailer";

export const runtime = "nodejs";

// Showroom "notify me when you open" + trade-partner early-access capture. Adds the
// person to OnConnect (tagged so you can work the list on opening day) and emails the
// shop. Same consent rules as the other forms: captured either way, only marketed to
// if they tick the box. Fails open — a CRM/mail hiccup must never lose a lead.
const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const ONBASE_API_URL = process.env.ONBASE_API_URL || "https://onbasehq.com.au";
const ONBASE_API_KEY = process.env.ONBASE_API_KEY;
const ZOHO_USER = process.env.ZOHO_SMTP_USER || "sales@onwoodtiles.com.au";
const ZOHO_PASS = process.env.ZOHO_SMTP_PASS;
const ZOHO_HOST = process.env.ZOHO_SMTP_HOST || "smtp.zoho.com.au";
const ZOHO_PORT = Number(process.env.ZOHO_SMTP_PORT) || 465;
const MAIL_FROM = process.env.MAIL_FROM || `OnWood Tiles <${ZOHO_USER}>`;
const SALES_TO = process.env.ENQUIRY_TO || "sales@onwoodtiles.com.au";

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

export async function POST(request: Request) {
  const rl = checkRateLimit(request, "showroom", RL_FORM);
  if (rl) return rl;

  let b: Record<string, unknown> = {};
  try { b = (await request.json()) as Record<string, unknown>; } catch { return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 }); }
  // honeypot
  if (typeof b.company === "string" && b.company.trim() !== "") return NextResponse.json({ ok: true });

  const str = (k: string) => (typeof b[k] === "string" ? (b[k] as string).trim() : "");
  const name = str("name"), email = str("email"), phone = str("phone"), businessName = str("businessName");
  const trade = b.trade === true;
  if (!name || !EMAIL_RE.test(email)) {
    return NextResponse.json({ ok: false, error: "Please add your name and a valid email." }, { status: 400 });
  }

  const parts = name.split(/\s+/).filter(Boolean);
  const firstName = parts[0] || undefined;
  const lastName = parts.length > 1 ? parts.slice(1).join(" ") : undefined;

  const marketingConsent = b.marketingConsent === true;
  const consentText = typeof b.consentText === "string" ? b.consentText : undefined;
  const consentIp = (request.headers.get("x-forwarded-for")?.split(",")[0] || request.headers.get("x-real-ip") || "").trim() || undefined;
  const tags = ["Showroom Interest", "Website Lead"];
  if (trade) tags.push("Trade Partner Early Access");
  if (marketingConsent) tags.push("Marketing");

  // 1) OnConnect contact (primary — this is the whole point: build the opening-day list).
  if (ONBASE_API_KEY) {
    try {
      const res = await fetch(`${ONBASE_API_URL}/api/v1/onconnect/contacts`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${ONBASE_API_KEY}` },
        body: JSON.stringify({ email, firstName, lastName, phone: phone || undefined, businessName: businessName || undefined, tags, marketingConsent, consentText, consentSource: "Showroom interest (onwoodtiles.com.au/showroom)", consentIp }),
      });
      if (!res.ok) console.error(`[showroom] OnConnect ${res.status} for ${email}: ${await res.text().catch(() => "")}`);
    } catch (err) { console.error(`[showroom] OnConnect failed for ${email}:`, err); }
  } else {
    console.error(`[showroom] ONBASE_API_KEY not set — lead not forwarded. Email: ${email}`);
  }

  // 2) Notify the shop (best-effort).
  if (ZOHO_PASS) {
    try {
      const t = nodemailer.createTransport({ host: ZOHO_HOST, port: ZOHO_PORT, secure: ZOHO_PORT === 465, auth: { user: ZOHO_USER, pass: ZOHO_PASS } });
      await t.sendMail({
        from: MAIL_FROM, to: SALES_TO, replyTo: email,
        subject: trade ? `Showroom + TRADE early access - ${name}` : `Showroom interest - ${name}`,
        html: `<h2 style="font-family:Arial,sans-serif">${trade ? "New showroom + trade early-access interest" : "New showroom interest"}</h2>
<p><strong>Name:</strong> ${esc(name)}</p>
<p><strong>Email:</strong> ${esc(email)}</p>
${phone ? `<p><strong>Phone:</strong> ${esc(phone)}</p>` : ""}
${trade ? `<p><strong>Trade Partner early access:</strong> YES${businessName ? ` — ${esc(businessName)}` : ""}</p>` : ""}
<p style="color:#8a959b;font-size:13px">Tags: ${esc(tags.join(", "))}. Marketing consent: ${marketingConsent ? "GIVEN" : "not given"}.</p>`,
      });
    } catch (err) { console.error(`[showroom] shop email failed for ${email}:`, err); }
  }

  // 3) Customer acknowledgement (best-effort).
  if (ZOHO_PASS) {
    try {
      const t = nodemailer.createTransport({ host: ZOHO_HOST, port: ZOHO_PORT, secure: ZOHO_PORT === 465, auth: { user: ZOHO_USER, pass: ZOHO_PASS } });
      await t.sendMail({
        from: MAIL_FROM, to: email, subject: "You're on the list - OnWood Tiles showroom",
        html: `<div style="font-family:Arial,sans-serif;font-size:15px;line-height:1.7;color:#20303a">
<p>Hi ${esc(firstName || "there")},</p>
<p>Thanks for registering your interest in the new OnWood Tiles showroom on the Sunshine Coast. You&rsquo;re on the list, and we&rsquo;ll email you the moment the doors open.</p>
${trade ? "<p>We&rsquo;ve also noted your interest in becoming a <strong>Trade Partner</strong> — the team will reach out about early access and trade pricing.</p>" : ""}
<p>In the meantime you can shop the full range online anytime at <a href="https://onwoodtiles.com.au/shop" style="color:#d06a45;text-decoration:none;">onwoodtiles.com.au</a>.</p>
<p>Talk soon,<br/>The OnWood Tiles team</p></div>`,
      });
    } catch (err) { console.error(`[showroom] ack email failed for ${email}:`, err); }
  }

  return NextResponse.json({ ok: true });
}
