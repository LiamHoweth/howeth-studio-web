import type { ReactNode } from "react";
import Link from "next/link";
import { getProduct } from "@/lib/products";
import { StudioSiteHeader } from "@/components/studio/StudioSiteHeader";
import { StudioSiteFooter } from "@/components/studio/StudioMarketing";
import "@/styles/product-page.css";

export function ProductInfoPage({ slug, label, title, description, children }: {
  slug: string;
  label: string;
  title: string;
  description: string;
  children: ReactNode;
}) {
  const product = getProduct(slug);
  return (
    <div className="product-page">
      <a className="product-skip" href="#main">Skip to main content</a>
      <StudioSiteHeader />
      <main id="main" className="product-main product-info">
        <nav className="product-breadcrumb" aria-label="Breadcrumb">
          <Link href={`/${slug}/`}>{product.name}</Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page">{label}</span>
        </nav>
        <header className="product-info__header">
          <p className="product-eyebrow">{product.name} / {label}</p>
          <h1>{title}</h1>
          <p className="product-hero__description">{description}</p>
          <nav className="product-resources" aria-label={`${product.name} resources`}>
            <Link href={`/${slug}/`}>The game</Link>
            <Link href={`/${slug}/support/`}>Support</Link>
            <Link href={`/${slug}/privacy/`}>Privacy policy</Link>
          </nav>
        </header>
        <div className="product-info__content">{children}</div>
      </main>
      <StudioSiteFooter year={new Date().getFullYear()} />
    </div>
  );
}
