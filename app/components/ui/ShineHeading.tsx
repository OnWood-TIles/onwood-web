import styles from "./ui.module.css";

// Archivo-900 heading with an optional Newsreader-italic accent word.
// e.g. <ShineHeading text="Tiles worth" accent="lingering over." />
export default function ShineHeading({
  text,
  accent,
  as = "h2",
  size = "clamp(30px, 5vw, 52px)",
}: {
  text: string;
  accent?: string;
  as?: "h1" | "h2" | "h3";
  size?: string;
}) {
  const Tag = as;
  return (
    <Tag className={styles.shineHeading} style={{ fontSize: size }}>
      {text}
      {accent ? (
        <>
          {" "}
          <span className={styles.shineWord}>{accent}</span>
        </>
      ) : null}
    </Tag>
  );
}
