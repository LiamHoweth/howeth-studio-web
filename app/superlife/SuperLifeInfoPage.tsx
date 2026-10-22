import type { ReactNode } from "react";
import Link from "next/link";
import { StudioSiteHeader } from "@/components/studio/StudioSiteHeader";
import { StudioSiteFooter } from "@/components/studio/StudioMarketing";
import "@/styles/product-page.css";

export function SuperLifeInfoPage({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="product-page">
      <a className="product-skip" href="#main">Skip to main content</a>
      <StudioSiteHeader />
      <main id="main" className="product-main product-info">
        <header className="product-info__header">
          <p className="product-eyebrow">SuperLife: Hero Life Simulator</p>
          <h1>{title}</h1>
          <p className="product-hero__description">Effective October 21, 2026. Published by Howeth Studio / Beopity.</p>
          <nav className="product-resources" aria-label="SuperLife resources">
            <Link href="/superlife/support/">Support</Link>
            <Link href="/superlife/privacy/">Privacy policy</Link>
          </nav>
        </header>
        <div className="product-info__content">{children}</div>
      </main>
      <StudioSiteFooter year={new Date().getFullYear()} />
    </div>
  );
}
