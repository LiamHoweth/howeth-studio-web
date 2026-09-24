import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { StudioSiteHeader } from "@/components/studio/StudioSiteHeader";
import { howethStudioConfig } from "@/lib/siteConfig";

export const metadata: Metadata = {
  title: "Noctara Sleep & Recovery",
  description:
    "Noctara turns supported Apple Health sleep data into recovery context, estimated energy forecasts, sleep trends, and a clearer plan for tonight.",
  alternates: { canonical: "/noctara/" },
};

const features = [
  {
    number: "01",
    title: "Understand today",
    description:
      "See Recovery and Sleep Scores with plain-language context, plus an estimated Energy Forecast for likely peaks and dips.",
  },
  {
    number: "02",
    title: "Look across nights",
    description:
      "Explore recorded sleep history, available stages, trends, and weekly insights without filling missing data with invented values.",
  },
  {
    number: "03",
    title: "Prepare for tonight",
    description:
      "Review a suggested sleep window and sleep-balance context to help make a practical plan for your evening.",
  },
] as const;

export default function NoctaraPage() {
  return (
    <>
      <a className="noctara-skip" href="#main">Skip to main content</a>
      <StudioSiteHeader />
      <main id="main">
        <section className="noctara-hero" aria-labelledby="noctara-title">
          <div className="noctara-hero__copy">
            <p className="noctara-kicker">Noctara · Sleep &amp; Recovery</p>
            <h1 id="noctara-title">Understand your night.<br /><em>Own your day.</em></h1>
            <p className="noctara-lede">
              Noctara turns supported sleep and recovery information from Apple Health
              into calm, practical wellness guidance for today and tonight.
            </p>
            <div className="noctara-hero__actions">
              <a className="noctara-button" href="#features">Explore the app</a>
              <span className="noctara-availability">App Store release in preparation</span>
            </div>
          </div>
          <div className="noctara-hero__art">
            <Image
              src="/noctara/horizon-app-icon.png"
              alt="Noctara Horizon owl mark"
              width={1024}
              height={1024}
              priority
            />
            <span aria-hidden="true">NOCTARA</span>
          </div>
        </section>

        <section className="noctara-section" id="features" aria-labelledby="noctara-features-title">
          <div className="noctara-section__heading">
            <p className="noctara-kicker">The experience</p>
            <h2 id="noctara-features-title">A clearer picture of rest.</h2>
          </div>
          <div className="noctara-features">
            {features.map((feature) => (
              <article className="noctara-feature" key={feature.number}>
                <span className="noctara-feature__number">{feature.number}</span>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="noctara-section noctara-section--access" aria-labelledby="noctara-access-title">
          <div>
            <p className="noctara-kicker">Your choice</p>
            <h2 id="noctara-access-title">Start locally. Sync if you want.</h2>
          </div>
          <div className="noctara-access__copy">
            <p>
              No account is required. Noctara keeps raw Apple Health samples and detailed
              sleep-stage timelines on your device. Optional Sign in with Apple syncs
              derived summaries, preferences, and reports.
            </p>
            <p>Every feature is planned to be included during early access at no charge.</p>
          </div>
        </section>
      </main>
      <footer className="noctara-footer">
        <p>Noctara provides wellness estimates for information, not medical advice.</p>
        <nav aria-label="Noctara links">
          <Link href="/work/">Studio work</Link>
          <a href="https://noctara-api-production.up.railway.app/privacy">Privacy</a>
          <a href="https://noctara-api-production.up.railway.app/support">Support</a>
          <a href={`mailto:${howethStudioConfig.contactEmail}`}>Contact</a>
        </nav>
      </footer>
    </>
  );
}
