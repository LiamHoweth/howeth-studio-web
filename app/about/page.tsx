import type { Metadata } from "next";
import Link from "next/link";
import {
  StudioAboutSection,
  StudioPageIntro,
  StudioSiteFooter,
} from "@/components/studio/StudioMarketing";
import { StudioSiteHeader } from "@/components/studio/StudioSiteHeader";

export const metadata: Metadata = {
  title: "About",
  description:
    "How Howeth Studio builds software: small-team accountability, product-led engineering, and mobile-first delivery with serious attention to data and APIs.",
  alternates: {
    canonical: "/about/",
  },
};

export default function AboutPage() {
  const year = new Date().getFullYear();

  return (
    <div className="studio-landing">
      <a className="studio-skip" href="#main">
        Skip to main content
      </a>
      <StudioSiteHeader />
      <main id="main" className="studio-landing__main">
        <nav className="studio-subcrumb studio-mono" aria-label="Breadcrumb">
          <Link href="/">Index</Link>
          <span aria-hidden="true"> · </span>
          <span>About</span>
        </nav>
        <StudioPageIntro
          index="003"
          eyebrow="Studio profile"
          title="Small by design. Serious about the details."
          description="Howeth Studio pairs product thinking with hands-on engineering, keeping the path from a good idea to reliable software direct and accountable."
        />
        <StudioAboutSection />
        <StudioSiteFooter year={year} />
      </main>
    </div>
  );
}
