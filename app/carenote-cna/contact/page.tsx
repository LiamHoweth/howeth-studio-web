import type { Metadata } from "next";
import { ContactForm } from "@/components/carenote/ContactForm";
import { careNoteConfig } from "@/lib/siteConfig";

export const metadata: Metadata = {
  title: "Contact CareNote CNA",
  description:
    "Contact CareNote CNA for app support, launch questions, beta access, or website inquiries.",
  alternates: {
    canonical: "/carenote-cna/contact/",
  },
};

export default function CareNoteContactPage() {
  return (
    <main id="main" className="page-main">
      <div className="site-shell">
        <section className="hero-panel">
          <span className="eyebrow">Contact</span>
          <h1>Contact CareNote CNA</h1>
          <p className="hero-copy">
            Use this page for support questions, download help, privacy questions,
            or anything else you want to ask about CareNote CNA.
          </p>
        </section>

        <section className="section contact-grid">
          <article className="contact-card">
            <h2>Email</h2>
            <p>
              <a href={`mailto:${careNoteConfig.supportEmail}`}>
                {careNoteConfig.supportEmail}
              </a>
            </p>
            <p>
              Send us a message anytime if you need help with the app or have
              questions before downloading.
            </p>
          </article>
          <article className="contact-card">
            <h2>Response target</h2>
            <p>Normal support questions: within 2 business days.</p>
            <p>
              Critical care or facility operational issues should use your normal
              organization workflow, not this site form.
            </p>
          </article>
          <article className="contact-card">
            <h2>How we can help</h2>
            <p>
              Ask about downloading the app, using shift note features, support
              requests, or privacy and account questions.
            </p>
          </article>
        </section>

        <section className="section section-card">
          <h2>Send a message</h2>
          <ContactForm />
        </section>
      </div>
    </main>
  );
}
