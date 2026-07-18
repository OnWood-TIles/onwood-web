import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Book-a-Visit submission. Phase B: validates + accepts (so the confirmation
// flow works). Phase C wires the sales email, the customer confirmation email
// (Zoho SMTP) and the OnBase calendar event.
export async function POST(req: Request) {
  let b: { name?: string; email?: string; phone?: string; purpose?: string; when?: string; notes?: string; date?: string; time?: string };
  try {
    b = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request" }, { status: 400 });
  }
  if (!b?.name?.trim() || !/.+@.+\..+/.test(b?.email ?? "") || !b?.when) {
    return NextResponse.json({ ok: false, error: "Missing details" }, { status: 400 });
  }
  // Phase C: send sales@ notification + customer confirmation + create the
  // OnBase calendar event here.
  console.log("[book] request:", b.name, b.email, b.when, b.purpose);
  return NextResponse.json({ ok: true });
}
