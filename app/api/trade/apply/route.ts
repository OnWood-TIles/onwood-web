import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export const runtime = "nodejs";

// Trade-partner application. Emails the showroom the application details and adds
// the person to OnConnect (tagged "Trade Application"). Same consent rules as the
// other forms: captured either way, only subscribed to marketing if they tick the
// box (business addresses aren't exempt under the Spam Act). Fails open.
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
  let b: Record<string, unknown> = {};
  try { b = (await request.json()) as Record<string, unknown>; } catch { return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 }); }
  const str = (k: string) => (typeof b[k] === "string" ? (b[k] as string).trim() : "");
  const name = str("name"), email = str("email"), phone = str("phone");
  const businessName = str("businessName"), abn = str("abn"), tradeType = str("tradeType"), message = str("message");
  if (!name || !businessName || !EMAIL_RE.test(email)) {
    return NextResponse.json({ ok: false, error: "Please add your name, business name and a valid email." }, { status: 400 });
  }

  const parts = name.split(/\s+/).filter(Boolean);
  const firstName = parts[0] || undefined;
  const lastName = parts.length > 1 ? parts.slice(1).join(" ") : undefined;

  const marketingConsent = b.marketingConsent === true;
  const consentText = typeof b.consentText === "string" ? b.consentText : undefined;
  const consentIp = (request.headers.get("x-forwarded-for")?.split(",")[0] || request.headers.get("x-real-ip") || "").trim() || undefined;
  const tags = ["Trade Application", "Website Lead"];
  if (marketingConsent) tags.push("Marketing");

  let emailed = false;

  // 1) Notify the showroom (primary).
  if (ZOHO_PASS) {
    try {
      const t = nodemailer.createTransport({ host: ZOHO_HOST, port: ZOHO_PORT, secure: ZOHO_PORT === 465, auth: { user: ZOHO_USER, pass: ZOHO_PASS } });
      await t.sendMail({
        from: MAIL_FROM, to: SALES_TO, replyTo: email,
        subject: `Trade Partner application - ${businessName}`,
        html: `<h2 style="font-family:Arial,sans-serif">New Trade Partner application</h2>
<p><strong>Contact:</strong> ${esc(name)}</p>
<p><strong>Business:</strong> ${esc(businessName)}</p>
${abn ? `<p><strong>ABN:</strong> ${esc(abn)}</p>` : ""}
<p><strong>Email:</strong> ${esc(email)}</p>
${phone ? `<p><strong>Phone:</strong> ${esc(phone)}</p>` : ""}
${tradeType ? `<p><strong>Trade:</strong> ${esc(tradeType)}</p>` : ""}
${message ? `<p><strong>Message:</strong><br>${esc(message).replace(/\n/g, "<br>")}</p>` : ""}
<p style="color:#8a959b;font-size:13px">Marketing consent: ${marketingConsent ? "GIVEN" : "not given"}.</p>`,
      });
      emailed = true;
    } catch (err) { console.error(`[trade-apply] email failed for ${email}:`, err); }
  }

  // 2) OnConnect contact (fail-open).
  if (ONBASE_API_KEY) {
    try {
      const res = await fetch(`${ONBASE_API_URL}/api/v1/onconnect/contacts`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${ONBASE_API_KEY}` },
        body: JSON.stringify({ email, firstName, lastName, phone: phone || undefined, businessName, tags, marketingConsent, consentText, consentSource: "Trade Partner application (onwoodtiles.com.au/trade/apply)", consentIp }),
      });
      if (!res.ok) console.error(`[trade-apply] OnConnect ${res.status} for ${email}: ${await res.text().catch(() => "")}`);
    } catch (err) { console.error(`[trade-apply] OnConnect failed for ${email}:`, err); }
  }

  // Customer acknowledgement (best-effort).
  if (ZOHO_PASS) {
    try {
      const t = nodemailer.createTransport({ host: ZOHO_HOST, port: ZOHO_PORT, secure: ZOHO_PORT === 465, auth: { user: ZOHO_USER, pass: ZOHO_PASS } });
      await t.sendMail({
        from: MAIL_FROM, to: email, subject: "We've received your trade application - OnWood Tiles",
        html: `<div style="font-family:Arial,sans-serif;font-size:15px;line-height:1.7;color:#20303a">
<p>Hi ${esc(firstName || "there")},</p>
<p>Thanks for applying for a Trade Partner account with OnWood Tiles. We've received your details for <strong>${esc(businessName)}</strong> and one of the team will be in touch shortly to get you set up.</p>
<p>Any questions in the meantime, just reply to this email or call the Baringa showroom.</p>
<p>The OnWood Tiles team</p></div>`,
      });
    } catch (err) { console.error(`[trade-apply] ack email failed for ${email}:`, err); }
  }

  if (!emailed && !ONBASE_API_KEY) {
    return NextResponse.json({ ok: false, error: "Sorry, we couldn't send that. Please email sales@onwoodtiles.com.au." }, { status: 502 });
  }
  return NextResponse.json({ ok: true });
}
