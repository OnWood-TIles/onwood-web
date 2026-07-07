import type { Metadata } from "next";
import { Archivo, Manrope, Newsreader } from "next/font/google";
import "./globals.css";

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

// Italic accent word ("soon.")
const newsreader = Newsreader({
  subsets: ["latin"],
  weight: ["400"],
  style: ["italic"],
  variable: "--font-newsreader",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://onwoodtiles.com.au"),
  title: "OnWood Flooring & Tiles — Coming Soon",
  description:
    "The Sunshine Coast's new home for all things tiles. Our new showroom & website are almost ready. Sign up for first access.",
  openGraph: {
    title: "OnWood Flooring & Tiles — Coming Soon",
    description:
      "The Sunshine Coast's new home for all things tiles. Our showroom & website are almost ready.",
    url: "https://onwoodtiles.com.au",
    siteName: "OnWood Flooring & Tiles",
    locale: "en_AU",
    type: "website",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en-AU"
      className={`${archivo.variable} ${manrope.variable} ${newsreader.variable} antialiased`}
    >
      <body>{children}</body>
    </html>
  );
}
