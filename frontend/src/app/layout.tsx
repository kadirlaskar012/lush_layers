import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LUSH LAYERS • Luxury Artisanal Cakes • Made with Love",
  description:
    "Exquisite bespoke celebration and wedding cakes crafted with passion. Single-origin Belgian chocolate, delicate botanical infusions, and heirloom tiered confections. Order seamlessly via WhatsApp.",
  keywords: [
    "luxury cakes",
    "bespoke wedding cakes",
    "artisanal birthday cakes",
    "custom cakes WhatsApp",
    "Belgian chocolate cakes",
    "LUSH LAYERS",
  ],
  openGraph: {
    title: "LUSH LAYERS • Luxury Artisanal Cakes",
    description: "Bespoke handcrafted cakes made with love. Order directly on WhatsApp.",
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
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
