export type Product = {
  slug: string;
  name: string;
  category: "Games" | "Apps";
  tagline: string;
  description: string;
  platform: string;
  status: string;
  accent: string;
  art: "football" | "elevenward" | "noctara" | "basketball" | "baseball" | "sprout" | "carenote";
  icon: string;
  screenshot?: string;
};

/** Public portfolio only. Availability is separate from a project's build state. */
export const products: readonly Product[] = [
  { slug: "noctara", name: "Noctara", category: "Apps", tagline: "Better nights. Clearer days.", description: "Sleep, recovery, and a calmer bedtime routine. Make sense of your rest with Apple Health and plan the night ahead.", platform: "iPhone · Apple Watch", status: "On the App Store", accent: "#bbb2f0", art: "noctara", icon: "/portfolio/noctara-icon.webp", screenshot: "/portfolio/noctara-screen.webp" },
  { slug: "football-era", name: "Football Era", category: "Games", tagline: "Your career. Your legacy.", description: "An American football career, one week at a time. Earn your place, negotiate your future, and build a legacy beyond the field.", platform: "iPhone", status: "On the App Store", accent: "#bcd5ee", art: "football", icon: "/portfolio/football-icon.webp", screenshot: "/portfolio/football-screen.webp" },
  { slug: "elevenward", name: "Elevenward", category: "Games", tagline: "One player. A world of football.", description: "A football career and life RPG. Grow from academy hopeful into a player with a story of your own, on and off the pitch.", platform: "iPhone · iPad", status: "On the App Store", accent: "#cbd1c8", art: "elevenward", icon: "/portfolio/elevenward-icon.webp" },
  { slug: "basketball-era", name: "Basketball Era", category: "Games", tagline: "Make your minutes matter.", description: "Build a basketball career through full seasons, training, contracts, and playoff runs. Every week moves your story forward.", platform: "iPhone · iPad", status: "In development", accent: "#edbea2", art: "basketball", icon: "/portfolio/basketball-icon.webp", screenshot: "/portfolio/basketball-screen.webp" },
  { slug: "sprout-to-stars", name: "Sprout to Stars", category: "Games", tagline: "A little farm. A bigger universe.", description: "A cozy incremental farm where crops, crews, and curious discoveries turn a small growing operation into something much bigger.", platform: "iPhone · iPad", status: "In development", accent: "#c9dfb7", art: "sprout", icon: "/portfolio/sprout-icon.webp", screenshot: "/portfolio/sprout-screen.webp" },
  { slug: "carenote-cna", name: "CareNote CNA", category: "Apps", tagline: "More care. Less paperwork.", description: "Structured shift notes for caregivers. Capture observations, review suggestions, and keep the final say on every saved note.", platform: "iPhone", status: "On the App Store", accent: "#bfe1e8", art: "carenote", icon: "/portfolio/carenote-icon.webp" },
  { slug: "baseball-era", name: "Baseball Era", category: "Games", tagline: "From rookie to the record books.", description: "A baseball career from the minors to the majors. Step up to the plate, develop your skills, and chase a place in the record books.", platform: "iPhone · iPad", status: "In development", accent: "#ded3b6", art: "baseball", icon: "/portfolio/baseball-icon.webp", screenshot: "/portfolio/baseball-screen.webp" },
];

export function getProduct(slug: string): Product {
  const product = products.find((entry) => entry.slug === slug);
  if (!product) throw new Error(`Unknown portfolio product: ${slug}`);
  return product;
}
