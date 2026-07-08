"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import ThemeToggle from "../ui/ThemeToggle";
import styles from "./site.module.css";

const LINKS = [
  { href: "/collections", label: "Collections" },
  { href: "/specials", label: "Specials" },
  { href: "/showroom", label: "Showroom" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export default function SiteNav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`${styles.nav} ${scrolled ? styles.navScrolled : ""}`}>
      <div className={styles.navInner}>
        <Link href="/" className={styles.brand} aria-label="OnWood Tiles home">
          <Image
            src="/onwood-logo-ink.png"
            alt="OnWood Tiles"
            width={128}
            height={42}
            priority
            style={{ height: 34, width: "auto" }}
          />
        </Link>

        <nav className={styles.navLinks} aria-label="Primary">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className={styles.navLink}>
              {l.label}
            </Link>
          ))}
        </nav>

        <div className={styles.navRight}>
          <ThemeToggle />
          <Link href="/contact" className={styles.navCta}>
            Visit us
          </Link>
          <button
            className={styles.navBurger}
            aria-label="Menu"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            <span />
            <span />
          </button>
        </div>
      </div>

      {open ? (
        <div className={styles.mobileMenu}>
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={styles.mobileLink}
              onClick={() => setOpen(false)}
            >
              {l.label}
            </Link>
          ))}
        </div>
      ) : null}
    </header>
  );
}
