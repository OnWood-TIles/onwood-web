import type { Metadata } from "next";
import LegalPage from "../components/marketing/LegalPage";
import { PRIVACY_POLICY } from "../../lib/legal-privacy";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How OnWood Tiles collects, uses, shares and protects your personal information, how we handle marketing, and how you can access, correct or complain - in line with the Australian Privacy Principles.",
};

export default function PrivacyPolicyPage() {
  return <LegalPage doc={PRIVACY_POLICY} updated="3 August 2026" />;
}
