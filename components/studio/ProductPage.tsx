import Link from "next/link";
import { getProduct } from "@/lib/products";
import { ProductArtwork } from "@/components/studio/ProductArtwork";
import { StudioSiteHeader } from "@/components/studio/StudioSiteHeader";
import { StudioSiteFooter } from "@/components/studio/StudioMarketing";
import "@/styles/product-page.css";

export type ProductPageProps = {
  slug: string;
  eyebrow?: string;
  headline: string;
  description: string;
  features: { title: string; description: string }[];
  detail?: { title: string; paragraphs: string[] };
  links?: { label: string; href: string }[];
  note?: string;
  renderHeader?: boolean;
  renderFooter?: boolean;
};

export function ProductPage({
  slug,
  eyebrow,
  headline,
  description,
  features,
  detail,
  links,
  note,
  renderHeader = true,
  renderFooter = true,
}: ProductPageProps) {
  const product = getProduct(slug);
  const actions = links?.length ? links : [{ label: "Explore features", href: "#features" }];
  const isLive = product.status === "On the App Store";

  return (
    <div className="product-page">
      {renderHeader && <a className="product-skip" href="#main">Skip to main content</a>}
      {renderHeader && <StudioSiteHeader />}
      <main id="main" className="product-main">
        <nav className="product-breadcrumb" aria-label="Breadcrumb">
          <Link href="/work/">All work</Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page">{product.name}</span>
        </nav>
        <section className="product-hero" aria-labelledby="product-title">
          <div className="product-hero__copy">
            <p className="product-eyebrow">{eyebrow || `${product.category} / ${product.name}`}</p>
            <h1 id="product-title">{headline}</h1>
            <p className="product-hero__description">{description}</p>
            <div className="product-actions">
              {actions.slice(0, 2).map((link, index) => (
                <a
                  key={`${link.href}-${link.label}`}
                  className={`product-action${index === 0 ? " product-action--primary" : ""}`}
                  href={link.href}
                >
                  {link.label}<span aria-hidden="true">{link.href.startsWith("#") ? "↓" : "↗"}</span>
                </a>
              ))}
            </div>
            {actions.length > 2 && (
              <nav className="product-resources" aria-label={`${product.name} resources`}>
                {actions.slice(2).map((link) => (
                  <a key={`${link.href}-${link.label}`} href={link.href}>{link.label}</a>
                ))}
              </nav>
            )}
            <dl className="product-meta">
              <div><dt>Platform</dt><dd>{product.platform}</dd></div>
              <div><dt>Status</dt><dd><span className={`product-status-dot ${isLive ? "product-status-dot--live" : "product-status-dot--development"}`} aria-hidden="true" />{product.status}</dd></div>
            </dl>
          </div>
          <div className="product-hero__art">
            <ProductArtwork product={product} priority />
            <div className="product-art-caption"><span>{product.name}</span><span>{product.category}</span></div>
          </div>
        </section>

        <section className="product-features product-section" id="features" aria-labelledby="product-features-title">
          <div className="product-section-heading">
            <p className="product-eyebrow">The experience</p>
            <h2 id="product-features-title">{product.category === "Games" ? "A world worth coming back to." : "Made for your everyday."}</h2>
          </div>
          <div className={`product-feature-grid${features.length === 4 ? " product-feature-grid--four" : ""}`}>
            {features.map((feature, index) => (
              <article className="product-feature" key={feature.title}>
                <span className="product-feature__index" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </article>
            ))}
          </div>
        </section>

        {detail && (
          <section className="product-detail product-section" aria-labelledby="product-detail-title">
            <div className="product-section-heading">
              <p className="product-eyebrow">A little more detail</p>
              <h2 id="product-detail-title">{detail.title}</h2>
            </div>
            <div className="product-detail__copy">
              {detail.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            </div>
          </section>
        )}

        {note && <aside className="product-note"><p>{note}</p></aside>}
      </main>
      {renderFooter && (
        <>
          <div className="product-explore">
            <Link className="product-action" href="/work/">Explore all work<span aria-hidden="true">↗</span></Link>
          </div>
          <StudioSiteFooter year={new Date().getFullYear()} />
        </>
      )}
    </div>
  );
}
