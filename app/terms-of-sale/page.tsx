import type { Metadata } from "next";
import LegalPage from "../components/marketing/LegalPage";
import { TERMS_OF_SALE } from "../../lib/legal-sale";

export const metadata: Metadata = {
  title: "Terms and Conditions of Sale",
  description:
    "The terms that apply when you buy tiles, natural stone, stone veneer and related products from OnWood Tiles - quotes, orders, deposits, batches, delivery, returns and your Australian Consumer Law rights.",
};

export default function TermsOfSalePage() {
  return <LegalPage doc={TERMS_OF_SALE} updated="3 August 2026" />;
}
