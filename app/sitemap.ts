import type { MetadataRoute } from "next";

export const dynamic = "force-static";

const siteOrigin = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://howethstudio.com"
).replace(/\/$/, "");

const studioRoutes = [
  "",
  "/about",
  "/work",
  "/contact",
  "/noctara",
  "/carenote-cna",
  "/carenote-cna/features",
  "/carenote-cna/how-it-works",
  "/carenote-cna/download",
  "/carenote-cna/support",
  "/carenote-cna/privacy",
  "/carenote-cna/contact",
  "/football-era",
  "/football-era/app-store",
  "/football-era/support",
  "/football-era/privacy",
  "/football-era/account-deletion",
] as const;

const elevenwardRoutes = [
  "/elevenward",
  "/elevenward/support",
  "/elevenward/privacy",
  "/elevenward/account-deletion",
  "/elevenward/press",
  ...["es", "pt-br", "fr"].flatMap((locale) => [
    `/elevenward/${locale}`,
    `/elevenward/${locale}/support`,
    `/elevenward/${locale}/privacy`,
    `/elevenward/${locale}/account-deletion`,
    `/elevenward/${locale}/press`,
  ]),
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  return [...studioRoutes, ...elevenwardRoutes].map((path) => ({
    url: `${siteOrigin}${path}/`,
    changeFrequency: path.includes("privacy") ? "yearly" : "monthly",
    priority: path === "" ? 1 : path === "/elevenward" ? 0.9 : 0.7,
  }));
}
