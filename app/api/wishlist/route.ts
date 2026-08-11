import { NextResponse } from "next/server";
import { checkRateLimit, RL_FORM } from "../../../lib/rateLimit";
import nodemailer from "nodemailer";

export const runtime = "nodejs";

// "Email me my saved selections" lead capture. Same shape as /api/calculator:
// add to OnConnect (tagged), email the customer their board, notify the
// showroom. Fails open.
const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const ONBASE_API_URL = process.env.ONBASE_API_URL || "https://onbasehq.com.au";
const ONBASE_API_KEY = process.env.ONBASE_API_KEY;

const ZOHO_SMTP_USER = process.env.ZOHO_SMTP_USER || "sales@onwoodtiles.com.au";
const ZOHO_SMTP_PASS = process.env.ZOHO_SMTP_PASS;
const ZOHO_SMTP_HOST = process.env.ZOHO_SMTP_HOST || "smtp.zoho.com.au";
const ZOHO_SMTP_PORT = Number(process.env.ZOHO_SMTP_PORT) || 465;
const MAIL_FROM = process.env.MAIL_FROM || `OnWood Tiles <${ZOHO_SMTP_USER}>`;
const SITE = "https://onwoodtiles.com.au";

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

type Item = { name: string; colour?: string; href: string };

export async function POST(request: Request) {
  const rl = checkRateLimit(request, "wishlist", RL_FORM);
  if (rl) return rl;

  let b: Record<string, unknown> = {};
  try { b = (await request.json()) as Record<string, unknown>; } catch { return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 }); }

  // honeypot: bots fill hidden fields; pretend success + drop
  if (typeof b.company === "string" && b.company.trim() !== "") {
    return NextResponse.json({ ok: true });
  }

  const email = typeof b.email === "string" ? b.email.trim() : "";
  if (!email || !EMAIL_RE.test(email)) return NextResponse.json({ ok: false, error: "Please enter a valid email address." }, { status: 400 });

  const name = typeof b.name === "string" ? b.name.trim() : "";
  const phone = typeof b.phone === "string" ? b.phone.trim() : "";
  const items: Item[] = Array.isArray(b.items)
    ? (b.items as unknown[])
        .filter((x): x is Item => !!x && typeof x === "object" && typeof (x as Item).name === "string" && typeof (x as Item).href === "string")
        .slice(0, 60)
        .map((x) => ({ name: x.name, colour: typeof x.colour === "string" ? x.colour : undefined, href: x.href }))
    : [];

  const parts = name.split(/\s+/).filter(Boolean);
  const firstName = parts[0] || undefined;
  const lastName = parts.length > 1 ? parts.slice(1).join(" ") : undefined;

  const marketingConsent = b.marketingConsent === true;
  const consentText = typeof b.consentText === "string" ? b.consentText : undefined;
  const consentIp = (request.headers.get("x-forwarded-for")?.split(",")[0] || request.headers.get("x-real-ip") || "").trim() || undefined;

  const tags = ["Saved Board", "Website Lead"];
  if (marketingConsent) tags.push("Marketing");

  if (ONBASE_API_KEY) {
    try {
      const res = await fetch(`${ONBASE_API_URL}/api/v1/onconnect/contacts`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${ONBASE_API_KEY}` },
        body: JSON.stringify({ email, firstName, lastName, phone: phone || undefined, tags, marketingConsent, consentText, consentSource: "Saved tiles / wishlist (onwoodtiles.com.au/saved)", consentIp }),
      });
      if (!res.ok) console.error(`[wishlist] OnConnect ${res.status} for ${email}: ${await res.text().catch(() => "")}`);
    } catch (err) { console.error(`[wishlist] OnConnect failed for ${email}:`, err); }
  } else {
    console.error(`[wishlist] ONBASE_API_KEY not set — lead not forwarded. Email: ${email}`);
  }

  if (ZOHO_SMTP_PASS) {
    try {
      const t = nodemailer.createTransport({ host: ZOHO_SMTP_HOST, port: ZOHO_SMTP_PORT, secure: ZOHO_SMTP_PORT === 465, auth: { user: ZOHO_SMTP_USER, pass: ZOHO_SMTP_PASS } });
      const list = items.map((i) => `<li style="margin:0 0 6px">${esc(i.name)}${i.colour ? ` <span style="color:#8a959b">- ${esc(i.colour)}</span>` : ""} &nbsp;<a href="${SITE}${esc(i.href)}" style="color:#1e7a8c;text-decoration:none">view</a></li>`).join("");
      await t.sendMail({ from: MAIL_FROM, to: email, subject: "Your saved tiles - OnWood Tiles", html: boardHtml(firstName, list, items.length) });
      await t.sendMail({
        from: MAIL_FROM, to: ZOHO_SMTP_USER, subject: `Saved-tiles lead: ${name || email} (${items.length})`,
        html: `<div style="font-family:sans-serif;font-size:14px;line-height:1.6;color:#20303a">
          <h2 style="margin:0 0 8px">New saved-tiles lead</h2>
          <p style="margin:0 0 8px"><strong>${esc(name || "(no name)")}</strong> &middot; ${esc(email)}${phone ? " &middot; " + esc(phone) : ""}</p>
          <ul style="margin:8px 0;padding-left:18px">${list || "<li>(none)</li>"}</ul>
          <p style="margin:8px 0 0;color:#8a959b">Tags: ${esc(tags.join(", "))}</p></div>`,
      });
    } catch (err) { console.error(`[wishlist] email failed for ${email}:`, err); }
  }

  return NextResponse.json({ ok: true });
}

function boardHtml(firstName: string | undefined, list: string, count: number): string {
  const hi = firstName ? `Hi ${esc(firstName)},` : "Hi there,";
  return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#0e1a20;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#0e1a20;padding:40px 16px;"><tr><td align="center">
    <table width="560" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;width:100%;background:#fbfaf6;border-radius:20px;overflow:hidden;">
      <tr><td style="background:#20303a;padding:26px 40px;"><img src="${SITE}/onwood-logo-white.png" alt="OnWood Tiles" width="131" height="48" style="display:block;border:0;width:131px;height:48px;"/></td></tr>
      <tr><td style="padding:36px 40px 6px;">
        <h1 style="margin:0 0 14px;font-size:23px;font-weight:800;color:#20303a;">${hi}</h1>
        <p style="margin:0 0 6px;font-size:16px;line-height:1.7;color:#3a4b54;">Here ${count === 1 ? "is the tile" : `are the ${count} tiles`} you saved:</p>
        <ul style="margin:12px 0 0;padding-left:18px;font-size:15px;line-height:1.7;color:#20303a;">${list}</ul>
        <p style="margin:16px 0 0;font-size:13.5px;line-height:1.6;color:#8a959b;">Bring these to our Baringa showroom and we will help you match quantities, finishes and the rest of the room.</p>
      </td></tr>
      <tr><td style="padding:16px 40px 34px;"><a href="${SITE}/book" style="display:inline-block;background:#d06a45;color:#fff;font-weight:800;font-size:15px;text-decoration:none;padding:13px 26px;border-radius:999px;">Book a showroom visit</a></td></tr>
      <tr><td style="padding:20px 40px;border-top:1px solid #e6e2d8;"><p style="margin:0;font-size:12px;color:#8a959b;">2/11 Packer Road, Baringa &middot; <a href="mailto:sales@onwoodtiles.com.au" style="color:#1e7a8c;text-decoration:none;">sales@onwoodtiles.com.au</a></p></td></tr>
    </table>
  </td></tr></table>
</body></html>`;
}
