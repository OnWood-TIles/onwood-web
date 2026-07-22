import { NextResponse } from "next/server";
import { tradeLogin, TradeError, TRADE_COOKIE } from "../../../../lib/onbase/trade";

export const runtime = "nodejs";

// Exchanges a trade customer's email + password for a session. On success we set
// the httpOnly `ow_trade` cookie to the OnBase session token (so it NEVER touches
// client JS) and return only the customer summary. On failure we echo the upstream
// status (401 bad credentials, 429 rate limited).
export async function POST(request: Request) {
  let email = "";
  let password = "";
  try {
    const b = (await request.json()) as { email?: unknown; password?: unknown };
    email = typeof b.email === "string" ? b.email.trim() : "";
    password = typeof b.password === "string" ? b.password : "";
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  if (!email || !password) {
    return NextResponse.json({ error: "Please enter your email and password." }, { status: 400 });
  }

  try {
    const { token, customer } = await tradeLogin(email, password);
    const res = NextResponse.json({ ok: true, customer });
    res.cookies.set({
      name: TRADE_COOKIE,
      value: token,
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });
    return res;
  } catch (err) {
    const status = err instanceof TradeError ? err.status : 500;
    const message =
      err instanceof TradeError && status === 401
        ? "Email or password is incorrect."
        : err instanceof TradeError
          ? err.message
          : "Something went wrong, please try again.";
    return NextResponse.json({ error: message }, { status });
  }
}
