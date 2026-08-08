"use client";

import Link from "next/link";

// Express, unbundled marketing-consent checkbox for the service forms (calculator,
// wishlist, contact, book). Unticked by default - the service still happens either
// way; ticking is the ONLY thing that opts them into marketing (Spam Act). The
// exact wording is exported so the API can log precisely what the person agreed to.
export const MARKETING_CONSENT_TEXT =
  "Yes! Send me first access to new arrivals, subscriber-only specials and Sunshine Coast styling inspiration from OnWood Tiles.";

export default function MarketingConsent({
  checked,
  onChange,
  style,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  style?: React.CSSProperties;
}) {
  return (
    <div style={{ margin: "14px 0 0", padding: "13px 15px", borderRadius: 12, background: "color-mix(in oklab, var(--accent) 6%, var(--surface))", border: "1px solid var(--line)", ...style }}>
      <label style={{ display: "flex", gap: 11, cursor: "pointer", alignItems: "flex-start" }}>
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          style={{ marginTop: 2, width: 18, height: 18, accentColor: "var(--accent)", flexShrink: 0, cursor: "pointer" }}
        />
        <span style={{ fontSize: 13.5, lineHeight: 1.5, color: "var(--ink)", fontWeight: 700 }}>{MARKETING_CONSENT_TEXT}</span>
      </label>
      <p style={{ fontSize: 11.5, lineHeight: 1.5, color: "var(--muted)", margin: "8px 0 0", paddingLeft: 29 }}>
        We only email marketing if you tick the box, and you can unsubscribe anytime. We use your details to help with your enquiry and never share them. See our{" "}
        <Link href="/privacy-policy" style={{ color: "var(--accent)", fontWeight: 700 }}>Privacy Policy</Link>.
      </p>
    </div>
  );
}
