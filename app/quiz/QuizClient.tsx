"use client";

import { useState } from "react";
import Link from "next/link";
import { QUESTIONS, scoreQuiz, type Candidate, type Option, type Question, type QuizResult } from "../../lib/quiz";
import SaveButton from "../components/wishlist/SaveButton";

export default function QuizClient({ candidates }: { candidates: Candidate[] }) {
  const [started, setStarted] = useState(false);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<(Option | null)[]>(() => QUESTIONS.map(() => null));
  const [result, setResult] = useState<QuizResult | null>(null);

  const pick = (opt: Option) => {
    const next = [...answers];
    next[step] = opt;
    setAnswers(next);
    if (step + 1 < QUESTIONS.length) setStep(step + 1);
    else setResult(scoreQuiz(candidates, next.filter(Boolean) as Option[]));
  };
  const back = () => setStep((s) => Math.max(0, s - 1));
  const restart = () => { setStarted(false); setStep(0); setAnswers(QUESTIONS.map(() => null)); setResult(null); if (typeof window !== "undefined") window.scrollTo(0, 0); };

  return (
    <main style={{ maxWidth: 1080, margin: "0 auto", padding: "clamp(96px,15vw,150px) 22px 90px" }}>
      {!started ? (
        <Intro count={QUESTIONS.length} onStart={() => setStarted(true)} />
      ) : result ? (
        <Result result={result} onRetake={restart} />
      ) : (
        <QuestionView q={QUESTIONS[step]} index={step} total={QUESTIONS.length} onPick={pick} onBack={back} chosenId={answers[step]?.id} />
      )}
    </main>
  );
}

// ── intro ─────────────────────────────────────────────────────────────────────
function Intro({ count, onStart }: { count: number; onStart: () => void }) {
  return (
    <section style={{ textAlign: "center", maxWidth: 680, margin: "0 auto" }}>
      <p style={eyebrow}>Selection by personality</p>
      <h1 style={{ ...h1, fontSize: "clamp(34px,6vw,62px)", marginTop: 14 }}>
        Find <em style={serif}>your</em> tile.
      </h1>
      <p style={{ fontSize: 18, lineHeight: 1.7, color: "#3a444a", margin: "18px auto 0", maxWidth: "52ch" }}>
        Answer {count} quick, playful questions and we&apos;ll match you with a tile that&apos;s genuinely <em style={{ fontStyle: "italic" }}>you</em> — then show you it in a real room. Takes about a minute.
      </p>
      <button type="button" onClick={onStart} style={{ ...cta, marginTop: 30, fontSize: 16, padding: "16px 34px" }}>
        Start the quiz →
      </button>
      <p style={{ fontSize: 12.5, color: "var(--muted)", marginTop: 16 }}>Just for fun — no email needed.</p>
    </section>
  );
}

// ── question ──────────────────────────────────────────────────────────────────
function QuestionView({ q, index, total, onPick, onBack, chosenId }: { q: Question; index: number; total: number; onPick: (o: Option) => void; onBack: () => void; chosenId?: string }) {
  const pct = Math.round((index / total) * 100);
  return (
    <section style={{ maxWidth: q.kind === "mood" && q.options.length <= 2 ? 900 : 820, margin: "0 auto" }}>
      {/* progress */}
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 26 }}>
        {index > 0 ? (
          <button type="button" onClick={onBack} aria-label="Back" style={{ ...ghostBtn }}>←</button>
        ) : <span style={{ width: 34 }} />}
        <div style={{ flex: 1, height: 6, background: "var(--surface)", borderRadius: 999, overflow: "hidden", border: "1px solid var(--line)" }}>
          <div style={{ width: `${pct}%`, height: "100%", background: "var(--accent)", transition: "width .3s ease" }} />
        </div>
        <span style={{ fontSize: 12.5, fontWeight: 800, color: "var(--muted)", whiteSpace: "nowrap" }}>{index + 1} / {total}</span>
      </div>

      <h2 style={{ ...h1, fontSize: "clamp(26px,4vw,40px)", textAlign: "center" }}>{q.title}</h2>
      {q.subtitle && <p style={{ textAlign: "center", color: "#5a6067", fontSize: 15.5, margin: "10px auto 0", maxWidth: "46ch" }}>{q.subtitle}</p>}

      {q.kind === "tap" ? (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "center", marginTop: 30 }}>
          {q.options.map((o) => (
            <button key={o.id} type="button" onClick={() => onPick(o)} style={{ ...tapOpt, ...(chosenId === o.id ? tapOptOn : {}) }}>
              {o.emoji && <span style={{ fontSize: 22 }}>{o.emoji}</span>}
              <span>{o.label}</span>
            </button>
          ))}
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: q.options.length <= 2 ? "repeat(auto-fit, minmax(240px, 1fr))" : "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginTop: 30 }}>
          {q.options.map((o) => (
            <button key={o.id} type="button" onClick={() => onPick(o)} style={{ ...moodCard, ...(chosenId === o.id ? moodCardOn : {}) }}>
              <div style={{ display: "flex", height: q.options.length <= 2 ? 150 : 120, borderRadius: 12, overflow: "hidden", border: "1px solid rgba(0,0,0,.06)" }}>
                {(o.palette || ["#eee"]).map((c, i) => <div key={i} style={{ flex: 1, background: c }} />)}
              </div>
              <div style={{ marginTop: 12, textAlign: "left" }}>
                <div style={{ fontFamily: "var(--font-archivo)", fontWeight: 800, fontSize: 16.5 }}>{o.label}</div>
                {o.sub && <div style={{ fontSize: 13, color: "#8a8577", marginTop: 2 }}>{o.sub}</div>}
              </div>
            </button>
          ))}
        </div>
      )}
    </section>
  );
}

