import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getFamilyBrochure } from "../../../lib/brochure";
import { getBusiness } from "../../../lib/onbase/client";
import { showroomAddress } from "../../../lib/content";
import FamilyBrochure, { type BrochureContact } from "../../components/brochure/FamilyBrochure";

export const dynamic = "force-dynamic";

type Params = { family: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { family } = await params;
  const data = await getFamilyBrochure(family);
  return { title: data ? `${data.familyName} brochure · OnWood Tiles` : "Brochure not found", robots: { index: false } };
}

export default async function BrochurePage({ params }: { params: Promise<Params> }) {
  const { family } = await params;
  const [data, business] = await Promise.all([getFamilyBrochure(family), getBusiness()]);
  if (!data) notFound();

  // No street address while we relocate within Baringa - show the placeholder.
  const address = showroomAddress();
  const contact: BrochureContact = {
    website: "onwoodtiles.com.au",
    address,
    phone: business?.phone || "",
    email: business?.email || "hello@onwoodtiles.com.au",
    hours: business?.openHoursSummary || "Mon to Fri, by appointment",
    abn: "41 522 687 021",
    bookUrl: "/book",
  };

  return <FamilyBrochure data={data} contact={contact} />;
}
