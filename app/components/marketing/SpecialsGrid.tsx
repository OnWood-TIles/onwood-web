import Reveal from "../ui/Reveal";
import { SPECIALS_PAGE } from "../../../lib/content";

// Each special is shown "in the room": the product's real "see it installed" photo
// is the card hero, with the actual singular tile floated on top of it (trimmed via
// /api/tile), plus a badge, name, price and Enquire link. No arched/oval shapes.
export default function SpecialsGrid() {
  return (
    <section style={{ padding: "6px 40px 56px", maxWidth: 1080, margin: "0 auto" }}>
      <div
        className="specials-grid"
        style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 30 }}
      >
        {SPECIALS_PAGE.items.map((it, i) => (
          <Reveal key={it.name} delay={(i % 2) * 0.08}>
            <article
              style={{
                borderRadius: 22,
                overflow: "hidden",
                background: "var(--surface)",
                border: "1px solid var(--line)",
                height: "100%",
                boxShadow: "0 20px 50px rgba(32,48,58,.10)",
              }}
            >
              {/* "See it installed" room hero */}
              <div style={{ position: "relative", aspectRatio: "4 / 3", overflow: "hidden", background: "#e7ddcd" }}>
                {it.room ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={it.room}
                    alt={`${it.name} installed`}
                    style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                  />
                ) : null}
                {it.pct ? (
                  <span
                    style={{
                      position: "absolute",
                      top: 14,
                      right: 14,
                      background: "var(--accent)",
                      color: "#fff",
                      fontFamily: "var(--font-archivo)",
                      fontWeight: 900,
                      fontSize: 14,
                      padding: "8px 13px",
                      borderRadius: 100,
                      boxShadow: "0 8px 20px rgba(0,0,0,.25)",
                    }}
                  >
                    {it.pct}
                  </span>
                ) : null}
                {/* the actual tile, floated over the room */}
                {it.tile ? (
                  <span
                    style={{
                      position: "absolute",
                      left: 14,
                      bottom: 14,
                      width: 98,
                      height: 98,
                      borderRadius: 12,
                      background: "#fff",
                      padding: 5,
                      boxShadow: "0 12px 28px rgba(0,0,0,.36)",
                      boxSizing: "border-box",
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`/api/tile?u=${encodeURIComponent(it.tile)}`}
                      alt={it.name}
                      style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 8, display: "block" }}
                    />
                  </span>
                ) : null}
              </div>
              {/* details */}
              <div style={{ padding: "18px 22px 24px" }}>
                <div style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--muted)" }}>
                  {it.tag}
                </div>
                <h3 style={{ fontFamily: "var(--font-archivo)", fontWeight: 800, fontSize: 23, margin: "6px 0 8px", color: "var(--ink)" }}>
                  {it.name}
                </h3>
                {it.now ? (
                  <div style={{ fontSize: 15, marginBottom: 8 }}>
                    {it.was ? (
                      <span style={{ textDecoration: "line-through", color: "var(--muted)" }}>{it.was}</span>
                    ) : null}{" "}
                    <strong style={{ color: "var(--accent)", fontSize: 20 }}>{it.now}</strong>
                  </div>
                ) : null}
                <div style={{ fontSize: 13.5, lineHeight: 1.55, color: "var(--muted)" }}>{it.note}</div>
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
