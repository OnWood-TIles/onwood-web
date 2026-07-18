"use client";

import { useMemo, useState, type CSSProperties } from "react";
import Link from "next/link";
import type { Business, DayHours } from "../../../lib/onbase/client";

// Book-a-Visit flow (adapted from the Claude Design, on the OnWood theme):
// 01 purpose -> 02 pick a day (calendar, availability from open hours) + time
// slot -> 03 details -> Visit Pass + Confirm -> confirmation with add-to-calendar.

const INK = "#14262A";
const ACCENT = "#D65A31";
const CREAM = "#F6F1E8";
const CARD = "#FBF8F1";
const MONO = "'Space Mono', ui-monospace, SFMono-Regular, Menlo, monospace";
const mono = (size: number, ls = 0.14, color = "rgba(23,40,43,.5)"): CSSProperties => ({
  fontFamily: MONO, fontSize: size, letterSpacing: `${ls}em`, color,
});

const PURPOSES = [
  { key: "browse", name: "Browse & get ideas", desc: "See the range in person, no agenda." },
  { key: "project", name: "A specific project", desc: "Bring your plans - we'll help you spec it." },
  { key: "samples", name: "Take samples home", desc: "Borrow tiles to try in your space." },
  { key: "trade", name: "Trade / bulk order", desc: "Pricing and lead times for the trade." },
];

const DEFAULT_HOURS: DayHours[] = [
  { day: "Monday", closed: false, open: "09:00", close: "17:00" },
  { day: "Tuesday", closed: false, open: "09:00", close: "17:00" },
  { day: "Wednesday", closed: false, open: "09:00", close: "17:00" },
  { day: "Thursday", closed: false, open: "09:00", close: "17:00" },
  { day: "Friday", closed: false, open: "09:00", close: "17:00" },
  { day: "Saturday", closed: false, open: "09:00", close: "13:00" },
  { day: "Sunday", closed: true, open: "09:00", close: "17:00" },
];

const minutes = (t: string) => { const m = /^(\d{1,2}):(\d{2})$/.exec(t); return m ? +m[1] * 60 + +m[2] : 0; };
function fmt(t: string) {
  const m = /^(\d{1,2}):(\d{2})$/.exec(t); if (!m) return t;
  let h = +m[1]; const mm = m[2]; const ap = h >= 12 ? "pm" : "am"; h = h % 12 || 12;
  return mm === "00" ? `${h}${ap}` : `${h}:${mm}${ap}`;
}
// hours[] is Mon..Sun; JS getDay() is Sun=0. Map to Mon-first index.
const monIndex = (d: Date) => (d.getDay() + 6) % 7;

