import type { Metadata } from "next";
import Link from "next/link";
import { StudioSiteHeader } from "@/components/studio/StudioSiteHeader";
import { StudioPageIntro, StudioSiteFooter } from "@/components/studio/StudioMarketing";
import { ProductArtwork } from "@/components/studio/ProductArtwork";
import { StructuredData } from "@/components/studio/GameStructuredData";
import { absoluteSiteUrl, careerGames, gamePreviewImage, publicGameStoreUrl } from "@/lib/gameMarketing";
import { getProduct } from "@/lib/products";
import "@/styles/games-marketing.css";

const title = "Sports Career Games for iPhone";
const description = "Find your next sports career: American football in Football Era, soccer in Elevenward, plus Basketball Era and Baseball Era in development. Explore games by Howeth Studio.";
export const metadata: Metadata = {
  title, description, alternates: { canonical: "/games/" },
  openGraph: { type: "website", siteName: "Howeth Studio", title, description, url: "/games/", images: [gamePreviewImage("football-era")] },
  twitter: { card: "summary_large_image", title, description, images: [gamePreviewImage("football-era")] },
};

export default function GamesPage() {
  return <div className="studio-landing games-marketing">
    <a className="studio-skip" href="#main">Skip to main content</a>
    <StudioSiteHeader />
    <StructuredData data={{ "@context": "https://schema.org", "@type": "CollectionPage", name: title, url: absoluteSiteUrl("/games/"), description, mainEntity: { "@type": "ItemList", itemListElement: careerGames.map((game, index) => ({ "@type": "ListItem", position: index + 1, name: getProduct(game.slug).name, url: absoluteSiteUrl(`/${game.slug}/`) })) } }} />
    <main id="main">
      <StudioPageIntro index="PLAY" eyebrow="Sports career games" title="Choose your sport. Build your story." description="Take one player from a fresh start toward a lasting legacy. Football Era and Elevenward are on the App Store; Basketball Era and Baseball Era are in development." />
      <section className="games-content" aria-labelledby="games-collection-title">
        <h2 id="games-collection-title">Four sports. Your career.</h2>
        <ul className="games-grid">
          {careerGames.map((game) => {
            const product = getProduct(game.slug);
            const storeUrl = publicGameStoreUrl(game.slug);
            return <li key={game.slug}><article>
              <Link href={`/${game.slug}/`} aria-label={`Explore ${product.name}`}><ProductArtwork product={product} /></Link>
              <p className="games-sport">{game.sport}</p>
              <h3><Link href={`/${game.slug}/`}>{product.name}<span aria-hidden="true"> ↗</span></Link></h3>
              <p>{product.description}</p>
              <p className="games-availability">{product.platform} <span aria-hidden="true">·</span> {product.status}</p>
              <div className="games-actions"><Link href={`/${game.slug}/`}>Explore the game</Link>{storeUrl && <a href={storeUrl}>Download on the App Store<span aria-hidden="true"> ↗</span></a>}</div>
            </article></li>;
          })}
        </ul>
      </section>
      <section className="games-content games-compare" aria-labelledby="games-compare-title">
        <h2 id="games-compare-title">Find the career for you.</h2>
        <div className="games-table-wrap"><table><caption>Compare Howeth Studio sports career games</caption><thead><tr><th scope="col">Game</th><th scope="col">Sport</th><th scope="col">Your journey</th><th scope="col">Availability</th></tr></thead><tbody>{careerGames.map((game) => <tr key={game.slug}><th scope="row"><Link href={`/${game.slug}/`}>{getProduct(game.slug).name}</Link></th><td>{game.sport}</td><td>{game.focus}</td><td>{getProduct(game.slug).status}</td></tr>)}</tbody></table></div>
      </section>
      <section className="games-content games-questions" aria-labelledby="games-questions-title">
        <h2 id="games-questions-title">Before your first season.</h2>
        <details><summary>Which games can I download now?</summary><p><Link href="/football-era/">Football Era</Link> and <Link href="/elevenward/">Elevenward</Link> have public App Store releases. Basketball Era and Baseball Era are in development; their pages introduce each game without a download link.</p></details>
        <details><summary>Can I play without an account?</summary><p>Football Era and Elevenward offer complete offline careers. Optional accounts add cloud features. You can start a guest career on your device.</p></details>
        <details><summary>What kind of games are these?</summary><p>You follow one athlete through training, match decisions, contracts, seasons, and life choices. Each game focuses on a personal sports career in an original fictional world.</p></details>
        <p className="games-press-link">Covering a game? <Link href="/press/">Find product facts and downloadable press assets<span aria-hidden="true"> ↗</span></Link></p>
      </section>
    </main>
    <StudioSiteFooter year={new Date().getFullYear()} />
  </div>;
}
