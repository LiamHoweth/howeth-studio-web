import type { Metadata } from "next";
import { ProductPage } from "@/components/studio/ProductPage";

export const metadata: Metadata = {
  title: "Basketball Era",
  description:
    "An offline basketball career game in development. Create your player, grow your skills, and follow a fictional league through seasons and playoffs.",
  alternates: { canonical: "/basketball-era/" },
};

export default function BasketballEraPage() {
  return (
    <ProductPage
      slug="basketball-era"
      eyebrow="Basketball career simulation"
      headline="Find your game. Build your legacy."
      description="Create a rookie, earn your place in the rotation, and shape a career through the choices you make on and off the court. Basketball Era brings a fictional basketball world to iPhone and iPad."
      features={[
        {
          title: "A player of your own",
          description:
            "Choose a position, an archetype, and a portrait. Develop your attributes, follow your coach's trust, and see how your build changes your opportunities on the court.",
        },
        {
          title: "Every season has a story",
          description:
            "Follow a 30-team league through an 82-game regular season, standings, play-in games, and playoff series. Game results build your statistics, records, and career history.",
        },
        {
          title: "Life beyond the scoreboard",
          description:
            "Review contract offers, make training choices, and spend earned game cash on your Life collection. Keep playing across seasons and look back on your career at retirement.",
        },
      ]}
      detail={{
        title: "The next chapter of Era.",
        paragraphs: [
          "Basketball Era is built around a complete local career loop: prepare for a game, make a basketball choice, review the result, and decide what comes next. Your progress stays available between sessions.",
          "The game is in development. The current version includes fictional teams and players, player development, league progression, and career records. Public release details will appear here when they are available.",
        ],
      }}
      links={[
        { label: "Explore the experience", href: "#features" },
        { label: "Explore Football Era", href: "/football-era/" },
        { label: "Explore Baseball Era", href: "/baseball-era/" },
      ]}
      note="In development for iPhone and iPad."
    />
  );
}
