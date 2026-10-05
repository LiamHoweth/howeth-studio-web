import type { Metadata } from "next";
import { ProductPage } from "@/components/studio/ProductPage";

export const metadata: Metadata = {
  title: "Basketball Era",
  description:
    "Create your player, earn your minutes, and build a basketball legacy. An offline career through a fictional 30-team league, full seasons, and playoff runs.",
  alternates: { canonical: "/basketball-era/" },
  openGraph: {
    title: "Basketball Era — Your minutes. Your moment. Your legacy.",
    description: "Create your player, earn your minutes, and build an offline career in a fictional basketball world.",
    url: "/basketball-era/",
    images: [{ url: "/portfolio/basketball-icon.webp", width: 512, height: 512, alt: "Basketball Era app icon" }],
  },
};

export default function BasketballEraPage() {
  return (
    <ProductPage
      slug="basketball-era"
      eyebrow="Basketball career simulation"
      headline="Your minutes. Your moment. Your legacy."
      description="Start with a rookie and a dream. Earn the rotation, find your game, and chase a title through a career shaped by your choices. A whole fictional basketball world, ready for your story."
      features={[
        {
          title: "A player of your own",
          description:
            "Build around five positions and twenty archetypes. Choose your look, develop your attributes, and earn your coach's trust as your role on the court grows.",
        },
        {
          title: "Every season has a story",
          description:
            "Take on a fictional 30-team league across 82-game seasons, play-in games, and playoff series. Make key-game choices, follow the standings, and turn your results into a career worth remembering.",
        },
        {
          title: "Life beyond the scoreboard",
          description:
            "Train with purpose, weigh contract offers, and decide when it is time for a new team. Spend earned game cash on your Life collection, then look back on the seasons that made your name.",
        },
        {
          title: "A career on your schedule",
          description:
            "Play offline, pick up where you left off, and keep separate careers in two free slots. No account, ads, or subscription stands between you and the next game.",
        },
      ]}
      detail={{
        title: "The season ends. Your story keeps going.",
        paragraphs: [
          "Prepare for the next matchup, choose your approach, and see what your player makes of the moment. Progress through full seasons, offseason decisions, records, and retirement. Every career has its own player, league history, and Life collection.",
          "The full offline career needs no purchase. Optional permanent gamepasses add reward boosts and extra career slots. Life shops use fictional cash earned in the game; App Store purchases live in the separate Basketball Era Shop.",
          "Basketball Era is being prepared for its public release. All teams and league content are fictional. Release details will appear here when they are available.",
        ],
      }}
      links={[
        { label: "Explore the experience", href: "#features" },
        { label: "Get support", href: "/basketball-era/support/" },
        { label: "Privacy policy", href: "/basketball-era/privacy/" },
        { label: "Explore Baseball Era", href: "/baseball-era/" },
      ]}
      note="Coming to iPhone and iPad. Careers stay on your device. Optional App Store purchases and restoration require an internet connection."
    />
  );
}
