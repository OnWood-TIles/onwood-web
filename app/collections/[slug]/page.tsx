import type { Metadata } from "next";
import Link from "next/link";
import PageShell from "../../components/site/PageShell";
import RangeDetail from "../../components/site/RangeDetail";
import ShineHeading from "../../components/ui/ShineHeading";
import { getRange } from "../../../lib/onbase/client";
import styles from "../../home.module.css";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const range = await getRange(slug);
  return {
    title: range?.name || "Collection",
    description:
      range?.description ||
      "Explore this OnWood Tiles collection and its colour range.",
  };
}

export default async function RangePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const range = await getRange(slug);

  if (!range) {
    return (
      <PageShell>
        <section
          className={styles.section}
          style={{ textAlign: "center", minHeight: "40vh" }}
        >
          <ShineHeading text="This range is" accent="coming soon." />
          <p style={{ color: "var(--color-muted)", marginTop: 16 }}>
            We are still adding this collection. In the meantime,{" "}
            <Link
              href="/collections"
              style={{ color: "var(--color-primary)" }}
            >
              browse all collections
            </Link>
            .
          </p>
        </section>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <RangeDetail range={range} />
    </PageShell>
  );
}
