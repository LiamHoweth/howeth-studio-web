import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { StudioSiteHeader } from "@/components/studio/StudioSiteHeader";
import { StudioPageIntro, StudioSiteFooter } from "@/components/studio/StudioMarketing";
import { careerGames, publicGameStoreUrl } from "@/lib/gameMarketing";
import { getProduct } from "@/lib/products";
import { howethStudioConfig } from "@/lib/siteConfig";
import "@/styles/games-marketing.css";

export const metadata: Metadata = {
  title: "Sports Games Press Kit", description: "Product facts, official app artwork, demo screenshots, and press contact for Football Era, Elevenward, Basketball Era, and Baseball Era by Howeth Studio.", alternates: { canonical: "/press/" },
};

export default function PressPage() {
  return <div className="studio-landing games-marketing">
    <a className="studio-skip" href="#main">Skip to main content</a><StudioSiteHeader />
    <main id="main">
      <StudioPageIntro index="PRESS" eyebrow="Howeth Studio" title="Stories worth playing. Ready to cover." description="Howeth Studio is an independent studio creating original mobile games and thoughtful apps. Find the facts and artwork for four sports careers below." />
      <section className="games-content press-contact" aria-labelledby="press-contact-title"><h2 id="press-contact-title">Press and creator enquiries.</h2><p>For interviews, gameplay footage, another asset format, or questions about a game, <a href={`mailto:${howethStudioConfig.contactEmail}?subject=Howeth%20Studio%20press%20enquiry`}>email {howethStudioConfig.contactEmail}</a>.</p><p>Use the artwork for accurate editorial coverage. Preserve its proportions and colors, and contact the studio for other uses. Demo screenshots may differ from the released game; games in development may change before release.</p></section>
      <section className="games-content" aria-labelledby="press-games-title"><h2 id="press-games-title">Games at a glance.</h2><ul className="press-grid">
        {careerGames.map((game) => {
          const product = getProduct(game.slug); const storeUrl = publicGameStoreUrl(game.slug);
          return <li key={game.slug}><article id={game.slug}>
            <div className="press-game-heading"><Image src={product.icon} alt="" width={80} height={80} /><div><p className="games-sport">{game.sport}</p><h3>{product.name}</h3></div></div>
            <p>{product.description}</p><dl><div><dt>Genre</dt><dd>{game.slug === "elevenward" ? "Football career and life RPG" : "Sports career simulation"}</dd></div><div><dt>Platform</dt><dd>{product.platform}</dd></div><div><dt>Status</dt><dd>{product.status}</dd></div></dl>
            <div className="press-downloads"><Link href={`/${game.slug}/`}>Product page</Link>{storeUrl && <a href={storeUrl}>App Store listing</a>}<a href={product.icon} download={`${game.slug}-icon.webp`}>Download app icon (WebP)</a>{product.screenshot && <a href={product.screenshot} download={`${game.slug}-demo.webp`}>Download demo screenshot (WebP)</a>}{game.slug === "elevenward" && <Link href="/elevenward/press/">Localized Elevenward press kit</Link>}</div>
          </article></li>;
        })}
      </ul></section>
      <div className="games-content games-press-link"><Link href="/games/">Explore all four career games<span aria-hidden="true"> ↗</span></Link></div>
    </main><StudioSiteFooter year={new Date().getFullYear()} />
  </div>;
}
