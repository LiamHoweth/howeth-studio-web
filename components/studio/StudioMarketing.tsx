import Image from "next/image";
import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { products } from "@/lib/products";
import { beopityConfig } from "@/lib/siteConfig";
import { Ambience } from "./art/Ambience";
import { CatPortrait } from "./art/CatPortrait";
import { FooterNight } from "./art/FooterNight";
import { hashSeed } from "./art/random";
import { DuskScene, Kite, MeadowEdge, MeadowFootpath, MeadowScene, Sprig } from "./art/Scenery";
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

/** Fraction of the interlude band's height where the walking cat's paws meet the painted footpath. */
const WANDER_GROUND = 0.88;

/**
 * A painted pause between chapters: a full-bleed meadow with the statement in
 * the sky and a footpath near the bottom. The ground layer (the whole band,
 * `data-wander`) is open ground where the cat leaves the lane and walks across
 * on the footpath at `data-wander-ground`, so it holds no links or controls.
 */
export function StudioInterlude({ index, children, wander = 0.45, seed, mood }: { index: string; children: ReactNode; wander?: number; seed?: number; mood?: "noon" | "golden" }) {
  const sceneSeed = seed ?? hashSeed(index);
  const sceneMood = mood ?? (sceneSeed % 2 ? "noon" : "golden");
  return (
    <section className={`interlude interlude--${sceneMood}`}>
      <MeadowScene seed={sceneSeed} mood={sceneMood} footpath={false} />
      <Ambience kind="meadow" seed={sceneSeed} density={0.8} />
      <div className="interlude__ground" data-wander={wander} data-wander-ground={WANDER_GROUND} style={{ "--wander-ground": `${WANDER_GROUND * 100}%` } as CSSProperties} aria-hidden="true">
        <MeadowFootpath seed={sceneSeed} mood={sceneMood} />
      </div>
      <div className="interlude__copy">
        <p className="studio-mono interlude__index">{index}</p>
        <p className="interlude__statement">{children}</p>
      </div>
    </section>
  );
}

export function StudioWorkSection() {
  return (
    <section className="studio-work" aria-labelledby="work-heading">
      <Ambience kind="sky" seed={3} className="studio-work__sky" />
      <Kite className="studio-work__kite" />
      <div className="studio-work__head">
        <div>
          <p className="studio-mono studio-section-label">Selected work</p>
          <h2 id="work-heading">Apps &amp; <em>games.</em></h2>
        </div>
        <p>Eight products, from a calmer bedtime to a career-defining season. Explore what’s live and what’s taking shape.</p>
      </div>
      <ProductCollection />
      <div className="studio-garden" aria-hidden="true">
        <Sprig className="studio-garden__sprig" variant={0} />
        <MeadowEdge seed={9} className="studio-garden__edge" />
        <Sprig className="studio-garden__sprig studio-garden__sprig--end" variant={1} />
      </div>
    </section>
  );
}

const principles = [
  { title: "Thoughtful by default", description: "Every screen earns its place. We would rather ship one considered feature than five noisy ones." },
  { title: "Built for the long run", description: "Seasons, saves and habits that last. Our products are designed to be returned to, not just opened." },
  { title: "Always a little curious", description: "Each idea starts with a question worth chasing, then gets refined until it feels simple." },
];

export function StudioAboutSection() {
  return (
    <section className="studio-about" aria-labelledby="about-heading">
      <Ambience kind="breeze" seed={5} />
      <div className="studio-about__grid">
        <div>
          <p className="studio-mono studio-section-label">The studio</p>
          <h2 id="about-heading">Small on purpose.<br /><em>Curious by nature.</em></h2>
          <div className="studio-about__copy">
            <p>beopity is an independent software studio with a soft spot for thoughtful mobile apps and games you can get lost in.</p>
            <p>From a better night’s sleep to a career-defining season, each product starts with a simple idea: make something worth coming back to.</p>
            <Link className="studio-text-link" href="/contact/">Start a conversation <span aria-hidden="true">↗</span></Link>
          </div>
        </div>
        <figure className="studio-portrait">
          <div className="studio-portrait__window">
            <CatPortrait />
          </div>
        </figure>
      </div>
      <div className="studio-garden studio-garden--about" aria-hidden="true">
        <MeadowEdge seed={11} className="studio-garden__edge" />
        <Sprig className="studio-garden__sprig studio-garden__sprig--end" variant={2} />
      </div>
      <ol className="studio-principles">
        {principles.map((principle) => (
          <li key={principle.title}><h3>{principle.title}</h3><p>{principle.description}</p></li>
        ))}
      </ol>
    </section>
  );
}

const studioLinks = [
  { href: "/", label: "Home" },
  { href: "/work/", label: "Work" },
  { href: "/about/", label: "Studio" },
  { href: "/contact/", label: "Contact" },
] as const;

export function StudioSiteFooter({ year }: { year: number }) {
  return (
    <footer id="contact" className="studio-footer" lang="en">
      <div className="studio-footer__dusk" aria-hidden="true">
        <DuskScene />
        <Ambience kind="dusk" seed={8} />
      </div>
      <div className="studio-footer__invitation">
        <p className="studio-mono">Have something in mind?</p>
        <h2>Let’s make something <em>worth coming back to.</em></h2>
        <Link className="studio-button" href="/contact/">Get in touch <span aria-hidden="true">↗</span></Link>
      </div>
      <div className="studio-footer__columns">
        <div className="studio-footer__about">
          <span className="studio-footer__badge" aria-hidden="true"><Image src="/beopity/avatar.webp" alt="" width={128} height={128} /></span>
          <div>
            <p>An independent studio making thoughtful apps and games.</p>
            <a className="studio-footer__mail" href={`mailto:${beopityConfig.contactEmail}`}>{beopityConfig.contactEmail}</a>
          </div>
        </div>
        <nav aria-label="Studio">
          <h3 className="studio-mono">Studio</h3>
          <ul>{studioLinks.map((link) => <li key={link.href}><Link href={link.href}>{link.label}</Link></li>)}</ul>
        </nav>
        <nav aria-label="Products">
          <h3 className="studio-mono">Products</h3>
          <ul>{products.map((product) => <li key={product.slug}><Link href={`/${product.slug}/`}>{product.name}</Link></li>)}</ul>
        </nav>
      </div>
      <FooterNight year={year} />
    </footer>
  );
}
