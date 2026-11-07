import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getFamilyBrochure } from "../../../lib/brochure";
import { getOptionsBrochure } from "../../../lib/optionsBrochure";
import { getBusiness } from "../../../lib/onbase/client";
import { showroomAddress } from "../../../lib/content";
import FamilyBrochure, { type BrochureContact } from "../../components/brochure/FamilyBrochure";
import OptionsBrochure from "../../components/brochure/OptionsBrochure";

export const dynamic = "force-dynamic";

type Params = { family: string };

// A product with options (a Marquis vanity range) has its own brochure under its product
// slug: sizes, drawings and options. Anything else is a tile-style family brochure.
async function load(slug: string) {
  const options = await getOptionsBrochure(slug);
  return options ? { options, family: null } : { options: null, family: await getFamilyBrochure(slug) };
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { family } = await params;
  const { options, family: data } = await load(family);
  const title = options ? `${options.name} ${options.accentWord}` : data?.familyName;
  return { title: title ? `${title} brochure · OnWood Tiles` : "Brochure not found", robots: { index: false } };
}

export default async function BrochurePage({ params }: { params: Promise<Params> }) {
  const { family } = await params;
  const [{ options, family: data }, business] = await Promise.all([load(family), getBusiness()]);
  if (!options && !data) notFound();

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

  return options ? <OptionsBrochure data={options} contact={contact} /> : <FamilyBrochure data={data!} contact={contact} />;
}
