import Reveal from "../ui/Reveal";
import CollectionCard from "./CollectionCard";
import { COLLECTIONS, COLLECTIONS_HEAD } from "../../../lib/content";

// Collections grid (reference: 04-section-collections). 3-col grid of arched
// swatch cards, collapsing to 1-col on narrow screens. Head row: eyebrow + H2
// on the left, "Request full sample box" link on the right.
const gridCss = `
.onwood-collections-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:22px;}
@media (max-width:700px){.onwood-collections-grid{grid-template-columns:1fr;}}
`;

export default function Collections() {
  return (
    <section
      id="collections"
      style={{ padding: "40px 40px 110px", maxWidth: 1240, margin: "0 auto" }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          gap: 20,
          flexWrap: "wrap",
          marginBottom: 40,
        }}
      >
        <div>
          <Reveal>
            <div
              style={{
                fontSize: 12.5,
                fontWeight: 700,
                letterSpacing: ".18em",
                textTransform: "uppercase",
                color: "var(--accent2)",
              }}
            >
              {COLLECTIONS_HEAD.eyebrow}
            </div>
          </Reveal>
          <Reveal delay={0.06}>
            <h2
              style={{
                fontFamily: "var(--font-archivo)",
                fontWeight: 800,
                fontSize: "clamp(30px,4vw,52px)",
                letterSpacing: "-.02em",
                margin: "12px 0 0",
              }}
            >
              {COLLECTIONS_HEAD.title}
            </h2>
          </Reveal>
        </div>
        <Reveal delay={0.12}>
          <a
            href={COLLECTIONS_HEAD.cta.href}
            style={{
              textDecoration: "none",
              color: "var(--ink)",
              fontWeight: 700,
              fontSize: 14,
              borderBottom: "2px solid var(--accent)",
              paddingBottom: 3,
              display: "inline-block",
            }}
          >
            {COLLECTIONS_HEAD.cta.label} &rarr;
          </a>
        </Reveal>
      </div>

      <style>{gridCss}</style>
      <div className="onwood-collections-grid">
        {COLLECTIONS.map((col, i) => (
          <Reveal key={col.name} delay={i * 0.06}>
            <CollectionCard col={col} />
          </Reveal>
        ))}
      </div>
    </section>
  );
}