// ── result ────────────────────────────────────────────────────────────────────
function Result({ result, onRetake }: { result: QuizResult; onRetake: () => void }) {
  const { persona, hero, runnersUp } = result;
  if (!hero) {
    return (
      <section style={{ textAlign: "center", maxWidth: 560, margin: "0 auto" }}>
        <h2 style={h1}>You&apos;re one of a kind ✨</h2>
        <p style={{ color: "#5a6067", fontSize: 16, lineHeight: 1.7, margin: "14px 0 26px" }}>We couldn&apos;t pin you to a single tile from that combination — which usually means you&apos;d love browsing the full range with us.</p>
        <Link href="/shop" style={{ ...cta, textDecoration: "none" }}>Browse the shop →</Link>
        <div><button type="button" onClick={onRetake} style={{ ...linkBtn, marginTop: 18 }}>↺ Retake the quiz</button></div>
      </section>
    );
  }
  const productHref = `/product/${hero.slug}?c=${encodeURIComponent(hero.colour)}`;
  const pinHref = `https://www.pinterest.com/pin/create/button/?url=${encodeURIComponent("https://onwoodtiles.com.au" + productHref)}&media=${encodeURIComponent(hero.img)}&description=${encodeURIComponent(`${persona.label} — ${hero.product} in ${hero.colour} | OnWood Tiles`)}`;
  return (
    <section style={{ maxWidth: 940, margin: "0 auto" }}>
      <div style={{ textAlign: "center" }}>
        <p style={eyebrow}>Your result</p>
        <h2 style={{ ...h1, fontSize: "clamp(30px,5vw,52px)", marginTop: 10 }}>{persona.label} {persona.emoji}</h2>
        <p style={{ fontSize: 17, lineHeight: 1.7, color: "#3a444a", margin: "14px auto 0", maxWidth: "50ch" }}>{persona.blurb}</p>
      </div>

      {/* hero tile */}
      <div style={{ marginTop: 30, background: "#fff", border: "1px solid var(--line)", borderRadius: 24, overflow: "hidden", boxShadow: "0 30px 70px -50px rgba(16,28,30,.6)" }}>
        <div style={{ position: "relative", aspectRatio: "16 / 10", background: "#f0ece3" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={hero.img} alt={`${hero.product} in ${hero.colour}, shown installed`} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
          <span style={{ position: "absolute", left: 16, top: 16, background: "rgba(255,255,255,.92)", color: "var(--ink)", fontWeight: 800, fontSize: 12, letterSpacing: ".06em", textTransform: "uppercase", padding: "7px 13px", borderRadius: 999 }}>Your match</span>
        </div>
        <div style={{ padding: "22px 24px" }}>
          <p style={{ fontSize: 12.5, fontWeight: 800, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--accent2)", margin: 0 }}>Meet</p>
          <h3 style={{ fontFamily: "var(--font-archivo)", fontWeight: 800, fontSize: 26, letterSpacing: "-.01em", margin: "4px 0 2px" }}>{hero.product}</h3>
          <p style={{ fontSize: 15, color: "#5a6067", margin: 0 }}>in <strong style={{ color: "var(--accent)" }}>{hero.colour}</strong></p>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 20, alignItems: "center" }}>
            <Link href={productHref} style={{ ...cta, textDecoration: "none" }}>See this tile →</Link>
            <Link href={`/contact?product=${encodeURIComponent(hero.product)}`} style={{ ...ctaOutline, textDecoration: "none" }}>Enquire</Link>
            <Link href="/book" style={{ ...ctaOutline, textDecoration: "none" }}>See it in the showroom</Link>
            <SaveButton item={{ href: `/product/${hero.slug}`, name: hero.product, colour: hero.colour, image: hero.img }} />
            <a href={pinHref} target="_blank" rel="noopener noreferrer" aria-label="Save to Pinterest" title="Save to Pinterest" style={{ display: "grid", placeItems: "center", width: 40, height: 40, borderRadius: 999, background: "#e60023", color: "#fff", textDecoration: "none" }}>
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden><path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C24.007 5.367 18.641.001 12.017.001z" /></svg>
            </a>
          </div>
        </div>
      </div>

      {/* runners-up */}
      {runnersUp.length > 0 && (
        <div style={{ marginTop: 34 }}>
          <p style={{ ...eyebrow, textAlign: "center" }}>Also very you</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14, marginTop: 14 }}>
            {runnersUp.map((c) => (
              <Link key={`${c.slug}-${c.colour}`} href={`/product/${c.slug}?c=${encodeURIComponent(c.colour)}`} style={{ textDecoration: "none", color: "inherit", background: "#fff", border: "1px solid var(--line)", borderRadius: 16, overflow: "hidden" }}>
                <div style={{ aspectRatio: "4 / 3", background: "#f0ece3" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={c.img} alt={`${c.product} in ${c.colour}`} loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                </div>
                <div style={{ padding: "10px 12px" }}>
                  <div style={{ fontWeight: 800, fontSize: 14, lineHeight: 1.25 }}>{c.product}</div>
                  <div style={{ fontSize: 12.5, color: "#8a8577" }}>{c.colour}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div style={{ textAlign: "center", marginTop: 34 }}>
        <button type="button" onClick={onRetake} style={linkBtn}>↺ Retake the quiz</button>
        <p style={{ fontSize: 12, color: "var(--muted)", margin: "16px auto 0", maxWidth: "52ch", lineHeight: 1.55 }}>
          Room images are AI-generated or rendered to show the tile in a space — a guide, not an exact photo. Always confirm from a physical sample.
        </p>
      </div>
    </section>
  );
}

// ── styles ────────────────────────────────────────────────────────────────────
const eyebrow: React.CSSProperties = { fontSize: 12, fontWeight: 800, letterSpacing: ".2em", textTransform: "uppercase", color: "var(--accent)", margin: 0 };
const h1: React.CSSProperties = { fontFamily: "var(--font-archivo)", fontWeight: 900, letterSpacing: "-.03em", lineHeight: 1.04, margin: 0 };
const serif: React.CSSProperties = { fontFamily: "var(--font-newsreader)", fontStyle: "italic", fontWeight: 400, color: "var(--sea)" };
const cta: React.CSSProperties = { display: "inline-block", cursor: "pointer", border: "none", fontFamily: "inherit", background: "var(--accent)", color: "#fff6ee", fontWeight: 800, fontSize: 15, padding: "13px 26px", borderRadius: 999 };
const ctaOutline: React.CSSProperties = { display: "inline-block", cursor: "pointer", background: "#fff", color: "var(--ink)", fontWeight: 700, fontSize: 15, padding: "13px 22px", borderRadius: 999, border: "1px solid var(--line)" };
const tapOpt: React.CSSProperties = { display: "inline-flex", alignItems: "center", gap: 10, cursor: "pointer", fontFamily: "inherit", background: "#fff", color: "var(--ink)", fontWeight: 700, fontSize: 16, padding: "16px 24px", borderRadius: 16, border: "1.5px solid var(--line)", transition: "all .15s ease" };
const tapOptOn: React.CSSProperties = { borderColor: "var(--accent)", background: "color-mix(in oklab, var(--accent) 8%, #fff)" };
const moodCard: React.CSSProperties = { cursor: "pointer", fontFamily: "inherit", background: "#fff", padding: 12, borderRadius: 18, border: "1.5px solid var(--line)", transition: "all .15s ease", textAlign: "left" };
const moodCardOn: React.CSSProperties = { borderColor: "var(--accent)", boxShadow: "0 12px 30px -20px rgba(16,28,30,.5)" };
const ghostBtn: React.CSSProperties = { display: "grid", placeItems: "center", width: 34, height: 34, borderRadius: 999, cursor: "pointer", border: "1px solid var(--line)", background: "#fff", color: "var(--ink)", fontSize: 16, fontFamily: "inherit" };
const linkBtn: React.CSSProperties = { cursor: "pointer", border: "none", background: "none", color: "var(--accent)", fontWeight: 800, fontSize: 14.5, fontFamily: "inherit" };
