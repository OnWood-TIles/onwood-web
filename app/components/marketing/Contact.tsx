// Contact section: a two-column layout with the shop's real details on the left
// (showroom address, visiting hours, email) and the shared "Send us a message"
// form on the right. The form is the SAME component used on the /contact page
// (ContactForm -> name/phone/email/message -> /api/enquiry), so the two never
// drift apart. Keeps id="contact" so /#contact anchor links still land here.
import { CONTACT, SHOP } from "../../../lib/content";
import ContactForm from "./ContactForm";
import styles from "./Contact.module.css";

const rowStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 12,
  fontSize: 15,
  color: "var(--ink)",
};

function chip(bg: string, color: string): React.CSSProperties {
  return {
    width: 38,
    height: 38,
    borderRadius: 10,
    background: bg,
    display: "grid",
    placeItems: "center",
    color,
    fontWeight: 800,
    flexShrink: 0,
  };
}

export default function Contact({ hours }: { hours?: string }) {
  const address = `Showroom · ${SHOP.street}, ${SHOP.suburb} ${SHOP.state} ${SHOP.postcode}`;

  return (
    <section
      id="contact"
      style={{
        padding: "100px 40px",
        background: "var(--surface)",
        borderTop: "1px solid var(--line)",
      }}
    >
      <div className={styles.wrap}>
        {/* Left: heading + real shop details */}
        <div>
          <h2
            style={{
              fontFamily: "var(--font-archivo)",
              fontWeight: 800,
              fontSize: "clamp(32px,4.4vw,56px)",
              letterSpacing: "-.02em",
              margin: "0 0 16px",
              lineHeight: 1.02,
              color: "var(--ink)",
            }}
          >
            {CONTACT.title}
          </h2>
          <p
            style={{
              color: "var(--muted)",
              fontSize: 16,
              lineHeight: 1.6,
              margin: "0 0 26px",
            }}
          >
            {CONTACT.sub}
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={rowStyle}>
              <span style={chip("var(--accent)", "#1a1411")} aria-hidden>
                ◎
              </span>
              {address}
            </div>
            <div style={rowStyle}>
              <span style={chip("var(--accent2)", "#fff")} aria-hidden>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round">
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 7v5l3 2" />
                </svg>
              </span>
              Visit us {hours || SHOP.hours}
            </div>
            <div style={rowStyle}>
              <span style={chip("var(--ink)", "var(--surface)")} aria-hidden>
                @
              </span>
              <a
                href={`mailto:${SHOP.email}`}
                style={{ color: "var(--ink)", textDecoration: "none" }}
              >
                {SHOP.email}
              </a>
            </div>
          </div>
        </div>

        {/* Right: the shared enquiry form -> /api/enquiry */}
        <ContactForm />
      </div>
    </section>
  );
}
