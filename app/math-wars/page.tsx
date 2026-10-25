import type { Metadata } from "next";
import { ProductPage } from "@/components/studio/ProductPage";

export const metadata: Metadata = {
  title: "Math Wars",
  description:
    "A turn-based battle game where every shot is an equation. Type y = f(x), bend your shot around walls, and outsmart bots, friends, or online rivals. No ads, accounts, chat, or purchases.",
  alternates: { canonical: "/math-wars/" },
  openGraph: {
    title: "Math Wars — Aim with math. Win with curves.",
    description: "Type a function, tap Fire, and watch your shot follow the graph across the arena.",
    url: "/math-wars/",
    images: [{ url: "/portfolio/math-wars-icon.webp", width: 512, height: 512, alt: "Math Wars app icon" }],
  },
};

export default function MathWarsPage() {
  return (
    <ProductPage
      slug="math-wars"
      eyebrow="Graphing battle game"
      headline="Aim with math. Win with curves."
      description="Type a function, tap Fire, and watch your shot follow the graph across the arena. A straight line slips through a gap, a parabola arcs over a wall, and a sine wave weaves between blocks. Last player standing wins."
      features={[
        {
          title: "Every shot is an equation",
          description:
            "Type y = f(x) on a math keypad built for aiming, with powers, fractions, roots, absolute value, trig, and logs. Bricks crumble as your shot breaks through; steel stops everything.",
        },
        {
          title: "Four ways to play",
          description:
            "Face up to five bots from Rookie to Legend, find an online match or duel a friend with a five-letter code, or pass one iPhone or iPad between two to six players.",
        },
        {
          title: "Thirty-six challenges",
          description:
            "Hand-made puzzles in four tiers each teach a curve shape, with up to three stars to earn. A guided tutorial covers the basics in your first match.",
        },
        {
          title: "Earned, never bought",
          description:
            "Win coins and experience to unlock 12 characters, shot trails, hats, titles, abilities, and 19 badges. There are no real-money purchases, and every function is free to use.",
        },
      ]}
      detail={{
        title: "Homework becomes tactics.",
        paragraphs: [
          "Slope, intercepts, parabolas, absolute value, sine waves, roots, and logarithms all become ways to win. An optional aim preview shows where your curve begins, and a typo or undefined value fizzles with a plain-language explanation.",
          "Choose a relaxed, standard, or speedy turn timer, or turn it off. A left-handed keypad, hardware keyboard support on iPad, Reduce Motion support, and adjustable haptics let everyone play their way.",
          "Math Wars has no ads, accounts, chat, or tracking. Progress stays on your device, and online players get a generated nickname. Math Wars is being prepared for its App Store release; details will appear here when they are available.",
        ],
      }}
      links={[
        { label: "Explore the game", href: "#features" },
        { label: "Get support", href: "/math-wars/support/" },
        { label: "Privacy policy", href: "/math-wars/privacy/" },
      ]}
      note="Coming to iPhone and iPad. Free to play. Bots, Pass & Play, and challenges work offline; Online versus needs an internet connection."
    />
  );
}
