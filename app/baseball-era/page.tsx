import type { Metadata } from "next";
import { ProductPage } from "@/components/studio/ProductPage";

export const metadata: Metadata = {
  title: "Baseball Era",
  description:
    "Build a hitter or pitcher, earn your call-up, and chase the record books. An offline baseball career from the fictional minors to the majors.",
  alternates: { canonical: "/baseball-era/" },
  openGraph: {
    title: "Baseball Era — Earn your call-up. Write your legacy.",
    description: "Create a ballplayer and build an offline baseball career from the fictional minors to the majors.",
    url: "/baseball-era/",
    images: [{ url: "/portfolio/baseball-icon.webp", width: 512, height: 512, alt: "Baseball Era app icon" }],
  },
};

export default function BaseballEraPage() {
  return (
    <ProductPage
      slug="baseball-era"
      eyebrow="Baseball career simulation"
      headline="Earn your call-up. Write your legacy."
      description="Step into the box. Take the mound. Create a ballplayer and turn rookie promise into a career in the majors, one pitch, one decision, and one season at a time."
      features={[
        {
          title: "Play your position",
          description:
            "Create a hitter, starting pitcher, or reliever across eleven player roles. Pick your portrait and archetype, develop your tools, and build the ballplayer you want to become.",
        },
        {
          title: "Make the next pitch count",
          description:
            "Choose your approach as games unfold through hits, walks, strikeouts, steals, and extra innings. Your training, attributes, fatigue, and health help shape the next moment.",
        },
        {
          title: "Earn your way up",
          description:
            "Rise from the Rookie Circuit through Triple-A to the Majors. Follow full schedules and playoff series, negotiate contracts, request a trade, and chase milestones across your career.",
        },
        {
          title: "The game travels with you",
          description:
            "Keep two independent careers for free and play offline whenever you have a moment. No account, ads, or subscription is needed for the journey from the minors to the record books.",
        },
      ]}
      detail={{
        title: "More than a season. A baseball life.",
        paragraphs: [
          "Watch your player grow across seasons, set goals, collect milestones, and compare the years that shaped your career. Offseason choices, a Life collection, and retirement give your baseball story a life beyond the next box score.",
          "The complete offline career needs no purchase. Optional permanent gamepasses offer reward boosts and extra career slots. Life shops spend fictional cash earned in your career; App Store purchases are offered separately in the Baseball Era Shop.",
          "Baseball Era is being prepared for its public release. Clubs, players, and league content are fictional, and game results are simulated. Public release details will appear here when they are available.",
        ],
      }}
      links={[
        { label: "Explore the experience", href: "#features" },
        { label: "Get support", href: "/baseball-era/support/" },
        { label: "Privacy policy", href: "/baseball-era/privacy/" },
        { label: "Explore Basketball Era", href: "/basketball-era/" },
      ]}
      note="Coming to iPhone and iPad. Careers stay on your device. Optional App Store purchases and restoration require an internet connection."
    />
  );
}
