import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Next.js 16 renamed Middleware -> Proxy. Same behaviour: runs before a request
// completes. This is the coming-soon GATE.
//
// Rules (fail CLOSED - any doubt -> show the coming-soon splash):
//   - Internal tools (/debug, /kitchen-sink) ALWAYS require the preview cookie,
//     even after launch.
//   - SITE_MODE=live            -> the public marketing site is public.
//   - otherwise, a request with a valid preview cookie sees the real site
//     (marked noindex); every other public request is rewritten to /soon.
//
// The public coming-soon splash is left INDEXABLE (no noindex) so onwoodtiles's
// search presence continues during the build; only the under-construction site
// behind the cookie is hidden from search.

const PREVIEW_COOKIE = "owp_preview";
const TRADE_COOKIE = "ow_trade";

// Reachable by the public even while gated (assets handled by the matcher).
const ALLOWLIST = [
  "/soon",
  "/staff",
  "/api/subscribe",
  "/api/enquiry",
  "/api/preview-login",
  "/api/preview-logout",
  "/api/revalidate", // secret-gated OnBase -> storefront cache purge (server-to-server)
];

// The Trade Partner portal is a SELF-CONTAINED customer area with its own OnBase-backed
// login. It must work even while the marketing site is coming-soon-gated (trade
// users must never bounce to /soon), so it lives OUTSIDE the preview gate.
//   - TRADE_PUBLIC  : reachable by anyone (login, password reset + their APIs).
//   - other /trade/* + /api/trade/* : require the ow_trade cookie's PRESENCE.
//     Real token validation happens in the trade layout via tradeMe(); here we
//     only check the cookie exists and, if not, send them to the login page.
const TRADE_PUBLIC = [
  "/trade/login",
  "/trade/set-password",
  "/api/trade/login",
  "/api/trade/forgot",
  "/api/trade/set-password",
];

// Internal-only paths: require the preview cookie in ALL modes (incl. live).
const ALWAYS_GATED = ["/debug", "/kitchen-sink", "/admin", "/api/admin"];

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
  const hasPreview =
    !!token && request.cookies.get(PREVIEW_COOKIE)?.value === token;

  const toSoon = () => {
    const url = request.nextUrl.clone();
    url.pathname = "/soon";
    return NextResponse.rewrite(url);
  };

  // ── Trade Partner portal (handled BEFORE the coming-soon gate) ────────────────────
  // Trade customers sign in independently of the preview cookie, so the portal
  // is reachable in every SITE_MODE and never bounces to /soon.
  if (pathname === "/trade" || pathname.startsWith("/trade/") || pathname.startsWith("/api/trade/")) {
    // Public trade paths (login, reset + their APIs) are always reachable.
    if (matches(pathname, TRADE_PUBLIC)) return noindex(NextResponse.next());
    // Everything else needs the session cookie present (real check is tradeMe()).
    if (request.cookies.get(TRADE_COOKIE)?.value) return noindex(NextResponse.next());
    // Missing cookie: APIs get a 401, pages redirect to the trade login.
    if (pathname.startsWith("/api/trade/")) {
      return noindex(NextResponse.json({ error: "Not signed in" }, { status: 401 }));
    }
    const url = request.nextUrl.clone();
    url.pathname = "/trade/login";
    url.search = "";
    return noindex(NextResponse.redirect(url));
  }

  // Internal tools: cookie required regardless of mode.
  if (matches(pathname, ALWAYS_GATED)) {
    return hasPreview ? noindex(NextResponse.next()) : noindex(toSoon());
  }

  // Public marketing site is live.
  if (process.env.SITE_MODE === "live") return NextResponse.next();

  // Gated: let the splash, login, signup + enquiry through.
  if (matches(pathname, ALLOWLIST)) return NextResponse.next();

  // Valid preview cookie -> reveal the real site, kept out of search.
  if (hasPreview) return noindex(NextResponse.next());

  // Public, gated -> coming-soon splash (INDEXABLE - preserves SEO).
  return toSoon();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icon.png|.*\\.(?:png|jpg|jpeg|gif|svg|webp|ico|txt|xml|woff2?)$).*)",
  ],
};
