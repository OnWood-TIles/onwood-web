import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Next.js 16 renamed Middleware -> Proxy. Runs before a request completes.
//
// The public marketing site is FULLY PUBLIC (the coming-soon gate was removed
// once the site launched). This proxy now only does two things:
//   1. keeps the Trade Partner portal behind its session cookie, and
//   2. keeps staff-only internal areas (/admin, /debug, /kitchen-sink, /api/admin)
//      behind the staff cookie, which is set by signing in at /staff.

const STAFF_COOKIE = "owp_preview";
const TRADE_COOKIE = "ow_trade";

// Trade portal paths reachable by anyone (login, reset + their APIs).
const TRADE_PUBLIC = [
  "/trade/login",
  "/trade/set-password",
  "/trade/apply",
  "/api/trade/login",
  "/api/trade/forgot",
  "/api/trade/set-password",
  "/api/trade/apply",
];

// Internal-only paths: require the staff cookie in ALL cases.
const ALWAYS_GATED = ["/debug", "/kitchen-sink", "/admin", "/api/admin", "/floor-scores-editor"];

function matches(pathname: string, list: string[]): boolean {
  return list.some((p) => pathname === p || pathname.startsWith(p + "/"));
}

function noindex(res: NextResponse): NextResponse {
  res.headers.set("x-robots-tag", "noindex, nofollow");
  return res;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = process.env.PREVIEW_TOKEN;
  const hasStaff = !!token && request.cookies.get(STAFF_COOKIE)?.value === token;

  // ── Trade Partner portal ────────────────────────────────────────────────────
  // A self-contained customer area with its own OnBase-backed login. Public paths
  // (login, reset + their APIs) are always reachable; everything else needs the
  // session cookie present (real validation happens in the trade layout).
  if (pathname === "/trade" || pathname.startsWith("/trade/") || pathname.startsWith("/api/trade/")) {
    if (matches(pathname, TRADE_PUBLIC)) return noindex(NextResponse.next());
    if (request.cookies.get(TRADE_COOKIE)?.value) return noindex(NextResponse.next());
    if (pathname.startsWith("/api/trade/")) {
      return noindex(NextResponse.json({ error: "Not signed in" }, { status: 401 }));
    }
    const url = request.nextUrl.clone();
    url.pathname = "/trade/login";
    url.search = "";
    return noindex(NextResponse.redirect(url));
  }

  // ── Staff-only internal areas ───────────────────────────────────────────────
  // /admin (site content editor), /debug, /kitchen-sink + their APIs. Require the
  // staff cookie; unauthorised APIs get a 401, unauthorised pages go to /staff to
  // sign in (and come back to where they were headed).
  if (matches(pathname, ALWAYS_GATED)) {
    if (hasStaff) return noindex(NextResponse.next());
    if (pathname.startsWith("/api/")) {
      return noindex(NextResponse.json({ error: "Unauthorised" }, { status: 401 }));
    }
    const url = request.nextUrl.clone();
    url.pathname = "/staff";
    url.search = "";
    url.searchParams.set("next", pathname);
    return noindex(NextResponse.redirect(url));
  }

  // Everything else is public.
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icon.png|.*\\.(?:png|jpg|jpeg|gif|svg|webp|ico|txt|xml|woff2?|ttf|otf|pdf)$).*)",
  ],
};
