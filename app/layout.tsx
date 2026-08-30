import type { Metadata } from "next";
import { Archivo, Manrope, Newsreader } from "next/font/google";
import "./globals.css";
import { ThemeProvider, themeNoFlashScript } from "./components/ui/ThemeProvider";
import { NavConfigProvider } from "./components/marketing/NavConfigProvider";
import { ShopMenuProvider } from "./components/marketing/ShopMenuProvider";
import WishlistFab from "./components/wishlist/WishlistFab";
import ShowroomBanner from "./components/marketing/ShowroomBanner";
import PresenceBeacon from "./components/PresenceBeacon";
import { Analytics } from "@vercel/analytics/next";
import { getNav, getShopMenu } from "../lib/onbase/client";

// Headings / labels
const archivo = Archivo({
  subsets: ["latin"],
  weight: ["600", "700", "800", "900"],
  variable: "--font-archivo",
  display: "swap",
});

// Body / UI
const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-manrope",
  display: "swap",
});

// Italic accent word ("soon.", shine words)
const newsreader = Newsreader({
  subsets: ["latin"],
  weight: ["400"],
  style: ["italic"],
  variable: "--font-newsreader",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://onwoodtiles.com.au"),
  title: {
    default: "OnWood Tiles - Sunshine Coast Tile Shop",
    template: "%s | OnWood Tiles",
  },
  description:
    "The Sunshine Coast's new home for all things tiles. Quality floor, wall and outdoor tiles in Baringa.",
  openGraph: {
    title: "OnWood Tiles",
    description: "The Sunshine Coast's new home for all things tiles.",
    url: "https://onwoodtiles.com.au",
    siteName: "OnWood Tiles",
    locale: "en_AU",
    type: "website",
  },
  // The share image is supplied by app/opengraph-image.tsx + app/twitter-image.tsx.
  twitter: {
    card: "summary_large_image",
    title: "OnWood Tiles",
    description: "The Sunshine Coast's new home for all things tiles.",
  },
  // Google Search Console verification. Set GOOGLE_SITE_VERIFICATION in Vercel to
  // the token from Search Console's "HTML tag" method; if unset, no tag renders.
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
    // Pinterest domain claim. Set PINTEREST_DOMAIN_VERIFY in Vercel to the code
    // from Pinterest -> Claim website -> "Add HTML tag" (the content= value).
    // Renders <meta name="p:domain_verify" ...> only when the env var is set.
    ...(process.env.PINTEREST_DOMAIN_VERIFY
      ? { other: { "p:domain_verify": process.env.PINTEREST_DOMAIN_VERIFY } }
      : {}),
  },
};

// LocalBusiness structured data (site-wide).
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "HomeGoodsStore",
  name: "OnWood Tiles",
  description:
    "The Sunshine Coast's new home for all things tiles. Quality floor, wall and outdoor tiles in Baringa.",
  url: "https://onwoodtiles.com.au",
  email: "sales@onwoodtiles.com.au",
  telephone: "+61 447 766 553",
  image: "https://onwoodtiles.com.au/onwood-logo-white.png",
  address: {
    "@type": "PostalAddress",
    streetAddress: "2/11 Packer Road",
    addressLocality: "Baringa",
    addressRegion: "QLD",
    postalCode: "4551",
    addressCountry: "AU",
  },
  areaServed: "Sunshine Coast, Queensland",
  // Approx Baringa coordinates. Refine to the exact Google Maps pin once the
  // Google Business Profile is set up.
  geo: { "@type": "GeoCoordinates", latitude: -26.7975, longitude: 153.1015 },
  hasMap: "https://www.google.com/maps/search/?api=1&query=OnWood+Tiles+2%2F11+Packer+Road+Baringa+QLD+4551",
  priceRange: "$$",
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      opens: "10:00",
      closes: "16:00",
    },
  ],
  sameAs: [
    "https://www.instagram.com/onwood_tiles",
    "https://www.facebook.com/share/18qX1BsNrf/",
    "https://au.pinterest.com/OnWoodTiles/",
  ],
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // /admin-designed navigation (cached ~5 min; [] -> built-in nav fallback) +
  // the shop taxonomy that drives the Shop mega-menu.
  const [navItems, shopDepts] = await Promise.all([getNav(), getShopMenu()]);
  return (
    <html
      lang="en-AU"
      suppressHydrationWarning
      className={`${archivo.variable} ${manrope.variable} ${newsreader.variable} antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeNoFlashScript }} />
        {/* No-JS fallback: scroll-reveal elements must not stay invisible. */}
        <noscript>
          <style>{`[data-reveal]{opacity:1!important;transform:none!important}`}</style>
        </noscript>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        {/* Accessibility (WCAG 2.4.1): first focusable element lets keyboard /
            screen-reader users jump the fixed nav straight to page content.
            Hidden off-screen until focused (see .skip-link in globals.css). */}
        <a href="#main" className="skip-link">Skip to content</a>
        <ThemeProvider>
          <NavConfigProvider items={navItems}>
            <ShopMenuProvider depts={shopDepts}>
              {/* Focus target for the skip link. tabIndex=-1 lets it receive
                  programmatic focus without joining the tab order. Pages render
                  their own <main>, so this is a neutral wrapper. */}
              <div id="main" tabIndex={-1}>
                {children}
              </div>
            </ShopMenuProvider>
            <WishlistFab />
            <ShowroomBanner />
          </NavConfigProvider>
        </ThemeProvider>
        {/* Cookieless traffic analytics (no consent banner required). */}
        <Analytics />
        {/* Live-visitor heartbeat for the /admin dashboard (no cookies, no PII). */}
        <PresenceBeacon />
      </body>
    </html>
  );
}
