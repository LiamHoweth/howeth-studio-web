import type { Metadata } from "next";
import { IBM_Plex_Mono, Manrope, Sora } from "next/font/google";
import "@/styles/carenote-marketing.css";
import "./globals.css";

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

const metadataBase = new URL(
  process.env.NEXT_PUBLIC_SITE_URL || "https://howethstudio.com"
);

export const metadata: Metadata = {
  metadataBase,
  title: {
    default: "Howeth Studio",
    template: "%s | Howeth Studio",
  },
  description:
    "Howeth Studio — independent software development and mobile products including CareNote CNA, Football Era, Elevenward, and Noctara.",
  icons: {
    icon: [{ url: "/studio/favicon.svg", type: "image/svg+xml" }],
  },
  openGraph: {
    type: "website",
    siteName: "Howeth Studio",
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
      className={`${manrope.variable} ${sora.variable} ${studioMono.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
