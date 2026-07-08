import SiteNav from "./SiteNav";
import SiteFooter from "./SiteFooter";
import styles from "../../home.module.css";

// Standard marketing page frame: nav + content + footer.
export default function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.page}>
      <SiteNav />
      <main>{children}</main>
      <SiteFooter />
    </div>
  );
}
