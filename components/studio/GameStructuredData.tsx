import { absoluteSiteUrl, getCareerGame, publicGameStoreUrl, type CareerGameSlug } from "@/lib/gameMarketing";
import { getProduct } from "@/lib/products";

export function StructuredData({ data }: { data: unknown }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}

export function GameStructuredData({ slug, path = `/${slug}/`, description, language = "en" }: { slug: CareerGameSlug; path?: string; description?: string; language?: string }) {
  const product = getProduct(slug);
  const store = publicGameStoreUrl(slug);
  return <StructuredData data={{
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "VideoGame",
        "@id": `${absoluteSiteUrl(path)}#game`,
        name: product.name,
        url: absoluteSiteUrl(path),
        description: description || getCareerGame(slug)!.description,
        image: absoluteSiteUrl(product.icon),
        genre: slug === "elevenward" ? ["Sports", "Role-playing"] : ["Sports", "Simulation"],
        inLanguage: language,
        creativeWorkStatus: store ? "Published" : "In development",
        author: { "@type": "Organization", name: "Howeth Studio", url: absoluteSiteUrl("/") },
        ...(store ? { sameAs: store } : {}),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Howeth Studio", item: absoluteSiteUrl("/") },
          { "@type": "ListItem", position: 2, name: "Games", item: absoluteSiteUrl("/games/") },
          { "@type": "ListItem", position: 3, name: product.name, item: absoluteSiteUrl(path) },
        ],
      },
    ],
  }} />;
}
