import Image from "next/image";
import type { Product } from "@/lib/products";

export function ProductArtwork({ product, priority = false }: { product: Product; priority?: boolean }) {
  return (
    <div className={`product-art product-art--${product.art}${product.screenshot ? " product-art--screen" : ""}`}>
      <span className="product-art__word" aria-hidden="true">{product.art === "sprout" ? "GROW" : product.art === "carenote" ? "CARE" : product.art === "noctara" ? "REST" : "PLAY"}</span>
      <div className="product-art__identity">
        <Image className="product-art__icon" src={product.icon} alt={`${product.name} app icon`} width={512} height={512} sizes="(max-width: 600px) 112px, 180px" priority={priority} />
        <span>{product.name}</span>
      </div>
      {product.screenshot && <div className="product-art__device"><Image src={product.screenshot} alt={`${product.name} app preview`} width={900} height={product.art === "sprout" ? 577 : 1950} sizes="(max-width: 600px) 180px, 280px" priority={priority} /></div>}
      {product.art === "elevenward" && <Image className="product-art__landscape" src="/portfolio/elevenward-hero.webp" alt="Elevenward football stadium artwork" priority={priority} fill sizes="(max-width: 700px) 100vw, 50vw" />}
      <span className="product-art__caption">{product.category === "Games" ? "A world of your own" : "Made for your everyday"}</span>
    </div>
  );
}
