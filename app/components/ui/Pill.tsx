import styles from "./ui.module.css";

type Tone = "neutral" | "accent" | "sea";

// Small rounded badge with an optional leading dot.
export default function Pill({
  children,
  tone = "neutral",
  dot = false,
}: {
  children: React.ReactNode;
  tone?: Tone;
  dot?: boolean;
}) {
  const toneClass =
    tone === "accent"
      ? styles.pillAccent
      : tone === "sea"
        ? styles.pillSea
        : "";
  return (
    <span className={`${styles.pill} ${toneClass}`}>
      {dot ? <span className={styles.pillDot} aria-hidden /> : null}
      {children}
    </span>
  );
}
