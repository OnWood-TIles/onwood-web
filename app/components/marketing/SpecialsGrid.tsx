import Reveal from "../ui/Reveal";
import { SPECIALS_PAGE } from "../../../lib/content";

// The 6 special-offer cards, matching the reference (arched swatch top, % OFF
// badge, tag, name, was/now price, note, Enquire link).
export default function SpecialsGrid() {
  return (
    <section
      style={{
        padding: "40px 40px 90px",
        maxWidth: 1240,
        margin: "0 auto",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3,1fr)",
          gap: 24,
        }}
        className="specials-grid"
      >
        {SPECIALS_PAGE.items.map((it, i) => (
          <Reveal key={it.name} delay={(i % 3) * 0.06}>
            <article
              style={{
                position: "relative",
                borderRadius: 20,
                overflow: "hidden",
                background: "var(--surface)",
                border: "1px solid var(--line)",
                height: "100%",
              }}
            >
              <div
                style={{
                  position: "relative",
                  margin: "10px 10px 0",
                  aspectRatio: "4 / 3.4",
                  borderRadius: "130px 130px 0 0",
                  overflow: "hidden",
                  background: it.swatch,
                }}
              >
                <span
                  style={{
                    position: "absolute",
                    top: 14,
                    right: 14,
                    zIndex: 2,
                    background: "var(--accent)",
                    color: "#fff",
                    fontFamily: "var(--font-archivo)",
                    fontWeight: 900,
                    fontSize: 14,
                    padding: "8px 12px",
                    borderRadius: 100,
                    boxShadow: "0 8px 20px rgba(0,0,0,.2)",
                  }}
                >
                  {it.pct}
                </span>
              </div>
              <div style={{ padding: "16px 18px 20px" }}>
                <div
                  style={{
                    fontSize: 11.5,
                    fontWeight: 700,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: "var(--muted)",
                  }}
                >
                  {it.tag}
                </div>
                <h3
                  style={{
                    fontFamily: "var(--font-archivo)",
                    fontWeight: 800,
                    fontSize: 20,
                    margin: "6px 0 8px",
                    color: "var(--ink)",
                  }}
                >
                  {it.name}
                </h3>
                <div style={{ fontSize: 15, marginBottom: 6 }}>
                  <span style={{ textDecoration: "line-through", color: "var(--muted)" }}>
                    {it.was}
                  </span>{" "}
                  <strong style={{ color: "var(--accent)", fontSize: 18 }}>{it.now}</strong>
                </div>
                <div style={{ fontSize: 13, color: "var(--muted)" }}>{it.note}</div>
                <a
                  href="/#contact"
                  style={{
                    display: "inline-block",
                    marginTop: 14,
                    textDecoration: "none",
                    color: "var(--ink)",
                    fontWeight: 700,
                    fontSize: 14,
                    borderBottom: "2px solid var(--accent)",
                    paddingBottom: 2,
                  }}
                >
                  Enquire →
                </a>
              </div>
            </article>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
