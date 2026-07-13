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

function shell(inner: string): string {
  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8" /><meta name="viewport" content="width=device-width,initial-scale=1" /></head>
<body style="margin:0;padding:0;background:#0e1a20;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#0e1a20;padding:40px 16px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;width:100%;background:#fbfaf6;border-radius:20px;overflow:hidden;">
        <tr><td style="background:#20303a;padding:28px 40px;">
          <img src="https://onwoodtiles.com.au/onwood-logo-white.png" alt="OnWood Tiles" width="131" height="48" style="display:block;border:0;outline:none;text-decoration:none;width:131px;height:48px;" />
        </td></tr>
        <tr><td style="padding:38px 40px;">${inner}</td></tr>
        <tr><td style="padding:22px 40px;border-top:1px solid #e6e2d8;">
          <p style="margin:0;font-size:12px;color:#8a959b;">
            2/11 Packer Road, Baringa &middot; <a href="mailto:sales@onwoodtiles.com.au" style="color:#1e7a8c;text-decoration:none;">sales@onwoodtiles.com.au</a> &middot; onwoodtiles.com.au
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

function customerEmailHtml(firstName: string | undefined, hasPdf: boolean): string {
  const hi = firstName ? `Hi ${escapeHtml(firstName)},` : "Hi there,";
  const attachLine = hasPdf
    ? `Your vision board is attached as a PDF, with the finishes you picked and where they come from.`
    : `We&rsquo;ve saved the finishes you picked, and our team will put a vision board together for you.`;
  return shell(`
    <h1 style="margin:0 0 16px;font-size:24px;font-weight:800;color:#20303a;">${hi}</h1>
    <p style="margin:0 0 18px;font-size:16px;line-height:1.7;color:#3a4b54;">
      Thanks for building a board with us. ${attachLine}
    </p>
    <p style="margin:0 0 18px;font-size:16px;line-height:1.7;color:#3a4b54;">
      Love the look? Reply to this email or pop into our Baringa showroom and we&rsquo;ll help you turn it into the real thing, with samples in hand and honest Sunshine Coast advice.
    </p>
    <p style="margin:0;font-size:16px;line-height:1.7;color:#3a4b54;">Talk soon,<br /><strong style="color:#20303a;">The OnWood Tiles team</strong></p>
  `);
}

function salesEmailHtml(payload: SharePayload): string {
  const { name, phone, email, suburb, postcode } = payload.customer;
  const count = payload.pieces.length;
  const row = (k: string, v?: string) =>
    v
      ? `<tr><td style="padding:4px 14px 4px 0;font-size:13px;color:#8a959b;">${escapeHtml(k)}</td><td style="padding:4px 0;font-size:13px;color:#20303a;font-weight:600;">${escapeHtml(v)}</td></tr>`
      : "";
  return shell(`
    <h1 style="margin:0 0 12px;font-size:22px;font-weight:800;color:#20303a;">New vision board</h1>
    <p style="margin:0 0 18px;font-size:15px;line-height:1.7;color:#3a4b54;">
      A customer has just created a vision board on the website. Their details have been added to OnBase (customer card + OnConnect, tagged &ldquo;${escapeHtml(VISION_TAG)}&rdquo;). Please follow up in the short future.
    </p>
    <table cellpadding="0" cellspacing="0" border="0" style="margin:0 0 18px;">
      ${row("Name", name)}
      ${row("Phone", phone)}
      ${row("Email", email)}
      ${row("Suburb", suburb)}
      ${row("Postcode", postcode)}
      ${row("Finishes", `${count} piece${count === 1 ? "" : "s"} on the board`)}
    </table>
    <p style="margin:0;font-size:14px;line-height:1.6;color:#3a4b54;">Their vision board PDF is attached.</p>
  `);
}
