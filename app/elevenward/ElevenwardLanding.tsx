import Link from "next/link";
import { ProductArtwork } from "@/components/studio/ProductArtwork";
import { getProduct } from "@/lib/products";
import { ElevenwardFooter, ElevenwardNav, LanguageNav } from "./ElevenwardChrome";
import {
  elevenwardCopy,
  elevenwardLanguageTag,
  elevenwardUiCopy,
  type ElevenwardLocale,
} from "./content";

export function ElevenwardLanding({ locale }: { locale: ElevenwardLocale }) {
  const copy = elevenwardCopy[locale];
  const ui = elevenwardUiCopy[locale];
  const privacyRoute = locale === "en" ? "/elevenward/privacy/" : `/elevenward/${locale}/privacy/`;

  return (
    <div className="ew-root" lang={elevenwardLanguageTag(locale)}>
      <a className="ew-skip" href="#ew-main">{ui.skip}</a>
      <ElevenwardNav locale={locale} active="overview" />
      <main id="ew-main">
        <section className="ew-hero" aria-labelledby="ew-title">
          <div className="ew-hero__copy">
            <div className="ew-status" aria-label={`${ui.developmentStatus}. ${ui.platforms}.`}>
              <span><i aria-hidden="true" />{ui.developmentStatus}</span>
              <span>{ui.platforms}</span>
            </div>
            <p className="ew-kicker">{copy.subtitle}</p>
            <h1 id="ew-title">{copy.title}</h1>
            <p className="ew-hero__intro">{copy.intro}</p>
            <div className="ew-actions">
              <a href="#career">{copy.primaryAction}<span aria-hidden="true">↓</span></a>
              <a className="ew-action--quiet" href="mailto:howethstudio@gmail.com?subject=Elevenward%20launch">{copy.secondaryAction}</a>
            </div>
            <LanguageNav active={locale} />
          </div>
          <div className="ew-hero__art" lang="en">
            <ProductArtwork product={getProduct("elevenward")} priority />
          </div>
        </section>

        <a className="ew-scroll-prompt" href="#career"><span>{ui.scrollPrompt}</span><i aria-hidden="true">↓</i></a>

        <section className="ew-stats" aria-label="Elevenward at a glance">
          {ui.stats.map(([value, label]) => <div key={label}><strong>{value}</strong><span>{label}</span></div>)}
        </section>

        <section className="ew-career" id="career" aria-labelledby="ew-career-title">
          <div className="ew-section-heading">
            <p className="ew-kicker">{ui.careerEyebrow}</p>
            <h2 id="ew-career-title">{ui.careerTitle}</h2>
          </div>
          <div className="ew-pillars">
            {copy.pillars.map(([title, body], index) => (
              <article key={title}>
                <span>0{index + 1}</span>
                <div><h3>{title}</h3><p>{body}</p></div>
              </article>
            ))}
          </div>
        </section>

        <section className="ew-loop" aria-labelledby="ew-loop-title">
          <div className="ew-section-heading ew-section-heading--sticky">
            <p className="ew-kicker">{ui.loopEyebrow}</p>
            <h2 id="ew-loop-title">{copy.loopTitle}</h2>
          </div>
          <ol>
            {copy.loop.map((step, index) => (
              <li key={step}><span>{String(index + 1).padStart(2, "0")}</span><strong>{step}</strong></li>
            ))}
          </ol>
        </section>

        <section className="ew-world" id="world" aria-labelledby="ew-world-title">
          <div className="ew-section-heading">
            <p className="ew-kicker">{ui.worldEyebrow}</p>
            <h2 id="ew-world-title">{copy.worldTitle}</h2>
            <p>{copy.worldBody}</p>
          </div>
          <div className="ew-world__map" aria-hidden="true">
            <div className="ew-world__pitch"><span /></div>
            {["ENG", "ESP", "FRA", "GER", "BRA", "USA"].map((nation, index) => (
              <span className={`ew-world__nation ew-world__nation--${index + 1}`} key={nation}>{nation}<i /></span>
            ))}
          </div>
        </section>

        <section className="ew-promise" id="fair-play" aria-labelledby="ew-promise-title">
          <div>
            <p className="ew-kicker">{ui.promiseEyebrow}</p>
            <h2 id="ew-promise-title">{copy.promiseTitle}</h2>
            <p>{copy.promiseBody}</p>
            <Link href={privacyRoute}>{ui.privacyAction}<span aria-hidden="true">→</span></Link>
          </div>
          <ul>{ui.fairPoints.map((point) => <li key={point}><span aria-hidden="true">✓</span>{point}</li>)}</ul>
        </section>
      </main>
      <ElevenwardFooter locale={locale} />
    </div>
  );
}
