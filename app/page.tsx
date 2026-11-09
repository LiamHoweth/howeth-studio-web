import type { Metadata } from "next";
import Link from "next/link";
import { products } from "@/lib/products";
import { StudioAboutSection, StudioInterlude, StudioSiteFooter, StudioWorkSection } from "@/components/studio/StudioMarketing";
import { StudioSiteHeader } from "@/components/studio/StudioSiteHeader";
import { StudioTrail } from "@/components/studio/StudioTrail";
import { HeroJourney } from "@/components/studio/hero/HeroJourney";

export const metadata: Metadata = {
  title: { absolute: "beopity — Apps & Games" },
  description: "An independent studio making apps and games worth wandering into: Noctara, Football Era, Elevenward, Basketball Era, Baseball Era, Sprout to Stars, Math Wars and CareNote CNA.",
  alternates: { canonical: "/" },
};

const live = products.filter((product) => product.status === "On the App Store").length;
const platforms = [...new Set(products.flatMap((product) => product.platform.split(" · ")))];

export default function HomePage() {
  return <div className="studio-landing">
    <a className="studio-skip" href="#main">Skip to main content</a>
    <StudioSiteHeader />
    <main id="main">
      {/* Bramble, the wandering house, crosses the hero landscape; the walking
          cat takes over in the trail below. */}
      <HeroJourney aria-labelledby="studio-hero-title">
        <p className="studio-mono studio-eyebrow">Independent apps &amp; games</p>
        <h1 id="studio-hero-title">A little curiosity. <em>Endless play.</em></h1>
        <p className="studio-hero__lede">We’re beopity, a small studio making thoughtful apps and worlds worth wandering into, one careful detail at a time.</p>
        <div className="studio-hero__actions">
          <Link className="studio-button" href="#work">Discover our work <span aria-hidden="true">↓</span></Link>
          <Link className="studio-text-link" href="/about/">Meet the studio <span aria-hidden="true">↗</span></Link>
        </div>
      </HeroJourney>
      <StudioTrail>
        <dl className="studio-facts studio-facts--strip">
          <div><dt className="studio-mono">Products</dt><dd>{String(products.length).padStart(2, "0")}</dd></div>
          <div><dt className="studio-mono">On the App Store</dt><dd>{String(live).padStart(2, "0")}</dd></div>
          <div><dt className="studio-mono">Made for</dt><dd><small>{platforms.join(" · ")}</small></dd></div>
        </dl>
        <StudioInterlude index="01 — The approach" wander={0.4}>Every product begins with <em>a little curiosity.</em></StudioInterlude>
        <div id="work"><StudioWorkSection /></div>
        <StudioInterlude index="02 — The pace" wander={0.55}>Made slowly, <em>so it lasts.</em></StudioInterlude>
        <div id="about"><StudioAboutSection /></div>
      </StudioTrail>
    </main>
    <StudioSiteFooter year={new Date().getFullYear()} />
  </div>;
}
