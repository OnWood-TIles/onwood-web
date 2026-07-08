import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Next.js 16 renamed Middleware -> Proxy. Same behaviour: runs before a request
// completes. This is the coming-soon GATE.
//
// Rules (fail CLOSED - any doubt -> show the coming-soon splash):
//   - SITE_MODE=live            -> full site is public, no gating.
//   - otherwise, a request with a valid preview cookie sees the real site.
//   - every other public request is rewritten to /soon and marked noindex.
//
// Note: env is read directly (not via lib/site.ts) so the values inline into
// the edge bundle. fetch caching options have no effect in proxy (Next 16).

const PREVIEW_COOKIE = "owp_preview";

const ALLOWLIST = [
  "/soon",
  "/staff",
  "/api/subscribe",
  "/api/preview-login",
  "/api/preview-logout",
];

function isAllowlisted(pathname: string): boolean {
  return ALLOWLIST.some(
    (p) => pathname === p || pathname.startsWith(p + "/"),
  );
}

export function proxy(request: NextRequest) {
  const isLive = process.env.SITE_MODE === "live";
  if (isLive) return NextResponse.next();

  const { pathname } = request.nextUrl;

  // Let the splash, login, signup + assets through untouched.
  if (isAllowlisted(pathname)) return NextResponse.next();

  // Valid preview cookie -> reveal the real site (still keep it out of search).
  const token = process.env.PREVIEW_TOKEN;
  const hasPreview =
    !!token && request.cookies.get(PREVIEW_COOKIE)?.value === token;

  if (hasPreview) {
    const res = NextResponse.next();
    res.headers.set("x-robots-tag", "noindex, nofollow");
    return res;
  }

  // Public, gated -> serve the coming-soon splash at the current URL.
  const url = request.nextUrl.clone();
  url.pathname = "/soon";
  const res = NextResponse.rewrite(url);
  res.headers.set("x-robots-tag", "noindex, nofollow");
  return res;
}

export const config = {
  // Run on everything except Next internals + common static files.
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icon.png|.*\\.(?:png|jpg|jpeg|gif|svg|webp|ico|txt|xml|woff2?)$).*)",
  ],
};
