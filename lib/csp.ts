// Content-Security-Policy: the browser's guest list of where this site may load code, styles,
// frames and connections from. Applied in next.config.ts on production deploys only.
//
// MODE: "report-only" blocks nothing and just reports what WOULD have been blocked to OnBase
// (/api/csp-report?site=onwood; read with onbase/scripts/csp-report-summary.ts). Once the
// reports only show junk, flip to "enforce". Started 2026-11-06.
export const CSP_MODE: "report-only" | "enforce" = "report-only";

const REPORT_URL = "https://onbasehq.com.au/api/csp-report?site=onwood";

const directives: Record<string, string[]> = {
  "default-src": ["'self'"],
  // 'unsafe-inline': Next's bootstrap, the theme no-flash script and JSON-LD are inline.
  "script-src": ["'self'", "'unsafe-inline'", "https://va.vercel-scripts.com"],
  "style-src": ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
  "font-src": ["'self'", "data:", "https://fonts.gstatic.com"],
  // Product photos come from OnBase, Blob storage and supplier hosts, so any https image is allowed.
  "img-src": ["'self'", "data:", "blob:", "https:"],
  "media-src": ["'self'", "data:", "blob:", "https:"],
  "connect-src": ["'self'", "https://vitals.vercel-insights.com"],
  // Showroom map on /contact and /book.
  "frame-src": ["'self'", "https://maps.google.com", "https://www.google.com"],
  "worker-src": ["'self'", "blob:"],
  "object-src": ["'none'"],
  "base-uri": ["'self'"],
  "form-action": ["'self'"],
  "frame-ancestors": ["'none'"],
};

export function cspHeaders(): { key: string; value: string }[] {
  const policy = Object.entries(directives).map(([k, v]) => `${k} ${v.join(" ")}`).join("; ")
    + `; report-uri ${REPORT_URL}; report-to csp`;
  return [
    { key: "Reporting-Endpoints", value: `csp="${REPORT_URL}"` },
    { key: CSP_MODE === "enforce" ? "Content-Security-Policy" : "Content-Security-Policy-Report-Only", value: policy },
  ];
}
