import type { Metadata } from "next";
import Link from "next/link";
import MarketingNav from "../components/marketing/MarketingNav";
import MarketingFooter from "../components/marketing/MarketingFooter";
import ContactForm from "../components/marketing/ContactForm";
import Reveal from "../components/ui/Reveal";
import { getBusiness } from "../../lib/onbase/client";
import { SHOP } from "../../lib/content";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Get in touch with OnWood Tiles. Send us a message, call the showroom, or find directions to our Baringa store on the Sunshine Coast.",
};

export const dynamic = "force-dynamic";

const eyebrow: React.CSSProperties = {
  fontSize: 12.5,
  fontWeight: 800,
  letterSpacing: ".2em",
  textTransform: "uppercase",
  color: "var(--accent2)",
};

const serif = (t: string) => (
  <em style={{ fontFamily: "var(--font-newsreader)", fontStyle: "italic", fontWeight: 500, color: "var(--accent)" }}>{t}</em>
);

function ReachCard({ icon, label, value, href, external }: { icon: React.ReactNode; label: string; value: string; href?: string; external?: boolean }) {
  const inner = (
    <>
      <span style={{ width: 46, height: 46, borderRadius: 13, flexShrink: 0, background: "color-mix(in srgb, var(--accent) 12%, var(--surface))", color: "var(--accent)", display: "grid", placeItems: "center" }}>{icon}</span>
      <span style={{ minWidth: 0 }}>
        <span style={{ display: "block", fontSize: 11.5, fontWeight: 800, letterSpacing: ".08em", textTransform: "uppercase", color: "var(--muted)" }}>{label}</span>
        <span style={{ display: "block", fontSize: 16, fontWeight: 700, color: "var(--ink)", marginTop: 3, wordBreak: "break-word" }}>{value}</span>
      </span>
    </>
  );
  const style: React.CSSProperties = { display: "flex", alignItems: "center", gap: 15, background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 16, padding: "16px 18px", textDecoration: "none", color: "inherit" };
  return href ? (
    <a className="ct-reach" href={href} style={style} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
      {inner}
    </a>
  ) : (
    <div style={style}>{inner}</div>
  );
}

