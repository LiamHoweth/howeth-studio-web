import Image from "next/image";
import Link from "next/link";
import { careerGames, type CareerGameSlug } from "@/lib/gameMarketing";
import { getProduct } from "@/lib/products";
import "@/styles/game-discovery.css";

const copy = {
  en: { heading: "Find your next career.", label: "More from Howeth Studio", all: "Explore all career games", live: "On the App Store", development: "In development" },
  es: { heading: "Encuentra tu próxima carrera.", label: "Más de Howeth Studio", all: "Explorar todos los juegos de carrera", live: "En el App Store", development: "En desarrollo" },
  "pt-br": { heading: "Encontre sua próxima carreira.", label: "Mais da Howeth Studio", all: "Explorar todos os jogos de carreira", live: "Na App Store", development: "Em desenvolvimento" },
  fr: { heading: "Trouvez votre prochaine carrière.", label: "Plus de Howeth Studio", all: "Découvrir tous les jeux de carrière", live: "Sur l’App Store", development: "En développement" },
} as const;

export function GameDiscovery({ current, locale = "en" }: { current: CareerGameSlug; locale?: keyof typeof copy }) {
  const text = copy[locale];
  return <section className="game-discovery" aria-labelledby={`related-${current}`}>
    <p className="game-discovery__eyebrow">{text.label}</p>
    <div className="game-discovery__heading"><h2 id={`related-${current}`}>{text.heading}</h2><Link href="/games/">{text.all}<span aria-hidden="true"> ↗</span></Link></div>
    <ul>
      {careerGames.filter((game) => game.slug !== current).map((game) => {
        const product = getProduct(game.slug);
        return <li key={game.slug}><Link href={`/${game.slug}/`}>
          <Image src={product.icon} alt="" width={64} height={64} />
          <span><strong>{product.name}</strong><small>{product.status === "On the App Store" ? text.live : text.development}</small></span><span aria-hidden="true">↗</span>
        </Link></li>;
      })}
    </ul>
  </section>;
}
