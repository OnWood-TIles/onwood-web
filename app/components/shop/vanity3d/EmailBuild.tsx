"use client";
// "Email me my vanity" (3D builder): renders four views of the build in the browser, then
// sends them with the build to /api/vanity-email. OnBase re-prices it, files an enquiry
// with the renders, and emails the customer their build plus a copy to the team.
import { useEffect, useState } from "react";
import type { WebsiteRange } from "../../../../lib/onbase/client";
import type { OptionSelection } from "../../../../lib/options";
import MarketingConsent, { MARKETING_CONSENT_TEXT } from "../../marketing/MarketingConsent";

export type Shot = { label: string; data: string };

export default function EmailBuild({ range, options, buildUrl, complete, missing, ready, capture, onClose }: {
  range: WebsiteRange; options: OptionSelection; buildUrl: string; complete: boolean; missing: number; ready: boolean;
  capture: () => Shot[]; onClose: () => void;
}) {
  const [f, setF] = useState({ name: "", email: "", phone: "", suburb: "", notes: "", company: "" });
  const [consent, setConsent] = useState(false);
  const [shots, setShots] = useState<Shot[]>([]);
  const [state, setState] = useState<"form" | "sending" | "sent">("form");
  const [error, setError] = useState("");
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setF((v) => ({ ...v, [k]: e.target.value }));

  // Preview the renders as soon as the 3D view is ready (the same stills are sent).
  // Opened straight from the 2D builder the vanity may not be built yet: retry briefly.
  useEffect(() => {
    if (!ready || !complete || shots.length) return;
    let tries = 0, timer = 0;
    const go = () => { const s = capture(); if (s.length) setShots(s); else if (++tries < 20) timer = window.setTimeout(go, 250); };
    go();
    return () => window.clearTimeout(timer);
  }, [ready, complete]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { const k = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); }; window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k); }, [onClose]);

  const send = async (e: React.FormEvent) => {
    e.preventDefault(); setError("");
    if (!f.name.trim()) return setError("Please add your name.");
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(f.email.trim())) return setError("Please add a valid email.");
    setState("sending");
    try {
      const pics = shots.length ? shots : capture();
      const res = await fetch("/api/vanity-email", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...f, rangeId: range.id, options, buildUrl, shots: pics, marketingConsent: consent, consentText: MARKETING_CONSENT_TEXT }),
      });
      const j = (await res.json().catch(() => null)) as { ok?: boolean; error?: string } | null;
      if (!res.ok || !j?.ok) { setState("form"); return setError(j?.error || "We could not send that just now. Please try again, or call us."); }
      setState("sent");
    } catch { setState("form"); setError("We could not send that just now. Please check your connection and try again."); }
  };

  return (
    <div className="eb-back" role="dialog" aria-modal="true" aria-labelledby="eb-title" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <style>{CSS}</style>
      <div className="eb-card">
        <button type="button" className="eb-x" onClick={onClose} aria-label="Close">×</button>
        {state === "sent" ? (
          <div className="eb-done">
            <h2 id="eb-title">On its way</h2>
            <p>We have emailed your {range.name} to <strong>{f.email.trim()}</strong>, with the renders and everything you chose. Check your junk folder if it is not there in a few minutes.</p>
            <p>Our team has a copy too, and may give you a quick call to help with sizes and finishes.</p>
            <button type="button" className="eb-send" onClick={onClose}>Back to my vanity</button>
          </div>
        ) : !complete ? (
          <div className="eb-done">
            <h2 id="eb-title">Nearly there</h2>
            <p>Your build still needs {missing} answer{missing === 1 ? "" : "s"} (marked * in the list). Finish those and we can email you the whole vanity with its price.</p>
            <button type="button" className="eb-send" onClick={onClose}>Finish my build</button>
          </div>
        ) : (
          <form onSubmit={send} noValidate>
            <h2 id="eb-title">Email me my vanity</h2>
            <p className="eb-sub">We will send you these views of your {range.name}, everything you chose and the price, with a link back to your build.</p>
            <div className="eb-shots" aria-label="Your renders">
              {(shots.length ? shots : [0, 1, 2, 3].map((i) => ({ label: String(i), data: "" }))).map((s, i) => (
                <figure key={i} className={i === 0 ? "big" : ""}>
                  {s.data ? <img src={s.data} alt={`${range.name}, ${s.label}`} /> : <span />}
                  {s.data && <figcaption>{s.label}</figcaption>}
                </figure>
              ))}
            </div>
            <div className="eb-grid">
              <label><span>Name</span><input value={f.name} onChange={set("name")} autoComplete="name" required /></label>
              <label><span>Email</span><input type="email" value={f.email} onChange={set("email")} autoComplete="email" required /></label>
              <label><span>Phone <em>(optional)</em></span><input type="tel" value={f.phone} onChange={set("phone")} autoComplete="tel" /></label>
              <label><span>Suburb <em>(optional)</em></span><input value={f.suburb} onChange={set("suburb")} autoComplete="address-level2" /></label>
            </div>
            <label className="eb-notes"><span>Anything we should know? <em>(optional)</em></span><textarea rows={2} value={f.notes} onChange={set("notes")} /></label>
            <input tabIndex={-1} autoComplete="off" value={f.company} onChange={set("company")} aria-hidden="true" className="eb-hp" />
            <MarketingConsent checked={consent} onChange={setConsent} />
            {error && <p className="eb-err" role="alert">{error}</p>}
            <button type="submit" className="eb-send" disabled={state === "sending"}>{state === "sending" ? "Sending…" : "Email me my vanity"}</button>
            <p className="eb-fine">Renders are an illustration only. We will only use your details to help with this vanity{consent ? " and to send you the updates you asked for" : ""}.</p>
          </form>
        )}
      </div>
    </div>
  );
}

