// Trade Partner portal footer. Deliberately REDUCED vs the public MarketingFooter
// (Reagan's call 2026-08-10): the left company/hours block, a Help column, a
// Trade-Partners "shop" column (portal sections + log out), socials and the legal
// bottom bar. Live company details come from OnBase via getBusiness() with the
// static SHOP constants as a fail-open fallback. Async server component; the log
// out link is a nested client component. No em-dashes in customer copy.
import Link from "next/link";
import { SHOP } from "../../../lib/content";
import { getBusiness } from "../../../lib/onbase/client";
import TradeFooterLogout from "./TradeFooterLogout";

// Showroom coordinates (Packer Road, Baringa) - directions link, matches /contact.
const MAP_DIRECTIONS =
  "https://www.google.com/maps/dir/?api=1&destination=-26.8078,153.0677";

// Help column - the same help options as the public footer, minus "Trade Partner
// Login" (they're already logged in here).
const HELP_LINKS = [
  { href: "/contact", label: "Contact Us" },
  { href: "/faq", label: "FAQ" },
  { href: "/terms-of-sale", label: "Terms of Sale" },
  { href: "/terms-of-use", label: "Website Terms of Use" },
  { href: "/privacy-policy", label: "Privacy Policy" },
];

// Trade-Partners "shop" column - the portal's own sections.
const TRADE_LINKS = [
  { href: "/trade", label: "Dashboard" },
  { href: "/trade/catalogue", label: "Catalogue" },
  { href: "/trade/orders", label: "Orders" },
  { href: "/trade/cart", label: "Cart" },
];

const footerStyle: React.CSSProperties = { background: "var(--bg)", borderTop: "1px solid var(--line)" };
const innerStyle: React.CSSProperties = { maxWidth: 1180, margin: "0 auto", padding: "52px 24px 26px" };
const gridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
  gap: 40,
  alignItems: "start",
};
const taglineStyle: React.CSSProperties = { fontSize: 13.5, lineHeight: 1.65, color: "var(--muted)", margin: "14px 0 18px", maxWidth: 300 };
const colHeaderStyle: React.CSSProperties = {
  fontFamily: "var(--font-archivo)",
  fontWeight: 800,
  fontSize: 12.5,
  letterSpacing: ".12em",
  textTransform: "uppercase",
  color: "var(--ink)",
  margin: "0 0 16px",
};
const linkListStyle: React.CSSProperties = { listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 12 };
const linkStyle: React.CSSProperties = { color: "var(--muted)", fontSize: 14, textDecoration: "none", lineHeight: 1.25 };
const contactLineStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "flex-start",
  gap: 9,
  color: "var(--muted)",
  fontSize: 13.5,
  lineHeight: 1.5,
  textDecoration: "none",
  marginBottom: 10,
};
const infoStyle: React.CSSProperties = { fontSize: 13, color: "var(--muted)" };
const bottomBarStyle: React.CSSProperties = {
  marginTop: 40,
  paddingTop: 22,
  borderTop: "1px solid var(--line)",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 16,
  flexWrap: "wrap",
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
const iconStyle: React.CSSProperties = { flexShrink: 0, marginTop: 1 };

function PinIcon() {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.7" style={iconStyle} aria-hidden="true">
      <path d="M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}
function PhoneIcon() {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.7" style={iconStyle} aria-hidden="true">
      <path d="M4 5c0 8.3 6.7 15 15 15 .6 0 1-.4 1-1v-2.4c0-.5-.3-.9-.8-1l-3-.6c-.4-.1-.9.1-1.1.5l-1 1.6a12 12 0 0 1-5-5l1.6-1c.4-.2.6-.7.5-1.1l-.6-3c-.1-.5-.5-.8-1-.8H5c-.6 0-1 .4-1 1z" />
    </svg>
  );
}
function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.7" style={iconStyle} aria-hidden="true">
      <rect x="3" y="5" width="18" height="14" rx="2.5" />
      <path d="M4 7l8 6 8-6" />
    </svg>
  );
}

