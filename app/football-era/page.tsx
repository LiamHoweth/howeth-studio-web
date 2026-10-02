import type { Metadata } from "next";
import { ProductPage } from "@/components/studio/ProductPage";
import { footballEraConfig } from "@/lib/siteConfig";

export const metadata: Metadata = {
  title: "Football Era — Build Your Football Legacy",
  description:
    "Football Era is an iPhone football career simulation. Build a QB, RB, or WR career through weekly games, contracts, records, and life beyond the field.",
  alternates: { canonical: "/football-era/" },
};

const features = [
  {
    title: "One week. A career of consequences.",
    description:
      "Read the matchup, arrive at one of 32 clubs’ stadiums, and make spotlight decisions. Stats, XP, money, trust, confidence, health, and records move with the result.",
  },
  {
    title: "Find your place in the league.",
    description:
      "Create a quarterback, running back, or wide receiver. Earn depth-chart trust, develop attributes, negotiate contracts, and chase awards through a 17-week regular season and playoffs.",
  },
  {
    title: "Life beyond the field.",
    description:
      "Browse weekly Realty, Motors, Jewelry, and Performance markets. Each category holds 100+ possibilities, with four to seven fresh listings each week and purchases that stay in your collection.",
  },
  {
    title: "A legacy that belongs to you.",
    description:
      "Follow league news, rosters, standings, and position records through retirement. Career, League, Life, and More keep the whole story close, ending with a Hall of Fame verdict.",
  },
];

export default function FootballEraPage() {
  const links = [
    ...(footballEraConfig.appStoreUrl
      ? [{ label: "Download on the App Store", href: footballEraConfig.appStoreUrl }]
      : []),
    ...(footballEraConfig.testFlightUrl
      ? [{ label: "Join TestFlight", href: footballEraConfig.testFlightUrl }]
      : []),
    { label: "Support", href: "/football-era/support/" },
    { label: "Privacy", href: "/football-era/privacy/" },
    { label: "Account deletion", href: "/football-era/account-deletion/" },
    { label: "App Store details", href: "/football-era/app-store/" },
  ];

  return (
    <ProductPage
      slug="football-era"
      eyebrow="Football career simulation · iPhone"
      headline="Build a career worth remembering."
      description="From your first depth-chart battle to your last game. Make the weekly decisions, earn the contract, and shape the life that comes with it."
      features={features}
      detail={{
        title: "Your career, at your pace.",
        paragraphs: [
          "Play a complete career offline, with two local save slots to start. Optional accounts provide eligible career sync and public leaderboards; guest play remains available.",
          "Optional permanent gamepasses include VIP (1.5× XP and money), 2× XP, 2× Money, and Extra Slots, which expands two careers to five. Restore purchases with the Apple Account used to buy them. Every multiplier is explained in the reward breakdown.",
        ],
      }}
      links={links}
      note="No ads, subscriptions, or consumable currency."
    />
  );
}
