import { redirect } from "next/navigation";

// The old Website Terms page has been superseded by the fuller Website Terms of
// Use. Keep the old URL working by redirecting to the new one.
export default function WebsiteTermsRedirect() {
  redirect("/terms-of-use");
}
