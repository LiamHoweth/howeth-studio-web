import type { Metadata } from "next";
import { careNoteConfig } from "@/lib/siteConfig";

export const metadata: Metadata = {
  title: "CareNote CNA Privacy Policy",
  description:
    "Read the CareNote CNA privacy policy covering local data storage, AI-assisted note features, third-party processing, and support contact information.",
  alternates: {
    canonical: "/carenote-cna/privacy/",
  },
};

export default function CareNotePrivacyPage() {
  return (
    <main id="main" className="page-main">
      <div className="site-shell">
        <section className="hero-panel">
          <span className="eyebrow">Privacy Policy</span>
          <h1>CareNote CNA Privacy Policy</h1>
          <p className="hero-copy">
            Effective date: March 11, 2026. This policy describes how CareNote CNA
            handles information when users create notes in the app and choose to
            use optional AI-assisted features.
          </p>
        </section>

        <section className="section two-column">
          <article className="section-card">
            <h2>What the app stores locally</h2>
            <p>
              The app stores resident profiles, shift reports, transcripts, and app
              settings locally on the device so users can create, review, edit, and
              export reports. Local reliability counters may also be stored to track
              failed saves, abandoned drafts, and AI retry behavior.
            </p>
          </article>
          <article className="section-card">
            <h2>When data leaves the device</h2>
            <p>
              If a user chooses AI-assisted note features, the app may send
              transcript text and reviewed structured fields to CareNote servers so
              note suggestions can be generated. The iPhone app does not store the
              OpenAI API key.
            </p>
          </article>
        </section>

        <section className="section two-column">
          <article className="section-card">
            <h2>Third-party service flow</h2>
            <p>
              Speech recognition may use Apple platform services. Depending on the
              feature being used, CareNote servers may also send eligible requests to
              OpenAI for structured note assistance or summary generation.
            </p>
          </article>
          <article className="section-card">
            <h2>What the app does not do by design</h2>
            <ul className="check-list">
              <li>It does not treat AI output as the source of truth.</li>
              <li>It does not automatically finalize notes without user review.</li>
              <li>It does not require ad tracking or analytics vendors for core use.</li>
            </ul>
          </article>
        </section>

        <section className="section two-column">
          <article className="section-card">
            <h2>Operational analytics</h2>
            <p>
              For quality monitoring, the app can keep local-only counters for failed
              saves, abandoned drafts, queued AI retries, retry attempts, retry
              successes, and retry failures. These counters are intended to stay
              aggregate and should not contain resident narrative text.
            </p>
          </article>
          <article className="section-card">
            <h2>Security and compliance notice</h2>
            <p>
              Organizations and individual users are responsible for evaluating
              whether CareNote CNA fits their privacy, security, and compliance
              requirements. Review internal policies and professional obligations
              before using the app with resident-identifiable information.
            </p>
          </article>
        </section>

        <section className="section two-column">
          <article className="section-card">
            <h2>Your choices</h2>
            <ul className="check-list">
              <li>Users can complete reports manually without AI assistance.</li>
              <li>Local report data can be cleared within app settings.</li>
              <li>Organizations can decide whether to enable AI features at all.</li>
            </ul>
          </article>
          <article className="section-card">
            <h2>Contact</h2>
            <p>
              Questions about this policy can be sent to{" "}
              <a href={`mailto:${careNoteConfig.supportEmail}`}>
                {careNoteConfig.supportEmail}
              </a>
              .
            </p>
          </article>
        </section>
      </div>
    </main>
  );
}
