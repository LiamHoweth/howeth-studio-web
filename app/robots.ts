import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/siteConfig";

export const dynamic = "force-static";

const siteOrigin = siteUrl.replace(/\/$/, "");

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/elevenward/admin/"],
    },
    sitemap: `${siteOrigin}/sitemap.xml`,
    host: siteOrigin,
  };
}
