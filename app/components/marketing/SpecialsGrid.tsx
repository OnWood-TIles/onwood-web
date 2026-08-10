import Reveal from "../ui/Reveal";
import { SPECIALS_PAGE } from "../../../lib/content";

// The current specials, each an arched real-tile photo, a badge, name, price (when
// there is one) + an Enquire link. Real product photos route through /api/tile so
// the white catalogue margin is trimmed off.
export default function SpecialsGrid() {
  return (
    <section
      style={{
        padding: "10px 40px 70px",
        maxWidth: 940,
        margin: "0 auto",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2,1fr)",
          gap: 28,
        }}
        className="specials-grid"
      >
        {SPECIALS_PAGE.items.map((it, i) => (
          <Reveal key={it.name} delay={(i % 2) * 0.08}>
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
                  aspectRatio: "4 / 3.2",
                  borderRadius: "130px 130px 0 0",
                  overflow: "hidden",
                  background: it.swatch || "#efece5",
                }}
              >
                {it.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={`/api/tile?u=${encodeURIComponent(it.image)}`}
                    alt={it.name}
                    style={{
                      position: "absolute",
                      inset: 0,
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      display: "block",
                    }}
                  />
                ) : null}
                {it.pct ? (
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
                ) : null}
              </div>
              <div style={{ padding: "16px 20px 22px" }}>
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
                    fontSize: 22,
                    margin: "6px 0 8px",
                    color: "var(--ink)",
                  }}
                >
                  {it.name}
                </h3>
                {it.now ? (
                  <div style={{ fontSize: 15, marginBottom: 6 }}>
                    {it.was ? (
                      <span style={{ textDecoration: "line-through", color: "var(--muted)" }}>
                        {it.was}
                      </span>
                    ) : null}{" "}
                    <strong style={{ color: "var(--accent)", fontSize: 19 }}>{it.now}</strong>
                  </div>
                ) : null}
                <div style={{ fontSize: 13.5, lineHeight: 1.55, color: "var(--muted)" }}>
                  {it.note}
                </div>
                <a
                  href="/contact"
                  style={{
                    display: "inline-block",
                    marginTop: 16,
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
