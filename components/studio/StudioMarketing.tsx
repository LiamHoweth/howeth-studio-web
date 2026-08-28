import Link from "next/link";
import { howethStudioConfig } from "@/lib/siteConfig";

type StudioPageIntroProps = {
  index: string;
  eyebrow: string;
  title: string;
  description: string;
};

export function StudioPageIntro({
  index,
  eyebrow,
  title,
  description,
}: StudioPageIntroProps) {
  return (
    <section className="studio-page-intro" aria-labelledby="studio-page-title">
      <div className="studio-page-intro__rail studio-mono" aria-hidden="true">
        <span>{index}</span>
        <span># {eyebrow}</span>
      </div>
      <div className="studio-page-intro__body">
        <p className="studio-mono studio-page-intro__eyebrow">{eyebrow}</p>
        <h1 id="studio-page-title" className="studio-page-intro__title">
          {title}
        </h1>
        <p className="studio-page-intro__copy">{description}</p>
      </div>
    </section>
  );
}

export function StudioWorkSection() {
  return (
    <section className="studio-work" aria-labelledby="work-heading">
      <div className="studio-work__head">
        <h2 id="work-heading" className="studio-work__title">
          Work
        </h2>
        <p className="studio-mono studio-work__subtitle">
          Shipped products &amp; ongoing surfaces
        </p>
      </div>

      <ol className="studio-work__list">
        <li className="studio-piece studio-piece--carenote">
          <span className="studio-mono studio-piece__index">01</span>
          <div className="studio-piece__body">
            <p className="studio-mono studio-piece__kind">Product · Caregiving</p>
            <h3 className="studio-piece__name">CareNote CNA</h3>
            <p className="studio-piece__copy">
              iPhone app for CNAs: structured shift charting, optional voice capture, and a
              review step before notes are saved — built for speed on the floor and clarity
              for supervisors.
            </p>
            <ul className="studio-piece__bullets studio-mono">
              <li>Native SwiftUI client</li>
              <li>Offline-first workflows</li>
              <li>Privacy-conscious capture</li>
            </ul>
            <div className="studio-piece__actions">
              <Link className="studio-cta" href="/carenote-cna/">
                View product site
              </Link>
              <Link className="studio-cta studio-cta--quiet" href="/carenote-cna/download/">
                Download
              </Link>
            </div>
          </div>
        </li>

        <li className="studio-piece studio-piece--football">
          <span className="studio-mono studio-piece__index">02</span>
          <div className="studio-piece__body">
            <p className="studio-mono studio-piece__kind">Product · Simulation</p>
            <h3 className="studio-piece__name">Football Era</h3>
            <p className="studio-piece__copy">
              Career football simulation on iPhone — seasons, slots, and long-term
              progression with a broadcast-inspired presentation layer over solid game
              systems.
            </p>
            <ul className="studio-piece__bullets studio-mono">
              <li>Gameplay + narrative beats</li>
              <li>Performance-minded UI</li>
              <li>Iterative live ops</li>
            </ul>
            <div className="studio-piece__actions">
              <Link className="studio-cta studio-cta--on-dark" href="/football-era/">
                View product site
              </Link>
              <Link className="studio-cta studio-cta--ghost" href="/football-era/">
                Features
              </Link>
            </div>
          </div>
        </li>
      </ol>
    </section>
  );
}

export function StudioAboutSection() {
  return (
    <section className="studio-about" aria-labelledby="about-heading">
      <div className="studio-about__grid">
        <h2 id="about-heading" className="studio-about__title">
          About
        </h2>
        <div className="studio-about__copy">
          <p>
            The studio is intentionally small: one accountable thread from problem framing
            through implementation, QA, and release. That shows up as opinionated product
            choices, tight scope, and software you can evolve — not a slide deck of
            promises.
          </p>
          <p>
            Mobile is a specialty, not the whole story. Expect serious attention to data
            flow, sync, accessibility, and the seams where clients meet APIs and
            third-party platforms.
          </p>
        </div>
      </div>
    </section>
  );
}

type StudioSiteFooterProps = { year: number };

export function StudioSiteFooter({ year }: StudioSiteFooterProps) {
  return (
    <footer id="contact" className="studio-footer">
      <div className="studio-footer__row studio-mono">
        <span>Howeth Studio</span>
        <span className="studio-footer__dot" aria-hidden="true">
          ·
        </span>
        <span>Independent software practice</span>
        <span className="studio-footer__dot" aria-hidden="true">
          ·
        </span>
        <span>© {year}</span>
      </div>
      <p className="studio-footer__contact">
        <span className="studio-mono studio-footer__label">Contact</span>
        <a className="studio-cta" href={`mailto:${howethStudioConfig.contactEmail}`}>
          {howethStudioConfig.contactEmail}
        </a>
        <Link className="studio-cta studio-cta--quiet" href="/carenote-cna/contact/">
          CareNote support form
        </Link>
      </p>
    </footer>
  );
}
