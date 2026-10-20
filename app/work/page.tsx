import type { Metadata } from "next";
import Link from "next/link";
import {
  StudioPageIntro,
  StudioSiteFooter,
  StudioWorkSection,
} from "@/components/studio/StudioMarketing";
import { StudioSiteHeader } from "@/components/studio/StudioSiteHeader";
import { StudioTrail } from "@/components/studio/StudioTrail";

export const metadata: Metadata = {
  title: "Work",
  description:
    "Products from beopity — Noctara, Football Era, Elevenward, Basketball Era, Baseball Era, Sprout to Stars, and CareNote CNA.",
  alternates: {
    canonical: "/work/",
  },
};

export default function WorkPage() {
  const year = new Date().getFullYear();

  return (
    <div className="studio-landing">
      <a className="studio-skip" href="#main">
        Skip to main content
      </a>
      <StudioSiteHeader />
      <main id="main">
        <StudioTrail>
          <nav className="studio-subcrumb studio-mono" aria-label="Breadcrumb">
            <Link href="/">Index</Link>
            <span aria-hidden="true"> · </span>
            <span>Work</span>
          </nav>
          <StudioPageIntro
            index="002"
            eyebrow="Apps & games"
            title="A little curiosity. A lot to explore."
            description="Thoughtful apps and games from beopity. Browse the full collection, from everyday companions to worlds still taking shape."
          />
          <StudioWorkSection />
        </StudioTrail>
      </main>
      <StudioSiteFooter year={year} />
    </div>
  );
}
