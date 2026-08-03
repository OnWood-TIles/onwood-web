import { redirect } from "next/navigation";

// The Terms of Service page has been superseded by the fuller Terms and
// Conditions of Sale. Keep the old URL working by redirecting to the new one.
export default function TermsRedirect() {
  redirect("/terms-of-sale");
}
