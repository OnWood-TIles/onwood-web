"use client";

import { useState } from "react";
import styles from "./contactForm.module.css";

type Status = { kind: "ok" | "error"; text: string } | null;

export default function ContactForm() {
  const [status, setStatus] = useState<Status>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setStatus(null);
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    try {
      const res = await fetch("/api/enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (res.ok && json.ok) {
        setStatus({ kind: "ok", text: "Thanks - we will be in touch soon." });
        form.reset();
      } else {
        setStatus({
          kind: "error",
          text: json.error || "Something went wrong, please try again.",
        });
      }
    } catch {
      setStatus({
        kind: "error",
        text: "Could not reach the server, please try again.",
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className={styles.form}>
      <div className={styles.row}>
        <input name="name" required placeholder="Your name" aria-label="Your name" className={styles.field} autoComplete="name" />
        <input name="email" type="email" required placeholder="Email" aria-label="Email" className={styles.field} autoComplete="email" />
      </div>
      <input name="phone" placeholder="Phone (optional)" aria-label="Phone" className={styles.field} autoComplete="tel" />
      <textarea name="message" required placeholder="How can we help?" aria-label="Message" className={styles.textarea} rows={5} />
      <button type="submit" disabled={busy} className={styles.submit}>
        {busy ? "Sending..." : "Send enquiry"}
      </button>
      {status ? (
        <p
          role="status"
          className={`${styles.note} ${status.kind === "error" ? styles.noteErr : styles.noteOk}`}
        >
          {status.text}
        </p>
      ) : null}
    </form>
  );
}