export default function BookAVisit({ business }: { business: Business | null }) {
  const hours = business?.openHours?.length ? business.openHours : DEFAULT_HOURS;
  const address = [business?.addressLine1 || "2/11 Packer Rd", business?.addressLine2 || "Baringa QLD 4551"].filter(Boolean).join(", ");
  const phone = business?.phone || "";

  const [purpose, setPurpose] = useState<string | null>(null);
  const [month, setMonth] = useState(() => { const d = new Date(); return { y: d.getFullYear(), m: d.getMonth() }; });
  const [date, setDate] = useState<Date | null>(null);
  const [slot, setSlot] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [tel, setTel] = useState("");
  const [notes, setNotes] = useState("");
  const [booking, setBooking] = useState(false);
  const [booked, setBooked] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const today = useMemo(() => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; }, []);

  const dayStatus = (d: Date): "closed" | "half" | "open" => {
    const h = hours[monIndex(d)];
    if (!h || h.closed) return "closed";
    const span = minutes(h.close) - minutes(h.open);
    return span <= 270 ? "half" : "open"; // <= 4.5h reads as a half day
  };

  // Calendar grid for the displayed month (Mon-first).
  const grid = useMemo(() => {
    const first = new Date(month.y, month.m, 1);
    const lead = monIndex(first);
    const daysIn = new Date(month.y, month.m + 1, 0).getDate();
    const cells: (Date | null)[] = [];
    for (let i = 0; i < lead; i++) cells.push(null);
    for (let d = 1; d <= daysIn; d++) cells.push(new Date(month.y, month.m, d));
    return cells;
  }, [month]);

  const slotGroups = useMemo(() => {
    if (!date) return [];
    const h = hours[monIndex(date)];
    if (!h || h.closed) return [];
    const start = minutes(h.open), end = minutes(h.close);
    const all: string[] = [];
    for (let t = start; t + 30 <= end; t += 60) all.push(`${String(Math.floor(t / 60)).padStart(2, "0")}:${String(t % 60).padStart(2, "0")}`);
    const morning = all.filter((t) => minutes(t) < 12 * 60);
    const arvo = all.filter((t) => minutes(t) >= 12 * 60);
    return [
      ...(morning.length ? [{ label: "MORNING", slots: morning }] : []),
      ...(arvo.length ? [{ label: "AFTERNOON", slots: arvo }] : []),
    ];
  }, [date, hours]);

  const passDate = date ? date.toLocaleDateString("en-AU", { weekday: "short", day: "numeric", month: "short" }) : "—";
  const passTime = slot ? fmt(slot) : "—";
  const passType = purpose ? PURPOSES.find((p) => p.key === purpose)?.name ?? "Visit" : "—";
  const ready = !!(purpose && date && slot && name.trim() && /.+@.+\..+/.test(email));

  const monthLabel = new Date(month.y, month.m, 1).toLocaleDateString("en-AU", { month: "long", year: "numeric" });
  const canPrev = !(month.y === today.getFullYear() && month.m === today.getMonth());
  const shiftMonth = (n: number) => setMonth((s) => { const d = new Date(s.y, s.m + n, 1); return { y: d.getFullYear(), m: d.getMonth() }; });

  const directionsHref = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`OnWood Tiles ${address}`)}`;

  function icsFor(): string {
    if (!date || !slot) return "";
    const start = new Date(date); start.setHours(+slot.slice(0, 2), +slot.slice(3), 0, 0);
    const end = new Date(start.getTime() + 60 * 60 * 1000);
    const z = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
    return ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//OnWood Tiles//Visit//EN", "BEGIN:VEVENT",
      `DTSTART:${z(start)}`, `DTEND:${z(end)}`, "SUMMARY:Showroom visit - OnWood Tiles",
      `LOCATION:${address}`, `DESCRIPTION:${passType}`, "END:VEVENT", "END:VCALENDAR"].join("\r\n");
  }
  function addToCalendar() {
    const blob = new Blob([icsFor()], { type: "text/calendar" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "onwood-visit.ics"; a.click();
  }

  async function confirm() {
    if (!ready || booking) return;
    setBooking(true); setError(null);
    try {
      const res = await fetch("/api/book", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          purpose: passType, date: date?.toISOString(), time: slot, when: `${passDate} at ${passTime}`,
          name: name.trim(), email: email.trim(), phone: tel.trim(), notes: notes.trim(),
        }),
      });
      if (!res.ok) throw new Error();
      setBooked(true);
    } catch {
      setError("Something went wrong - please call us or try again.");
    } finally {
      setBooking(false);
    }
  }

  const sectionNum = (n: string, title: string) => (
    <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 16 }}>
      <span style={{ ...mono(11, 0.16, ACCENT) }}>{n}</span>
      <span style={{ fontSize: 20, fontWeight: 750, letterSpacing: "-.01em" }}>{title}</span>
    </div>
  );

  return (
    <div>
      <div style={{ marginBottom: 30 }}>
        <div style={{ ...mono(11, 0.18, "var(--accent2)"), textTransform: "uppercase" }}>Book a visit</div>
        <h1 style={{ fontFamily: "var(--font-archivo)", fontWeight: 800, fontSize: "clamp(30px,4.4vw,52px)", letterSpacing: "-.02em", margin: "10px 0 0" }}>
          Come see it in person.
        </h1>
        <p style={{ color: "#5a6067", fontSize: 15.5, maxWidth: 560, marginTop: 12, lineHeight: 1.6 }}>
          Over 400 tiles on display at our Baringa showroom. Pick a time that suits and we'll have the space ready for you.
        </p>
      </div>

      <div className="ow-book-grid" style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 340px", gap: 40, alignItems: "start" }}>
        {/* Left: the form */}
        <div style={{ display: "flex", flexDirection: "column", gap: 36 }}>
          {/* 01 purpose */}
          <div>
            {sectionNum("01", "What brings you in?")}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(215px,1fr))", gap: 12 }}>
              {PURPOSES.map((p) => {
                const on = purpose === p.key;
                return (
                  <button key={p.key} type="button" onClick={() => setPurpose(p.key)}
                    style={{ appearance: "none", cursor: "pointer", textAlign: "left", background: on ? "#fff" : CARD, border: `1px solid ${on ? ACCENT : "rgba(23,40,43,.14)"}`, borderRadius: 16, padding: 16, color: "#17282B", transition: "all .2s" }}>
                    <span style={{ display: "block", width: 11, height: 11, borderRadius: 3, background: ACCENT, transform: "rotate(45deg)" }} />
                    <span style={{ display: "block", fontSize: 16, fontWeight: 750, marginTop: 14, letterSpacing: "-.01em" }}>{p.name}</span>
                    <span style={{ display: "block", fontSize: 12.5, lineHeight: 1.5, color: "rgba(23,40,43,.6)", marginTop: 5 }}>{p.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 02 day & time */}
          <div>
            {sectionNum("02", "Pick a day & time")}
            <div className="ow-book-cal" style={{ display: "grid", gridTemplateColumns: "300px minmax(0,1fr)", gap: 20 }}>
              <div style={{ background: CARD, border: "1px solid rgba(23,40,43,.12)", borderRadius: 20, padding: 20 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                  <button type="button" onClick={() => canPrev && shiftMonth(-1)} disabled={!canPrev}
                    style={{ appearance: "none", cursor: canPrev ? "pointer" : "default", border: "1px solid rgba(23,40,43,.2)", background: "#fff", borderRadius: "50%", width: 34, height: 34, fontSize: 15, color: "#17282B", opacity: canPrev ? 1 : 0.35 }}>←</button>
                  <span style={{ fontSize: 15, fontWeight: 750 }}>{monthLabel}</span>
                  <button type="button" onClick={() => shiftMonth(1)} style={{ appearance: "none", cursor: "pointer", border: "1px solid rgba(23,40,43,.2)", background: "#fff", borderRadius: "50%", width: 34, height: 34, fontSize: 15, color: "#17282B" }}>→</button>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 6, marginBottom: 6 }}>
                  {["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"].map((d) => (
                    <span key={d} style={{ textAlign: "center", ...mono(9, 0.06, "rgba(23,40,43,.45)") }}>{d}</span>
                  ))}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 6 }}>
                  {grid.map((d, i) => {
                    if (!d) return <div key={i} style={{ aspectRatio: "1/1" }} />;
                    const past = d < today;
                    const st = dayStatus(d);
                    const disabled = past || st === "closed";
                    const sel = date && d.toDateString() === date.toDateString();
                    const dot = st === "open" ? "#5C8A5E" : st === "half" ? "#C79A3F" : "transparent";
                    return (
                      <div key={i} style={{ aspectRatio: "1/1" }}>
                        <button type="button" disabled={disabled} onClick={() => { setDate(d); setSlot(null); }}
                          style={{
                            appearance: "none", cursor: disabled ? "default" : "pointer", width: "100%", height: "100%",
                            border: `1px solid ${sel ? ACCENT : "rgba(23,40,43,.13)"}`, borderRadius: 11,
                            background: sel ? ACCENT : "#fff", color: sel ? CREAM : disabled ? "rgba(23,40,43,.3)" : "#17282B",
                            fontFamily: "inherit", fontSize: 13.5, fontWeight: 600, display: "flex", flexDirection: "column",
                            alignItems: "center", justifyContent: "center", gap: 3, transition: "all .16s", opacity: disabled ? 0.5 : 1,
                          }}>
                          <span>{d.getDate()}</span>
                          <span style={{ width: 5, height: 5, borderRadius: "50%", background: sel ? CREAM : dot }} />
                        </button>
                      </div>
                    );
                  })}
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 14, marginTop: 14, ...mono(9, 0.08) }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 5 }}><span style={{ width: 6, height: 6, borderRadius: "50%", background: "#5C8A5E" }} />OPEN</span>
                  <span style={{ display: "flex", alignItems: "center", gap: 5 }}><span style={{ width: 6, height: 6, borderRadius: "50%", background: "#C79A3F" }} />HALF DAY</span>
                  <span style={{ display: "flex", alignItems: "center", gap: 5 }}><span style={{ width: 10, height: 10, borderRadius: 3, background: ACCENT }} />SELECTED</span>
                </div>
              </div>

              <div>
                {date ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                    {slotGroups.map((g) => (
                      <div key={g.label}>
                        <div style={{ ...mono(9, 0.18), marginBottom: 10 }}>{g.label}</div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                          {g.slots.map((s) => {
                            const on = slot === s;
                            return (
                              <button key={s} type="button" onClick={() => setSlot(s)}
                                style={{ appearance: "none", cursor: "pointer", border: `1px solid ${on ? ACCENT : "rgba(23,40,43,.18)"}`, background: on ? ACCENT : "#fff", color: on ? CREAM : "#17282B", borderRadius: 10, padding: "11px 15px", ...mono(11.5, 0.04, on ? CREAM : "#17282B"), transition: "all .18s" }}>
                                {fmt(s)}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ minHeight: 190, border: "1px dashed rgba(23,40,43,.2)", borderRadius: 20, display: "grid", placeItems: "center", textAlign: "center", padding: 24 }}>
                    <span style={{ ...mono(10.5, 0.12), maxWidth: 180, lineHeight: 1.6 }}>SELECT A DAY TO SEE AVAILABLE TIMES</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 03 details */}
          <div>
            {sectionNum("03", "Your details")}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" style={{ ...inputStyle, gridColumn: "span 2" }} />
              <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" type="email" style={inputStyle} />
              <input value={tel} onChange={(e) => setTel(e.target.value)} placeholder="Phone (optional)" style={inputStyle} />
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Anything we should prep? (room, style, m² needed…)" rows={3} style={{ ...inputStyle, gridColumn: "span 2", resize: "vertical" }} />
            </div>
          </div>
        </div>

        {/* Right rail: map + visit pass + confirm */}
        <div className="ow-book-rail" style={{ position: "sticky", top: 100, display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ position: "relative", borderRadius: 20, overflow: "hidden", border: "1px solid rgba(23,40,43,.14)", height: 200, background: "#DDE3DE" }}>
            <iframe title="map" src={`https://maps.google.com/maps?q=${encodeURIComponent(address)}&z=15&output=embed`} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: 0 }} loading="lazy" />
            <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, pointerEvents: "none", background: "linear-gradient(to top,rgba(20,38,42,.82),transparent)", padding: "26px 16px 14px", display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 10 }}>
              <span style={{ ...mono(10, 0.1, CREAM), lineHeight: 1.4 }}>OnWood Showroom<br />{address}</span>
              <a href={directionsHref} target="_blank" rel="noopener noreferrer" style={{ pointerEvents: "auto", background: CREAM, color: "#14262A", borderRadius: 999, padding: "8px 13px", ...mono(9.5, 0.1, "#14262A"), fontWeight: 700, textDecoration: "none" }}>DIRECTIONS →</a>
            </div>
          </div>

          {/* Visit pass */}
          <div style={{ background: INK, color: CREAM, borderRadius: 20, padding: 22, position: "relative", overflow: "hidden" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ width: 9, height: 9, background: ACCENT, borderRadius: 2, transform: "rotate(45deg)" }} />
                <span style={{ fontFamily: "var(--font-archivo)", fontWeight: 850, letterSpacing: ".12em", fontSize: 12 }}>ONWOOD</span>
              </span>
              <span style={{ ...mono(9, 0.2, "rgba(246,241,232,.5)") }}>VISIT PASS</span>
            </div>
            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 12, marginTop: 20 }}>
              <div><div style={{ ...mono(9, 0.16, "rgba(246,241,232,.5)") }}>DATE</div><div style={{ fontSize: 22, fontWeight: 800, marginTop: 3 }}>{passDate}</div></div>
              <div style={{ textAlign: "right" }}><div style={{ ...mono(9, 0.16, "rgba(246,241,232,.5)") }}>TIME</div><div style={{ fontSize: 22, fontWeight: 800, marginTop: 3 }}>{passTime}</div></div>
            </div>
            <div style={{ marginTop: 16 }}><div style={{ ...mono(9, 0.16, "rgba(246,241,232,.5)") }}>VISIT</div><div style={{ fontSize: 13, fontWeight: 650, marginTop: 3 }}>{passType}</div></div>
            <div style={{ ...mono(10, 0.04, "rgba(246,241,232,.7)"), lineHeight: 1.55, marginTop: 14 }}>Stay as long as you like - there&apos;s no clock on good design.</div>
            <div style={{ position: "relative", margin: "20px -22px 0", borderTop: "1.5px dashed rgba(246,241,232,.25)" }}>
              <span style={{ position: "absolute", left: -11, top: -11, width: 22, height: 22, borderRadius: "50%", background: CARD }} />
              <span style={{ position: "absolute", right: -11, top: -11, width: 22, height: 22, borderRadius: "50%", background: CARD }} />
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginTop: 18 }}>
              <div style={{ display: "flex", alignItems: "flex-end", gap: 2, height: 30 }}>
                {Array.from({ length: 26 }).map((_, i) => (
                  <span key={i} style={{ width: i % 3 === 0 ? 3 : 1.5, height: "100%", background: CREAM, opacity: (i * 7) % 5 === 0 ? 0.4 : 0.85 }} />
                ))}
              </div>
              <span style={{ ...mono(9, 0.14, ready ? "#8fca8f" : "rgba(246,241,232,.55)") }}>{ready ? "READY" : "PENDING"}</span>
            </div>
          </div>

          <button type="button" onClick={confirm} disabled={!ready || booking}
            style={{ appearance: "none", border: "none", cursor: ready && !booking ? "pointer" : "default", color: CREAM, background: ready ? ACCENT : "rgba(23,40,43,.3)", borderRadius: 999, padding: 16, fontFamily: "inherit", fontSize: 15, fontWeight: 750, transition: "background .3s" }}>
            {booking ? "Booking…" : "Confirm booking"}
          </button>
          {error && <p style={{ ...mono(10, 0.04, "#b0563a"), textAlign: "center", margin: 0 }}>{error}</p>}
          <p style={{ ...mono(9.5, 0.06), lineHeight: 1.6, textAlign: "center", margin: 0 }}>We&apos;ll email a confirmation &amp; calendar invite.<br />Free to reschedule anytime.</p>
        </div>
      </div>

      {/* Confirmation modal */}
      {booked && (
        <div style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(16,28,30,.55)", backdropFilter: "blur(8px)", display: "grid", placeItems: "center", padding: 24 }}>
          <div style={{ background: CARD, borderRadius: 26, padding: "clamp(28px,4vw,44px)", maxWidth: 440, width: "100%", textAlign: "center", boxShadow: "0 40px 90px -30px rgba(16,28,30,.6)" }}>
            <svg width="66" height="66" viewBox="0 0 72 72" style={{ margin: "0 auto" }}>
              <circle cx="36" cy="36" r="33" fill="none" stroke="#5C8A5E" strokeWidth="3" opacity=".3" />
              <path d="M22 37 L32 47 L51 26" fill="none" stroke="#5C8A5E" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <div style={{ ...mono(10, 0.2, "#B5451F"), marginTop: 18 }}>BOOKING CONFIRMED</div>
            <h2 style={{ margin: "8px 0 0", fontFamily: "var(--font-archivo)", fontSize: 28, fontWeight: 830, letterSpacing: "-.02em" }}>See you soon, {name.split(" ")[0] || "there"}.</h2>
            <div style={{ background: "#fff", border: "1px solid rgba(23,40,43,.12)", borderRadius: 16, padding: 18, marginTop: 20, textAlign: "left", display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}><span style={mono(10, 0.1)}>VISIT</span><span style={{ fontSize: 13.5, fontWeight: 650 }}>{passType}</span></div>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}><span style={mono(10, 0.1)}>WHEN</span><span style={{ fontSize: 13.5, fontWeight: 650 }}>{passDate} · {passTime}</span></div>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}><span style={mono(10, 0.1)}>WHERE</span><span style={{ fontSize: 13.5, fontWeight: 650, textAlign: "right" }}>{address}</span></div>
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
              <button type="button" onClick={addToCalendar} style={{ appearance: "none", border: "none", cursor: "pointer", flex: 1, background: INK, color: CREAM, borderRadius: 999, padding: 14, fontFamily: "inherit", fontSize: 13.5, fontWeight: 700 }}>Add to calendar</button>
              <Link href="/shop" style={{ background: "transparent", border: "1.5px solid rgba(23,40,43,.25)", borderRadius: 999, padding: "14px 18px", fontSize: 13.5, fontWeight: 700, color: "#17282B", textDecoration: "none" }}>Done</Link>
            </div>
          </div>
        </div>
      )}

      <style>{`@media (max-width: 900px){.ow-book-grid{grid-template-columns:1fr !important}.ow-book-rail{position:static !important}.ow-book-cal{grid-template-columns:1fr !important}}`}</style>
    </div>
  );
}

const inputStyle: CSSProperties = {
  appearance: "none", background: "#fff", border: "1px solid rgba(23,40,43,.18)", borderRadius: 12,
  padding: "14px 16px", fontFamily: "inherit", fontSize: 14.5, color: "#17282B",
};
