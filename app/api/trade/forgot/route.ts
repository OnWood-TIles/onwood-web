import { NextResponse } from "next/server";
import { tradeForgot } from "../../../../lib/onbase/trade";

export const runtime = "nodejs";

// Kicks off a trade password reset. OnBase always answers {ok:true} (it never
// reveals whether an email is registered), so we do the same - even on error, we
// return {ok:true} so this endpoint can't be used to probe for accounts.
export async function POST(request: Request) {
  let email = "";
  try {
    const b = (await request.json()) as { email?: unknown };
    email = typeof b.email === "string" ? b.email.trim() : "";
  } catch {
    return NextResponse.json({ ok: true });
  }

  if (email) {
    // Where OnBase should point the "set your password" link back to. OnBase appends
    // "/trade/set-password?token=..." itself, so pass the bare origin (no suffix).
    const portalUrl = new URL(request.url).origin;
    try {
      await tradeForgot(email, portalUrl);
    } catch (err) {
      console.error("[trade] forgot-password failed:", err);
    }
  }

  return NextResponse.json({ ok: true });
}
