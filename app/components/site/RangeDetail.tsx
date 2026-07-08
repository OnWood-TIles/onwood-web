"use client";

import { useState } from "react";
import Link from "next/link";
import Niche from "../ui/Niche";
import Eyebrow from "../ui/Eyebrow";
import Pill from "../ui/Pill";
import ShineHeading from "../ui/ShineHeading";
import type { WebsiteRange } from "../../../lib/onbase/client";
import styles from "./rangeDetail.module.css";

const AVAIL_LABEL: Record<string, string> = {
  in_stock: "In stock",
  low: "Low stock",
  out: "Out of stock",
};

export default function RangeDetail({ range }: { range: WebsiteRange }) {
  const [active, setActive] = useState(0);
  const swatches = range.swatches ?? [];
  const swatch = swatches[active];
  const heroImage = swatch?.image || swatch?.images?.[0] || range.heroImage;

  return (
    <section className={styles.wrap}>
      <div className={styles.art}>
        <Niche src={heroImage} alt={swatch?.colour || range.name} ratio="1 / 1" priority />
      </div>

      <div className={styles.info}>
        {range.category ? <Eyebrow>{range.category}</Eyebrow> : null}
        <ShineHeading as="h1" text={range.name} size="clamp(30px,5vw,46px)" />
        {range.description ? (
          <p className={styles.desc}>{range.description}</p>
        ) : null}

        {swatches.length > 0 ? (
          <div className={styles.swatchBlock}>
            <div className={styles.swatchLabel}>
              Colour
              {swatch ? <span className={styles.swatchName}>{swatch.colour}</span> : null}
              {swatch?.availability ? (
                <Pill
                  tone={swatch.availability === "out" ? "neutral" : "sea"}
                  dot
                >
                  {AVAIL_LABEL[swatch.availability] || swatch.availability}
                </Pill>
              ) : null}
            </div>
            <div className={styles.swatches}>
              {swatches.map((s, i) => (
                <button
                  key={s.colour + i}
                  className={`${styles.swatch} ${i === active ? styles.swatchActive : ""}`}
                  style={{ background: s.swatchHex || "#ccc" }}
                  aria-label={s.colour}
                  aria-pressed={i === active}
                  title={s.colour}
                  onClick={() => setActive(i)}
                />
              ))}
            </div>
          </div>
        ) : null}

        {range.specs && Object.keys(range.specs).length > 0 ? (
          <dl className={styles.specs}>
            {Object.entries(range.specs).map(([k, v]) => (
              <div key={k} className={styles.specRow}>
                <dt className={styles.specKey}>{k}</dt>
                <dd className={styles.specVal}>{v}</dd>
              </div>
            ))}
          </dl>
        ) : null}

        <Link href="/contact" className={styles.enquire}>
          Enquire about this range
        </Link>
      </div>
    </section>
  );
}
