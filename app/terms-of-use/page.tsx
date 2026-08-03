import type { Metadata } from "next";
import LegalPage from "../components/marketing/LegalPage";
import { WEBSITE_TERMS_OF_USE } from "../../lib/legal-website-use";

export const metadata: Metadata = {
  title: "Website Terms of Use",
  description:
    "The terms that govern your use of the OnWood Tiles website and trade portal - including our AI-generated and illustrative imagery disclosure, indicative stock, and your Australian Consumer Law rights.",
};

export default function TermsOfUsePage() {
  return <LegalPage doc={WEBSITE_TERMS_OF_USE} updated="3 August 2026" />;
}
