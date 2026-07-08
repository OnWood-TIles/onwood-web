import { NextResponse } from "next/server";

export const runtime = "nodejs";

// Clears the preview cookie and returns to the public splash.
export async function POST(request: Request) {
  const res = NextResponse.redirect(new URL("/soon", request.url), {
    status: 303,
  });
  res.cookies.set({
    name: "owp_preview",
    value: "",
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return res;
}
