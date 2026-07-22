import type { Metadata } from "next";
import LegalPage from "../components/marketing/LegalPage";
import { TERMS_OF_SERVICE, LEGAL_UPDATED } from "../../lib/legal";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "The terms that apply when you buy tiles, flooring, tapware and related products from OnWood Tiles - quotes, orders, payment, delivery, returns and your Australian Consumer Law rights.",
};

export default function TermsOfServicePage() {
  return <LegalPage doc={TERMS_OF_SERVICE} updated={LEGAL_UPDATED} />;
}
