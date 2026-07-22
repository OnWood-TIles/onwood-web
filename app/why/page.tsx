import type { Metadata } from "next";
import Link from "next/link";
import MarketingNav from "../components/marketing/MarketingNav";
import MarketingFooter from "../components/marketing/MarketingFooter";
import Reveal from "../components/ui/Reveal";
import CountUp from "../components/ui/CountUp";
import { getBusiness, listRanges, type WebsiteRange } from "../../lib/onbase/client";

export const metadata: Metadata = {
  title: "Why OnWood Tiles",
  description:
    "We don't just sell tiles - we help you get the whole room right. A curated Sunshine Coast tile range, honest advice, live stock, and supply + installation by hand from our Baringa showroom.",
};

export const dynamic = "force-dynamic";

// Warm arched-niche placeholder, used when there's no real photo for a slot yet.
const NICHE_BG =
  "linear-gradient(160deg, color-mix(in srgb, var(--accent) 13%, var(--surface)), color-mix(in srgb, var(--sea) 9%, var(--surface)))";

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

const VALUES = [
  {
    n: "01",
    title: "Chosen, not just stocked",
    body: "Every finish in our range earns its place. We curate tiles that actually work for coastal homes, then help you match them to your space, not just point you at a shelf.",
  },
  {
    n: "02",
    title: "Up to date on trends and tech",
    body: "Tile design and surface technology move fast. We keep on top of the latest looks, formats and finishes, so the advice you get is current, not last decade's catalogue.",
  },
  {
    n: "03",
    title: "The complete package",
    body: "Not just tiles. We finish the whole job with modern accessories, tapware, adhesives, trims and more, so everything comes from one place and actually works together.",
  },
  {
    n: "04",
    title: "Local and independent",
    body: "No franchise script, no pushy upsell. Honest advice from a Sunshine Coast team who'll still be here when your next project comes around.",
  },
];

const STEPS = [
  { n: 1, title: "Visit the showroom", body: "See full-size boards and big-format samples in honest coastal light, and take samples home the same day." },
  { n: 2, title: "We match your space", body: "Bring photos or plans. We help you choose colour, size and layout for the way your room actually runs." },
  { n: 3, title: "Order with live stock", body: "What you see is what we can supply. We check real stock before you commit, so there are no surprises." },
  { n: 4, title: "Follow-up and aftercare", body: "Once your tiles are down, we're still here. Ask us about cleaning, sealing and keeping your surface looking its best for years to come." },
];

const QUOTES = [
  { text: "The team matched a wood-look porcelain to our deck perfectly. Half the house has asked where the floor is from.", name: "Hannah P.", place: "Pelican Waters" },
  { text: "Honest advice, no upsell, and the samples went home with us the same day. Made choosing so much easier.", name: "Dan & Mel", place: "Buderim" },
  { text: "Beautiful zellige for our splashback and it turned up exactly when they said. Genuinely lovely to deal with.", name: "Priya S.", place: "Caloundra" },
];

function gatherImages(ranges: WebsiteRange[]): string[] {
  const rooms: string[] = [];
  const products: string[] = [];
  for (const r of ranges) {
    const room = r.swatches?.[0]?.installedImage || r.swatches?.find((s) => s.installedImage)?.installedImage;
    const prod = r.heroImage || r.swatches?.find((s) => s.image)?.image;
    if (room) rooms.push(room);
    if (prod) products.push(prod);
  }
  // Prefer lifestyle room shots, then fall back to product photos.
  return [...rooms, ...products].filter(Boolean) as string[];
}

// An arched image niche - real photo if we have one, warm gradient otherwise.
function Niche({ src, alt, radius, minH }: { src?: string | null; alt: string; radius: string; minH: string }) {
  return (
    <div className="wy-niche" style={{ position: "relative", borderRadius: radius, overflow: "hidden", minHeight: minH, background: NICHE_BG, boxShadow: "0 24px 56px -22px rgba(32,48,58,.28)" }}>
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img className="wy-niche-img" src={src} alt={alt} loading="lazy" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
      ) : (
        <div aria-label={alt} role="img" style={{ position: "absolute", inset: 0 }} />
      )}
    </div>
  );
}

