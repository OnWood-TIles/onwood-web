// Site footer, rebuilt 2026-07-22 as a multi-column DIRECTORY (mimics the
// reference bottom-banner: bold uppercase column headers over stacked links) so
// links scale as we add them. Now also carries the OnWood logo lockup, live
// company details (address / phone / email) and open hours, pulled from OnBase
// via getBusiness() with the static SHOP constants as a fail-open fallback.
// Link columns live in lib/content.ts (FOOTER_COLUMNS) so they're easy to
// extend. Async server component. No em-dashes in customer copy.
import Link from "next/link";
import { SHOP, FOOTER_COLUMNS } from "../../../lib/content";
import { getBusiness } from "../../../lib/onbase/client";

// Showroom coordinates (Packer Road, Baringa) - directions link, matches /contact.
const MAP_DIRECTIONS =
  "https://www.google.com/maps/dir/?api=1&destination=-26.8078,153.0677";

const footerStyle: React.CSSProperties = {
  background: "var(--bg)",
  borderTop: "1px solid var(--line)",
};
const innerStyle: React.CSSProperties = {
  maxWidth: 1240,
  margin: "0 auto",
  padding: "56px 40px 28px",
};
const gridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
  gap: 40,
  alignItems: "start",
};
// (the ONWOOD wordmark is now part of the logo image)
const taglineStyle: React.CSSProperties = {
  fontSize: 13.5,
  lineHeight: 1.65,
  color: "var(--muted)",
  margin: "14px 0 18px",
  maxWidth: 300,
};
const colHeaderStyle: React.CSSProperties = {
  fontFamily: "var(--font-archivo)",
  fontWeight: 800,
  fontSize: 12.5,
  letterSpacing: ".12em",
  textTransform: "uppercase",
  color: "var(--ink)",
  margin: "0 0 16px",
};
const linkListStyle: React.CSSProperties = {
  listStyle: "none",
  margin: 0,
  padding: 0,
  display: "flex",
  flexDirection: "column",
  gap: 12,
};
const linkStyle: React.CSSProperties = {
  color: "var(--muted)",
  fontSize: 14,
  textDecoration: "none",
  lineHeight: 1.25,
};
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
const infoStyle: React.CSSProperties = {
  fontSize: 13,
  color: "var(--muted)",
};
const bottomBarStyle: React.CSSProperties = {
  marginTop: 44,
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

export default async function MarketingFooter() {
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
              Sunshine Coast tile shop and supplier. Beautiful floor, wall and
              outdoor tiles, chosen and matched with care by a local family team.
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

          {/* ── Directory link columns (extend in lib/content.ts) ── */}
          {FOOTER_COLUMNS.map((col) => (
            <div key={col.title}>
              <div style={colHeaderStyle}>{col.title}</div>
              <ul style={linkListStyle}>
                {col.links.map((l) => (
                  <li key={`${col.title}-${l.label}`}>
                    <Link href={l.href} className="owf-link" style={linkStyle}>
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* ── Bottom bar ────────────────────────────────────────── */}
        <div style={bottomBarStyle}>
          <div style={infoStyle}>
            © 2026 {SHOP.name} · {SHOP.suburb} {SHOP.state} · Tiles, supply only
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
            <Link href="/terms" className="owf-link" style={{ ...infoStyle, textDecoration: "none" }}>
              Terms of Service
            </Link>
            <Link href="/website-terms" className="owf-link" style={{ ...infoStyle, textDecoration: "none" }}>
              Website Terms
            </Link>
            <Link href="/trade/login" className="owf-link" style={{ ...infoStyle, fontWeight: 700, textDecoration: "none", color: "var(--accent)" }}>
              Trade Partner login
            </Link>
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
      </div>
    </footer>
  );
}
