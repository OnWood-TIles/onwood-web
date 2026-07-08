import styles from "./ui.module.css";

// Frosted surface card matching the coming-soon language.
export default function GlassCard({
  children,
  className = "",
  style,
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div className={`${styles.glassCard} ${className}`} style={style}>
      {children}
    </div>
  );
}
