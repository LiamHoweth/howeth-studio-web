import type { Metadata } from "next";
import { siteUrl } from "@/lib/siteConfig";
import { Fraunces, IBM_Plex_Mono, Manrope, Sora } from "next/font/google";
import { DocumentLanguage } from "@/components/studio/DocumentLanguage";
import { AmbientMusic } from "@/components/studio/AmbientMusic";
import "@/styles/carenote-marketing.css";
import "./globals.css";
import "@/styles/studio-chrome.css";
import "@/styles/ambient-music.css";

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-manrope",
  display: "swap",
});

const sora = Sora({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-sora",
  display: "swap",
});

// Soft, hand-finished display serif for editorial headlines.
const fraunces = Fraunces({
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["SOFT", "WONK", "opsz"],
  variable: "--font-display",
  display: "swap",
});

const studioMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-studio-mono",
  display: "swap",
});

const metadataBase = new URL(siteUrl);

export const metadata: Metadata = {
  metadataBase,
  title: {
    default: "beopity",
    template: "%s | beopity",
  },
  description:
    "beopity — independent software development and mobile products including Noctara, Football Era, Elevenward, Basketball Era, Baseball Era, Sprout to Stars, and CareNote CNA.",
  icons: {
    icon: [
      { url: "/beopity/favicon.png", type: "image/png", sizes: "48x48" },
      { url: "/beopity/icon-192.png", type: "image/png", sizes: "192x192" },
    ],
    apple: "/beopity/apple-touch-icon.png",
  },
  twitter: { card: "summary_large_image", images: ["/beopity/social.png"] },
  openGraph: {
    type: "website",
    siteName: "beopity",
    images: [{ url: "/beopity/social.png", width: 1200, height: 630, alt: "beopity: a black kitten above the lowercase beopity wordmark" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${manrope.variable} ${sora.variable} ${fraunces.variable} ${studioMono.variable}`}
    >
      <body><DocumentLanguage />{children}<AmbientMusic /></body>
    </html>
  );
}
