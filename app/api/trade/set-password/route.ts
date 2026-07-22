import { NextResponse } from "next/server";
import { tradeSetPassword, TradeError } from "../../../../lib/onbase/trade";

export const runtime = "nodejs";

// Sets a new password from a reset token (from the emailed link). On success the
// user is sent to /trade/login to sign in with it. Passwords are min 8 chars.
export async function POST(request: Request) {
  let resetToken = "";
  let password = "";
  try {
    const b = (await request.json()) as { resetToken?: unknown; password?: unknown };
    resetToken = typeof b.resetToken === "string" ? b.resetToken : "";
    password = typeof b.password === "string" ? b.password : "";
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  if (!resetToken) {
    return NextResponse.json({ error: "This reset link is missing its token." }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json(
      { error: "Please choose a password of at least 8 characters." },
      { status: 400 },
    );
  }

  try {
    await tradeSetPassword(resetToken, password);
    return NextResponse.json({ ok: true });
  } catch (err) {
    const status = err instanceof TradeError ? err.status : 500;
    const message =
      err instanceof TradeError
        ? err.message || "This reset link is invalid or has expired."
        : "Something went wrong, please try again.";
    return NextResponse.json({ error: message }, { status });
  }
}
