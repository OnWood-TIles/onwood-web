import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Book-a-Visit submission: emails a professional notification to sales@, sends
// the customer a designed confirmation email, and records the visit on the
// OnBase calendar. Each channel fails-open; we only error if everything fails.
const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const ONBASE_API_URL = process.env.ONBASE_API_URL || "https://onbasehq.com.au";
const ONBASE_API_KEY = process.env.ONBASE_API_KEY;
const ZOHO_USER = process.env.ZOHO_SMTP_USER || "sales@onwoodtiles.com.au";
const ZOHO_PASS = process.env.ZOHO_SMTP_PASS;
const ZOHO_HOST = process.env.ZOHO_SMTP_HOST || "smtp.zoho.com.au";
const ZOHO_PORT = Number(process.env.ZOHO_SMTP_PORT) || 465;
const MAIL_FROM = process.env.MAIL_FROM || `OnWood Tiles <${ZOHO_USER}>`;
const SALES_TO = process.env.ENQUIRY_TO || "sales@onwoodtiles.com.au";
const ADDRESS = process.env.SHOWROOM_ADDRESS || "2/11 Packer Rd, Baringa QLD 4551";
const SHOP_PHONE = process.env.SHOWROOM_PHONE || "";

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

function customerHtml(o: { first: string; purpose: string; when: string; address: string; phone: string }): string {
  const lbl = "font-family:'Courier New',monospace;font-size:10px;letter-spacing:.1em;color:#86A6AC";
  const row = (l: string, v: string, last = false) =>
    `<tr><td style="padding:14px 18px;${last ? "" : "border-bottom:1px solid #F3EEE3"}"><span style="${lbl}">${l}</span><div style="font-size:15px;font-weight:700;margin-top:3px;color:#20303A">${v}</div></td></tr>`;
  return `<div style="background:#F6F1E8;padding:32px 16px;font-family:Arial,Helvetica,sans-serif;color:#20303A">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;margin:0 auto">
    <tr><td style="background:#20303A;border-radius:20px 20px 0 0;padding:26px 30px;color:#F6F1E8">
      <span style="font-weight:800;letter-spacing:.14em;font-size:14px">ONWOOD TILES</span>
      <div style="font-family:'Courier New',monospace;font-size:10px;letter-spacing:.2em;color:#86A6AC;margin-top:16px">BOOKING CONFIRMED</div>
      <div style="font-size:26px;font-weight:800;margin-top:6px;letter-spacing:-.01em">See you soon, ${esc(o.first)}.</div>
    </td></tr>
    <tr><td style="background:#ffffff;padding:26px 30px">
      <p style="margin:0 0 20px;font-size:15px;line-height:1.6;color:#3a4750">Thanks for booking a visit to our Baringa showroom - it's locked in, and we'll have the space ready for you with over 400 tiles on display.</p>
      <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #EDE6D8;border-radius:14px">
        ${row("VISIT", esc(o.purpose))}
        ${row("WHEN", esc(o.when))}
        ${row("WHERE", esc(o.address), true)}
      </table>
      <div style="margin-top:22px;padding:16px 18px;background:#F6F1E8;border-radius:12px;font-size:13.5px;line-height:1.6;color:#3a4750">
        Need to change it? Just reply to this email${o.phone ? ` or call us on ${esc(o.phone)}` : ""} - rescheduling is easy, no clock on good design.
      </div>
      <p style="margin:22px 0 0;font-size:14px;line-height:1.6;color:#3a4750">See you soon,<br><strong>The OnWood Tiles team</strong></p>
    </td></tr>
    <tr><td style="padding:18px 30px;text-align:center;font-family:'Courier New',monospace;font-size:10px;letter-spacing:.1em;color:#86A6AC">
      ONWOOD TILES &nbsp;·&nbsp; ${esc(o.address)}${o.phone ? ` &nbsp;·&nbsp; ${esc(o.phone)}` : ""}
    </td></tr>
  </table>
</div>`;
}

export async function POST(request: Request) {
  let b: Record<string, unknown>;
  try { b = (await request.json()) as Record<string, unknown>; } catch { return NextResponse.json({ ok: false, error: "Invalid request" }, { status: 400 }); }
  const str = (k: string) => (typeof b[k] === "string" ? (b[k] as string).trim() : "");
  const name = str("name"), email = str("email"), phone = str("phone"), purpose = str("purpose") || "Showroom visit";
  const when = str("when"), notes = str("notes"), startISO = str("startISO"), endISO = str("endISO");
  if (!name || !EMAIL_RE.test(email) || !when) return NextResponse.json({ ok: false, error: "Missing details" }, { status: 400 });
  const first = name.split(/\s+/)[0] || "there";

  let salesOk = false, custOk = false, calOk = false;

  if (ZOHO_PASS) {
    const t = nodemailer.createTransport({ host: ZOHO_HOST, port: ZOHO_PORT, secure: ZOHO_PORT === 465, auth: { user: ZOHO_USER, pass: ZOHO_PASS } });
    // 1) sales notification
    try {
      await t.sendMail({
        from: MAIL_FROM, to: SALES_TO, replyTo: email,
        subject: `Showroom booking - ${name} (${when})`,
        html: `<h2 style="font-family:Arial,sans-serif">New showroom booking</h2>
<p><strong>Name:</strong> ${esc(name)}</p>
<p><strong>Email:</strong> ${esc(email)}</p>
${phone ? `<p><strong>Phone:</strong> ${esc(phone)}</p>` : ""}
<p><strong>Purpose:</strong> ${esc(purpose)}</p>
<p><strong>When:</strong> ${esc(when)}</p>
${notes ? `<p><strong>Notes:</strong> ${esc(notes).replace(/\n/g, "<br>")}</p>` : ""}`,
      });
      salesOk = true;
    } catch (e) { console.error("[book] sales email failed:", e); }
    // 2) customer confirmation
    try {
      await t.sendMail({ from: MAIL_FROM, to: email, replyTo: SALES_TO, subject: "Your OnWood Tiles showroom visit is confirmed", html: customerHtml({ first, purpose, when, address: ADDRESS, phone: SHOP_PHONE }) });
      custOk = true;
    } catch (e) { console.error("[book] customer email failed:", e); }
  }

  // 3) OnBase calendar event
  if (ONBASE_API_KEY && startISO) {
    try {
      const res = await fetch(`${ONBASE_API_URL}/api/v1/bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${ONBASE_API_KEY}` },
        body: JSON.stringify({ name, email, phone, purpose, startISO, endISO, notes }),
      });
      calOk = res.ok;
      if (!res.ok) console.error("[book] calendar", res.status);
    } catch (e) { console.error("[book] calendar failed:", e); }
  }

  if (!salesOk && !custOk && !calOk) {
    return NextResponse.json({ ok: false, error: "Sorry - we couldn't record that just now. Please call us or email sales@onwoodtiles.com.au." }, { status: 502 });
  }
  return NextResponse.json({ ok: true });
}
