import Image from "next/image";
import styles from "./ui.module.css";

// The signature whitewashed-Mediterranean arched "niche" frame. Holds a photo
// (arched top), with a hairline inner ring. Falls back to a warm gradient when
// no image is supplied (a placeholder slot during the build).
export default function Niche({
  src,
  alt = "",
  ratio = "3 / 4",
  sizes = "(max-width: 768px) 90vw, 420px",
  priority = false,
  className = "",
  children,
}: {
  src?: string;
  alt?: string;
  ratio?: string;
  sizes?: string;
  priority?: boolean;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <div
      className={`${styles.niche} ${className}`}
      style={{ aspectRatio: ratio }}
    >
      {src ? (
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          className={styles.nicheImg}
        />
      ) : null}
      <span className={styles.nicheRing} aria-hidden />
      {children ? <div className={styles.nicheInner}>{children}</div> : null}
    </div>
  );
}
