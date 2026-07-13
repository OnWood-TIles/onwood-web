import type { Metadata } from "next";
import { Archivo, Manrope, Newsreader } from "next/font/google";
import "./globals.css";
import { ThemeProvider, themeNoFlashScript } from "./components/ui/ThemeProvider";

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
  sameAs: [
    "https://www.instagram.com/onwood_tiles",
    "https://www.facebook.com/share/18qX1BsNrf/",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
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
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
