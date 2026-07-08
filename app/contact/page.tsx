import type { Metadata } from "next";
import PageShell from "../components/site/PageShell";
import ContactForm from "../components/site/ContactForm";
import Eyebrow from "../components/ui/Eyebrow";
import ShineHeading from "../components/ui/ShineHeading";
import { getShopDetails } from "../../lib/content";
import styles from "../home.module.css";
import contact from "./contact.module.css";

export const metadata: Metadata = {
  title: "Contact & Visit",
  description:
    "Visit OnWood Tiles at 2/11 Packer Street, Baringa, or send an enquiry - we would love to help with your project.",
};

export default async function ContactPage() {
  const shop = await getShopDetails();
  return (
    <PageShell>
      <section className={`${styles.section} ${contact.grid}`}>
        <div className={contact.info}>
          <Eyebrow>Say hello</Eyebrow>
          <ShineHeading as="h1" text="Visit us, or" accent="drop a line." />
          <p className={styles.heroSub}>
            Pop into the Baringa showroom, or send us a message and we will get
            straight back to you.
          </p>
          <dl className={contact.details}>
            <div>
              <dt className={contact.dt}>Showroom</dt>
              <dd className={contact.dd}>
                {shop.street}, {shop.suburb} {shop.state} {shop.postcode}
              </dd>
            </div>
            <div>
              <dt className={contact.dt}>Email</dt>
              <dd className={contact.dd}>
                <a href={`mailto:${shop.email}`} className={contact.link}>
                  {shop.email}
                </a>
              </dd>
            </div>
            <div>
              <dt className={contact.dt}>Follow</dt>
              <dd className={contact.dd}>
                <a href={shop.socials.instagram} target="_blank" rel="noopener noreferrer" className={contact.link}>
                  Instagram
                </a>
                {" · "}
                <a href={shop.socials.facebook} target="_blank" rel="noopener noreferrer" className={contact.link}>
                  Facebook
                </a>
              </dd>
            </div>
          </dl>
        </div>
        <div className={contact.formCol}>
          <ContactForm />
        </div>
      </section>
    </PageShell>
  );
}