export default async function TradeFooter() {
  // Live company details from OnBase, with the static SHOP constants as a
  // fail-open fallback (getBusiness returns null on any hiccup). Mirrors /contact.
  const business = await getBusiness();
  const phone = (business?.phone || "").trim();
  const email = (business?.email || SHOP.email).trim();
  const addr1 = (business?.addressLine1 || SHOP.street).trim();
  const addr2 = (business?.addressLine2 || `${SHOP.suburb} ${SHOP.state} ${SHOP.postcode}`).trim();
  const fullAddr = [addr1, addr2].filter(Boolean).join(", ");
  const hoursSummary = (business?.openHoursSummary || SHOP.hours).trim();
  const openHours = (business?.openHours || []).filter((d) => d && d.day);
  const telHref = `tel:${phone.replace(/[^0-9+]/g, "")}`;

  return (
    <footer style={footerStyle}>
      {/* Link hover polish (server-rendered, no client JS) */}
      <style>{`.owf-link:hover{color:var(--accent)!important}`}</style>

      <div style={innerStyle}>
        <div style={gridStyle}>
          {/* ── Brand + company details + open hours ─────────────── */}
          <div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/onwood-logo-ink-tight.png" alt="OnWood Tiles" style={{ height: 42, width: "auto", display: "block" }} />

            <p style={taglineStyle}>
              Your OnWood Tiles trade account. Browse the full range at your pricing, build an order request and track it through to delivery.
            </p>

            <a href={MAP_DIRECTIONS} target="_blank" rel="noopener noreferrer" className="owf-link" style={contactLineStyle}>
              <PinIcon />
              <span>{fullAddr}</span>
            </a>
            {phone && (
              <a href={telHref} className="owf-link" style={contactLineStyle}>
                <PhoneIcon />
                <span>{phone}</span>
              </a>
            )}
            <a href={`mailto:${email}`} className="owf-link" style={contactLineStyle}>
              <MailIcon />
              <span>{email}</span>
            </a>

            {/* Open hours */}
            <div style={{ marginTop: 18 }}>
              <div style={{ ...colHeaderStyle, fontSize: 11.5, margin: "0 0 10px" }}>Open Hours</div>
              {openHours.length ? (
                <ul style={{ ...linkListStyle, gap: 7, maxWidth: 220 }}>
                  {openHours.map((d) => (
                    <li key={d.day} style={{ display: "flex", justifyContent: "space-between", gap: 12, fontSize: 13, color: "var(--muted)" }}>
                      <span>{d.day.slice(0, 3)}</span>
                      <span style={{ color: d.closed ? "var(--muted)" : "var(--ink)" }}>
                        {d.closed ? "Closed" : `${d.open}-${d.close}`}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div style={infoStyle}>{hoursSummary}</div>
              )}
            </div>
          </div>

          {/* ── Trade Partners (portal sections + log out) ────────── */}
          <div>
            <div style={colHeaderStyle}>Trade Partners</div>
            <ul style={linkListStyle}>
              {TRADE_LINKS.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="owf-link" style={linkStyle}>{l.label}</Link>
                </li>
              ))}
              <li>
                <TradeFooterLogout style={linkStyle} />
              </li>
            </ul>
          </div>

          {/* ── Help ──────────────────────────────────────────────── */}
          <div>
            <div style={colHeaderStyle}>Help</div>
            <ul style={linkListStyle}>
              {HELP_LINKS.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="owf-link" style={linkStyle}>{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ── Bottom bar: legal + socials ───────────────────────── */}
        <div style={bottomBarStyle}>
          <div style={infoStyle}>
            © 2026 {SHOP.name} · {SHOP.suburb} {SHOP.state} · Tiles, supply only
            <br />
            OnWood Tiles is a registered business name of Reagan Genrich, ABN 41 522 687 021.
            <br />
            Our enquiries, quoting and trade orders run on{" "}
            <a href="https://onbasehq.com.au" target="_blank" rel="noopener" className="owf-link" style={{ color: "inherit", textDecoration: "underline" }}>
              OnBase HQ
            </a>
            .
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <a href={SHOP.socials.instagram} target="_blank" rel="noopener noreferrer" aria-label="OnWood Tiles on Instagram" className="owf-link" style={socialLinkStyle}>
              <svg viewBox="0 0 24 24" width="17" height="17" aria-hidden="true">
                <rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" strokeWidth="2" />
                <circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="2" />
                <circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" />
              </svg>
            </a>
            <a href={SHOP.socials.facebook} target="_blank" rel="noopener noreferrer" aria-label="OnWood Tiles on Facebook" className="owf-link" style={socialLinkStyle}>
              <svg viewBox="0 0 24 24" width="17" height="17" aria-hidden="true">
                <path d="M14 8.5V6.8c0-.7.4-1 1.1-1H16.5V3H14.2C11.9 3 11 4.4 11 6.4V8.5H9V11h2v8h3v-8h2.2l.4-2.5H14z" fill="currentColor" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
