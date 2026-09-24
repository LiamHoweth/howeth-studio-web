import type { Metadata } from "next";
import { StudioClock } from "@/components/studio/StudioClock";
import {
  StudioAboutSection,
  StudioSiteFooter,
  StudioWorkSection,
} from "@/components/studio/StudioMarketing";
import { StudioSiteHeader } from "@/components/studio/StudioSiteHeader";

export const metadata: Metadata = {
  title: "Howeth Studio",
  description:
    "Independent software studio building CareNote CNA, Football Era, Elevenward, Noctara, and selective new work.",
  alternates: {
    canonical: "/",
  },
};

export default function HomePage() {
  const year = new Date().getFullYear();

  return (
    <div className="studio-landing">
      <a className="studio-skip" href="#main">
        Skip to main content
      </a>
      <StudioSiteHeader />
      <main id="main" className="studio-landing__main">
        <section className="studio-hero" aria-labelledby="studio-hero-title">
          <div className="studio-hero__rail">
            <span className="studio-mono studio-hero__index" aria-hidden="true">
              001
            </span>
            <p className="studio-mono studio-hero__hash"># SoftwareStudio</p>
          </div>

          <div className="studio-hero__body">
            <h1 id="studio-hero-title" className="studio-hero__title">
              <span className="studio-hero__title-line studio-hero__title-line--a">
                Software
              </span>
              <span className="studio-hero__title-line studio-hero__title-line--b">
                Development
              </span>
            </h1>
            <p className="studio-mono studio-hero__folio">
              Studio portfolio — {year}
            </p>
            <p className="studio-hero__lede">
              Howeth Studio designs and ships end-to-end software: disciplined product work,
              thoughtful UX, and maintainable code — from native mobile to the services and
              data models behind them.
            </p>
          </div>

          <div className="studio-hero__meta studio-mono">
            <StudioClock />
            <span className="studio-hero__coords" aria-label="Practice location">
              Remote-first · US
            </span>
            <span className="studio-hero__status">Available for selective projects</span>
          </div>
        </section>

        <div id="work">
          <StudioWorkSection />
        </div>

        <div id="about">
          <StudioAboutSection />
        </div>

        <StudioSiteFooter year={year} />
      </main>
    </div>
  );
}
