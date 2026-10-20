import type { Metadata } from "next";
import Link from "next/link";
import { StudioSiteHeader } from "@/components/studio/StudioSiteHeader";
import {
  StudioPageIntro,
  StudioSiteFooter,
} from "@/components/studio/StudioMarketing";
import { StudioTrail } from "@/components/studio/StudioTrail";
import { beopityConfig } from "@/lib/siteConfig";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Reach beopity for project inquiries, partnerships, or product support — email and CareNote CNA contact options.",
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
      <main id="main">
        <StudioTrail>
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
            <h2 id="contact-heading" className="studio-mono studio-section-label">
              Contact
            </h2>
            <div className="studio-contact-card studio-contact-card--paper">
              <p className="studio-mono">Direct</p>
              <h3 className="studio-contact-card__title">Write to the studio</h3>
              <p>Project inquiries, partnerships and press.</p>
              <a className="studio-cta" href={`mailto:${beopityConfig.contactEmail}`}>
                {beopityConfig.contactEmail}
              </a>
            </div>
            <div className="studio-contact-card">
              <p className="studio-mono">Product support</p>
              <h3 className="studio-contact-card__title">CareNote CNA</h3>
              <p>
                For CareNote CNA questions or feedback, you can use the in-product support flow
                or the marketing-site form.
              </p>
              <Link className="studio-cta studio-cta--quiet" href="/carenote-cna/contact/">
                CareNote CNA contact form
              </Link>
            </div>
          </section>
        </StudioTrail>
      </main>
      <StudioSiteFooter year={year} />
    </div>
  );
}
