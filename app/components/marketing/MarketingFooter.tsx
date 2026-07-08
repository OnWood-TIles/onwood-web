// Site footer. Transcribed from .refwork/tiles-sections/13-footer-footer.html:
// a light band (44px 40px, var(--bg), top border) with the ONWOOD roof mark +
// wordmark on the left (same lockup as the nav) and the location/copyright line
// on the right. Copy is corrected to "Tiles" (never "Flooring") and adds
// Instagram/Facebook links from SHOP.socials. Server component (no interactivity).
import { SHOP } from "../../../lib/content";

const footerStyle: React.CSSProperties = {
  padding: "44px 40px",
  background: "var(--bg)",
  borderTop: "1px solid var(--line)",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 20,
  flexWrap: "wrap",
};

const wordmarkStyle: React.CSSProperties = {
  fontFamily: "var(--font-archivo)",
  fontWeight: 900,
  letterSpacing: ".14em",
  fontSize: 16,
};

const infoStyle: React.CSSProperties = {
  fontSize: 13,
  color: "var(--muted)",
};

const socialLinkStyle: React.CSSProperties = {
  display: "grid",
  placeItems: "center",
  width: 32,
  height: 32,
  borderRadius: 100,
  color: "var(--muted)",
  border: "1px solid var(--line)",
  textDecoration: "none",
};

export default function MarketingFooter() {
  return (
    <footer style={footerStyle}>
      {/* Left: roof mark + ONWOOD wordmark (matches the nav lockup) */}
      <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
        <svg viewBox="0 0 100 74" width="28" height="22" aria-hidden="true">
          <path
            d="M8 44 L50 8 L92 44"
            fill="none"
            stroke="currentColor"
            strokeWidth="9"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <rect x="20" y="52" width="60" height="8" rx="4" fill="var(--accent2)" />
          <rect x="28" y="66" width="44" height="7" rx="3.5" fill="var(--accent)" />
        </svg>
        <span style={wordmarkStyle}>ONWOOD</span>
      </div>

      {/* Right: location/copyright line + social links */}
      <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
        <div style={infoStyle}>
          Tiles · Sunshine Coast, {SHOP.state} · © 2026 {SHOP.name}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <a
            href={SHOP.socials.instagram}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="OnWood Tiles on Instagram"
            style={socialLinkStyle}
          >
            <svg viewBox="0 0 24 24" width="17" height="17" aria-hidden="true">
              <rect
                x="3"
                y="3"
                width="18"
                height="18"
                rx="5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              />
              <circle
                cx="12"
                cy="12"
                r="4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              />
              <circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" />
            </svg>
          </a>
          <a
            href={SHOP.socials.facebook}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="OnWood Tiles on Facebook"
            style={socialLinkStyle}
          >
            <svg viewBox="0 0 24 24" width="17" height="17" aria-hidden="true">
              <path
                d="M14 8.5V6.8c0-.7.4-1 1.1-1H16.5V3H14.2C11.9 3 11 4.4 11 6.4V8.5H9V11h2v8h3v-8h2.2l.4-2.5H14z"
                fill="currentColor"
              />
            </svg>
          </a>
        </div>
      </div>
    </footer>
  );
}
