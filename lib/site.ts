// Central site-mode + preview-gate config.
//
// SITE_MODE controls what the PUBLIC sees:
//   "coming-soon" (default) -> everyone is rewritten to /soon (the live splash),
//                              EXCEPT visitors holding a valid preview cookie.
//   "live"                  -> the full site is public; /soon becomes a fallback.
//
// The preview gate lets Reagan + staff view the in-progress full site on the
// real domain without exposing it. A shared password (PREVIEW_PASSWORD) is
// exchanged at /staff for a signed-value cookie (owp_preview === PREVIEW_TOKEN).

export type SiteMode = "coming-soon" | "live";

export const SITE_MODE: SiteMode =
  process.env.SITE_MODE === "live" ? "live" : "coming-soon";

export const IS_LIVE = SITE_MODE === "live";

// Cookie the proxy checks to bypass the coming-soon gate.
export const PREVIEW_COOKIE = "owp_preview";

// Server secret the cookie must equal. Kept out of the client bundle.
export const PREVIEW_TOKEN = process.env.PREVIEW_TOKEN || "";

// What staff type at /staff to unlock preview.
export const PREVIEW_PASSWORD = process.env.PREVIEW_PASSWORD || "";

// Paths always reachable by the public even while gated (assets, the splash
// itself, the signup API, and the staff login).
export const GATE_ALLOWLIST = [
  "/soon",
  "/staff",
  "/api/subscribe",
  "/api/preview-login",
  "/api/preview-logout",
];
