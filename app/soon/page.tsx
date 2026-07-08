import type { Metadata } from "next";
import ComingSoon from "../components/ComingSoon";

export const metadata: Metadata = {
  title: "OnWood Tiles - Coming Soon",
  description:
    "The Sunshine Coast's new home for all things tiles. Our new showroom & website are almost ready. Sign up for first access.",
};

// The public splash. While SITE_MODE is not "live", the proxy gate rewrites all
// public routes here; it also stays mounted after launch as a fallback splash.
export default function SoonPage() {
  return <ComingSoon />;
}
