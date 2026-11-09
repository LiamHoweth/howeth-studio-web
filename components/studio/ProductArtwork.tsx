import Image from "next/image";
import type { CSSProperties } from "react";
import type { Product } from "@/lib/products";

/**
 * A soft painted panel tinted by the product's accent: a hazy sky, a drifting
 * cloud and two rolling hills, with the product's real icon and screen on top.
 */
export function ProductArtwork({ product, priority = false }: { product: Product; priority?: boolean }) {
  return (
    <div
      className={`product-art product-art--${product.art}${product.screenshot ? " product-art--screen" : ""}`}
      style={{ "--product-accent": product.accent } as CSSProperties}
    >
      <svg className="product-art__land" viewBox="0 0 600 400" preserveAspectRatio="xMidYMax slice" aria-hidden="true" focusable="false">
        <g className="product-art__cloud">
          <circle cx="92" cy="92" r="22" /><circle cx="122" cy="80" r="30" /><circle cx="156" cy="90" r="22" /><rect x="70" y="92" width="110" height="20" rx="10" />
        </g>
        <path className="product-art__hill product-art__hill--back" d="M0 300 Q120 250 250 278 T520 262 T600 270 L600 400 L0 400 Z" />
        <path className="product-art__hill product-art__hill--front" d="M0 340 Q160 300 330 332 T600 318 L600 400 L0 400 Z" />
        <g className="product-art__flowers">
          <circle cx="60" cy="356" r="3" /><circle cx="140" cy="348" r="2.4" /><circle cx="236" cy="362" r="3.2" /><circle cx="380" cy="352" r="2.6" /><circle cx="470" cy="366" r="3" /><circle cx="548" cy="350" r="2.2" />
        </g>
      </svg>
      <span className="product-art__word" aria-hidden="true">{product.art === "sprout" ? "GROW" : product.art === "carenote" ? "CARE" : product.art === "noctara" ? "REST" : "PLAY"}</span>
      <div className="product-art__identity">
        <Image className="product-art__icon" src={product.icon} alt={`${product.name} app icon`} width={512} height={512} sizes="(max-width: 600px) 112px, 180px" priority={priority} />
        <span>{product.name}</span>
      </div>
      {product.screenshot && <div className="product-art__device"><Image src={product.screenshot} alt={`${product.name} app preview`} width={900} height={product.art === "sprout" ? 577 : product.art === "mathwars" ? 416 : 1950} sizes="(max-width: 600px) 180px, 280px" priority={priority} /></div>}
      {product.art === "elevenward" && <Image className="product-art__landscape" src="/portfolio/elevenward-hero.webp" alt="Elevenward football stadium artwork" priority={priority} fill sizes="(max-width: 700px) 100vw, 50vw" />}
      <span className="product-art__caption">{product.category === "Games" ? "A world of your own" : "Made for your everyday"}</span>
    </div>
  );
}