const CSS = `
.eb-back{position:fixed;inset:0;z-index:60;background:rgba(20,26,28,.55);display:grid;place-items:center;padding:16px;overflow:auto}
.eb-card{position:relative;width:min(620px,100%);max-height:calc(100dvh - 32px);overflow:auto;background:#fff;border-radius:20px;padding:26px 24px 22px;box-shadow:0 30px 80px -30px rgba(0,0,0,.5);color:#1f2a2e}
.eb-card h2{font-size:22px;margin:0 0 6px;letter-spacing:-.01em}
.eb-sub{margin:0 0 14px;color:#5b6468;font-size:14px;line-height:1.5}
.eb-x{position:absolute;top:10px;right:12px;width:36px;height:36px;border:0;background:none;font-size:26px;line-height:1;color:#5b6468;cursor:pointer;border-radius:50%}
.eb-x:hover{background:#f1efea}
.eb-shots{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:0 0 16px}
.eb-shots figure{margin:0;position:relative;border-radius:10px;overflow:hidden;background:#ece8e1;aspect-ratio:3/2}
.eb-shots figure.big{grid-column:1/-1}
.eb-shots img{width:100%;height:100%;object-fit:cover;display:block}
.eb-shots span{display:block;width:100%;height:100%;animation:ebp 1.2s ease-in-out infinite alternate}
@keyframes ebp{from{opacity:.5}to{opacity:1}}
.eb-shots figcaption{position:absolute;left:8px;bottom:6px;font-size:10.5px;letter-spacing:.08em;text-transform:uppercase;color:#fff;background:rgba(0,0,0,.45);padding:2px 7px;border-radius:999px}
.eb-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px 12px}
.eb-card label{display:flex;flex-direction:column;gap:5px;font-size:13px;font-weight:600}
.eb-card label em{font-weight:400;font-style:normal;color:#7a8286}
.eb-card input:not([type=checkbox]),.eb-card textarea{font:inherit;font-size:15px;font-weight:400;padding:10px 12px;border:1px solid #d8d3cb;border-radius:10px;background:#fff;color:inherit}
.eb-card input:focus,.eb-card textarea:focus{outline:2px solid #2f6f6a;outline-offset:1px}
.eb-notes{margin:10px 0 8px}
.eb-hp{position:absolute;left:-9999px;width:1px;height:1px;opacity:0}
.eb-err{color:#b3261e;font-size:14px;margin:8px 0 0}
.eb-send{width:100%;margin-top:12px;font:inherit;font-size:15px;font-weight:700;padding:13px;border-radius:12px;border:0;background:#2f6f6a;color:#fff;cursor:pointer}
.eb-send:disabled{opacity:.6;cursor:default}
.eb-fine{font-size:12px;color:#7a8286;margin:10px 0 0;line-height:1.5}
.eb-done p{font-size:15px;line-height:1.6;color:#3a444a;margin:0 0 10px}
@media (max-width:520px){.eb-grid{grid-template-columns:1fr}.eb-card{padding:22px 16px 18px}}
`;
