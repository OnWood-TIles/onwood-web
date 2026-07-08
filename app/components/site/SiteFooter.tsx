import Link from "next/link";
import { getShopDetails } from "../../../lib/content";
import styles from "./site.module.css";

// Site footer with shop details + socials. Server component (reads content).
export default async function SiteFooter() {
  const shop = await getShopDetails();
  return (
    <footer className={styles.footer}>
      <div className={styles.footerInner}>
        <div className={styles.footerCol}>
          <div className={styles.footerBrand}>OnWood Tiles</div>
          <p className={styles.footerAddr}>
            {shop.street}, {shop.suburb} {shop.state} {shop.postcode}
          </p>
          <a href={`mailto:${shop.email}`} className={styles.footerLink}>
            {shop.email}
          </a>
        </div>

        <div className={styles.footerCol}>
          <div className={styles.footerHead}>Explore</div>
          <Link href="/collections" className={styles.footerLink}>
            Collections
          </Link>
          <Link href="/specials" className={styles.footerLink}>
            Specials
          </Link>
          <Link href="/showroom" className={styles.footerLink}>
            Showroom
          </Link>
          <Link href="/contact" className={styles.footerLink}>
            Visit us
          </Link>
        </div>

        <div className={styles.footerCol}>
          <div className={styles.footerHead}>Follow</div>
          <a
            href={shop.socials.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.footerLink}
          >
            Instagram
          </a>
          <a
            href={shop.socials.facebook}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.footerLink}
          >
            Facebook
          </a>
        </div>
      </div>
      <div className={styles.footerBase}>
        (c) {new Date().getFullYear()} OnWood Tiles - Baringa, Sunshine Coast QLD
      </div>
    </footer>
  );
}
