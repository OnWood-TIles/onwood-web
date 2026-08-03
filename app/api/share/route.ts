import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import {
  composeBoardImage,
  buildMoodboardPdf,
  type SharePayload,
  type SharePiece,
} from "../../../lib/moodboard";

// PDF compose + SMTP send + OnBase/OnConnect calls all need the Node runtime, and
// image fetching can take a few seconds, so give it headroom.
export const runtime = "nodejs";
export const maxDuration = 60;
export const dynamic = "force-dynamic";

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

// OnBase / OnConnect (same tenant + key as the coming-soon signup form).
const ONBASE_API_URL = process.env.ONBASE_API_URL || "https://onbasehq.com.au";
const ONBASE_API_KEY = process.env.ONBASE_API_KEY;
const VISION_TAG = process.env.ONBASE_VISION_TAG || "Vision Board";
const ONBASE_NOTE = "Customer created a Vision Board on the website.";

// Zoho SMTP (same mailbox as the welcome email).
const ZOHO_SMTP_USER = process.env.ZOHO_SMTP_USER || "sales@onwoodtiles.com.au";
const ZOHO_SMTP_PASS = process.env.ZOHO_SMTP_PASS;
const ZOHO_SMTP_HOST = process.env.ZOHO_SMTP_HOST || "smtp.zoho.com.au";
const ZOHO_SMTP_PORT = Number(process.env.ZOHO_SMTP_PORT) || 465;
const MAIL_FROM = process.env.MAIL_FROM || `OnWood Tiles <${ZOHO_SMTP_USER}>`;
const SALES_EMAIL = process.env.SALES_EMAIL || "sales@onwoodtiles.com.au";

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!,
  );
}

const str = (v: unknown, max = 200) =>
  (typeof v === "string" ? v : "").trim().slice(0, max);
const num = (v: unknown) => (typeof v === "number" && isFinite(v) ? v : 0);

