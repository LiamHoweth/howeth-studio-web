import type { Metadata } from "next";
import Link from "next/link";
import { StudioSiteHeader } from "@/components/studio/StudioSiteHeader";
import {
  StudioPageIntro,
  StudioSiteFooter,
} from "@/components/studio/StudioMarketing";
import { howethStudioConfig } from "@/lib/siteConfig";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Reach Howeth Studio for project inquiries, partnerships, or product support — email and CareNote CNA contact options.",
  alternates: {
    canonical: "/contact/",
  },
};

export default function ContactPage() {
  const year = new Date().getFullYear();

  return (
    <div className="studio-landing">
      <a className="studio-skip" href="#main">
        Skip to main content
      </a>
      <StudioSiteHeader />
      <main id="main" className="studio-landing__main">
        <nav className="studio-subcrumb studio-mono" aria-label="Breadcrumb">
          <Link href="/">Index</Link>
          <span aria-hidden="true"> · </span>
          <span>Contact</span>
        </nav>

        <StudioPageIntro
          index="004"
          eyebrow="Start a conversation"
          title="Have a useful problem to solve?"
          description="Share the product, the audience, and where the work is stuck. You will hear directly from the person who would design and build it."
        />

        <section className="studio-contact-page" aria-labelledby="contact-heading">
          <h2 id="contact-heading" className="studio-contact-page__title">
            Contact
          </h2>
          <p className="studio-mono studio-contact-page__label">Direct</p>
          <p className="studio-contact-page__line">
            <a className="studio-cta" href={`mailto:${howethStudioConfig.contactEmail}`}>
              {howethStudioConfig.contactEmail}
            </a>
          </p>
          <p className="studio-mono studio-contact-page__label">Product support</p>
          <p className="studio-contact-page__copy">
            For CareNote CNA questions or feedback, you can use the in-product support flow
            or the marketing-site form.
          </p>
          <p className="studio-contact-page__line">
            <Link className="studio-cta studio-cta--quiet" href="/carenote-cna/contact/">
              CareNote CNA contact form
            </Link>
          </p>
        </section>

        <StudioSiteFooter year={year} />
      </main>
    </div>
  );
}