function CTA({ href, label, primary }: { href: string; label: string; primary?: boolean }) {
  return (
    <Link
      href={href}
      style={
        primary
          ? { display: "inline-flex", alignItems: "center", gap: 8, background: "var(--accent)", color: "#fff6ee", fontWeight: 800, fontSize: 15, padding: "14px 26px", borderRadius: 999, textDecoration: "none", boxShadow: "0 14px 30px -12px rgba(208,106,69,.6)" }
          : { display: "inline-flex", alignItems: "center", gap: 8, color: "var(--ink)", fontWeight: 800, fontSize: 15, padding: "14px 24px", borderRadius: 999, textDecoration: "none", border: "1.5px solid var(--line)", background: "var(--surface)" }
      }
    >
      {label} <span aria-hidden>&rarr;</span>
    </Link>
  );
}

export default async function WhyPage() {
  const [business, ranges] = await Promise.all([getBusiness(), listRanges()]);
  const pics = gatherImages(ranges);
  const addr = business ? [business.addressLine1, business.addressLine2].filter(Boolean).join(", ") : "Baringa, Sunshine Coast";

  return (
    <div data-theme="terracotta" style={{ background: "var(--bg)", color: "var(--ink)" }}>
      <MarketingNav />
      <main>
        {/* ── Hero ─────────────────────────────────────────────── */}
        <section style={{ maxWidth: 1240, margin: "0 auto", padding: "140px 40px 40px" }}>
          <div className="wy-hero-grid">
            <div>
              <Reveal>
                <div style={eyebrow}>Why OnWood Tiles</div>
              </Reveal>
              <Reveal delay={0.06}>
                <h1 style={{ fontFamily: "var(--font-archivo)", fontWeight: 800, fontSize: "clamp(38px,5.4vw,66px)", letterSpacing: "-.025em", lineHeight: 1.02, margin: "16px 0 0" }}>
                  We don&rsquo;t just sell tiles. We help you get the whole room {serif("right.")}
                </h1>
              </Reveal>
              <Reveal delay={0.12}>
                <p style={{ color: "#5a6067", fontSize: 17, lineHeight: 1.7, margin: "22px 0 0", maxWidth: 540 }}>
                  Every OnWood project starts with your space, your light and your budget. We help you choose, match and pull the whole look together, from the tiles to the finishing details, so you end up with a room you&rsquo;ll love for years. All from a local, family-run team right here on the Sunshine Coast.
                </p>
              </Reveal>
              <Reveal delay={0.18}>
                <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginTop: 30 }}>
                  <CTA href="/book" label="Book a showroom visit" primary />
                  <CTA href="/shop" label="Browse the range" />
                </div>
              </Reveal>
            </div>
            <Reveal delay={0.1}>
              <div className="wy-hero-mosaic">
                <div style={{ gridArea: "tall" }}>
                  <Niche src={pics[0]} alt="A tiled Sunshine Coast room" radius="200px 200px 22px 22px" minH="clamp(300px,40vw,460px)" />
                </div>
                <div style={{ gridArea: "a" }}>
                  <Niche src={pics[1]} alt="Tile detail" radius="120px 120px 18px 18px" minH="clamp(150px,20vw,220px)" />
                </div>
                <div style={{ gridArea: "b" }}>
                  <Niche src={pics[2]} alt="Finished floor" radius="18px 18px 120px 120px" minH="clamp(150px,20vw,220px)" />
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ── Values / what makes us different ─────────────────── */}
        <section style={{ maxWidth: 1240, margin: "0 auto", padding: "70px 40px 20px" }}>
          <Reveal>
            <div style={{ ...eyebrow, color: "var(--sea)" }}>What makes us different</div>
          </Reveal>
          <Reveal delay={0.05}>
            <h2 style={{ fontFamily: "var(--font-archivo)", fontWeight: 800, fontSize: "clamp(28px,3.6vw,46px)", letterSpacing: "-.02em", margin: "12px 0 40px", maxWidth: 620 }}>
              A tile shop that actually {serif("sweats the details.")}
            </h2>
          </Reveal>
          <div className="wy-values">
            {VALUES.map((v, i) => (
              <Reveal key={v.n} delay={i * 0.06}>
                <article className="wy-val">
                  <span className="wy-val-bar" aria-hidden />
                  <div style={{ fontFamily: "var(--font-archivo)", fontWeight: 900, fontSize: 15, letterSpacing: ".12em", color: "var(--accent)" }}>{v.n}</div>
                  <h3 style={{ fontFamily: "var(--font-archivo)", fontWeight: 800, fontSize: 20, letterSpacing: "-.01em", margin: "14px 0 8px" }}>{v.title}</h3>
                  <p style={{ color: "var(--muted)", fontSize: 14.5, lineHeight: 1.6, margin: 0 }}>{v.body}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ── The Owners ───────────────────────────────────────── */}
        <section style={{ maxWidth: 1240, margin: "0 auto", padding: "96px 40px 20px" }}>
          <div className="wy-owners">
            <Reveal>
              <div style={{ position: "relative" }}>
                <Niche alt="The OnWood Tiles owners - photo coming soon" radius="22px 200px 22px 200px" minH="clamp(320px,36vw,440px)" />
                <span style={{ position: "absolute", bottom: 18, left: 18, background: "var(--surface)", color: "var(--ink)", fontWeight: 800, fontSize: 12.5, letterSpacing: ".03em", padding: "8px 15px", borderRadius: 999, boxShadow: "0 12px 26px -12px rgba(32,48,58,.4)" }}>
                  Family owned &amp; operated
                </span>
              </div>
            </Reveal>
            <div>
              <Reveal><div style={eyebrow}>The owners</div></Reveal>
              <Reveal delay={0.05}>
                <h2 style={{ fontFamily: "var(--font-archivo)", fontWeight: 800, fontSize: "clamp(28px,3.6vw,44px)", letterSpacing: "-.02em", margin: "12px 0 16px" }}>
                  A husband-and-wife team, {serif("obsessed with getting it right.")}
                </h2>
              </Reveal>
              <Reveal delay={0.1}>
                <p style={{ color: "#5a6067", fontSize: 16, lineHeight: 1.7, margin: "0 0 16px", maxWidth: 510 }}>
                  OnWood Tiles is family owned and operated, run by a husband-and-wife team with over 15 years of combined experience in the flooring industry.
                </p>
              </Reveal>
              <Reveal delay={0.14}>
                <p style={{ color: "#5a6067", fontSize: 16, lineHeight: 1.7, margin: 0, maxWidth: 510 }}>
                  Our roots run deep, from manufacturing through to retail, so we&rsquo;ve seen first-hand what makes a surface last and what makes a room feel right. That&rsquo;s the eye, and the honesty, we bring to every single project.
                </p>
              </Reveal>
              <Reveal delay={0.16}>
                <div style={{ marginTop: 22 }}>
                  <div style={{ fontFamily: "var(--font-newsreader)", fontStyle: "italic", fontSize: 24, color: "var(--ink)", lineHeight: 1 }}>Reagan &amp; Caz Genrich</div>
                  <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--muted)", marginTop: 6 }}>Owners, OnWood Tiles</div>
                </div>
              </Reveal>
              <Reveal delay={0.2}>
                <div style={{ display: "flex", gap: 30, marginTop: 26, flexWrap: "wrap" }}>
                  <div>
                    <div style={{ fontFamily: "var(--font-archivo)", fontWeight: 900, fontSize: 32, color: "var(--accent)", lineHeight: 1 }}>15+</div>
                    <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 5 }}>Years combined experience</div>
                  </div>
                  <div>
                    <div style={{ fontFamily: "var(--font-archivo)", fontWeight: 900, fontSize: 32, color: "var(--accent)", lineHeight: 1 }}>100%</div>
                    <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 5 }}>Family owned &amp; operated</div>
                  </div>
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        {/* ── Stats band (aegean) ──────────────────────────────── */}
        <section style={{ background: "linear-gradient(160deg,#1A5563,#123C46)", color: "#fff", padding: "84px 40px", marginTop: 70 }}>
          <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 24, textAlign: "center" }} className="wy-stats">
            {([
              { display: "1000s", label: "Products to choose from" },
              { display: "4551", label: "Baringa showroom, on your doorstep" },
              { count: 100, suffix: "%", label: "Local, independent & Sunshine Coast owned" },
            ] as { display?: string; count?: number; suffix?: string; label: string }[]).map((s, i) => (
              <Reveal key={s.label} delay={i * 0.08}>
                <div style={{ fontFamily: "var(--font-archivo)", fontWeight: 900, fontSize: "clamp(38px,5vw,60px)", color: "#f0a884", lineHeight: 1 }}>
                  {s.count != null ? <CountUp to={s.count} suffix={s.suffix} /> : <span>{s.display}</span>}
                </div>
                <div style={{ fontSize: 14, color: "rgba(255,255,255,.76)", marginTop: 10, maxWidth: 230, marginInline: "auto", lineHeight: 1.5 }}>{s.label}</div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ── Process ──────────────────────────────────────────── */}
        <section style={{ maxWidth: 1240, margin: "0 auto", padding: "96px 40px 20px" }}>
          <div style={{ textAlign: "center", marginBottom: 46 }}>
            <Reveal><div style={{ ...eyebrow, color: "var(--sea)" }}>How it works</div></Reveal>
            <Reveal delay={0.05}>
              <h2 style={{ fontFamily: "var(--font-archivo)", fontWeight: 800, fontSize: "clamp(28px,3.6vw,46px)", letterSpacing: "-.02em", margin: "12px 0 0" }}>
                From first sample to {serif("finished floor.")}
              </h2>
            </Reveal>
          </div>
          <div className="wy-steps">
            <span className="wy-steps-line" aria-hidden />
            {STEPS.map((s, i) => (
              <Reveal key={s.n} delay={i * 0.07}>
                <div style={{ position: "relative", textAlign: "center", padding: "0 6px" }}>
                  <div className="wy-step-num">{s.n}</div>
                  <h3 style={{ fontFamily: "var(--font-archivo)", fontWeight: 800, fontSize: 18, letterSpacing: "-.01em", margin: "18px 0 8px" }}>{s.title}</h3>
                  <p style={{ color: "var(--muted)", fontSize: 14, lineHeight: 1.6, margin: 0, maxWidth: 260, marginInline: "auto" }}>{s.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ── Showroom callout ─────────────────────────────────── */}
        <section style={{ maxWidth: 1240, margin: "0 auto", padding: "96px 40px 40px" }}>
          <div className="wy-showroom">
            <Reveal>
              <Niche src={pics[3] || pics[0]} alt="Inside the OnWood Tiles Baringa showroom" radius="220px 22px 220px 22px" minH="clamp(300px,34vw,420px)" />
            </Reveal>
            <div>
              <Reveal><div style={eyebrow}>Step inside</div></Reveal>
              <Reveal delay={0.05}>
                <h2 style={{ fontFamily: "var(--font-archivo)", fontWeight: 800, fontSize: "clamp(28px,3.6vw,44px)", letterSpacing: "-.02em", margin: "12px 0 14px" }}>
                  See the finishes {serif("in the flesh.")}
                </h2>
              </Reveal>
              <Reveal delay={0.1}>
                <p style={{ color: "#5a6067", fontSize: 16, lineHeight: 1.7, margin: "0 0 20px", maxWidth: 480 }}>
                  Full-size boards, big-format samples and honest Sunshine Coast light. Come and stand a tile next to your own colours before you commit, and take samples home the same day.
                </p>
              </Reveal>
              <Reveal delay={0.15}>
                <div style={{ display: "flex", gap: 22, flexWrap: "wrap", color: "var(--ink)", fontSize: 14.5, marginBottom: 24 }}>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 12, letterSpacing: ".08em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 4 }}>Showroom</div>
                    <div>{addr}</div>
                  </div>
                  {business?.openHoursSummary && (
                    <div>
                      <div style={{ fontWeight: 800, fontSize: 12, letterSpacing: ".08em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 4 }}>Open</div>
                      <div>{business.openHoursSummary}</div>
                    </div>
                  )}
                </div>
              </Reveal>
              <Reveal delay={0.2}>
                <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
                  <CTA href="/book" label="Book a visit" primary />
                  <CTA href="/shop" label="Browse online" />
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        {/* ── Testimonials ─────────────────────────────────────── */}
        <section style={{ maxWidth: 1240, margin: "0 auto", padding: "70px 40px 40px" }}>
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <Reveal><div style={{ ...eyebrow, color: "var(--sea)" }}>From Sunshine Coast homes</div></Reveal>
            <Reveal delay={0.05}>
              <h2 style={{ fontFamily: "var(--font-archivo)", fontWeight: 800, fontSize: "clamp(28px,3.6vw,46px)", letterSpacing: "-.02em", margin: "12px 0 0" }}>
                People stop and {serif("look down.")}
              </h2>
            </Reveal>
          </div>
          <div className="wy-quotes">
            {QUOTES.map((q, i) => (
              <Reveal key={q.name} delay={i * 0.07}>
                <figure className="wy-quote">
                  <div aria-hidden style={{ fontFamily: "var(--font-newsreader)", fontStyle: "italic", fontSize: 44, lineHeight: 0.4, color: "var(--accent)", height: 20 }}>&ldquo;</div>
                  <blockquote style={{ margin: 0, fontSize: 15.5, lineHeight: 1.65, color: "var(--ink)" }}>{q.text}</blockquote>
                  <figcaption style={{ marginTop: 16, fontSize: 13.5, fontWeight: 700 }}>
                    {q.name} <span style={{ color: "var(--muted)", fontWeight: 500 }}>&middot; {q.place}</span>
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ── Final CTA ────────────────────────────────────────── */}
        <section style={{ padding: "40px 40px 110px" }}>
          <div style={{ maxWidth: 1080, margin: "0 auto", borderRadius: 28, overflow: "hidden", background: "linear-gradient(150deg,#d06a45,#b0501f)", color: "#fff6ee", padding: "clamp(40px,6vw,72px)", textAlign: "center", boxShadow: "0 30px 70px -30px rgba(176,80,31,.6)" }}>
            <Reveal>
              <h2 style={{ fontFamily: "var(--font-archivo)", fontWeight: 800, fontSize: "clamp(30px,4.4vw,52px)", letterSpacing: "-.02em", margin: 0, lineHeight: 1.05 }}>
                Come and see it in the flesh.
              </h2>
            </Reveal>
            <Reveal delay={0.06}>
              <p style={{ fontSize: 17, lineHeight: 1.65, margin: "16px auto 30px", maxWidth: 520, color: "rgba(255,246,238,.9)" }}>
                Pop into the Baringa showroom, bring your photos, and let&rsquo;s get your whole room right.
              </p>
            </Reveal>
            <Reveal delay={0.12}>
              <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
                <Link href="/book" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#fff6ee", color: "var(--ink)", fontWeight: 800, fontSize: 15, padding: "14px 28px", borderRadius: 999, textDecoration: "none" }}>
                  Book a showroom visit <span aria-hidden>&rarr;</span>
                </Link>
                <Link href="/shop" style={{ display: "inline-flex", alignItems: "center", gap: 8, color: "#fff6ee", fontWeight: 800, fontSize: 15, padding: "14px 26px", borderRadius: 999, textDecoration: "none", border: "1.5px solid rgba(255,246,238,.5)" }}>
                  Browse the range <span aria-hidden>&rarr;</span>
                </Link>
              </div>
            </Reveal>
          </div>
        </section>
      </main>
      <MarketingFooter />

      <style>{`
        .wy-hero-grid{display:grid;grid-template-columns:1.05fr .95fr;gap:52px;align-items:center;}
        .wy-hero-mosaic{display:grid;grid-template-columns:1fr 1fr;grid-template-rows:auto auto;gap:16px;grid-template-areas:"tall a" "tall b";}
        @media(max-width:900px){.wy-hero-grid{grid-template-columns:1fr;gap:38px;}}
        @media(max-width:520px){.wy-hero-mosaic{grid-template-areas:"tall tall" "a b";}}
        .wy-niche-img{transition:transform .7s cubic-bezier(.2,.6,.2,1);}
        .wy-niche:hover .wy-niche-img{transform:scale(1.06);}

        .wy-values{display:grid;grid-template-columns:repeat(4,1fr);gap:20px;}
        @media(max-width:980px){.wy-values{grid-template-columns:repeat(2,1fr);}}
        @media(max-width:560px){.wy-values{grid-template-columns:1fr;}}
        .wy-val{position:relative;height:100%;background:var(--surface);border:1px solid var(--line);border-radius:20px;padding:26px 22px 24px;overflow:hidden;transition:transform .3s ease, box-shadow .3s ease;}
        .wy-val:hover{transform:translateY(-6px);box-shadow:0 26px 54px -26px rgba(32,48,58,.32);}
        .wy-val-bar{position:absolute;top:0;left:0;right:0;height:4px;background:linear-gradient(90deg,var(--accent),var(--accent2));transform:scaleX(0);transform-origin:left;transition:transform .45s cubic-bezier(.2,.6,.2,1);}
        .wy-val:hover .wy-val-bar{transform:scaleX(1);}

        .wy-steps{display:grid;grid-template-columns:repeat(4,1fr);gap:24px;position:relative;}
        .wy-steps-line{position:absolute;top:26px;left:12%;right:12%;height:2px;background:linear-gradient(90deg,transparent,var(--line) 12%,var(--line) 88%,transparent);z-index:0;}
        @media(max-width:860px){.wy-steps{grid-template-columns:1fr 1fr;gap:36px 20px;}.wy-steps-line{display:none;}}
        @media(max-width:520px){.wy-steps{grid-template-columns:1fr;}}
        .wy-step-num{position:relative;z-index:1;width:52px;height:52px;margin:0 auto;border-radius:50%;display:grid;place-items:center;font-family:var(--font-archivo);font-weight:900;font-size:20px;color:#fff6ee;background:linear-gradient(150deg,var(--accent),#b0501f);box-shadow:0 12px 26px -10px rgba(208,106,69,.6);border:4px solid var(--bg);}

        .wy-owners{display:grid;grid-template-columns:.85fr 1.15fr;gap:52px;align-items:center;}
        @media(max-width:860px){.wy-owners{grid-template-columns:1fr;gap:34px;}}

        .wy-showroom{display:grid;grid-template-columns:1fr 1fr;gap:52px;align-items:center;}
        @media(max-width:860px){.wy-showroom{grid-template-columns:1fr;gap:34px;}}

        .wy-quotes{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;}
        @media(max-width:860px){.wy-quotes{grid-template-columns:1fr;}}
        .wy-quote{height:100%;background:var(--surface);border:1px solid var(--line);border-radius:20px;padding:26px 24px 22px;box-shadow:0 14px 36px -24px rgba(32,48,58,.3);}

        @media(max-width:640px){.wy-stats{grid-template-columns:1fr!important;gap:36px!important;}}
      `}</style>
    </div>
  );
}
