import { NextResponse } from "next/server";

export const runtime = "nodejs";

// Exchanges the shared staff password for a preview cookie that the proxy gate
// recognises. On success -> redirect to the site; on failure -> back to /staff.
export async function POST(request: Request) {
  const password = process.env.PREVIEW_PASSWORD || "";
  const token = process.env.PREVIEW_TOKEN || "";

  let submitted = "";
  let next = "/";
  const contentType = request.headers.get("content-type") || "";
  try {
    if (contentType.includes("application/json")) {
      const body = (await request.json()) as { password?: string; next?: string };
      submitted = typeof body.password === "string" ? body.password : "";
      if (typeof body.next === "string") next = body.next;
    } else {
      const form = await request.formData();
      submitted = String(form.get("password") || "");
      const n = form.get("next");
      if (typeof n === "string" && n.startsWith("/")) next = n;
    }
  } catch {
    // fall through to failure
  }

  const ok = !!password && !!token && submitted === password;

  if (!ok) {
    return NextResponse.redirect(new URL("/staff?error=1", request.url), {
      status: 303,
    });
  }

  const res = NextResponse.redirect(new URL(next, request.url), { status: 303 });
  res.cookies.set({
    name: "owp_preview",
    value: token,
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });
  return res;
}
