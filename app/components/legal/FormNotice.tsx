import Link from "next/link";

// Privacy collection notice shown directly beneath any form that collects a
// name, email or phone (contact, enquiry, sample/quote request, newsletter,
// trade application). Legible by design: body font, >=12px, high contrast, and
// a real link to the Privacy Policy - never hover-only or hidden.
//
// variant swaps the wording for the context:
//   "enquiry"    - contact / enquiry / sample / quote forms (default)
//   "newsletter" - email sign-ups
//   "trade"      - trade partner account application
export default function FormNotice({
  variant = "enquiry",
  style,
}: {
  variant?: "enquiry" | "newsletter" | "trade";
  style?: React.CSSProperties;
}) {
  const text =
    variant === "newsletter"
      ? "Sign up for new ranges, promotions and inspiration. Unsubscribe any time. "
      : variant === "trade"
      ? "We will use these details to assess and manage your trade account, process your order requests, and send you trade updates and pricing information. "
      : "We will use your details to respond to your enquiry and to send you occasional updates about new ranges, promotions and events. You can unsubscribe at any time. ";

  return (
    <p style={{ margin: "14px 0 0", fontSize: 12.5, lineHeight: 1.5, color: "#55606a", ...style }}>
      {text}
      See our{" "}
      <Link href="/privacy-policy" style={{ color: "inherit", textDecoration: "underline", fontWeight: 600 }}>
        Privacy Policy
      </Link>
      .
    </p>
  );
}
