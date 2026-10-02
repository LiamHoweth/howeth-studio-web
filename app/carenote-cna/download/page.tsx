import type { Metadata } from "next";
import Link from "next/link";
import { careNoteConfig } from "@/lib/siteConfig";

export const metadata: Metadata = {
  title: "Download CareNote CNA",
  description:
    "Download CareNote CNA for iPhone, learn what to expect from the app, and get support if you need help getting started.",
  alternates: {
    canonical: "/carenote-cna/download/",
  },
};

export default function CareNoteDownloadPage() {
  const appStoreHref =
    careNoteConfig.appStoreUrl || "/carenote-cna/contact";
  const storeClass =
    "button button-primary" + (careNoteConfig.appStoreUrl ? "" : " is-disabled");

  return (
    <main id="main" className="page-main">
      <div className="site-shell">
        <section className="hero-panel">
          <span className="eyebrow">Download</span>
          <h1>Get CareNote CNA on iPhone.</h1>
          <p className="hero-copy">
            CareNote CNA is built for iPhone and designed to help caregivers document
            shifts faster. Download the app, start organizing resident notes, and
            keep every saved report reviewable.
          </p>
        </section>

        <section className="section two-column">
          <article className="download-card">
            <h2>Download on the App Store</h2>
            <p>
              Install CareNote CNA on iPhone and start using a faster, more
              structured charting workflow.
            </p>
            <div className="download-actions">
              <a className={storeClass} href={appStoreHref}>
                Download on the App Store
              </a>
              <Link className="button button-secondary" href="/carenote-cna/support/">
                Get Support
              </Link>
            </div>
          </article>
          <article className="download-card">
            <h2>What to expect</h2>
            <p>
              CareNote CNA is designed for caregivers who want faster shift notes,
              structured documentation, and a simpler review flow before saving.
            </p>
            <div className="download-actions">
              <Link className="button button-ghost" href="/carenote-cna/how-it-works/">
                See How It Works
              </Link>
            </div>
          </article>
        </section>

        <section className="section two-column">
          <article className="section-card">
            <h2>Before you download</h2>
            <ul className="check-list">
              <li>CareNote CNA is iPhone-first.</li>
              <li>
                Microphone and speech recognition are optional permissions for voice
                capture.
              </li>
              <li>You can review and edit notes before the final save.</li>
              <li>
                Support is available at{" "}
                <a href={`mailto:${careNoteConfig.supportEmail}`}>
                  {careNoteConfig.supportEmail}
                </a>
                .
              </li>
            </ul>
          </article>
          <article className="section-card">
            <h2>Need help getting started?</h2>
            <p>
              If you have questions about downloading the app, using voice capture,
              or understanding the workflow, visit the Support page or send us an
              email.
            </p>
            <div className="hero-actions">
              <Link className="button button-primary" href="/carenote-cna/support/">
                Support
              </Link>
              <Link className="button button-ghost" href="/carenote-cna/contact/">
                Contact Us
              </Link>
            </div>
          </article>
        </section>
      </div>
    </main>
  );
}
