import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
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
          <h1 id="studio-hero-title">Small studio.<br />Big <em>possibilities.</em></h1>
          <p className="studio-hero__lede">Thoughtful apps for the everyday.<br />Games that take you somewhere else.</p>
          <Link className="studio-button" href="#work">Explore the collection <span aria-hidden="true">↘</span></Link>
          <div className="studio-hero__foot studio-mono"><span>Built with care.</span><span>Made to be used.</span></div>
        </div>
        <div className="studio-hero__scene studio-hero__scene--beopity">
          <Image className="beopity-hero-art" src="/beopity/brand.webp" alt="Beopity: an ivory b emblem and wordmark on charcoal with a subtle teal glow" width={1254} height={1254} priority />
          <div className="beopity-hero-links" aria-label="Explore our apps and games">
            <Link href="/football-era/">Football Era <span aria-hidden="true">↗</span></Link>
            <Link href="/elevenward/">Elevenward <span aria-hidden="true">↗</span></Link>
            <Link href="/noctara/">Noctara <span aria-hidden="true">↗</span></Link>
          </div>
        </div>
      </section>
      <div className="studio-manifesto"><p>Useful in your day.<br /><span>Immersive in your downtime.</span></p><span className="studio-mono">Different ideas.<br />The same attention to detail.</span></div>
      <div id="work"><StudioWorkSection /></div>
      <div id="about"><StudioAboutSection /></div>
    </main>
    <StudioSiteFooter year={new Date().getFullYear()} />
  </div>;
}
