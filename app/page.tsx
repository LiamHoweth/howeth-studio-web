import type { Metadata } from "next";
import Link from "next/link";
import { BeopitySculpture } from "@/components/studio/BeopitySculpture";
import { StudioAboutSection, StudioSiteFooter, StudioWorkSection } from "@/components/studio/StudioMarketing";
import { StudioSiteHeader } from "@/components/studio/StudioSiteHeader";

export const metadata: Metadata = {
  title: { absolute: "Beopity — Apps & Games" },
  description: "A small independent studio building thoughtful apps and worlds worth playing. Explore Noctara, Football Era, Elevenward, Basketball Era, Baseball Era, Sprout to Stars, and CareNote CNA.",
  alternates: { canonical: "/" },
};

export default function HomePage() {
  return <div className="studio-landing">
    <a className="studio-skip" href="#main">Skip to main content</a>
    <StudioSiteHeader />
    <main id="main" className="studio-landing__main">
      <section className="studio-hero" aria-labelledby="studio-hero-title">
        <div className="studio-hero__body">
          <p className="studio-mono studio-hero__eyebrow"><span aria-hidden="true" /> Independent by design</p>
          <h1 id="studio-hero-title">A little<br />curiosity.<br /><em>Endless play.</em></h1>
          <p className="studio-hero__lede">We’re Beopity. Makers of thoughtful apps<br className="studio-desktop-break" /> and worlds worth getting lost in.</p>
          <Link className="studio-button" href="#work">Discover our work <span aria-hidden="true">↗</span></Link>
        </div>
        <BeopitySculpture />
      </section>
      <div className="studio-manifesto"><span className="studio-mono">Made with intention.<br />Played your way.</span><p>Good ideas.<br /><span>Even better experiences.</span></p><Link href="#work" className="studio-manifesto__scroll" aria-label="Scroll to our collection">↓</Link></div>
      <div id="work"><StudioWorkSection /></div>
      <div id="about"><StudioAboutSection /></div>
    </main>
    <StudioSiteFooter year={new Date().getFullYear()} />
  </div>;
}
