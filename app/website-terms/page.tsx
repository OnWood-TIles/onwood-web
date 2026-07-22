import type { Metadata } from "next";
import LegalPage from "../components/marketing/LegalPage";
import { WEBSITE_TERMS, LEGAL_UPDATED } from "../../lib/legal";

export const metadata: Metadata = {
  title: "Terms of Website Use",
  description:
    "The terms that apply to your use of the OnWood Tiles website - acceptable use, trade partner accounts, product information, intellectual property and liability.",
};

export default function WebsiteTermsPage() {
  return <LegalPage doc={WEBSITE_TERMS} updated={LEGAL_UPDATED} />;
}