export default async function ContactPage() {
  const business = await getBusiness();
  const phone = (business?.phone || "").trim();
  const email = (business?.email || SHOP.email).trim();
  const addr1 = (business?.addressLine1 || SHOP.street).trim();
  const addr2 = (business?.addressLine2 || `${SHOP.suburb} ${SHOP.state} ${SHOP.postcode}`).trim();
  const fullAddr = [addr1, addr2].filter(Boolean).join(", ");
  const hoursSummary = (business?.openHoursSummary || SHOP.hours).trim();
  const openHours = (business?.openHours || []).filter((d) => d && d.day);
  // Pin by COORDINATES, not a name/address search. OnWood isn't listed on Google
  // Maps yet, so a name/address query snaps to whichever business is registered at
  // the address (a competitor). Coordinates drop a plain, unlabelled pin. Swap to
  // the OnWood place ID once the listing is live. Packer Road, Baringa (Aura).
  const MAP_LAT = -26.8078;
  const MAP_LNG = 153.0677;
  const mapEmbed = `https://maps.google.com/maps?q=${MAP_LAT},${MAP_LNG}&z=16&output=embed`;
  const directions = `https://www.google.com/maps/dir/?api=1&destination=${MAP_LAT},${MAP_LNG}`;
  const telHref = `tel:${phone.replace(/[^0-9+]/g, "")}`;

  return (
    <div data-theme="terracotta" style={{ background: "var(--bg)", color: "var(--ink)" }}>
      <MarketingNav />
      <main>
        {/* ── Hero ─────────────────────────────────────────────── */}
        <section style={{ maxWidth: 1240, margin: "0 auto", padding: "140px 40px 20px", textAlign: "center" }}>
          <Reveal><div style={eyebrow}>Get in touch</div></Reveal>
          <Reveal delay={0.06}>
            <h1 style={{ fontFamily: "var(--font-archivo)", fontWeight: 800, fontSize: "clamp(40px,5.6vw,68px)", letterSpacing: "-.025em", lineHeight: 1.02, margin: "16px 0 0" }}>
              Come and say {serif("hello.")}
            </h1>
          </Reveal>
          <Reveal delay={0.12}>
            <p style={{ color: "#5a6067", fontSize: 17, lineHeight: 1.7, margin: "20px auto 0", maxWidth: 560 }}>
              Questions about a tile, a colour, stock, or a room you&rsquo;re planning? Send us a message, call the showroom, or drop in for a coffee and a fistful of samples. We&rsquo;d love to help.
            </p>
          </Reveal>
        </section>

        {/* ── Form + quick-reach ───────────────────────────────── */}
        <section style={{ maxWidth: 1240, margin: "0 auto", padding: "48px 40px 20px" }}>
          <div className="ct-grid">
            <Reveal><ContactForm /></Reveal>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <Reveal delay={0.06}>
                <h2 style={{ fontFamily: "var(--font-archivo)", fontWeight: 800, fontSize: 22, letterSpacing: "-.01em", margin: "4px 0 4px" }}>Reach us quickly</h2>
              </Reveal>
              {phone && (
                <Reveal delay={0.1}>
                  <ReachCard label="Call the showroom" value={phone} href={telHref} icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3-8.6A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.2a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z" /></svg>} />
                </Reveal>
              )}
              <Reveal delay={0.14}>
                <ReachCard label="Email us" value={email} href={`mailto:${email}`} icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="3" /><path d="m3 6 9 6 9-6" /></svg>} />
              </Reveal>
              <Reveal delay={0.18}>
                <ReachCard label="Visit the showroom" value={fullAddr} href={directions} external icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 6-9 12-9 12s-9-6-9-12a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>} />
              </Reveal>
              <Reveal delay={0.22}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginTop: 6, padding: "4px 2px" }}>
                  <div style={{ display: "flex", gap: 10 }}>
                    <a href={SHOP.socials.instagram} target="_blank" rel="noopener noreferrer" aria-label="OnWood Tiles on Instagram" className="ct-social">
                      <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden><rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" strokeWidth="2" /><circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="2" /><circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" /></svg>
                    </a>
                    <a href={SHOP.socials.facebook} target="_blank" rel="noopener noreferrer" aria-label="OnWood Tiles on Facebook" className="ct-social">
                      <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden><path d="M14 8.5V6.8c0-.7.4-1 1.1-1H16.5V3H14.2C11.9 3 11 4.4 11 6.4V8.5H9V11h2v8h3v-8h2.2l.4-2.5H14z" fill="currentColor" /></svg>
                    </a>
                  </div>
                  <Link href="/book" style={{ color: "var(--ink)", fontWeight: 800, fontSize: 14, textDecoration: "none", borderBottom: "2px solid var(--accent)", paddingBottom: 2 }}>
                    Rather book a visit? &rarr;
                  </Link>
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        {/* ── Find the showroom (map + directions) ─────────────── */}
        <section style={{ maxWidth: 1240, margin: "0 auto", padding: "70px 40px 110px" }}>
          <div style={{ textAlign: "center", marginBottom: 34 }}>
            <Reveal><div style={{ ...eyebrow, color: "var(--sea)" }}>Find us</div></Reveal>
            <Reveal delay={0.05}>
              <h2 style={{ fontFamily: "var(--font-archivo)", fontWeight: 800, fontSize: "clamp(28px,3.6vw,46px)", letterSpacing: "-.02em", margin: "12px 0 0" }}>
                The Baringa {serif("showroom.")}
              </h2>
            </Reveal>
          </div>
          <div className="ct-map">
            <Reveal>
              <div style={{ position: "relative", borderRadius: 22, overflow: "hidden", border: "1px solid var(--line)", boxShadow: "0 24px 56px -26px rgba(32,48,58,.34)", minHeight: 340, height: "100%" }}>
                <span style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, background: "linear-gradient(90deg,var(--accent),var(--accent2))", zIndex: 2 }} aria-hidden />
                <iframe
                  title="Map to the OnWood Tiles Baringa showroom"
                  src={mapEmbed}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  style={{ border: 0, width: "100%", height: "100%", minHeight: 340, display: "block", filter: "saturate(1.02)" }}
                />
              </div>
            </Reveal>
            <Reveal delay={0.08}>
              <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 22, padding: "28px 26px", boxShadow: "0 20px 50px -30px rgba(32,48,58,.3)", display: "flex", flexDirection: "column", gap: 20 }}>
                <div>
                  <div style={{ fontSize: 11.5, fontWeight: 800, letterSpacing: ".08em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 6 }}>Showroom</div>
                  <div style={{ fontSize: 17, fontWeight: 700, lineHeight: 1.4 }}>{addr1}</div>
                  <div style={{ fontSize: 15, color: "var(--muted)" }}>{addr2}</div>
                </div>
                <div>
                  <div style={{ fontSize: 11.5, fontWeight: 800, letterSpacing: ".08em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 8 }}>Opening hours</div>
                  {openHours.length ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                      {openHours.map((d) => (
                        <div key={d.day} style={{ display: "flex", justifyContent: "space-between", gap: 14, fontSize: 14 }}>
                          <span style={{ color: "var(--ink)", fontWeight: 600 }}>{d.day}</span>
                          <span style={{ color: d.closed ? "var(--muted)" : "var(--ink)" }}>{d.closed ? "Closed" : `${d.open} - ${d.close}`}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ fontSize: 15, color: "var(--ink)" }}>{hoursSummary}</div>
                  )}
                </div>
                <div style={{ fontSize: 13.5, color: "var(--muted)", lineHeight: 1.6 }}>
                  Free parking right out the front, and the kettle&rsquo;s usually on. Look for the ONWOOD sign.
                </div>
                <a href={directions} target="_blank" rel="noopener noreferrer" className="ct-dir" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, background: "var(--ink)", color: "var(--surface)", fontWeight: 800, fontSize: 15, padding: "14px 20px", borderRadius: 999, textDecoration: "none" }}>
                  Get directions <span aria-hidden>&rarr;</span>
                </a>
              </div>
            </Reveal>
          </div>
        </section>
      </main>
      <MarketingFooter />

      <style>{`
        .ct-grid{display:grid;grid-template-columns:1.15fr .85fr;gap:34px;align-items:start;}
        @media(max-width:860px){.ct-grid{grid-template-columns:1fr;gap:30px;}}
        .ct-map{display:grid;grid-template-columns:1.5fr .95fr;gap:24px;align-items:stretch;}
        @media(max-width:860px){.ct-map{grid-template-columns:1fr;}}
        .ct-reach{transition:transform .25s ease, box-shadow .25s ease, border-color .25s ease;}
        .ct-reach:hover{transform:translateY(-3px);box-shadow:0 18px 40px -22px rgba(32,48,58,.35);border-color:color-mix(in srgb, var(--accent) 40%, var(--line));}
        .ct-social{display:grid;place-items:center;width:40px;height:40px;border-radius:999px;color:var(--muted);border:1px solid var(--line);text-decoration:none;transition:color .2s ease, border-color .2s ease;}
        .ct-social:hover{color:var(--accent);border-color:var(--accent);}
        .ct-dir{transition:transform .2s ease, filter .2s ease;}
        .ct-dir:hover{transform:translateY(-2px);filter:brightness(1.1);}
      `}</style>
    </div>
  );
}
