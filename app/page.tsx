import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { products } from "@/lib/products";
import { StudioAboutSection, StudioInterlude, StudioSiteFooter, StudioWorkSection } from "@/components/studio/StudioMarketing";
import { StudioSiteHeader } from "@/components/studio/StudioSiteHeader";
import { StudioTrail } from "@/components/studio/StudioTrail";

export const metadata: Metadata = {
  title: { absolute: "beopity — Apps & Games" },
  description: "A small independent studio building thoughtful apps and worlds worth playing. Explore Noctara, Football Era, Elevenward, Basketball Era, Baseball Era, Sprout to Stars, and CareNote CNA.",
  alternates: { canonical: "/" },
};

const live = products.filter((product) => product.status === "On the App Store").length;
const platforms = [...new Set(products.flatMap((product) => product.platform.split(" · ")))];

export default function HomePage() {
  return <div className="studio-landing">
    <a className="studio-skip" href="#main">Skip to main content</a>
    <StudioSiteHeader />
    <main id="main">
      <StudioTrail>
        <section className="studio-hero" aria-labelledby="studio-hero-title">
          <div className="studio-hero__body">
            <p className="studio-mono studio-eyebrow"><i aria-hidden="true" /> Independent apps &amp; games</p>
            <h1 id="studio-hero-title">A little curiosity. <em>Endless play.</em></h1>
            <p className="studio-hero__lede">We’re beopity, a small studio making thoughtful apps and worlds worth getting lost in, one careful detail at a time.</p>
            <div className="studio-hero__actions">
              <Link className="studio-button" href="#work">Discover our work <span aria-hidden="true">↓</span></Link>
              <Link className="studio-text-link" href="/about/">Meet the studio <span aria-hidden="true">↗</span></Link>
            </div>
            <dl className="studio-facts">
              <div><dt className="studio-mono">Products</dt><dd>{String(products.length).padStart(2, "0")}</dd></div>
              <div><dt className="studio-mono">On the App Store</dt><dd>{String(live).padStart(2, "0")}</dd></div>
              <div><dt className="studio-mono">Made for</dt><dd><small>{platforms.join(" · ")}</small></dd></div>
            </dl>
          </div>
          <figure className="studio-art">
            <div className="studio-art__card">
              <Image src="/beopity/logo.webp" alt="beopity: a black kitten with pale mint eyes sitting above the lowercase beopity wordmark" width={1080} height={1080} sizes="(max-width: 860px) 92vw, 40vw" priority />
            </div>
            <figcaption className="studio-mono studio-art__tag">Curious since day one</figcaption>
          </figure>
        </section>
        <StudioInterlude index="01 — The approach" wander={0.4}>Every product begins with <em>a little curiosity.</em></StudioInterlude>
        <div id="work"><StudioWorkSection /></div>
        <StudioInterlude index="02 — The pace" wander={0.55}>Made slowly, <em>so it lasts.</em></StudioInterlude>
        <div id="about"><StudioAboutSection /></div>
      </StudioTrail>
    </main>
    <StudioSiteFooter year={new Date().getFullYear()} />
  </div>;
}
