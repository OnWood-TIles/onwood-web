"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import MosaicCanvas from "./MosaicCanvas";
import styles from "./comingSoon.module.css";

type Note = { text: string; kind: "ok" | "error" } | null;

export default function ComingSoon() {
  const hostRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [name, setName] = useState("");
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
        body: JSON.stringify({ name, email }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
      };
      if (res.ok && data.ok) {
        setNote({
          text: "✓ You’re on the list, we’ll be in touch.",
          kind: "ok",
        });
        setName("");
        setEmail("");
      } else {
        setNote({
          text: data.error || "Something went wrong, please try again.",
          kind: "error",
        });
      }
    } catch {
      setNote({
        text: "Couldn’t reach the server, please try again.",
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
          <Image
            src="/onwood-logo-white.png"
            alt="OnWood Tiles"
            width={131}
            height={48}
            priority
            className={styles.brandLogo}
          />
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
              Foundations laid, the build has begun.
            </div>
          </div>
        </div>

        {/* email capture */}
        <form
          onSubmit={onSubmit}
          className={`${styles.rise} ${styles.form}`}
          style={{ animationDelay: "0.46s" }}
        >
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            aria-label="Your name"
            autoComplete="name"
            className={styles.field}
          />
          <div className={styles.formRow}>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email for first access"
              aria-label="Email address for first access"
              autoComplete="email"
              className={`${styles.field} ${styles.emailField}`}
            />
            <button
              ref={buttonRef}
              type="submit"
              disabled={submitting}
              className={styles.submit}
            >
              {submitting ? "Adding…" : "Notify me →"}
            </button>
          </div>
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

        {/* social links */}
        <div
          className={`${styles.rise} ${styles.socials}`}
          style={{ animationDelay: "0.62s" }}
        >
          <a
            href="https://www.instagram.com/onwood_tiles"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="OnWood Tiles on Instagram"
            className={styles.socialLink}
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth={1.8}>
              <rect x="2.5" y="2.5" width="19" height="19" rx="5.5" />
              <circle cx="12" cy="12" r="4.2" />
              <circle cx="17.6" cy="6.4" r="1.15" fill="currentColor" stroke="none" />
            </svg>
          </a>
          <a
            href="https://www.facebook.com/share/18qX1BsNrf/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="OnWood Tiles on Facebook"
            className={styles.socialLink}
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
              <path d="M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.49-3.89 3.77-3.89 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.44 2.89h-2.34v6.99A10 10 0 0 0 22 12z" />
            </svg>
          </a>
        </div>
      </div>

      <div className={styles.footnote}>
        Tap the wall to lay your own tile · © 2026 OnWood Tiles ·{" "}
        <a
          href="/staff"
          style={{ color: "inherit", textDecoration: "none", opacity: 0.7 }}
        >
          Staff
        </a>
      </div>
    </div>
  );
}
