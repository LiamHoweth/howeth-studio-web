"use client";

import { useState } from "react";
import Link from "next/link";
import { products } from "@/lib/products";
import { ProductArtwork } from "./ProductArtwork";

const filters = ["All", "Games", "Apps"] as const;
type Filter = (typeof filters)[number];

export function ProductCollection() {
  const [filter, setFilter] = useState<Filter>("All");
  const visible = products.filter((product) => filter === "All" || product.category === filter);

  return (
    <>
      <div className="collection-bar">
        <div className="collection-filters" role="group" aria-label="Filter products">
          {filters.map((label) => (
            <button key={label} type="button" aria-pressed={filter === label} onClick={() => setFilter(label)}>
              {label}<span>{label === "All" ? products.length : products.filter((product) => product.category === label).length}</span>
            </button>
          ))}
        </div>
        <p className="studio-mono collection-count" role="status" aria-live="polite">{String(visible.length).padStart(2, "0")} products to explore</p>
      </div>
      <ol className="collection-grid">
        {visible.map((product) => (
          <li key={product.slug}>
            <Link className="collection-product" href={`/${product.slug}/`} aria-label={`Explore ${product.name}`}>
              <ProductArtwork product={product} />
              <div className="collection-product__copy">
                <div className="collection-product__heading">
                  <h3>{product.name}</h3><span className="collection-product__arrow" aria-hidden="true">↗</span>
                </div>
                <p className="collection-product__tagline">{product.tagline}</p>
                <p className="collection-product__description">{product.description}</p>
                <div className="collection-product__meta studio-mono">
                  <span>{product.platform}</span>
                  <span className="collection-product__status"><i className={product.status === "On the App Store" ? "is-live" : ""} aria-hidden="true" />{product.status}</span>
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ol>
    </>
  );
}
