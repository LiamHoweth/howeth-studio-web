import Link from "next/link";
import { beopityConfig } from "@/lib/siteConfig";
import { ProductCollection } from "./ProductCollection";

type StudioPageIntroProps = {
  index: string;
  eyebrow: string;
  title: string;
  description: string;
};

export function StudioPageIntro({ index, eyebrow, title, description }: StudioPageIntroProps) {
  return (
    <section className="studio-page-intro" aria-labelledby="studio-page-title">
      <div className="studio-page-intro__rail studio-mono">
        <span>{index}</span><span>{eyebrow}</span>
      </div>
      <h1 id="studio-page-title">{title}</h1>
      <p>{description}</p>
    </section>
  );
}

export function StudioWorkSection() {
  return (
    <section className="studio-work" aria-labelledby="work-heading">
      <div className="studio-work__head">
        <div>
          <p className="studio-mono studio-section-label">01 / The collection</p>
          <h2 id="work-heading">Find your next favorite.</h2>
        </div>
        <p>Seven products. Plenty of possibilities.<br />Explore what’s live and what’s taking shape.</p>
      </div>
      <ProductCollection />
    </section>
  );
}

export function StudioAboutSection() {
  return (
    <section className="studio-about" aria-labelledby="about-heading">
      <div className="studio-about__grid">
        <div>
          <p className="studio-mono studio-section-label">02 / Behind the work</p>
          <h2 id="about-heading">Small on purpose.<br /><em>Curious by nature.</em></h2>
        </div>
        <div className="studio-about__copy">
          <p>Beopity is an independent software studio with a soft spot for thoughtful mobile apps and games you can get lost in.</p>
          <p>From a better night’s sleep to a career-defining season, each product starts with a simple idea: make something worth coming back to.</p>
          <Link className="studio-text-link" href="/contact/">Let’s talk <span aria-hidden="true">↗</span></Link>
        </div>
      </div>
      <div className="studio-values studio-mono">
        <span>Thoughtful by default</span><span>Built for the long run</span><span>Always a little curious</span>
      </div>
    </section>
  );
}

export function StudioSiteFooter({ year }: { year: number }) {
  return (
    <footer id="contact" className="studio-footer">
      <div className="studio-footer__invitation">
        <p className="studio-mono">Have something in mind?</p>
        <Link href="/contact/">Good things start<br />with a <em>conversation.</em><span aria-hidden="true">↗</span></Link>
      </div>
      <div className="studio-footer__bottom">
        <Link className="studio-footer__wordmark" href="/">beopity</Link>
        <a href={`mailto:${beopityConfig.contactEmail}`}>{beopityConfig.contactEmail}</a>
        <div className="studio-mono"><span>Independent apps &amp; games</span><span>© {year} Beopity <Link className="studio-footer__secret" href="/for-ameliante/" aria-label="A little secret">♡</Link></span></div>
      </div>
    </footer>
  );
}
