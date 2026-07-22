import { NextResponse } from "next/server";
import { tradeLogout, TRADE_COOKIE } from "../../../../lib/onbase/trade";

export const runtime = "nodejs";

// Ends the OnBase session (best-effort) and always clears the local cookie, so
// the user is signed out even if the upstream logout call hiccups.
export async function POST() {
  await tradeLogout();
  const res = NextResponse.json({ ok: true });
  res.cookies.set({
    name: TRADE_COOKIE,
    value: "",
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return res;
}