export async function POST(request: Request) {
  // --- parse + validate --------------------------------------------------
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  const c = (body.customer ?? {}) as Record<string, unknown>;
  const name = str(c.name, 120);
  const phone = str(c.phone, 40);
  const email = str(c.email, 160);
  const suburb = str(c.suburb, 80);
  const postcode = str(c.postcode, 12);

  if (!name) return bad("Please add your name.");
  if (!email || !EMAIL_RE.test(email)) return bad("Please add a valid email address.");
  if (!phone) return bad("Please add a phone number.");

  const boardIn = (body.board ?? {}) as Record<string, unknown>;
  const piecesIn = Array.isArray(body.pieces) ? body.pieces : [];
  if (piecesIn.length === 0) return bad("Your board is empty - add a few finishes first.");

  const pieces: SharePiece[] = piecesIn.slice(0, 80).map((p) => {
    const o = (p ?? {}) as Record<string, unknown>;
    return {
      kind: str(o.kind, 20),
      name: str(o.name, 120),
      color: str(o.color, 16) || undefined,
      url: typeof o.url === "string" ? o.url.slice(0, 2_000_000) : undefined,
      sub: str(o.sub, 120) || undefined,
      x: num(o.x),
      y: num(o.y),
      w: num(o.w),
      h: num(o.h),
      z: num(o.z),
    };
  });

  const payload: SharePayload = {
    customer: { name, phone, email, suburb, postcode },
    board: {
      w: Math.min(3000, Math.max(300, num(boardIn.w) || 900)),
      h: Math.min(3000, Math.max(200, num(boardIn.h) || 560)),
      stoneName: str(boardIn.stoneName, 80) || null,
      stoneUrl: typeof boardIn.stoneUrl === "string" ? boardIn.stoneUrl : null,
    },
    pieces,
  };

  const origin = new URL(request.url).origin;
  const dateStr = new Date().toLocaleDateString("en-AU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  // --- build the Mood Board PDF (best-effort) ----------------------------
  let pdfBuf: Buffer | null = null;
  try {
    const boardPng = await composeBoardImage(payload, origin);
    pdfBuf = await buildMoodboardPdf(payload, boardPng, dateStr, origin);
  } catch (err) {
    console.error("[share] PDF build failed:", err);
  }

  const firstName = name.split(/\s+/)[0] || undefined;
  const lastName = name.split(/\s+/).slice(1).join(" ") || undefined;
  const attachments = pdfBuf
    ? [
        {
          filename: "OnWood-Tiles-Vision-Board.pdf",
          content: pdfBuf,
          contentType: "application/pdf",
        },
      ]
    : undefined;

  // --- fan out: emails + OnBase card + OnConnect contact -----------------
  // Each returns a result (never throws) so the response can report exactly what
  // happened with the email + CRM side of the flow.
  const tasks = await Promise.all([
    sendCustomerEmail(email, firstName, attachments),
    sendSalesEmail(payload, attachments),
    upsertOnBaseCustomer(payload),
    addOnConnectContact(email, firstName, lastName),
  ]);
  for (const t of tasks)
    if (!t.ok) console.error(`[share] ${t.name} failed: ${t.detail || ""}`);

  return NextResponse.json({ ok: true, pdf: Boolean(pdfBuf) });
}

function bad(error: string) {
  return NextResponse.json({ ok: false, error }, { status: 400 });
}

// ---- side effects (each fails-open) ---------------------------------------

type Attach = { filename: string; content: Buffer; contentType: string }[] | undefined;
type Task = { name: string; ok: boolean; detail?: string };

function transporter() {
  return nodemailer.createTransport({
    host: ZOHO_SMTP_HOST,
    port: ZOHO_SMTP_PORT,
    secure: ZOHO_SMTP_PORT === 465,
    auth: { user: ZOHO_SMTP_USER, pass: ZOHO_SMTP_PASS },
  });
}

async function sendCustomerEmail(email: string, firstName: string | undefined, attachments: Attach): Promise<Task> {
  if (!ZOHO_SMTP_PASS) return { name: "customerEmail", ok: false, detail: "ZOHO_SMTP_PASS not set" };
  try {
    const info = await transporter().sendMail({
      from: MAIL_FROM,
      to: email,
      subject: "Your OnWood Tiles vision board",
      html: customerEmailHtml(firstName, Boolean(attachments)),
      attachments,
    });
    return { name: "customerEmail", ok: true, detail: `to ${email} | ${String(info?.response || "").slice(0, 120)}` };
  } catch (e) {
    return { name: "customerEmail", ok: false, detail: String(e).slice(0, 300) };
  }
}

async function sendSalesEmail(payload: SharePayload, attachments: Attach): Promise<Task> {
  if (!ZOHO_SMTP_PASS) return { name: "salesEmail", ok: false, detail: "ZOHO_SMTP_PASS not set" };
  try {
    const info = await transporter().sendMail({
      from: MAIL_FROM,
      to: SALES_EMAIL,
      replyTo: payload.customer.email,
      subject: `New vision board - ${payload.customer.name}`,
      html: salesEmailHtml(payload),
      attachments,
    });
    return { name: "salesEmail", ok: true, detail: String(info?.response || "").slice(0, 120) };
  } catch (e) {
    return { name: "salesEmail", ok: false, detail: String(e).slice(0, 300) };
  }
}

async function upsertOnBaseCustomer(payload: SharePayload): Promise<Task> {
  if (!ONBASE_API_KEY) return { name: "onbaseCustomer", ok: false, detail: "ONBASE_API_KEY not set" };
  const { name, phone, email, suburb, postcode } = payload.customer;
  try {
    const res = await fetch(`${ONBASE_API_URL}/api/v1/customers`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${ONBASE_API_KEY}`,
      },
      body: JSON.stringify({
        name,
        phone,
        email,
        suburb,
        postcode,
        state: "QLD",
        note: ONBASE_NOTE,
      }),
    });
    const body = await res.text().catch(() => "");
    return { name: "onbaseCustomer", ok: res.ok, detail: `${res.status} ${body.slice(0, 180)}` };
  } catch (e) {
    return { name: "onbaseCustomer", ok: false, detail: String(e).slice(0, 300) };
  }
}

async function addOnConnectContact(
  email: string,
  firstName: string | undefined,
  lastName: string | undefined,
): Promise<Task> {
  if (!ONBASE_API_KEY) return { name: "onconnect", ok: false, detail: "ONBASE_API_KEY not set" };
  try {
    const res = await fetch(`${ONBASE_API_URL}/api/v1/onconnect/contacts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${ONBASE_API_KEY}`,
      },
      body: JSON.stringify({ email, firstName, lastName, tags: [VISION_TAG] }),
    });
    const body = await res.text().catch(() => "");
    return { name: "onconnect", ok: res.ok, detail: `${res.status} ${body.slice(0, 200)}` };
  } catch (e) {
    return { name: "onconnect", ok: false, detail: String(e).slice(0, 300) };
  }
}

// ---- email bodies ---------------------------------------------------------

// Styled to match the other OnWood emails (book-a-visit, welcome): a warm cream
// ground, a teal-ink header band with a Courier-mono eyebrow + terracotta accent.
const CONTACT_ADDR = process.env.SHOWROOM_ADDRESS || "2/11 Packer Road, Baringa QLD 4551";
const MONO_LBL = "font-family:'Courier New',monospace;font-size:10px;letter-spacing:.14em;color:#86A6AC";

function emailShell(eyebrow: string, heading: string, body: string): string {
  const footer = ["ONWOOD TILES", escapeHtml(CONTACT_ADDR), "onwoodtiles.com.au", escapeHtml(SALES_EMAIL)].join(" &nbsp;&middot;&nbsp; ");
  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8" /><meta name="viewport" content="width=device-width,initial-scale=1" /></head>
<body style="margin:0;padding:0;">
<div style="background:#F6F1E8;padding:32px 16px;font-family:Arial,Helvetica,sans-serif;color:#20303A;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:520px;margin:0 auto;">
    <tr><td style="background:#20303A;border-radius:20px 20px 0 0;padding:28px 30px;color:#F6F1E8;">
      <img src="https://onwoodtiles.com.au/email-logo.png" alt="OnWood Tiles" width="150" style="display:block;height:auto;border:0;outline:none;text-decoration:none;" />
      <div style="font-family:'Courier New',monospace;font-size:10px;letter-spacing:.22em;color:#E79070;margin-top:20px;">${eyebrow}</div>
      <div style="font-size:26px;font-weight:800;margin-top:6px;letter-spacing:-.01em;">${heading}</div>
      <div style="height:3px;width:46px;background:#D06A45;border-radius:2px;margin-top:14px;"></div>
    </td></tr>
    <tr><td style="background:#ffffff;padding:28px 30px;">${body}</td></tr>
    <tr><td style="padding:18px 30px;text-align:center;font-family:'Courier New',monospace;font-size:10px;letter-spacing:.1em;color:#86A6AC;">${footer}</td></tr>
  </table>
</div>
</body></html>`;
}

function customerEmailHtml(firstName: string | undefined, hasPdf: boolean): string {
  const heading = firstName ? `Here&rsquo;s your board, ${escapeHtml(firstName)}.` : "Here&rsquo;s your vision board.";
  const attach = hasPdf
    ? "Your vision board is attached as a PDF - the finishes you picked, where they come from, and your room brought to life."
    : "We&rsquo;ve saved the finishes you picked, and our team will put a vision board together for you.";
  return emailShell(
    "YOUR VISION BOARD",
    heading,
    `
    <p style="margin:0 0 18px;font-size:15px;line-height:1.7;color:#3a4750;">Thanks for building a board with us. ${attach}</p>
    <p style="margin:0 0 18px;font-size:15px;line-height:1.7;color:#3a4750;">Love the look? Reply to this email or pop into our Baringa showroom and we&rsquo;ll help you turn it into the real thing - samples in hand and honest Sunshine Coast advice.</p>
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:8px;border:1px solid #EDE6D8;border-radius:14px;">
      <tr><td style="padding:14px 18px 8px;"><span style="${MONO_LBL}">VISIT US</span></td></tr>
      <tr><td style="padding:0 18px 4px;font-size:15px;font-weight:700;color:#20303A;">${escapeHtml(CONTACT_ADDR)}</td></tr>
      <tr><td style="padding:0 18px 16px;"><a href="mailto:${escapeHtml(SALES_EMAIL)}" style="font-size:14px;font-weight:700;color:#1E7A8C;text-decoration:none;">${escapeHtml(SALES_EMAIL)}</a></td></tr>
    </table>
    <p style="margin:22px 0 0;font-size:14px;line-height:1.6;color:#3a4750;">Talk soon,<br /><strong style="color:#20303A;">The OnWood Tiles team</strong></p>
  `,
  );
}

function salesEmailHtml(payload: SharePayload): string {
  const { name, phone, email, suburb, postcode } = payload.customer;
  const count = payload.pieces.length;
  const row = (k: string, v?: string) =>
    v
      ? `<tr><td style="padding:5px 16px 5px 0;font-family:'Courier New',monospace;font-size:11px;letter-spacing:.06em;color:#86A6AC;white-space:nowrap;vertical-align:top;">${escapeHtml(k)}</td><td style="padding:5px 0;font-size:14px;color:#20303A;font-weight:700;">${escapeHtml(v)}</td></tr>`
      : "";
  return emailShell(
    "NEW VISION BOARD",
    "A new board just landed.",
    `
    <p style="margin:0 0 18px;font-size:15px;line-height:1.7;color:#3a4750;">A customer built a vision board on the website. Their details are in OnBase (customer card + OnConnect, tagged &ldquo;${escapeHtml(VISION_TAG)}&rdquo;). Please follow up soon.</p>
    <table cellpadding="0" cellspacing="0" border="0" style="margin:0 0 6px;">
      ${row("NAME", name)}
      ${row("PHONE", phone)}
      ${row("EMAIL", email)}
      ${row("SUBURB", suburb)}
      ${row("POSTCODE", postcode)}
      ${row("FINISHES", `${count} piece${count === 1 ? "" : "s"} on the board`)}
    </table>
    <p style="margin:14px 0 0;font-size:14px;line-height:1.6;color:#3a4750;">Their vision board PDF is attached.</p>
  `,
  );
}
