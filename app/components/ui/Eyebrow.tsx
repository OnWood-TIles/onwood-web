import styles from "./ui.module.css";

// Small uppercase section label with a leading dot.
export default function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <span className={styles.eyebrow}>
      <span className={styles.eyebrowDot} aria-hidden />
      {children}
    </span>
  );
}
