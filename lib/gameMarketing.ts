import type { Metadata } from "next";
import { getProduct } from "@/lib/products";
import { footballEraConfig, elevenwardConfig, siteUrl } from "@/lib/siteConfig";

export const careerGames = [
  { slug: "football-era", sport: "American football", focus: "Quarterback, running back, or wide receiver", title: "Football Era — American Football Career Game", description: "Build an American football career on iPhone. Make weekly decisions, develop your player, negotiate contracts, and chase a Hall of Fame legacy in Football Era." },
  { slug: "elevenward", sport: "Football / soccer", focus: "One player's career and life, from age 17 to retirement", title: "Elevenward — Football Career & Life RPG", description: "Live a complete football career on iPhone and iPad. Train, navigate contracts, make match decisions, and shape life away from the pitch in Elevenward." },
  { slug: "basketball-era", sport: "Basketball", focus: "Player development, full seasons, and playoff runs", title: "Basketball Era — Basketball Career Simulation", description: "Explore Basketball Era, an offline basketball career game in development for iPhone and iPad. Create a player, train, follow full seasons, and chase playoff success." },
  { slug: "baseball-era", sport: "Baseball", focus: "A hitter or pitcher's journey through fictional leagues", title: "Baseball Era — Baseball Career Simulation", description: "Explore Baseball Era, an offline baseball career game in development for iPhone and iPad. Build a hitter or pitcher and rise through fictional leagues." },
] as const;

export type CareerGameSlug = (typeof careerGames)[number]["slug"];

export function getCareerGame(slug: string) {
  return careerGames.find((game) => game.slug === slug);
}

export function publicGameStoreUrl(slug: string): string {
  if (slug === "football-era") return footballEraConfig.appStoreUrl;
  if (slug === "elevenward") return elevenwardConfig.appStoreUrl;
  return "";
}

export function absoluteSiteUrl(path: string): string {
  return new URL(path, siteUrl).toString();
}

export function gamePreviewImage(slug: CareerGameSlug) {
  return { url: `/portfolio/og/${slug}.png`, width: 1200, height: 630, alt: `${getProduct(slug).name} by Howeth Studio` };
}

export function createGameMetadata(slug: CareerGameSlug): Metadata {
  const game = getCareerGame(slug)!;
  const path = `/${slug}/`;
  const image = gamePreviewImage(slug);
  return {
    title: game.title,
    description: game.description,
    alternates: { canonical: path },
    openGraph: { type: "website", siteName: "Howeth Studio", title: game.title, description: game.description, url: path, images: [image] },
    twitter: { card: "summary_large_image", title: game.title, description: game.description, images: [image] },
  };
}
