import type { Metadata } from "next";
import { siteUrl } from "@/lib/siteConfig";
import { IBM_Plex_Mono, Manrope, Sora } from "next/font/google";
import { DocumentLanguage } from "@/components/studio/DocumentLanguage";
import "@/styles/carenote-marketing.css";
import "./globals.css";
import "@/styles/studio-chrome.css";

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
    default: "Beopity",
    template: "%s | Beopity",
  },
  description:
    "Beopity — independent software development and mobile products including Noctara, Football Era, Elevenward, Basketball Era, Baseball Era, Sprout to Stars, and CareNote CNA.",
  icons: {
    icon: [{ url: "/beopity/favicon.png", type: "image/png" }],
    apple: "/beopity/apple-touch-icon.png",
  },
  twitter: { card: "summary_large_image", images: ["/beopity/social.png"] },
  openGraph: {
    type: "website",
    siteName: "Beopity",
    images: [{ url: "/beopity/social.png", width: 1200, height: 630, alt: "Beopity — independent apps and games" }],
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
      className={`${manrope.variable} ${sora.variable} ${studioMono.variable}`}
    >
      <body><DocumentLanguage />{children}</body>
    </html>
  );
}
