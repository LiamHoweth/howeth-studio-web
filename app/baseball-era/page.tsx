import type { Metadata } from "next";
import { ProductPage } from "@/components/studio/ProductPage";

export const metadata: Metadata = {
  title: "Baseball Era",
  description:
    "An offline baseball career game in development. Build a hitter or pitcher, rise through fictional leagues, and make your mark across a complete career.",
  alternates: { canonical: "/baseball-era/" },
};

export default function BaseballEraPage() {
  return (
    <ProductPage
      slug="baseball-era"
      eyebrow="Baseball career simulation"
      headline="From your first at-bat to your last great season."
      description="Create a hitter or pitcher and work your way from rookie ball toward the majors. Baseball Era turns the long baseball season into a personal career of development, decisions, and moments at the plate."
      features={[
        {
          title: "Play your position",
          description:
            "Choose from eleven player roles and build around a hitter or pitcher archetype. Develop your tools through training, skill points, and the experience you earn in games.",
        },
        {
          title: "Make the next pitch count",
          description:
            "Choose your approach as seeded games unfold through hits, walks, strikeouts, steals, and extra innings. Pitching fatigue, health, and your attributes influence what happens.",
        },
        {
          title: "Earn your way up",
          description:
            "Follow fictional rookie, Triple-A, and major leagues through schedules, standings, and playoff series. Chase promotions, review contracts, and track your season goals and career records.",
        },
      ]}
      detail={{
        title: "A career that keeps its history.",
        paragraphs: [
          "Watch your player develop across seasons, compare completed years, and build a career story from your results. Offseason choices, earned-money Life shops, and retirement give the journey a life beyond a single game.",
          "Baseball Era is an offline game in development, with fictional clubs and its own baseball simulation. It is not yet available as a public App Store release.",
        ],
      }}
      links={[
        { label: "Explore the experience", href: "#features" },
        { label: "Explore Football Era", href: "/football-era/" },
        { label: "Explore Basketball Era", href: "/basketball-era/" },
      ]}
      note="In development for iPhone and iPad."
    />
  );
}
