import type { Metadata } from "next";
import Link from "next/link";
import { careNoteConfig } from "@/lib/siteConfig";

export const metadata: Metadata = {
  title: "CareNote CNA Support",
  description:
    "Get help with CareNote CNA, find setup guidance, troubleshooting steps, and direct support contact details for the app.",
  alternates: {
    canonical: "/carenote-cna/support/",
  },
};

export default function CareNoteSupportPage() {
  return (
    <main id="main" className="page-main">
      <div className="site-shell">
        <section className="hero-panel">
          <span className="eyebrow">Support</span>
          <h1>Support for CareNote CNA.</h1>
          <p className="hero-copy">
            Find answers to common questions, get help with downloads or
            note-taking features, and contact us if you need direct support.
          </p>
        </section>

        <section className="section two-column">
          <article className="section-card">
            <h2>Quick support details</h2>
            <ul className="check-list">
              <li>
                Email:{" "}
                <a href={`mailto:${careNoteConfig.supportEmail}`}>
                  {careNoteConfig.supportEmail}
                </a>
              </li>
              <li>Response target: 2 business days for normal support questions.</li>
              <li>
                Emergency care issues should follow your organization workflow, not
                this support address.
              </li>
            </ul>
          </article>
          <article className="section-card">
            <h2>Include this in your support request</h2>
            <ul className="check-list">
              <li>App version and iPhone model.</li>
              <li>
                Whether the issue happened during manual entry, dictation,
                extraction, or note generation.
              </li>
              <li>Whether the device had a working network connection at the time.</li>
              <li>Short steps that reproduce the problem.</li>
            </ul>
          </article>
        </section>

        <section className="section section-card">
          <h2>Frequently asked questions</h2>
          <div className="faq-list">
            <details className="faq-card" open>
              <summary>How do I add a resident?</summary>
              <div className="faq-answer">
                Add the resident from the hall board, then start a new report from
                that resident profile.
              </div>
            </details>
            <details className="faq-card">
              <summary>Do I have to use voice capture?</summary>
              <div className="faq-answer">
                No. Voice capture is optional. You can type shift details manually and
                continue using the structured workflow without dictation.
              </div>
            </details>
            <details className="faq-card">
              <summary>What if smart suggestions are unavailable?</summary>
              <div className="faq-answer">
                You can keep charting manually and continue documenting the shift.
                CareNote CNA is designed so review and note-taking do not depend on
                one single workflow.
              </div>
            </details>
            <details className="faq-card">
              <summary>Is AI writing the final chart by itself?</summary>
              <div className="faq-answer">
                No. Structured fields stay primary, AI output stays editable, and the
                user reviews everything before the final save.
              </div>
            </details>
            <details className="faq-card">
              <summary>What data leaves the device?</summary>
              <div className="faq-answer">
                If you choose AI-assisted note features, relevant note details may be
                sent to CareNote servers to generate suggestions. The Privacy Policy
                explains this in more detail.
              </div>
            </details>
            <details className="faq-card">
              <summary>How do I clear local data on a test device?</summary>
              <div className="faq-answer">
                Use the in-app Settings screen to clear local resident and report data
                when resetting a device for testing.
              </div>
            </details>
          </div>
        </section>

        <section className="section section-card">
          <h2>Need a direct reply?</h2>
          <p>
            Use the contact form for detailed support issues, download help, or
            questions about how the app works.
          </p>
          <div className="hero-actions">
            <Link className="button button-primary" href="/carenote-cna/contact/">
              Open Contact Form
            </Link>
            <Link className="button button-secondary" href="/carenote-cna/privacy/">
              Read Privacy Policy
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
