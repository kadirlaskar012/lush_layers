import type { Metadata, Viewport } from "next";
import { Playfair_Display, Cormorant_Garamond, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-editorial",
  display: "swap",
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#FAF8F5",
};

export const metadata: Metadata = {
  title: "LUSH LAYERS • Boutique Cake Studio • By Tina Baidya",
  description:
    "Exquisite bespoke celebration and wedding cakes crafted with passion by Tina Baidya. Single-origin Belgian chocolate, delicate botanical infusions, and heirloom tiered confections. Order seamlessly via WhatsApp at +91 8768388868.",
  keywords: [
    "Lush Layers",
    "Tina Baidya",
    "luxury cakes",
    "bespoke wedding cakes",
    "artisanal birthday cakes",
    "custom cakes WhatsApp",
    "Belgian chocolate cakes",
    "haute patisserie",
  ],
  openGraph: {
    title: "LUSH LAYERS • Luxury Artisanal Cakes • By Tina Baidya",
    description: "Bespoke handcrafted cakes made with love by Tina Baidya. Order directly on WhatsApp: +91 8768388868.",
    siteName: "LUSH LAYERS",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${playfair.variable} ${cormorant.variable} ${plusJakarta.variable}`}>
      <head>
        <link rel="preconnect" href="https://res.cloudinary.com" crossOrigin="" />
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />
      </head>
      <body>{children}</body>
    </html>
  );
}
