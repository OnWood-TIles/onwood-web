import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export const runtime = "nodejs";

// Tile-calculator lead capture. Mirrors /api/subscribe: add the person to
// OnConnect (tagged with bucketed project context so the list is segmentable),
// email them their estimate, and notify the showroom. Everything fails open -
// a CRM/mail hiccup must never lose the lead or error the user.
const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const ONBASE_API_URL = process.env.ONBASE_API_URL || "https://onbasehq.com.au";
const ONBASE_API_KEY = process.env.ONBASE_API_KEY;

const ZOHO_SMTP_USER = process.env.ZOHO_SMTP_USER || "sales@onwoodtiles.com.au";
const ZOHO_SMTP_PASS = process.env.ZOHO_SMTP_PASS;
const ZOHO_SMTP_HOST = process.env.ZOHO_SMTP_HOST || "smtp.zoho.com.au";
const ZOHO_SMTP_PORT = Number(process.env.ZOHO_SMTP_PORT) || 465;
const MAIL_FROM = process.env.MAIL_FROM || `OnWood Tiles <${ZOHO_SMTP_USER}>`;

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
const money = (n: number) => n.toLocaleString("en-AU", { minimumFractionDigits: 0, maximumFractionDigits: 0 });

export async function POST(request: Request) {
  let b: Record<string, unknown> = {};
  try { b = (await request.json()) as Record<string, unknown>; } catch { return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 }); }

  const email = typeof b.email === "string" ? b.email.trim() : "";
  if (!email || !EMAIL_RE.test(email)) return NextResponse.json({ ok: false, error: "Please enter a valid email address." }, { status: 400 });

  const name = typeof b.name === "string" ? b.name.trim() : "";
  const phone = typeof b.phone === "string" ? b.phone.trim() : "";
  const roomType = typeof b.roomType === "string" ? b.roomType.trim() : "";
  const totalArea = typeof b.totalArea === "number" ? b.totalArea : 0;
  const wastage = typeof b.wastage === "number" ? b.wastage : 10;
  const toOrder = typeof b.toOrder === "number" ? b.toOrder : 0;
  const boxes = typeof b.boxes === "number" ? b.boxes : null;
  const cost = typeof b.cost === "number" ? b.cost : null;

  const parts = name.split(/\s+/).filter(Boolean);
  const firstName = parts[0] || undefined;
  const lastName = parts.length > 1 ? parts.slice(1).join(" ") : undefined;

  // Marketing consent (express, from the unticked checkbox) + audit data.
  const marketingConsent = b.marketingConsent === true;
  const consentText = typeof b.consentText === "string" ? b.consentText : undefined;
  const consentIp = (request.headers.get("x-forwarded-for")?.split(",")[0] || request.headers.get("x-real-ip") || "").trim() || undefined;

  // Everyone is captured (fail-open); only consenters get "Marketing" + a subscribed
  // status. OnConnect defaults new contacts to unsubscribed unless marketingConsent.
  const tags = ["Tile Calculator", "Website Lead"];
  if (marketingConsent) tags.push("Marketing");

  // 1) OnConnect contact (fail-open).
  if (ONBASE_API_KEY) {
    try {
      const res = await fetch(`${ONBASE_API_URL}/api/v1/onconnect/contacts`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${ONBASE_API_KEY}` },
        body: JSON.stringify({ email, firstName, lastName, phone: phone || undefined, tags, marketingConsent, consentText, consentSource: "Tile Calculator (onwoodtiles.com.au/calculator)", consentIp }),
      });
      if (!res.ok) console.error(`[calculator] OnConnect ${res.status} for ${email}: ${await res.text().catch(() => "")}`);
    } catch (err) { console.error(`[calculator] OnConnect failed for ${email}:`, err); }
  } else {
    console.error(`[calculator] ONBASE_API_KEY not set — lead not forwarded. Email: ${email}`);
  }

  // 2) Emails (fail-open; dormant until ZOHO_SMTP_PASS is set).
  if (ZOHO_SMTP_PASS) {
    try {
      const t = nodemailer.createTransport({ host: ZOHO_SMTP_HOST, port: ZOHO_SMTP_PORT, secure: ZOHO_SMTP_PORT === 465, auth: { user: ZOHO_SMTP_USER, pass: ZOHO_SMTP_PASS } });
      const lines: [string, string][] = [
        ["Total area", `${totalArea.toFixed(2)} m²`],
        [`With ${wastage}% wastage`, `${toOrder.toFixed(2)} m²`],
        ...(boxes != null ? ([["Boxes to order", `${boxes}`]] as [string, string][]) : []),
        ...(cost != null ? ([["Rough supply cost", `$${money(cost)}`]] as [string, string][]) : []),
      ];
      // Customer estimate
      await t.sendMail({ from: MAIL_FROM, to: email, subject: "Your tile estimate - OnWood Tiles", html: estimateHtml(firstName, lines, roomType) });
      // Showroom lead notification
      await t.sendMail({
        from: MAIL_FROM, to: ZOHO_SMTP_USER, subject: `Tile calculator lead: ${name || email}`,
        html: `<div style="font-family:sans-serif;font-size:14px;line-height:1.6;color:#20303a">
          <h2 style="margin:0 0 8px">New tile-calculator lead</h2>
          <p style="margin:0 0 4px"><strong>${esc(name || "(no name)")}</strong> &middot; ${esc(email)}${phone ? " &middot; " + esc(phone) : ""}</p>
          ${roomType ? `<p style="margin:0 0 8px">Tiling: ${esc(roomType)}</p>` : ""}
          <ul style="margin:8px 0;padding-left:18px">${lines.map(([k, v]) => `<li>${esc(k)}: <strong>${esc(v)}</strong></li>`).join("")}</ul>
          <p style="margin:8px 0 0;color:#8a959b">Tags: ${esc(tags.join(", "))}</p></div>`,
      });
    } catch (err) { console.error(`[calculator] email failed for ${email}:`, err); }
  }

  return NextResponse.json({ ok: true });
}

function estimateHtml(firstName: string | undefined, lines: [string, string][], roomType: string): string {
  const hi = firstName ? `Hi ${esc(firstName)},` : "Hi there,";
  const rows = lines.map(([k, v], i) => `<tr><td style="padding:10px 0;${i ? "border-top:1px solid #e6e2d8;" : ""}font-size:15px;color:#3a4b54">${esc(k)}</td><td style="padding:10px 0;${i ? "border-top:1px solid #e6e2d8;" : ""}font-size:15px;font-weight:800;color:#20303a;text-align:right">${esc(v)}</td></tr>`).join("");
  return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#0e1a20;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#0e1a20;padding:40px 16px;"><tr><td align="center">
    <table width="560" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;width:100%;background:#fbfaf6;border-radius:20px;overflow:hidden;">
      <tr><td style="background:#20303a;padding:26px 40px;"><img src="https://onwoodtiles.com.au/onwood-logo-white.png" alt="OnWood Tiles" width="131" height="48" style="display:block;border:0;width:131px;height:48px;"/></td></tr>
      <tr><td style="padding:36px 40px 10px;">
        <h1 style="margin:0 0 14px;font-size:23px;font-weight:800;color:#20303a;">${hi}</h1>
        <p style="margin:0 0 6px;font-size:16px;line-height:1.7;color:#3a4b54;">Here is your tile estimate${roomType ? ` for your ${esc(roomType.toLowerCase())}` : ""}:</p>
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:14px 0 4px;">${rows}</table>
        <p style="margin:16px 0 0;font-size:13.5px;line-height:1.6;color:#8a959b;">This is an estimate to get you close. Bring your plans to our Baringa showroom and we will confirm the exact quantity, box multiples and price for your chosen tile.</p>
      </td></tr>
      <tr><td style="padding:16px 40px 34px;">
        <a href="https://onwoodtiles.com.au/shop" style="display:inline-block;background:#d06a45;color:#fff;font-weight:800;font-size:15px;text-decoration:none;padding:13px 26px;border-radius:999px;">Browse the range</a>
      </td></tr>
      <tr><td style="padding:20px 40px;border-top:1px solid #e6e2d8;"><p style="margin:0;font-size:12px;color:#8a959b;">2/11 Packer Road, Baringa &middot; <a href="mailto:sales@onwoodtiles.com.au" style="color:#1e7a8c;text-decoration:none;">sales@onwoodtiles.com.au</a></p></td></tr>
    </table>
  </td></tr></table>
</body></html>`;
}
