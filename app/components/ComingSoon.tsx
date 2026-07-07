"use client";

import { useEffect, useRef, useState } from "react";
import MosaicCanvas from "./MosaicCanvas";
import styles from "./comingSoon.module.css";

type Note = { text: string; kind: "ok" | "error" } | null;

export default function ComingSoon() {
  const hostRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [note, setNote] = useState<Note>(null);

  // magnetic "Notify me" button — translates toward the cursor, springs back
  useEffect(() => {
    const el = buttonRef.current;
    if (!el) return;
    const move = (e: PointerEvent) => {
      const b = el.getBoundingClientRect();
      el.style.transition = "transform .1s ease-out";
      el.style.transform = `translate(${
        (e.clientX - (b.left + b.width / 2)) * 0.3
      }px, ${(e.clientY - (b.top + b.height / 2)) * 0.4}px)`;
    };
    const leave = () => {
      el.style.transition = "transform .4s cubic-bezier(.2,.9,.3,1.4)";
      el.style.transform = "translate(0,0)";
    };
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", leave);
    return () => {
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", leave);
    };
  }, []);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setNote(null);
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
      };
      if (res.ok && data.ok) {
        setNote({
          text: "✓ You’re on the list — we’ll be in touch.",
          kind: "ok",
        });
        setEmail("");
      } else {
        setNote({
          text: data.error || "Something went wrong — please try again.",
          kind: "error",
        });
      }
    } catch {
      setNote({
        text: "Couldn’t reach the server — please try again.",
        kind: "error",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div ref={hostRef} className={styles.root}>
      <MosaicCanvas hostRef={hostRef} />

      {/* vignette + warmth over the mosaic */}
      <div className={styles.vignette} />

      {/* top bar */}
      <div className={styles.topbar}>
        <div className={styles.brand}>
          <svg viewBox="0 0 100 74" width="30" height="24" aria-hidden="true">
            <path
              d="M8 44 L50 8 L92 44"
              fill="none"
              stroke="currentColor"
              strokeWidth="9"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <rect x="20" y="52" width="60" height="8" rx="4" fill="var(--accent)" />
            <rect x="28" y="66" width="44" height="7" rx="3.5" fill="var(--sea)" />
          </svg>
          <span className={styles.brandName}>ONWOOD</span>
        </div>
        <div className={styles.status}>
          <span className={styles.statusDot} />
          Sunshine Coast, AU
        </div>
      </div>

      {/* centre card */}
      <div className={styles.card}>
        <div className={styles.rise} style={{ animationDelay: "0.05s" }}>
          <div className={styles.eyebrow}>
            <span className={styles.eyebrowDot} /> Something beautiful is being laid
          </div>
        </div>

        <h1
          className={`${styles.rise} ${styles.heading}`}
          style={{ animationDelay: "0.16s" }}
        >
          Coming
          <br />
          <span className={styles.headingAccent}>soon.</span>
        </h1>

        <p
          className={`${styles.rise} ${styles.subhead}`}
          style={{ animationDelay: "0.26s" }}
        >
          The Sunshine Coast&apos;s new home for all things tiles. Our new showroom
          &amp; website are almost ready.
        </p>

        {/* feature: showroom build progress */}
        <div className={`${styles.rise} ${styles.feature}`} style={{ animationDelay: "0.36s" }}>
          <div className={styles.progress}>
            <div className={styles.progressHead}>
              <span className={styles.progressLabel}>Showroom fit-out</span>
              <span className={styles.progressValue}>
                20<small>%</small>
              </span>
            </div>
            <div className={styles.progressTrack}>
              <div className={styles.progressFill} />
            </div>
            <div className={styles.progressCaption}>
              Foundations laid — the build has begun.
            </div>
          </div>
        </div>

        {/* email capture */}
        <form
          onSubmit={onSubmit}
          className={styles.rise}
          style={{ animationDelay: "0.46s", display: "flex", gap: 10, maxWidth: 440, margin: "0 auto", flexWrap: "wrap" }}
        >
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email for first access"
            aria-label="Email address for first access"
            className={styles.email}
          />
          <button
            ref={buttonRef}
            type="submit"
            disabled={submitting}
            className={styles.submit}
          >
            {submitting ? "Adding…" : "Notify me →"}
          </button>
        </form>
        <div
          role="status"
          aria-live="polite"
          className={`${styles.note} ${note ? styles.noteVisible : ""} ${
            note?.kind === "error" ? styles.noteError : ""
          }`}
        >
          {note?.text}
        </div>

        {/* footer row */}
        <div className={`${styles.rise} ${styles.cardFooter}`} style={{ animationDelay: "0.56s" }}>
          <span className={styles.footerItem}>
            <span className={styles.footerIcon}>◎</span> 2/11 Packer Street, Baringa
          </span>
          <span className={styles.footerItem}>
            <span className={styles.footerIcon}>@</span>
            <a href="mailto:sales@onwoodtiles.com.au" className={styles.footerLink}>
              sales@onwoodtiles.com.au
            </a>
          </span>
        </div>
      </div>

      <div className={styles.footnote}>
        Tap the wall to lay your own tile · © 2026 OnWood Flooring &amp; Tiles
      </div>
    </div>
  );
}
