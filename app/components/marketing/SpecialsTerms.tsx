import Reveal from "../ui/Reveal";
import { SPECIALS_PAGE } from "../../../lib/content";

// The specials terms & conditions - understated, numbered, covers every current
// offer (timber-look %, Aspect price, free delivery zones + the usual fine print).
export default function SpecialsTerms() {
  const { termsTitle, terms } = SPECIALS_PAGE;
  return (
    <section style={{ padding: "6px 40px 84px", maxWidth: 900, margin: "0 auto" }}>
      <Reveal>
        <div style={{ borderRadius: 18, border: "1px solid var(--line)", background: "var(--surface)", padding: "clamp(22px,3vw,34px)" }}>
          <h2 style={{ fontFamily: "var(--font-archivo)", fontWeight: 800, fontSize: 18, letterSpacing: "0.02em", margin: 0, color: "var(--ink)" }}>
            {termsTitle}
          </h2>
          <ol style={{ margin: "12px 0 0", padding: 0, listStyle: "none" }}>
            {terms.map((t, i) => (
              <li
                key={i}
                style={{
                  display: "flex",
                  gap: 12,
                  fontSize: 12.5,
                  lineHeight: 1.6,
                  color: "var(--muted)",
                  padding: "8px 0",
                  borderTop: i ? "1px solid var(--line)" : "none",
                }}
              >
                <span style={{ flexShrink: 0, fontWeight: 800, color: "var(--accent)", minWidth: 18 }}>{i + 1}.</span>
                <span>{t}</span>
              </li>
            ))}
          </ol>
        </div>
      </Reveal>
    </section>
  );
}
